// /types/question-types.ts

export interface OptionDetails {
  pros: string[];
  cons: string[];
  example: string;
  whyThisFits: string;
}

export type Option = {
  key: "A" | "B";
  label: string;
  summary: string;
  details: OptionDetails;
};

export interface QuestionType {
  step: number;
  question: string;
  options: Option[];
}

// Used for blueprint generation + question flow history
export interface HistoryItem {
  step: number;
  question: string;
  optionKey: "A" | "B";   // <-- canonical name used everywhere
  optionLabel: string;
}
