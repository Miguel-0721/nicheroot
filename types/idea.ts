export type BlueprintIdea = {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  demand: string;
  score?: number;
  signal?: "Gold" | "Silver" | "Bronze";
  locked?: boolean;
  reason?: string;
  summary?: string;
  workCycle?: string; // ✅ ADD THIS
};

