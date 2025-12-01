// /app/api/next-question/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { HistoryItem } from "@/types/question-types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Extract JSON safely
function extractJson(content: string) {
  try {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch (e) {
    console.error("❌ Failed JSON parse:", e);
    return null;
  }
}

interface RequestPayload {
  step: number;
  userInput: string;
  history: HistoryItem[];
  choice?: "A" | "B" | null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestPayload;

    const step = body.step ?? 1;
    const userInput = body.userInput ?? "";
    const history = body.history ?? [];

    // 🔥 SUPERCHARGED QUESTION GENERATOR PROMPT
    const prompt = `
You are **NicheRoot AI**, a senior business strategist.

Your ONLY task is to generate the **next question** that helps diagnose the user's best business direction.

----------------------------------------
RULES
----------------------------------------
1. The question MUST be based on:
   - Their personal story
   - Their previous answers
   - Real-world constraints

2. Step logic:
   - Step 1 → Core constraint
   - Step 2 → Personality & work style
   - Step 3 → Risk profile
   - Step 4 → Strengths & skills
   - Step 5 → Market leaning (digital, local service, physical)
   - Step 6 → Execution style (fast-start vs slow build)

3. Provide **two opposite options**:
   - They MUST represent real trade-offs.
   - They MUST NOT be generic.

4. EACH OPTION MUST HAVE:
   {
     "label": "",
     "summary": "",
     "details": {
       "pros": ["...", "..."],
       "cons": ["...", "..."],
       "example": "",
       "whyThisFits": ""
     }
   }

5. Follow EXACT JSON structure below.

----------------------------------------
RETURN JSON EXACTLY LIKE THIS:
----------------------------------------

{
  "step": ${step},
  "question": "string",
  "options": [
    {
      "key": "A",
      "label": "string",
      "summary": "string",
      "details": {
        "pros": ["string", "string"],
        "cons": ["string", "string"],
        "example": "string",
        "whyThisFits": "string"
      }
    },
    {
      "key": "B",
      "label": "string",
      "summary": "string",
      "details": {
        "pros": ["string", "string"],
        "cons": ["string", "string"],
        "example": "string",
        "whyThisFits": "string"
      }
    }
  ]
}

----------------------------------------
USER STORY:
${userInput}

PREVIOUS ANSWERS:
${JSON.stringify(history, null, 2)}

Generate the next question ONLY. No commentary.
`;

    // Call GPT
    const completion = await client.responses.create({
      model: "gpt-4.1",
      input: prompt,
    });

    const raw = completion.output_text ?? "";
    const parsed = extractJson(raw);

    // Validation
    if (
      !parsed ||
      !parsed.options ||
      !Array.isArray(parsed.options) ||
      parsed.options.length !== 2
    ) {
      console.error("❌ Invalid question JSON:", raw);

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid question structure. The AI did not return proper JSON.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      question: parsed,
    });
  } catch (error) {
    console.error("❌ Error in /api/next-question:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Server error generating next question.",
      },
      { status: 500 }
    );
  }
}
