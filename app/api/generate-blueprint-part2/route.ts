// app/api/generate-blueprint-part2/route.ts

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

// ---------------- Types ----------------

type Part2Output = {
  sectionsPart2: BusinessBlueprint["sections"];
};

// ---------------- Route Handler ----------------

export async function POST(req: Request) {
  try {
    const { userInput, history, part1 } = await req.json();

    if (!userInput || !history || !part1) {
      return NextResponse.json(
        { error: "Missing userInput, history or part1" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are NicheRoot, an AI Business Strategist.

This is **PART 2 of 3** of the blueprint generator.

You ONLY generate:
- sectionsPart2 (BlueprintSection[]) for these sections:

  4. Market & Demand          (id: "market-demand")
  5. Competitive Landscape    (id: "competition")
  6. ICP & Personas           (id: "icp-personas")
  7. Value Proposition        (id: "value-proposition")
  8. Offer & Pricing          (id: "offer-pricing")

You MUST NOT generate:
- meta
- globalChecklist
- any sections outside ids above.

Final JSON shape:

<json>
{
  "sectionsPart2": [ ...sections 4–8 only... ]
}
</json>

Nothing else.

Use the same types (BlueprintSection, SectionContent, charts, tables, diagrams)
and the same **beginner-friendly style** as in Part 1.

Important: keep explanations very clear. Every chart/table/diagram must have
an "explanation" that interprets the pattern and gives one simple takeaway.

Treat part1.meta and part1.sectionsPart1 as context for consistency
(but do NOT output them again).
`;

    const userPrompt = `
User background and constraints:
${userInput}

Decision history from the 6-question flow:
${JSON.stringify(history, null, 2)}

Context from Part 1 (meta + first sections):
${JSON.stringify(part1, null, 2)}

Generate ONLY sections 4–8 as described in the system prompt.
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
    console.log("BLUEPRINT PART2 RAW:", raw.slice(0, 500));

    const parsed = extractFirstJson(raw) as Part2Output;

    // ⭐ Recommended safety validation
    if (!parsed.sectionsPart2 || !Array.isArray(parsed.sectionsPart2)) {
      throw new Error("Part 2 JSON missing required sectionsPart2 array");
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Blueprint PART2 generation error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate blueprint part 2",
        message: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
