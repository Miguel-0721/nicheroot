// lib/serpCache.ts

type CachedSerpResult = {
  key: string;
  data: any;
  createdAt: number;
};

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// In-memory cache (safe for now; DB later)
const serpCache = new Map<string, CachedSerpResult>();

export function buildSerpCacheKey(keyword: string) {
  return keyword.trim().toLowerCase();
}

export function getCachedSerpResult(key: string) {
  const entry = serpCache.get(key);
  if (!entry) return null;

  const isExpired = Date.now() - entry.createdAt > CACHE_TTL_MS;
  if (isExpired) {
    serpCache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCachedSerpResult(key: string, data: any) {
  serpCache.set(key, {
    key,
    data,
    createdAt: Date.now(),
  });
}
