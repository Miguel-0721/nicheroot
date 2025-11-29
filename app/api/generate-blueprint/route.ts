// app/api/generate-blueprint/route.ts

import { NextResponse } from "next/server";
import { HistoryItem } from "@/types/question-types";
import { buildQuestionSummary } from "@/lib/generateQuestion";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userInput: string = body.userInput ?? "";
    const history: HistoryItem[] = body.history ?? [];

    // Build compact readable summary from answered A/B questions
    const questionSummary = buildQuestionSummary(history);

    // --------------------------------------
    // 🚧 Placeholder Blueprint (No AI Yet)
    // --------------------------------------
    // Will be replaced with OpenAI:
    // const openaiRes = await client.chat.completions.create({ ... })
    // --------------------------------------

    const blueprint = {
      title: "Your Personalized Business Blueprint (Placeholder)",

      summary:
        "This is a placeholder blueprint. Later this will use AI to analyze your answers, constraints, personality, goals, and budget.",

      userDescription: userInput,
      decisionsOverview: questionSummary,

      totalStepsAnswered: history.length,
      decisions: history.map((h) => ({
        step: h.step,
        question: h.question,
        chosen: h.optionLabel,
      })),

      nicheSuggestion: "Example Digital Service (Placeholder)",

      monetization: [
        "Monthly Retainers",
        "Digital Packages",
        "Upsells & Add-ons",
      ],

      demandLevel: "High (placeholder)",
      competitionLevel: "Medium (placeholder)",

      stepByStepGuide: [
        "Define your core offer",
        "Study 5 competitors",
        "Build your landing page",
        "Publish sample work",
        "Start cold outreach",
      ],

      toolsNeeded: ["Canva", "Notion", "Stripe", "Simple landing page builder"],

      exampleNames: ["NicheRoot Studio", "ClarityOps", "BrightStart Labs"],
    };

    return NextResponse.json({
      success: true,
      blueprint,
    });
  } catch (error) {
    console.error("Blueprint API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Blueprint server error",
      },
      { status: 500 }
    );
  }
}
