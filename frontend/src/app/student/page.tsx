'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../components/providers/AuthProvider';
import { apiFetch } from '../../lib/api';
import { SpeechToTextButton } from '../../components/ui/SpeechToTextButton';
import { SpeechControls } from '../../components/ui/SpeechControls';
import toast from 'react-hot-toast';

const SUBJECTS = ['Math', 'English', 'Science', 'Social Studies'] as const;
const GRADE_LEVELS = ['ECD A', 'ECD B', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'] as const;
const LANGUAGES = ['Shona', 'Ndebele', 'Tonga', 'English'] as const;

type ChildProfile = {
  id: string;
  name: string;
  gradeLevel: number;
  preferredLanguage: string;
};

export default function StudentPage() {
  const router = useRouter();
  const { user, tokens, isLoading, logout } = useAuth();

  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>('Math');
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!tokens?.accessToken) {
      router.replace('/login');
      return;
    }

    // Load child profile
    const loadChildProfile = async () => {
      try {
        const res = await apiFetch<{ success: boolean; data: ChildProfile[] }>(`/users/children/me`, {
          method: 'GET',
          token: tokens.accessToken,
        });
        
        if (res.data && res.data.length > 0) {
          setChildProfile(res.data[0]);
        }
      } catch (error) {
        console.error('Failed to load child profile:', error);
      }
    };

    loadChildProfile();
  }, [tokens?.accessToken, isLoading, router]);

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setIsAsking(true);
    setAnswer('');

    try {
      const res = await apiFetch<{ success: boolean; data: { answer: string; confidenceScore: number } }>(`/ai/ask`, {
        method: 'POST',
        token: tokens.accessToken,
        body: {
          question: question.trim(),
          subject,
          gradeLevel: childProfile?.gradeLevel || 3,
          language: childProfile?.preferredLanguage || 'English',
          childId: childProfile?.id,
        },
      });

      setAnswer(res.data.answer);
      toast.success('Answer received!');
    } catch (error) {
      toast.error('Failed to get answer. Please try again.');
      console.error('Ask question error:', error);
    } finally {
      setIsAsking(false);
    }
  };

  if (!childProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Student Portal</h1>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {childProfile.name}! 
          </h1>
          <p className="text-gray-600">
            Grade {GRADE_LEVELS[childProfile.gradeLevel]} · {childProfile.preferredLanguage}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/learn')}>Learn</Button>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ask Question Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ask a Question</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as any)}
                className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <Input
              label="Your Question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              rightElement={
                <SpeechToTextButton
                  onResult={(text) => {
                    setQuestion(text);
                    toast.success('Question filled from voice');
                  }}
                />
              }
            />

            <Button 
              onClick={handleAskQuestion}
              disabled={isAsking || !question.trim()}
              className="w-full"
            >
              {isAsking ? 'Getting Answer...' : 'Ask Question'}
            </Button>
          </div>
        </div>

        {/* Answer Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Answer</h2>
          
          {isAsking ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Thinking...</div>
            </div>
          ) : answer ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
              </div>
              
              <SpeechControls
                language={childProfile.preferredLanguage as any}
                label="Listen to Answer"
                text={answer}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Ask a question to see the answer here</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/learn')}
            className="w-full"
          >
            <span className="mr-2"></span>
            Generate Lesson
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/saved')}
            className="w-full"
          >
            <span className="mr-2"></span>
            Saved Lessons
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/parent')}
            className="w-full"
          >
            <span className="mr-2"></span>
            Parent Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
