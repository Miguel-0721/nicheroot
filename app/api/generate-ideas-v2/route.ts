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
  category: string;
  difficulty: "Low" | "Medium" | "High";
  demand: "Low" | "Medium" | "High";
  score: number;
  signal: "gold" | "silver" | "bronze";
  reason?: string;
  summary?: string;
  workCycle?: string; // ✅ ADD THIS
};



function extractJson(text: string) {
  const match = text.match(/<json>\s*([\s\S]*?)\s*<\/json>/i);
  if (!match) throw new Error("JSON wrapper not found");
  return JSON.parse(match[1]);
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
  return Math.max(50, Math.min(90, Math.round(x)));

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

  for (let i = 0; i < 3; i++) {
    const reason = ideas[i]?.reason;
    if (typeof reason !== "string") return false;

    // accept • or -
    const bullets = reason
      .split(/•|-/)
      .map((b: string) => b.trim())
      .filter(Boolean);

    // allow 2–4 bullets (not exactly 3)
    if (bullets.length < 2) return false;
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

Include a field called "reason" ONLY for the top 3 ideas.

"reason" MUST be a single string containing 2–3 bullet points.

Bullets may be separated by:
- the "•" character OR
- a dash "-"

Each bullet must describe:
• Demand reality
• Execution effort
• Validation speed

Exact formatting is NOT required.


Each bullet should clearly relate to:
- demand reality
- execution effort
- validation speed

Exact wording, order, or labels are NOT required.


Additional rules:
- No hype
- No encouragement
- No promises
- No references to "your goals"
- Plain, literal language only

Ranking consistency rule (STRICT):

Higher-ranked ideas MUST have clearer, faster, or cheaper validation
than lower-ranked ideas.

If two ideas are similar, the higher-ranked one must:
- validate faster, OR
- cost less to test, OR
- rely on clearer existing demand

If the reason does not clearly justify the ranking,
the response MUST be regenerated.


For each idea, also include a field called "summary".

The summary must:
- Be 2–3 sentences
- Be written in plain, simple English
- Explain what the business actually involves in practice
- Describe concrete activities (what you do week to week)
- Avoid hype, benefits, or promises
- NOT repeat the idea title


For each idea, also include a field called "workCycle".

The workCycle must:
- Be 2–3 sentences
- Describe what a typical week looks like
- Mention recurring tasks (research, writing, outreach, delivery, etc.)
- Be neutral and literal
- Avoid advice, motivation, or outcomes
- Avoid repeating the summary

Example tone:
"A typical week involves reviewing new material in the niche, selecting relevant items, writing short explanations, and sending one scheduled update. Most time is spent on research and editing rather than promotion."



Example tone:
"This idea involves running a weekly email newsletter that summarizes regulatory updates for small businesses. The work mainly consists of tracking official announcements, writing short explanations, and distributing them to subscribers."



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
      "reason": "ONLY for top 3",
      "summary": "2–3 sentences",
      "workCycle": "2–3 sentences"
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


let lastRaw = "";


while (attempts < 2) {
  attempts++;


if (process.env.NODE_ENV === "development") {
  console.log(`[generate-ideas-v2] attempt ${attempts}`);
}



  const response = await client.responses.create({
    model: "gpt-4.1",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
   max_output_tokens: 3000,
    temperature: 0.7,
    top_p: 0.9,
  });

lastRaw = safeGetText(response);
const raw = lastRaw;

  if (!raw) continue;

  try {
    const candidate = extractJson(raw);

    if (
      candidate?.ideas &&
      Array.isArray(candidate.ideas) &&
      candidate.ideas.length === 10 &&
 candidate.ideas.every((idea: any, i: number) => {
  if (i < 3) return typeof idea.reason === "string";
  return typeof idea.summary === "string";
})


    ) {
      parsed = candidate;
      break;
    }
 } catch (err) {
  if (process.env.NODE_ENV === "development") {
    console.log("[generate-ideas-v2] JSON validation failed, retrying...");
  }
}

}


if (process.env.NODE_ENV === "development") {
  console.error(
    "[generate-ideas-v2] last raw model output:",
    lastRaw
  );
}



if (!parsed && lastRaw.includes("<json>")) {
  console.error("Model output was truncated. Increase max_output_tokens.");
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
  const next: IdeaRow = { ...idea };

  // ✅ Always carry summary if it exists
  if (typeof parsed.ideas[index]?.summary === "string") {
    next.summary = parsed.ideas[index].summary;
  }


if (typeof parsed.ideas[index]?.workCycle === "string") {
  next.workCycle = parsed.ideas[index].workCycle;
}


  // Always pass summary and workCycle (already correct)
// Always pass reason IF it exists
if (typeof parsed.ideas[index]?.reason === "string") {
  next.reason = String(parsed.ideas[index].reason);
}


  return next;
}) as IdeaRow[];


   if (ideas.length !== 10) {
  throw new Error("Idea normalization mismatch");
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
