// app/api/generate-blueprint-part1/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { BusinessBlueprint } from "@/types/blueprint-types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ---------- Shared helpers (same as original) ----------

// Safely extract JSON that is wrapped inside <json> ... </json>
function extractFirstJson(text: string): any {
  const start = text.indexOf("<json>");
  const end = text.indexOf("</json>");

  if (start === -1 || end === -1) {
    throw new Error("JSON wrapper not found in model output.");
  }

  const jsonText = text.substring(start + "<json>".length, end).trim();

  try {
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("JSON parse failed on:", jsonText);
    throw new Error("JSON parse failed: " + String(err));
  }
}

// Safely extract the text response from the OpenAI Responses API
function safeGetText(response: any): string {
  if (response?.output_text) {
    return response.output_text.trim();
  }

  if (Array.isArray(response?.output)) {
    for (const block of response.output) {
      if (Array.isArray(block?.content)) {
        for (const item of block.content) {
          if (item?.text) {
            return item.text.trim();
          }
        }
      }
    }
  }

  if (response?.content && Array.isArray(response.content)) {
    for (const item of response.content) {
      if (item?.text) {
        return item.text.trim();
      }
    }
  }

  try {
    return JSON.stringify(response);
  } catch {
    return "";
  }
}

// ---------- Types for this part ----------

type Part1Output = {
  meta: BusinessBlueprint["meta"];
  sectionsPart1: BusinessBlueprint["sections"];
};

export async function POST(req: Request) {
  try {
    const { userInput, history } = await req.json();

    if (!userInput || !history) {
      return NextResponse.json(
        { error: "Missing userInput or history" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are NicheRoot, an AI Business Strategist.


IMPORTANT LEGAL & COMPLIANCE RULES:
-----------------------------------
- All financial numbers, revenue estimates, timelines, or projections MUST be treated as 
  hypothetical examples only.
- DO NOT imply guarantees of income, client volume, business success, or financial outcomes.
- Always use safe wording such as: “may”, “could”, “potential”, “illustrative example”, 
  “not guaranteed”, “hypothetical scenario”.
- Never reference real statistics, real studies, or real external sources.


This is **PART 1 of 3** of the blueprint generator.

You ONLY generate:
- meta  (BlueprintMeta)
- sectionsPart1  (BlueprintSection[]) for these sections:

  1. Founder Fit & Leverage    (id: "founder-fit")
  2. Business Model Blueprint  (id: "business-model")


You MUST NOT generate:
- any other sections
- globalChecklist

Your final JSON MUST have this exact shape:

<json>
{
  "meta": { ...BlueprintMeta... },
  "sectionsPart1": [ ...only sections 1–3... ]
}
</json>

Nothing else. No markdown. No comments.

------------------ TYPE SKETCH (for reference) ------------------

type BlueprintScoreMetrics = {
  risk: number;         // 0–100 integer
  skillFit: number;     // 0–100 integer
  demand: number;       // 0–100 integer
  monetization: number; // 0–100 integer
};

type BlueprintMeta = {
  nicheTitle: string;       // short, niche-specific title (NOT generic)
  modelName: string;
  difficulty: string;       // e.g. "Simple", "Moderate", "Complex"
  startupCost: string;      // e.g. "Very low", "Low", "Medium", "High"
  expectedTimeline: string; // e.g. "4–8 weeks"

  timeCommitment: string;   // e.g. "5–8 hrs/week"
  modelSummary: string;     // 1 sentence, simple summary of the model
  whyItFits: string;        // 1–2 sentences, professional, beginner-friendly explanation of fit

  scores: BlueprintScoreMetrics;
};


type ChartType = "line" | "bar" | "pie" | "radar" | "heatmap" | "funnel";

type ChartBlock = {
  title?: string;
  type: ChartType;
  xKey?: string;
  yKeys?: string[];
  data: any[];
  note?: string;
  explanation: string; // REQUIRED: interpretive insight, beginner-friendly
};

type DiagramType =
  | "flow"
  | "value-chain"
  | "customer-journey"
  | "canvas"
  | "funnel";

type DiagramBlock = {
  title?: string;
  type: DiagramType;
  nodes: string[];
  connections: [number, number][];
  notes?: string[];
  explanation: string;
};

type ImageBlock = {
  title?: string;
  url: string;
  caption?: string;
};

type ListBlock = {
  title?: string;
  items: string[];
};

type TableBlock = {
  title?: string;
  columns: string[];
  rows: string[][];
  explanation: string;  // REQUIRED: insight, not just restating cells
};

type ExampleBlock = {
  title?: string;
  items: string[];
};

type SectionContent = {
  paragraphs?: string[];
  lists?: ListBlock[];
  tables?: TableBlock[];
  charts?: ChartBlock[];
  diagrams?: DiagramBlock[];
  images?: ImageBlock[];
  examples?: ExampleBlock[];
  nextMoves?: string[];
};

type BlueprintSection = {
  id: string;
  title: string;
  eyebrow?: string;
  content: SectionContent;
};

----------------------------------------------------------
GLOBAL STYLE RULES (APPLY TO ALL 3 SECTIONS HERE):

- timeCommitment must be a realistic weekly range (like "5–8 hrs/week").
- modelSummary must be 1 simple sentence describing how the model works.
- whyItFits must be 1–2 sentences, professional but beginner-friendly, explaining why this model matches the user’s skills, risk level and constraints.
- Write in **beginner-friendly** language.
- Short paragraphs, simple sentences, no heavy jargon.
- Still keep strategic depth: always explain the “why”, not just “what”.
- For any chart, table or diagram:
  - "explanation" must interpret the pattern,
    why it matters, and one concrete takeaway.
- nextMoves:
  - Start every item with an action verb (Define, Draft, Research, Talk to, Test, etc.).
  - Make them concrete and realistic for a beginner.

----------------------------------------------------------

SECTION 2 – Founder Fit & Leverage (id: "founder-fit")

- 2–3 paragraphs explaining why this business fits (or doesn’t perfectly fit)
  the user’s traits, skills, risk tolerance and time/money situation.
- Include lists for:
  - strengths (4–6 items),
  - weaknesses (3–5 items),
  - opportunities/advantages (3–5 items).
- Include at least one visual (radar chart is ideal) comparing core strengths.
- explanation must show what the user should focus on and how to use leverage.

----------------------------------------------------------
SECTION 3 – Business Model Blueprint (id: "business-model")

- Explain in very simple language how the business works day-to-day:
  - how it makes money,
  - what the workflow looks like,
  - one concrete “day in the life” or “week in the life” example.
- Compare briefly with one nearby alternative model and explain
  why this one fits better for this user.

Visuals:
- One value-chain style diagram (type: "value-chain") showing 5–7 steps
  from first contact to payment and follow-up.
- One small table acting as a “mini canvas”:
  columns: ["Component", "Description"]
  rows: Problem, Solution, Channels, Revenue, Costs, Key Metrics.
- Optional simple chart (e.g. conservative vs expected revenue over a few months).

nextMoves for this section:
- 5–7 specific actions, all beginner-friendly and concrete.

----------------------------------------------------------
JSON OUTPUT RULES (FOR THIS PART ONLY):

- Output ONLY:

  <json>
  {
    "meta": { ...BlueprintMeta... },
    "sectionsPart1": [ ...sections with ids "founder-fit", "business-model" ONLY... ]

  }
  </json>

- No globalChecklist here.
- No other properties.
- No extraneous text outside <json>...</json>.
`;

    const userPrompt = `
User background and constraints:
${userInput}

Decision history from the 6-question flow:
${JSON.stringify(history, null, 2)}

Generate ONLY meta and the two sections (founder-fit, business-model) as described in the system prompt.
`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_output_tokens: 6000,
    });

    const raw = safeGetText(response);
    console.log("BLUEPRINT PART1 RAW:", raw.slice(0, 500));

    const parsed = extractFirstJson(raw) as Part1Output;

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Blueprint PART1 generation error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate blueprint part 1",
        message: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
