// /lib/generateQuestions.ts

import { HistoryItem } from "@/types/question-types";

/**
 * Turns the answered A/B questions into a compact text summary
 * that we feed into /api/generate-blueprint.
 */
export function buildQuestionSummary(history: HistoryItem[]): string {
  if (!history || history.length === 0) {
    return "The user has not answered any trade-off questions yet.";
  }

  const lines = history.map((item, index) => {
    return [
      `${index + 1}. Question: ${item.question}`,
      `   Chosen option: ${item.optionLabel} (key ${item.choice})`,
    ].join("\n");
  });

  return lines.join("\n\n");
}
