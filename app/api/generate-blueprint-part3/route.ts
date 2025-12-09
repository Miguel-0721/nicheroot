// app/api/generate-blueprint-part3/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { BusinessBlueprint } from "@/types/blueprint-types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ---------------- Shared Helpers ----------------

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

function safeGetText(response: any): string {
  if (response?.output_text) return response.output_text.trim();

  if (Array.isArray(response?.output)) {
    for (const block of response.output) {
      if (Array.isArray(block?.content)) {
        for (const item of block.content) {
          if (item?.text) return item.text.trim();
        }
      }
    }
  }

  if (response?.content && Array.isArray(response.content)) {
    for (const item of response.content) {
      if (item?.text) return item.text.trim();
    }
  }

  try {
    return JSON.stringify(response);
  } catch {
    return "";
  }
}

// ---------------- Types ----------------

type Part3Output = {
  sectionsPart3: BusinessBlueprint["sections"];
  globalChecklist: string[];
};

// ---------------- Route ----------------

export async function POST(req: Request) {
  try {
    const { userInput, history, part1, part2 } = await req.json();

    if (!userInput || !history || !part1 || !part2) {
      return NextResponse.json(
        { error: "Missing userInput, history, part1 or part2" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are NicheRoot, an AI Business Strategist.

This is **PART 3 of 3**.

You ONLY generate:
- sectionsPart3 for:

    9. Financial Model (12 months)  (id: "financial-model")
    10. 90-Day Action Plan          (id: "action-plan")
    11. Risk Map & Mitigations      (id: "risks")
    12. Tools & Setup               (id: "tools-setup")

- globalChecklist (15–20 clear beginner steps)

DO NOT generate:
- meta
- any earlier sections

Output JSON only:

<json>
{
  "sectionsPart3": [...],
  "globalChecklist": [...]
}
</json>

Rules:
- Same section structure as parts 1 & 2
- Beginner-friendly explanations
- Every chart/table/diagram MUST include an "explanation" interpreting the data
- Checklist steps must begin with verbs and be simple, concrete actions
`;

    const userPrompt = `
User background:
${userInput}

Decision history:
${JSON.stringify(history, null, 2)}

Part 1 context:
${JSON.stringify(part1, null, 2)}

Part 2 context:
${JSON.stringify(part2, null, 2)}

Generate only sections 9–12 + globalChecklist.
`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_output_tokens: 6000,
    });

    const raw = safeGetText(response);
    console.log("BLUEPRINT PART3 RAW:", raw.slice(0, 500));

    const parsed = extractFirstJson(raw) as Part3Output;

    // ---------------- Safety Validation ----------------
    if (!parsed.sectionsPart3 || !Array.isArray(parsed.sectionsPart3)) {
      throw new Error("Part 3 missing required sectionsPart3 array");
    }

    if (!parsed.globalChecklist || !Array.isArray(parsed.globalChecklist)) {
      throw new Error("Part 3 missing globalChecklist array");
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Blueprint PART3 generation error:", err);

    return NextResponse.json(
      {
        error: "Failed to generate blueprint part 3",
        message: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
