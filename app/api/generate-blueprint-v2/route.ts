import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Extract JSON wrapped inside <json> ... </json>
function extractJson(text: string) {
  const start = text.indexOf("<json>");
  const end = text.indexOf("</json>");

  if (start === -1 || end === -1) {
    throw new Error("JSON wrapper not found");
  }

  const jsonText = text.slice(start + 6, end).trim();
  return JSON.parse(jsonText);
}

function safeGetText(response: any): string {
  // 1) Most common case
  if (response.output_text) {
    return response.output_text;
  }

  // 2) Safely scan response blocks
  if (Array.isArray(response.output)) {
    for (const block of response.output) {
      if (Array.isArray(block.content)) {
        for (const item of block.content) {
          if (typeof item.text === "string") {
            return item.text;
          }
        }
      }
    }
  }

  return "";
}



export async function POST(req: Request) {
  try {
    const { idea, userContext } = await req.json();


    if (!idea) {
      return NextResponse.json(
        { error: "Missing idea" },
        { status: 400 }
      );
    }

const contextBlock =
  userContext && userContext.trim().length > 0
    ? `User context (important, tailor the blueprint to this person):
${userContext}

Use this information to adapt scope, difficulty, timelines, and advice.
`
    : "";




    const systemPrompt = `
You are NicheRoot AI.

You MUST output ONLY valid JSON wrapped EXACTLY like this:

<json>
{ ...valid BusinessBlueprint JSON... }
</json>

Rules:
- NO markdown
- NO commentary
- NO text outside <json>
- If you cannot comply, output:

<json>
{}
</json>

Schema:
{
  "meta": {
    "nicheTitle": string,
    "scores": {
      "fit": number,
      "risk": number,
      "demand": number,
      "monetization": number
    }
  },
  "sections": [
    {
      "id": string,
      "title": string,
      "content": {
        "paragraphs": string[],
        "nextMoves"?: string[]
      }
    }
  ]
}
`;

const userPrompt = `
${contextBlock}
Business idea:
${JSON.stringify(idea, null, 2)}

Generate a concise but complete business blueprint.
`;


    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_output_tokens: 3000,
    });

  const raw = safeGetText(response);


    if (!raw) {
      throw new Error("No output from model");
    }

    const parsed = extractJson(raw);

    if (!parsed.sections || parsed.sections.length === 0) {
      throw new Error("Blueprint missing sections");
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Blueprint V2 error:", err);
    return NextResponse.json(
      { error: "Failed to generate blueprint" },
      { status: 500 }
    );
  }
}
