export async function fetchSearchInterest(keyword: string) {
  if (!process.env.SERPAPI_API_KEY) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      engine: "google_trends",
      q: keyword,
      api_key: process.env.SERPAPI_API_KEY!,
    });

    const res = await fetch(`https://serpapi.com/search.json?${params}`);
    const data = await res.json();

    return {
      interest_over_time: data.interest_over_time?.timeline_data ?? [],
      related_queries: data.related_queries?.top ?? [],
    };
  } catch (err) {
    console.error("SerpAPI error:", err);
    return null;
  }
}
