// app/api/generate-blueprint/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { BusinessBlueprint } from "@/types/blueprint-types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Safely extract first JSON object from a text blob
function extractFirstJson(text: string): any {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON object found in response.");
  }
  return JSON.parse(match[0]);
}

// Handle different possible shapes from the Responses API
function safeGetText(response: any): string {
  // New unified format
  if (response.output_text) {
    return response.output_text;
  }

  // responses.create with "output" array
  if (response.output?.length > 0) {
    const first = response.output[0];
    if (first.content?.length > 0 && first.content[0].text) {
      return first.content[0].text;
    }
  }

  // ChatCompletion-like
  if (response.choices?.length > 0) {
    const msg = response.choices[0].message;
    if (msg?.content) return msg.content;
  }

  return JSON.stringify(response, null, 2);
}

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

Your ONLY job is to return a SINGLE JSON object that matches EXACTLY this TypeScript shape:

type BusinessBlueprint = {
  executiveSummary: {
    model: string;
    audience: string;
    startupCost: string;
    timeToFirstResults: string;
    complexity: string;
    metrics: {
      riskScore: number;
      skillFit: number;
      demandScore: number;
      monetizationScore: number;
    };
    nextMoves: string[];
  };
  founderFit: {
    summary: string;
    radar: {
      riskTolerance: number;
      availableTime: number;
      availableCapital: number;
      skillLeverage: number;
      marketPreference: number;
      workStyle: number;
    };
    nextMoves: string[];
  };
  businessModel: {
    description: string;
    valueChain: string[];
    nextMoves: string[];
  };
  marketAnalysis: {
    overview: string;
    demandTrend: { year: number; value: number }[];
    segments: { name: string; size: string; opportunity: string }[];
    nextMoves: string[];
  };
  competition: {
    table: { name: string; strength: string; weakness: string; differentiation: string }[];
    quadrant: { xLabel: string; yLabel: string };
    nextMoves: string[];
  };
  targetAudience: {
    persona: {
      name: string;
      description: string;
      pains: string[];
      goals: string[];
      motivations: string[];
    };
    nextMoves: string[];
  };
  valueProposition: {
    pains: string[];
    gains: string[];
    painRelievers: string[];
    gainCreators: string[];
    nextMoves: string[];
  };
  monetization: {
    streams: { name: string; percent: number; description: string }[];
    pricing: { low: number; recommended: number; premium: number };
    justification: string;
    nextMoves: string[];
  };
  financials: {
    projection: { month: string; revenue: number; expenses: number }[];
    costBreakdown: { category: string; percent: number }[];
    assumptions: { key: string; value: string; reason?: string }[];
    nextMoves: string[];
  };
  actionPlan: {
    timeline: { week: string; tasks: string[] }[];
    nextMoves: string[];
  };
  risks: {
    matrix: { risk: string; probability: number; impact: number }[];
    mitigations: { risk: string; strategy: string }[];
    nextMoves: string[];
  };
  tools: {
    category: string;
    list: { name: string; purpose: string }[];
    nextMoves: string[];
  };
  sources: {
    reasoning: string[];
    suggestedVerifications: string[];
  };
  checklist: string[];
};

IMPORTANT RULES:

- Return ONLY raw JSON. No markdown, no comments, no backticks, no extra text.
- All string fields must be plain text without markdown.
- Every "nextMoves" array must contain 3–7 short, concrete, actionable steps tailored to THAT SECTION ONLY.
  - executiveSummary.nextMoves → high-level validation & direction decisions.
  - founderFit.nextMoves → adjust time, capital, risk, and skill focus.
  - businessModel.nextMoves → refine offers, delivery, and value chain.
  - marketAnalysis.nextMoves → demand validation, segment research.
  - competition.nextMoves → positioning and differentiation actions.
  - targetAudience.nextMoves → audience research, interviews, messaging tests.
  - valueProposition.nextMoves → refine pains/gains mapping and proof.
  - monetization.nextMoves → pricing tests, packages, recurring models.
  - financials.nextMoves → check assumptions, buffers, revenue milestones.
  - actionPlan.nextMoves → what to do FIRST in the execution roadmap.
  - risks.nextMoves → mitigation, monitoring, contingency actions.
  - tools.nextMoves → which tools to set up in what order.
- "checklist" is a global list of 10–20 steps you consider the minimal path from zero to first stable revenue.
- financials.projection MUST have 12 months: "Month 1" ... "Month 12".
- demandTrend MUST be realistic and monotonic or slightly noisy, not random.

You MUST ensure the JSON is syntactically valid.
`;

    const userPrompt = `
User background and constraints:
${userInput}

Decision history from the 6-question flow:
${JSON.stringify(history, null, 2)}

Using this information, generate a complete BusinessBlueprint JSON object that follows the schema exactly.
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_output_tokens: 6000,
    });

    const raw = safeGetText(response);
    console.log("BLUEPRINT RAW:", raw);

    const parsed = extractFirstJson(raw) as BusinessBlueprint;

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Blueprint generation error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate blueprint",
        message: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
