import { NextResponse } from "next/server";
import { QuestionType } from "@/types/question-types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const step = body.step;

    // ---- STATIC DEMO QUESTION ----
    // Replace later with your AI logic.
    const mockQuestion: QuestionType = {
      step,
      question:
        "Which type of business model aligns better with your long-term lifestyle and energy levels?",
      options: [
        {
          key: "A",
          label: "Calmer, predictable, low-pressure work style.",
          details: {
            pros: ["Low stress", "Predictable workflow", "Manageable solo"],
            cons: ["Lower income ceiling", "Slower growth"],
            example: "Subscription-based digital service",
          },
        },
        {
          key: "B",
          label: "Higher performance, more income potential.",
          details: {
            pros: ["High upside", "Fast growth potential", "Exciting & dynamic"],
            cons: ["Higher stress", "More time required"],
            example: "Marketing agency or arbitrage model",
          },
        },
      ],
    };

    return NextResponse.json({
      success: true,
      question: mockQuestion,
    });
  } catch (err) {
    console.error("ERROR in /next-question:", err);
    return NextResponse.json({ success: false });
  }
}
