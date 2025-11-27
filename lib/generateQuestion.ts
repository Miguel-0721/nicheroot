import { QuestionType, OptionType, OptionKey, HistoryItem } from "@/types/question-types";

export function generateNextQuestion(
  step: number,
  history: HistoryItem[],
  userInput: string
): QuestionType {

  return {
    step,
    question: `Placeholder question for step ${step}`,
    options: [
      {
        key: "A",
        label: "Option A",
        description: "This is a placeholder description for Option A.",
        pros: ["Pro A1", "Pro A2"],
        cons: ["Con A1"],
        example: "Example scenario for Option A."
      },
      {
        key: "B",
        label: "Option B",
        description: "This is a placeholder description for Option B.",
        pros: ["Pro B1", "Pro B2"],
        cons: ["Con B1"],
        example: "Example scenario for Option B."
      }
    ]
  };
}
