import { NextResponse } from "next/server";
import { HistoryItem } from "@/types/question-types";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userInput: string = body.userInput ?? "";
    const history: HistoryItem[] = body.history ?? [];

    // Placeholder blueprint — we will replace with OpenAI logic later
    const blueprint = {
      title: "Your Personalized Business Blueprint (Placeholder)",
      summary:
        "This is a placeholder blueprint. Later this will analyze your answers, personality, skills, and budget.",
      basedOnUser: userInput,
      totalStepsAnswered: history.length,
      decisions: history.map((h) => ({
        step: h.step,
        question: h.question,
        chosen: h.optionLabel,
      })),
      nicheSuggestion: "Placeholder Niche Business",
      monetization: ["Example monetization 1", "Example monetization 2"],
      demandLevel: "High (placeholder)",
      competitionLevel: "Medium (placeholder)",
      stepByStepGuide: [
        "Step 1: Placeholder action",
        "Step 2: Placeholder action",
        "Step 3: Placeholder action",
      ],
      toolsNeeded: ["Example tool A", "Example tool B"],
      exampleNames: ["PlaceholderCo", "TestifyLabs", "BizStarter"],
    };

    return NextResponse.json({
      success: true,
      blueprint,
    });
  } catch (error) {
    console.error("Blueprint API error:", error);
    return NextResponse.json(
      { success: false, error: "Blueprint server error" },
      { status: 500 }
    );
  }
}
