// /lib/generateQuestion.ts

import OpenAI from "openai";
import { HistoryItem, QuestionType } from "@/types/question-types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

type GenerateQuestionArgs = {
  step: number;
  userInput: string;
  history: HistoryItem[];
};

export async function generateQuestion(
  args: GenerateQuestionArgs
): Promise<QuestionType> {
  const { step, userInput, history } = args;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You are the Question Engine for NicheRoot, an AI that matches people to the right business.",
          "You ask exactly 6 A/B trade-off questions.",
          "",
          "Goal:",
          "- Each question should be tailored to the user's background, capital, constraints and previous choices.",
          "- The questions should progressively zoom in on a specific business direction.",
          "",
          "Rules:",
          "1. You always return JSON only.",
          "2. You must respect the TypeScript shape:",
          "",
          "{",
          '  "step": number,',
          '  "question": string,',
          '  "options": [',
          "    {",
          '      "key": "A" | "B",',
          '      "label": string,',
          '      "summary": string,',
          '      "details": {',
          '        "description"?: string,',
          '        "pros": string[],',
          '        "cons": string[],',
          '        "example"?: string,',
          '        "why_this_fits"?: string',
          "      }",
          "    },",
          "    { ... same for key B ... }",
          "  ]",
          "}",
          "",
          "Content guidelines:",
          "- Use clear, conversational language (not corporate, not cringe).",
          "- Each option's description should be 1–2 short sentences.",
          "- Pros/cons: 2–4 bullet points each, focused on lifestyle, risk, time, and money.",
          "- Example: 1 concrete scenario that matches the user's field and capital.",
          "- why_this_fits: explain in 1–2 sentences why this path could fit THIS user based on the intro and previous choices.",
        ].join("\n"),
      },
      {
        role: "user",
        content: JSON.stringify({
          step,
          userInput,
          history,
        }),
      },
    ],
  });

  const raw = response.choices[0]?.message?.content;

  if (!raw) {
    throw new Error("No content returned from OpenAI for question generation.");
  }

  let parsed: QuestionType;
  try {
    parsed = JSON.parse(raw) as QuestionType;
  } catch (err) {
    console.error("Failed to parse question JSON:", raw);
    throw err;
  }

  // Safety checks / defaults
  if (!parsed.step) parsed.step = step;
  if (!parsed.options || parsed.options.length !== 2) {
    throw new Error("Question must have exactly two options A and B.");
  }

  // Ensure keys are "A" and "B"
  parsed.options[0].key = "A";
  parsed.options[1].key = "B";

  return parsed;
}
