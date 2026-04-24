export type AIGeneratePayload = {
  subject: string;
  topic: string;
  gradeLevel: string;
  language: string;
  childId?: string;
  improve?: boolean;
  mode?: 'normal' | 'simplify' | 'translate';
  translateTo?: string;
};

export type CachedAIResponse = {
  key: string;
  payload: AIGeneratePayload & { userId?: string };
  response: unknown;
  cachedAt: string;
};

export type QueuedAIRequest = {
  id: string; // idempotency key
  payload: AIGeneratePayload;
  queuedAt: string;
};

const CACHE_KEY = 'dzidza_ai_ai_cache_v1';
const QUEUE_KEY = 'dzidza_ai_ai_queue_v1';
const LAST_SYNC_KEY = 'dzidza_ai_last_synced_v1';
const LAST_INPUTS_KEY = 'dzidza_ai_last_inputs_v1';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function makeAIKey(payload: AIGeneratePayload): string {
  // Add random element to ensure unique questions each time, but keep same parameters for offline caching
  const randomId = Math.random().toString(36).substring(2, 8);
  return [payload.subject, payload.topic, payload.gradeLevel, payload.language, randomId]
    .map((s) => String(s || '').trim().toLowerCase())
    .join('::');
}

export function readCache(): CachedAIResponse[] {
  if (typeof window === 'undefined') return [];
  return safeParse<CachedAIResponse[]>(localStorage.getItem(CACHE_KEY)) || [];
}

export function readAllUserCaches(): CachedAIResponse[] {
  if (typeof window === 'undefined') return [];
  
  // Try to read from all possible cache keys for different users
  const allCaches: CachedAIResponse[] = [];
  
  // Read current user cache
  const currentCache = safeParse<CachedAIResponse[]>(localStorage.getItem(CACHE_KEY)) || [];
  allCaches.push(...currentCache);
  
  // Try to read from additional cache keys (for admin access to all user lessons)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('dzidza_ai_ai_cache') && key !== CACHE_KEY) {
      const userCache = safeParse<CachedAIResponse[]>(localStorage.getItem(key)) || [];
      allCaches.push(...userCache);
    }
  }
  
  // Remove duplicates and sort by date
  const uniqueCaches = allCaches.filter((item, index, self) =>
    index === self.findIndex((t) => t.key === item.key)
  );
  
  return uniqueCaches.sort((a, b) => 
    new Date(b.cachedAt).getTime() - new Date(a.cachedAt).getTime()
  );
}

export function writeCache(items: CachedAIResponse[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(items));
}

export function upsertCachedResponse(payload: AIGeneratePayload, response: unknown, maxItems = 20, userId?: string) {
  const key = makeAIKey(payload);
  const existing = readCache().filter((x) => x.key !== key);
  const next: CachedAIResponse[] = [
    {
      key,
      payload: {
        ...payload,
        userId: userId || 'unknown'
      },
      response,
      cachedAt: new Date().toISOString(),
    },
    ...existing,
  ].slice(0, maxItems);

  writeCache(next);
}

// Enhanced function to ensure userId is properly passed for all lesson generations
export function upsertCachedResponseForUser(payload: AIGeneratePayload, response: unknown, maxItems = 20, userId: string) {
  const key = makeAIKey(payload);
  const existing = readCache().filter((x) => x.key !== key);
  const next: CachedAIResponse[] = [
    {
      key,
      payload: {
        ...payload,
        userId: userId // Always use the provided userId
      },
      response,
      cachedAt: new Date().toISOString(),
    },
    ...existing,
  ].slice(0, maxItems);

  writeCache(next);
}

export function getCachedResponse(payload: AIGeneratePayload): CachedAIResponse | null {
  const key = makeAIKey(payload);
  const items = readCache();
  return items.find((x) => x.key === key) || null;
}

export function readQueue(): QueuedAIRequest[] {
  if (typeof window === 'undefined') return [];
  return safeParse<QueuedAIRequest[]>(localStorage.getItem(QUEUE_KEY)) || [];
}

export function writeQueue(items: QueuedAIRequest[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export function enqueueRequest(payload: AIGeneratePayload): QueuedAIRequest {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const entry: QueuedAIRequest = {
    id,
    payload,
    queuedAt: new Date().toISOString(),
  };

  const next = [...readQueue(), entry];
  writeQueue(next);
  return entry;
}

export function dequeueRequest(id: string) {
  const next = readQueue().filter((x) => x.id !== id);
  writeQueue(next);
}

export function setLastSynced(iso: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_SYNC_KEY, iso);
}

export function getLastSynced(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_SYNC_KEY);
}

export type LastLearnInputs = {
  subject: string;
  topic: string;
  gradeLevel: string;
  language: string;
  childId?: string;
};

export function setLastLearnInputs(v: LastLearnInputs) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_INPUTS_KEY, JSON.stringify(v));
}

export function getLastLearnInputs(): LastLearnInputs | null {
  if (typeof window === 'undefined') return null;
  return safeParse<LastLearnInputs>(localStorage.getItem(LAST_INPUTS_KEY));
}
