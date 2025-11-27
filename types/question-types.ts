export type OptionKey = "A" | "B";

export interface QuestionOption {
  key: OptionKey;
  label: string;
  description?: string;
}

export interface QuestionType {
  step: number;
  question: string;
  options: QuestionOption[];
}

export interface HistoryItem {
  step: number;
  question: string;
  choice: OptionKey;
  optionLabel: string;
}
