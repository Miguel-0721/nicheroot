import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { userInput, history } = await req.json();

    // Blueprint prompt
    const prompt = `
You are NicheRoot — an AI business blueprint generator.

User's intro / context:
${userInput}

Their 6 trade-off answers:
${history
  .map((h: any) => `Step ${h.step}: ${h.question} — User chose: ${h.optionLabel}`)
  .join("\n")}

Generate a complete business blueprint divided into EXACTLY eight sections.

Your response MUST be ONLY valid JSON:

{
  "overview": "...",
  "situation": "...",
  "strategy": "...",
  "financials": "...",
  "market": "...",
  "actionPlan": "...",
  "risks": "...",
  "tools": "..."
}

RULES:
- NO explanations
- NO markdown formatting
- NO backticks
- NO commentary
ONLY clean JSON.
`;

    // Call OpenAI Responses API
    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    // ---- FIXED OPENAI OUTPUT EXTRACTION ----
// Works for ALL models + removes TypeScript errors
let raw = "";

// 1) Try new Responses API (runtime)
try {
  // @ts-ignore - OpenAI typings are incomplete in v6.x
  raw = completion.output?.[0]?.content?.[0]?.text ?? "";
} catch {}

// 2) Fallback - older format
// @ts-ignore
if (!raw && completion.output_text) {
  // @ts-ignore
  raw = completion.output_text;
}

if (!raw || typeof raw !== "string") {
  throw new Error("OpenAI returned empty or invalid output");
}


    if (!raw) {
      throw new Error("OpenAI returned empty output");
    }

    // CLEAN JSON — remove stray characters
    const cleaned = raw
      .replace(/^[^\{]*/g, "")   // remove anything before {
      .replace(/[^}]*$/g, "");   // remove anything after }

    const json = JSON.parse(cleaned);

    return NextResponse.json(json);
  } catch (err: any) {
    console.error("Blueprint generation error →", err);

    return NextResponse.json(
      {
        error: "Blueprint generation failed",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
