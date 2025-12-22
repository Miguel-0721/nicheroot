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

    // reason is handled AFTER ranking, not here


  return out;
}


function isValidTop3Reasons(ideas: any[]): boolean {
  if (!Array.isArray(ideas) || ideas.length < 3) return false;

  const titles = ideas.map(i => String(i.title || "").toLowerCase());

  for (let i = 0; i < 3; i++) {
    const reason = ideas[i]?.reason;
    if (!reason) return false;

    const bullets = reason.split("•").map((b: string) => b.trim())
.filter(Boolean);
    if (bullets.length !== 3) return false;

    const comparisonBullet = bullets[2].toLowerCase();

    const referencesOtherIdea = titles.some(
      (title, idx) =>
        idx !== i &&
        title.length > 6 &&
        comparisonBullet.includes(title.slice(0, 10))
    );

    if (!referencesOtherIdea) return false;
  }

  return true;
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

Your job is NOT to validate ideas.
Your job is to RANK ideas by relevance and realism.

CORE PRINCIPLE:
- The user's input influences PRIORITY, not EXCLUSION.
- Ideas must be diverse, not repetitive.
- Optimize for decision clarity, not excitement.

HARD OUTPUT RULES (MANDATORY):
1) Generate EXACTLY 10 ideas.
2) Ordered list = ranking (best first).
3) Implicit tiers:
   - Tier A (top 3): strongest alignment
   - Tier B (next 4): adjacent/complementary
   - Tier C (last 3): alternative but plausible
4) Categories must vary across the list.
5) Avoid vague labels: no “platform”, “AI tool”, “solution”, “agency” unless sharply specific.
6) Each idea title must clearly imply the founder’s recurring work.


ANTI-REPETITION RULE (MANDATORY):
- If an idea sounds like a generic startup list item, discard it.
- Each idea must differ in:
  (a) business model
  (b) customer type
  (c) value creation mechanism

DOMAIN LEVERAGE VALIDATION (CRITICAL):
- For the top 5 ideas, at least 3 MUST FAIL without domain familiarity.
- If a generic entrepreneur could run it, it MUST NOT be top 5.


ENFORCEMENT CHECK:
If the top-ranked idea could reasonably be executed by:
- a generic content creator
- a beginner entrepreneur
- or someone without industry exposure

Then it MUST be ranked below at least one idea that requires:
- insider language
- regulatory familiarity
- workflow or operational knowledge


REALISM GUARDRAILS:
- No revenue promises.
- No timelines.
- Difficulty must reflect real friction (trust, integrations, sales cycles).

SCORING RULES:
- Scores must strictly descend with ranking (max 1-point ties).
- 80–90 = Tier A
- 65–79 = Tier B
- 50–64 = Tier C


EXECUTION REALITY OVERRIDE (MANDATORY):
Ranking must reflect what the founder actually does week to week,
including outreach, research, delivery, and iteration effort.



REVERSIBILITY RULE (MANDATORY FOR TOP 3):

When ranking the top 3 ideas, prefer ideas that:
- can be tested without legal or reputational risk
- can fail without long-term consequences
- do not require being “right” to get paid

If two ideas are otherwise similar in demand and effort,
the idea with LOWER downside risk MUST rank higher,
even if it appears less sophisticated.


If an idea requires ANY of the following:
- regulatory interpretation
- legal or compliance accuracy
- expert credibility or trust
- direct client outreach as the primary validation method

AND the user has:
- limited capital
- limited weekly hours
- no stated prior domain experience

THEN that idea MUST NOT be ranked #1
unless its validation can be completed in under 7 days
with no external trust dependency.


REASON RULE (TOP 3 ONLY — STRICT):
- Include "reason" ONLY for top 3 ideas.
- EXACTLY 3 bullets separated by "•"

Bullet order (MANDATORY):
1) Time/effort realism (user constraints)
2) Lowest-risk validation path (where + what to test)
3) EXPLICIT comparison to another idea in this list

Bullet 3 RULE (VERY IMPORTANT):
- Bullet 3 MUST mention another idea by:
  - its title, OR
  - a uniquely identifying description from the list
- Example of a VALID bullet:
  “Ranks higher than the recurring virtual assistant services idea because it avoids hourly scaling limits.”
- Example of INVALID bullets:
  - “Ranks higher than other options”
  - “Better than alternatives”
  - “More scalable than similar ideas”

If Bullet 3 does not explicitly reference another idea from the same list,
the entire response is INVALID and MUST be regenerated.



Rules:
- Reference concrete constraints (time, money, skill).
- No hype, no promises.
- No repeated phrasing.


TITLE SPECIFICITY RULE (MANDATORY):
- Titles must describe a concrete recurring activity or artifact.
- Avoid abstract verbs like "curate", "build", "sell" unless paired with:
  - audience
  - medium
  - frequency or trigger
- A reader must be able to imagine a weekly work cycle from the title alone.



OUTPUT FORMAT (STRICT):
Return ONLY valid JSON wrapped EXACTLY like:

<json>
{ ... }
</json>

No markdown. No commentary. No text outside <json>.

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
      "reason": "• Bullet 1 • Bullet 2 • Bullet 3"
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

let parsed: any | null = null;
let attempts = 0;

while (attempts < 3) {
  attempts++;

  const response = await client.responses.create({
    model: "gpt-4.1",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_output_tokens: 1400,
    temperature: 0.85,
    top_p: 0.9,
  });

  const raw = safeGetText(response);
  if (!raw) continue;

  try {
    const candidate = extractJson(raw);

    if (
      candidate?.ideas &&
      Array.isArray(candidate.ideas) &&
      candidate.ideas.length === 10 &&
      isValidTop3Reasons(candidate.ideas)
    ) {
      parsed = candidate;
      break;
    }
  } catch {
    // parsing failed, retry
  }
}

if (!parsed) {
  throw new Error("Failed to generate valid ideas after retries");
}


    if (!parsed?.ideas || !Array.isArray(parsed.ideas) || parsed.ideas.length !== 10) {
      throw new Error("Invalid ideas payload (must be exactly 10)");
    }

    const ideas: IdeaRow[] = parsed.ideas
  .map(normalizeIdeaRow)
  .filter(Boolean)
  .map((idea: IdeaRow, index: number) => {

    // Enforce reason ONLY for top 3 ideas
    if (index < 3 && parsed.ideas[index]?.reason) {
      return {
        ...idea,
        reason: String(parsed.ideas[index].reason),
      };
    }

    return idea;
  }) as IdeaRow[];


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
