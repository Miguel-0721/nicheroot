// types/blueprint-types.ts

export interface PricingModel {
  organic: string[];
  paid: string[];
}

export interface MarketingPlan {
  organic: string[];
  paid: string[];
}

export interface BusinessBlueprint {
  title: string;
  subtitle: string;

  // High-level summaries
  situationSummary: string;
  recommendedDirection: string;
  businessModelSummary: string;

  // Offers / products
  offerExamples: string[];

  // Pricing & marketing
  pricing: PricingModel;
  marketingPlan: MarketingPlan;

  // Roadmap
  stepByStepGuide: string[];
  dayOneActions: string[];
  first30Days: string[];

  // Risks
  keyRisks: string[];
  howToReduceRisk: string[];

  // Scaling
  growthLevers: string[];
}
