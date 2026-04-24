'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../components/providers/AuthProvider';
import { generateAIWithOfflineSupport } from '../../lib/aiOfflineApi';
import { AIGeneratePayload, getLastLearnInputs, getLastSynced, readCache, readAllUserCaches, upsertCachedResponseForUser, setLastLearnInputs } from '../../lib/offlineStore';
import { SpeechControls } from '../../components/ui/SpeechControls';
import { SpeechToTextButton } from '../../components/ui/SpeechToTextButton';
import { apiFetch } from '../../lib/api';
import { ClientOnlyErrorBoundary } from '../../components/ErrorBoundary';

const SUBJECTS = ['Math', 'English', 'Science', 'Social Studies'] as const;
const LANGUAGES = ['Shona', 'Ndebele', 'Tonga'] as const;
const TRANSLATE_TARGETS = ['Shona', 'Ndebele', 'English'] as const;
const GRADE_LEVELS = ['ECD A', 'ECD B', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'] as const;

type Mode = 'idle' | 'online' | 'offline-cache' | 'offline-queued';

type ChildDto = { id: string; name: string; gradeLevel: number; preferredLanguage: string };

function formatLastSynced(iso: string | null) {
  if (!iso) return 'Never';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleString();
}

function confidenceUi(confidenceScore: unknown): { label: string; className: string; value: number | null } {
  if (typeof confidenceScore !== 'number' || !Number.isFinite(confidenceScore)) {
    return { label: 'Confidence: —', className: 'text-gray-600 bg-gray-50 border-gray-200', value: null };
  }
  const v = Math.max(0, Math.min(1, confidenceScore));
  const pct = Math.round(v * 100);
  if (v > 0.8) return { label: `Confidence: ${pct}%`, className: 'text-emerald-800 bg-emerald-50 border-emerald-200', value: v };
  if (v >= 0.6) return { label: `Confidence: ${pct}%`, className: 'text-amber-800 bg-amber-50 border-amber-200', value: v };
  return { label: `Confidence: ${pct}%`, className: 'text-red-800 bg-red-50 border-red-200', value: v };
}

export default function LearnPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, tokens, role, login, register, logout, refreshProfile, isLoading } = auth;

  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>('Math');
  const [topic, setTopic] = useState('Addition');
  const [gradeLevel, setGradeLevel] = useState<(typeof GRADE_LEVELS)[number]>('Grade 3');
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>('Shona');

  const [mode, setMode] = useState<Mode>('idle');
  const [result, setResult] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [formattedLastSynced, setFormattedLastSynced] = useState<string>('Never');

  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string>>({});
  const [practiceChecked, setPracticeChecked] = useState(false);

  const [translateTo, setTranslateTo] = useState<(typeof TRANSLATE_TARGETS)[number]>('English');

  const [children, setChildren] = useState<ChildDto[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(undefined);

  const cached = useMemo(() => role === 'ADMIN' ? readAllUserCaches() : readCache(), [mode, role]);
  const lastSynced = useMemo(() => getLastSynced(), [mode]);

  useEffect(() => {
    setFormattedLastSynced(formatLastSynced(lastSynced));
  }, [lastSynced]);

  useEffect(() => {
    if (isLoading) return;
    if (!tokens?.accessToken) {
      router.replace('/login');
    }
  }, [isLoading, tokens?.accessToken, router]);

  useEffect(() => {
    const last = getLastLearnInputs();
    if (!last) return;

    if (last.subject && SUBJECTS.includes(last.subject as any)) setSubject(last.subject as any);
    if (last.topic && typeof last.topic === 'string' && last.topic.trim()) setTopic(last.topic);
    if (last.gradeLevel && GRADE_LEVELS.includes(last.gradeLevel as any)) setGradeLevel(last.gradeLevel as any);
    if (last.language && LANGUAGES.includes(last.language as any)) setLanguage(last.language as any);
    if (last.childId && typeof last.childId === 'string') setSelectedChildId(last.childId);
  }, []);

  useEffect(() => {
    setLastLearnInputs({
      subject,
      topic,
      gradeLevel,
      language,
      childId: selectedChildId || undefined,
    });
  }, [subject, topic, gradeLevel, language, selectedChildId]);

  useEffect(() => {
    if (!tokens?.accessToken) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<{ success: boolean; data: ChildDto[] }>(`/users/children`, {
          method: 'GET',
          token: tokens.accessToken,
        });
        if (cancelled) return;
        setChildren(res.data);
        if (!selectedChildId && res.data.length > 0) {
          setSelectedChildId(res.data[0].id);
        }
      } catch (e) {
        if (cancelled) return;
        console.error('Failed to fetch children:', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tokens?.accessToken]);

  const onGenerate = async (options?: { improve?: boolean; mode?: 'normal' | 'simplify' | 'translate'; translateTo?: string }) => {
    if (!tokens?.accessToken) return;
    setBusy(true);
    setErrorText(null);

    try {
      const response = await generateAIWithOfflineSupport({
        subject,
        topic,
        gradeLevel,
        language,
        childId: selectedChildId || undefined,
        improve: options?.improve,
        mode: options?.mode,
        translateTo: options?.translateTo,
      }, tokens.accessToken);

      // Cache with userId for all users
      if (response && typeof response === 'object') {
        console.log('AI Response structure:', response);
        console.log('Response keys:', Object.keys(response));
        console.log('Has explanation:', 'explanation' in response);
        console.log('Has example:', 'example' in response);
        console.log('Has practice_questions:', 'practice_questions' in response);
        console.log('Data structure:', response.data);
        console.log('Data keys:', Object.keys(response.data || {}));
        console.log('Data has explanation:', 'explanation' in (response.data || {}));
        console.log('Data has example:', 'example' in (response.data || {}));
        
        const { upsertCachedResponseForUser } = await import('../../lib/offlineStore');
        upsertCachedResponseForUser({
          subject,
          topic,
          gradeLevel,
          language,
          childId: selectedChildId || undefined,
          improve: options?.improve,
          mode: options?.mode,
          translateTo: options?.translateTo,
        }, response.data, 20, user?.id || role);
        
        // Set user ID for future AI generations
        if (typeof window !== 'undefined') {
          (window as any).__USER_ID = user?.id || role;
        }
      }

      setResult(response.data);
      setMode('online');
      toast.success('Lesson generated successfully!');
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : 'Failed to generate lesson. Please try again.');
      toast.error('Failed to generate lesson');
    } finally {
      setBusy(false);
    }
  };

  const confidence = useMemo(() => confidenceUi((result as any)?.confidenceScore), [result]);

  const practiceQuestions = useMemo(() => {
    return !result || typeof result !== 'object' || !('practice_questions' in (result as any))
      ? []
      : ((result as any).practice_questions as any[])
          .filter((q) => q && typeof q === 'object')
          .map((q) => ({
            question: String((q as any).question || ''),
            hint: String((q as any).hint || ''),
            answer: String((q as any).answer || ''),
          }));
  }, [result]);

  return (
    <ClientOnlyErrorBoundary>
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learn</h1>
          <p className="text-gray-600 text-sm">Works online, and falls back to saved lessons / queue when offline.</p>
          <div className="mt-1 text-xs text-gray-500">Last synced: {formattedLastSynced}</div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/')}>Home</Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/parent')}>Back to dashboard</Button>
        </div>
      </div>

      {errorText ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorText}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="subject" className="label">
              Subject
            </label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value as any)}
              className="input"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="topic" className="label">
              Topic
            </label>
            <Input
              label="Topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Addition, fractions, photosynthesis"
              rightElement={<SpeechToTextButton onTranscript={setTopic} />}
              aria-label="Topic"
            />
          </div>

          <div>
            <label htmlFor="gradeLevel" className="label">
              Grade Level
            </label>
            <select
              id="gradeLevel"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value as any)}
              className="input"
            >
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="language" className="label">
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="input"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {children.length > 0 ? (
            <div>
              <label htmlFor="child" className="label">
                Child (optional)
              </label>
              <select
                id="child"
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="input"
              >
                <option value="">None selected</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Grade {c.gradeLevel})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <Button onClick={() => onGenerate()} isLoading={busy} disabled={busy}>
            {busy ? 'Generating lesson...' : 'Generate'}
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => onGenerate({ improve: true })}
              disabled={busy || !result || mode === 'offline-queued'}
              aria-label="Improve explanation"
              type="button"
            >
              Improve
            </Button>

            <Button
              variant="outline"
              onClick={() => onGenerate({ mode: 'simplify' })}
              disabled={busy || mode === 'offline-queued'}
              aria-label="Explain simpler"
              type="button"
            >
              Explain Simpler
            </Button>

            <div className="flex gap-2">
              <select
                value={translateTo}
                onChange={(e) => setTranslateTo(e.target.value as any)}
                className="input"
                disabled={busy || mode === 'offline-queued'}
              >
                {TRANSLATE_TARGETS.map((t) => (
                  <option key={t} value={t}>
                    Translate to {t}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => onGenerate({ mode: 'translate', translateTo })}
                disabled={busy || mode === 'offline-queued'}
                aria-label="Translate"
                type="button"
              >
                Translate
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            <div className="mt-2 flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${mode === 'idle' ? 'bg-gray-100 text-gray-700' : mode === 'online' ? 'bg-emerald-100 text-emerald-700' : mode === 'offline-cache' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                {mode === 'idle' ? 'Ready' : mode === 'online' ? 'Generated online' : mode === 'offline-cache' ? 'Loaded from cache' : 'Queued for later'}
              </div>
              {(mode === 'online' || mode === 'offline-cache') && (
                <Button variant="outline" onClick={() => setMode('idle')} className="h-7">
                  Clear
                </Button>
              )}
            </div>
          </div>

          {(mode === 'online' || mode === 'offline-cache') && result ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Generated Lesson</h3>
                <div className={confidence.className}>
                  {confidence.label}
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                {console.log('Lesson content display - Mode:', mode, 'Result:', result, 'Has explanation:', !!(result as any).explanation, 'Has example:', !!(result as any).example)}
                {(result as any).explanation ? (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Explanation:</strong> {(result as any).explanation}
                    </p>
                  </div>
                ) : <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Debug: No explanation found in lesson response</strong>
                    </p>
                  </div>}
                {(result as any).example ? (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">
                      <strong>Example:</strong> {(result as any).example}
                    </p>
                  </div>
                ) : <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-sm text-orange-800">
                      <strong>Debug: No example found in lesson response</strong>
                    </p>
                  </div>}
                {practiceQuestions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Practice Questions</h4>
                    <div className="space-y-4">
                      {practiceQuestions.map((q, i) => (
                        <div key={i} className="border border-gray-200 rounded p-4">
                          <p className="font-medium text-gray-900 mb-2">
                            {i + 1}. {q.question}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Hint:</strong> {q.hint}
                          </p>
                          {practiceMode ? (
                            <div>
                              <Input
                                label="Answer"
                                type="text"
                                placeholder="Your answer..."
                                value={practiceAnswers[i] || ''}
                                onChange={(e) => setPracticeAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                                className="mb-2"
                              />
                              {practiceChecked && (
                                <div className="text-sm">
                                  <span className={q.answer === practiceAnswers[i] ? 'text-emerald-600' : 'text-red-600'}>
                                    {q.answer === practiceAnswers[i] ? '✓ Correct!' : `✗ Incorrect. Answer: ${q.answer}`}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Saved lessons</h2>
            <p className="mt-1 text-sm text-gray-600">
              {role === 'ADMIN' 
                ? 'All cached AI responses from all students (available offline).'
                : 'Last 20 cached AI responses (available offline).'
              }
            </p>
          </div>
          <Link href={role === 'ADMIN' ? '/dashboard/teacher' : '/dashboard/parent'} className="text-sm text-primary-700 hover:underline">
            Back to dashboard
          </Link>
        </div>

        {typeof window === 'undefined' ? null : (
          !cached.length ? (
            <div className="mt-4 rounded-md border border-gray-200 p-4 text-sm text-gray-700">
              {role === 'ADMIN' ? 'No saved lessons found from any students.' : 'No saved lessons yet.'}
            </div>
          ) : (
            <div className="mt-4">
              {role === 'ADMIN' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Teacher View:</strong> You are viewing all saved lessons from all students in the system.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cached.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => {
                      console.log('Loading saved lesson:', c);
                      console.log('Lesson response:', c.response);
                      setSubject(c.payload.subject as any);
                      setTopic(c.payload.topic);
                      setGradeLevel(c.payload.gradeLevel as any);
                      setLanguage(c.payload.language as any);
                      setMode('offline-cache');
                      setResult(c.response);
                      toast('Loaded saved lesson');
                    }}
                    className="text-left rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold text-gray-500">{c.payload.subject}</div>
                      {role === 'ADMIN' && (
                        <div className="text-xs text-blue-600 font-medium">
                          {c.payload.userId === user?.id ? 'Generated by You' : `Generated by: ${c.payload.userId}`}
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">{c.payload.topic}</div>
                    <div className="mt-2 text-xs text-gray-600">
                      {c.payload.gradeLevel} · {c.payload.language}
                    </div>
                    <div className="mt-2 text-[11px] text-gray-500">Saved: {new Date(c.cachedAt).toLocaleString()}</div>
                    {role === 'ADMIN' && (
                      <div className="mt-2 text-xs text-purple-600 font-medium">
                        Teacher Access: Viewable
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
    </ClientOnlyErrorBoundary>
  );
}
