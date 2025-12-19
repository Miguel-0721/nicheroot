import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// IMPORTANT:
// SerpAPI is intentionally NOT used in Explore / idea generation.
// This route must stay cheap and fast (no paid external lookups).
// Only the Blueprint route may use SerpAPI, behind ENABLE_SERPAPI_BLUEPRINT.



type IdeaRow = {
  id: string;
  title: string;
  category: string; // e.g. "Services" | "SaaS" | "Content" | "Marketing"
  difficulty: "Low" | "Medium" | "High";
  demand: "Low" | "Medium" | "High";
  score: number; // 0-100
  signal: "gold" | "silver" | "bronze";
  reason?: string; // optional short justification
};

function extractJson(text: string) {
  const start = text.indexOf("<json>");
  const end = text.indexOf("</json>");
  if (start === -1 || end === -1) throw new Error("JSON wrapper not found");
  const jsonText = text.slice(start + 6, end).trim();
  return JSON.parse(jsonText);
}

function safeGetText(response: any): string {
  if (response?.output_text) return response.output_text;

  if (Array.isArray(response?.output)) {
    for (const block of response.output) {
      if (Array.isArray(block?.content)) {
        for (const item of block.content) {
          if (typeof item?.text === "string") return item.text;
        }
      }
    }
  }
  return "";
}

function clampScore(n: any) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 50;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function toKebabId(s: string) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || `idea-${Date.now()}`;
}

function normalizeIdeaRow(raw: any): IdeaRow | null {
  if (!raw) return null;

  const title = String(raw.title || "").trim();
  if (!title) return null;

  const difficulty = raw.difficulty;
  const demand = raw.demand;
  const signal = raw.signal;

  const allowedDiff = new Set(["Low", "Medium", "High"]);
  const allowedDem = new Set(["Low", "Medium", "High"]);
  const allowedSig = new Set(["gold", "silver", "bronze"]);

  const out: IdeaRow = {
    id: toKebabId(raw.id || title),
    title,
    category: String(raw.category || "Services"),
    difficulty: allowedDiff.has(difficulty) ? difficulty : "Medium",
    demand: allowedDem.has(demand) ? demand : "Medium",
    score: clampScore(raw.score),
    signal: allowedSig.has(signal) ? signal : "silver",
  };

  if (raw.reason) out.reason = String(raw.reason).slice(0, 140);

  return out;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userInput = String(body?.userInput || "").trim();

    if (!userInput || userInput.length < 20) {
      return NextResponse.json(
        { error: "Missing or too-short userInput" },
        { status: 400 }
      );
    }

    // Dev-only guard: Explore must never use SerpAPI
    if (process.env.NODE_ENV === "development") {
      if (process.env.ENABLE_SERPAPI_EXPLORE === "true") {
        console.warn(
          "ENABLE_SERPAPI_EXPLORE is set but Explore route does not use SerpAPI."
        );
      }
    }


    // Keep this tight for now: 10 ideas only (safe incremental step)
   const systemPrompt = `
You are NicheRoot AI — a realistic business idea ranking engine.

Your job is NOT to filter ideas strictly.
Your job is to RANK ideas by relevance.

CORE PRINCIPLE:
- The user's input influences PRIORITY, not EXCLUSION.
- Ideas must be diverse, not repetitive.

IDEA GENERATION RULES (MANDATORY):
1. Generate EXACTLY 10 ideas.
2. Ideas must be grouped implicitly into tiers:
   - Tier A (top 3): strongest alignment with user intent
   - Tier B (next 4): adjacent or complementary ideas
   - Tier C (last 3): alternative but still plausible options
3. No two ideas may share the same core business archetype.
   - If one idea is advisory, no other advisory.
   - If one is SaaS, others must differ in execution model.
4. Avoid generic templates:
   - No “consulting”, “agency”, or “platform” without a qualifier.
5. Categories must vary across ideas.
6. Scores must reflect ranking order (top ideas score higher).


ANTI-REPETITION RULE (MANDATORY):
- Do NOT reuse business ideas, structures, or phrasing that commonly appear
  in generic startup lists.
- If an idea feels familiar or “standard”, discard it and generate a more specific variant.
- Each idea must be meaningfully distinct in:
  (a) business model
  (b) customer type
  (c) value creation mechanism



DOMAIN LEVERAGE VALIDATION (CRITICAL RULE):

Before finalizing the ranked list, you MUST verify:

- For the top 5 ideas:
  At least 3 ideas MUST FAIL if the user had NO experience in the stated domain.

If an idea could reasonably be executed by a generic entrepreneur
with no domain background, it MUST NOT appear in the top 5.

Examples of DISALLOWED top ideas for a finance-focused user:
- Marketing agencies
- Bootcamps
- Generic SaaS tools
- Newsletters unrelated to finance

Examples of ALLOWED top ideas:
- Financial infrastructure
- Regulated services
- Compliance-heavy SaaS
- Capital allocation platforms
- B2B finance operations

If this condition is not met, REGENERATE the list before responding.




SCORING GUIDELINES:
- 80–90: Tier A (gold)
- 65–79: Tier B (silver)
- 50–64: Tier C (bronze)
- Do NOT cluster scores tightly.

SIGNAL RULES:
- gold = best fit for THIS user
- silver = reasonable but less direct
- bronze = viable but higher tradeoff

OUTPUT FORMAT (STRICT):
Return ONLY valid JSON wrapped EXACTLY like:

<json>
{ ... }
</json>

No markdown. No commentary. No text outside <json>.

REASON FORMAT RULE (TOP 3 IDEAS ONLY):

- Include the "reason" field ONLY for the TOP 3 ranked ideas.
- Each reason MUST contain EXACTLY 3 bullet points, separated by the "•" character.

Each bullet must cover ONE distinct angle:
1) Time & effort realism (e.g. part-time hours, solo-friendly workload)
2) Low-risk validation path (e.g. first channel, first test, small budget)
3) Why this idea ranks higher than nearby alternatives FOR THIS USER

Rules:
- Bullets must reference at least one concrete constraint (time, money, skill).
- Avoid generic phrases like "fits your goals" or "good potential".
- Do NOT promise revenue, success, or timelines.
- Do NOT reuse phrasing across different ideas.
- Keep bullets short and factual, not promotional.


Additional constraint:
- At least ONE bullet per top-3 idea must explicitly compare it
  against another nearby option (e.g. “Ranks higher than X because…”).


SCHEMA:
{
  "ideas": [
    {
      "id": "kebab-case-id",
      "title": "specific and concrete",
      "category": "Services|SaaS|Content|Marketing|Local",
      "difficulty": "Low|Medium|High",
      "demand": "Low|Medium|High",
      "score": 0-100,
      "signal": "gold|silver|bronze",
      "reason": "• Bullet point 1 • Bullet point 2 • Bullet point 3"

    }
  ]
}
`;

const userPrompt = `
User context:
${userInput}

Interpret this context as a PRIORITY SIGNAL, not a hard filter.

Rank ideas so the most aligned appear first,
but still include adjacent and alternative ideas
to preserve discovery and comparison.
`;


  const response = await client.responses.create({
  model: "gpt-4.1",
  input: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
  max_output_tokens: 1400,

  // 👇 ADD THESE
  temperature: 0.85,
  top_p: 0.9,
});


    const raw = safeGetText(response);
    if (!raw) throw new Error("No output from model");

    const parsed = extractJson(raw);

    if (!parsed?.ideas || !Array.isArray(parsed.ideas) || parsed.ideas.length !== 10) {
      throw new Error("Invalid ideas payload (must be exactly 10)");
    }

    const ideas: IdeaRow[] = parsed.ideas
      .map(normalizeIdeaRow)
      .filter(Boolean) as IdeaRow[];

    if (ideas.length < 6) {
      throw new Error("Too many invalid ideas after normalization");
    }

    return NextResponse.json({ ideas });
  } catch (err: any) {
    console.error("generate-ideas-v2 error:", err);
    return NextResponse.json(
      { error: "Failed to generate ideas" },
      { status: 500 }
    );
  }
}
