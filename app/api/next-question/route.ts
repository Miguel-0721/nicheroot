import { NextResponse } from "next/server";
import { generateNextQuestion } from "@/lib/generateQuestion";
import { HistoryItem } from "@/types/question-types";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const step: number = body.step ?? 1;
    const userInput: string = body.userInput ?? "";
    const history: HistoryItem[] = body.history ?? [];

    // Generate next question with real content
    const nextQuestion = generateNextQuestion(step, history, userInput);

    return NextResponse.json({
      success: true,
      question: nextQuestion,
    });

  } catch (error) {
    console.error("Error in next-question API:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
