export interface OptionDetails {
  pros?: string[];
  cons?: string[];
  example?: string;
}

export type Option = {
  key: "A" | "B";
  label: string;
  summary: string;

  details: {
    pros: string[];
    cons: string[];
    example: string;
  };
};

export type QuestionType = {
  step: number;
  question: string;
  options: Option[];
};


export interface HistoryItem {
  step: number;
  question: string;
  choice: "A" | "B";
  optionLabel: string;
}
