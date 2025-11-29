// /types/question-types.ts

export interface OptionDetails {
  pros: string[];
  cons: string[];
  example: string;
  whyThisFits: string;  // <-- UPDATED here (camelCase)
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

export interface HistoryItem {
  step: number;
  question: string;
  choice: "A" | "B";
  optionLabel: string;
}
