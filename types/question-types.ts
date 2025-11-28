export interface Option {
  key: "A" | "B";
  label: string;
  summary: string;
  pros: string[];
  cons: string[];
  example: string;
}

export interface QuestionType {
  step: number;
  question: string;
  options: Option[];
}

export interface HistoryItem {
  step: number;
  question: string;
  choice: "A" | "B";
  optionLabel: string;
}
