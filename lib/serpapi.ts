import {
  buildSerpCacheKey,
  getCachedSerpResult,
  setCachedSerpResult,
} from "./serpCache";

export async function fetchSearchInterest(keyword: string) {
  if (!process.env.SERPAPI_API_KEY) {
    return null;
  }

  const cacheKey = buildSerpCacheKey(keyword);

  // 1️⃣ CHECK CACHE FIRST
  const cached = getCachedSerpResult(cacheKey);
  if (cached) {
    return cached;
  }

  // 2️⃣ CALL SERPAPI ONLY IF NEEDED
  try {
    const params = new URLSearchParams({
      engine: "google_trends",
      q: keyword,
      api_key: process.env.SERPAPI_API_KEY!,
    });

    const res = await fetch(`https://serpapi.com/search.json?${params}`);
    const data = await res.json();

    const normalized = {
      interest_over_time: data.interest_over_time?.timeline_data ?? [],
      related_queries: data.related_queries?.top ?? [],
    };

    // 3️⃣ SAVE TO CACHE
    setCachedSerpResult(cacheKey, normalized);

    return normalized;
  } catch (err) {
    console.error("SerpAPI error:", err);
    return null;
  }
}
