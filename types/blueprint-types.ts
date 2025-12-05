// types/blueprint-types.ts

export type BusinessBlueprint = {
  executiveSummary: {
    model: string;
    audience: string;
    startupCost: string;           // e.g. "Low", "Medium", "High"
    timeToFirstResults: string;    // e.g. "2–4 weeks"
    complexity: string;            // e.g. "Low to Medium"
    metrics: {
      riskScore: number;          // 0–100
      skillFit: number;           // 0–100
      demandScore: number;        // 0–100
      monetizationScore: number;  // 0–100
    };
    nextMoves: string[];          // 3–7 bullets specific to direction check
  };

  founderFit: {
    summary: string;
    radar: {
      riskTolerance: number;     // 0–100
      availableTime: number;     // 0–100
      availableCapital: number;  // 0–100
      skillLeverage: number;     // 0–100
      marketPreference: number;  // 0–100
      workStyle: number;         // 0–100
    };
    nextMoves: string[];         // e.g. adjust hours, risk, capital, etc.
  };

  businessModel: {
    description: string;
    valueChain: string[];        // 3–7 steps
    nextMoves: string[];         // actions to refine offers / delivery
  };

  marketAnalysis: {
    overview: string;
    demandTrend: {
      year: number;              // e.g. 2020–2024
      value: number;             // 0–100 demand index
    }[];
    segments: {
      name: string;
      size: string;              // e.g. "Small", "Medium"
      opportunity: string;
    }[];
    nextMoves: string[];         // research/validation tasks
  };

  competition: {
    table: {
      name: string;
      strength: string;
      weakness: string;
      differentiation: string;
    }[];
    quadrant: {
      xLabel: string;
      yLabel: string;
    };
    nextMoves: string[];         // positioning & differentiation actions
  };

  targetAudience: {
    persona: {
      name: string;
      description: string;
      pains: string[];
      goals: string[];
      motivations: string[];
    };
    nextMoves: string[];         // e.g. interviews, surveys, channel tests
  };

  valueProposition: {
    pains: string[];
    gains: string[];
    painRelievers: string[];
    gainCreators: string[];
    nextMoves: string[];         // refine messaging, offers, proof, etc.
  };

  monetization: {
    streams: {
      name: string;
      percent: number;
      description: string;
    }[];
    pricing: {
      low: number;
      recommended: number;
      premium: number;
    };
    justification: string;
    nextMoves: string[];         // tests, bundles, payment model actions
  };

  financials: {
    projection: {
      month: string;             // "Month 1" … "Month 12"
      revenue: number;
      expenses: number;
    }[];
    costBreakdown: {
      category: string;
      percent: number;
    }[];
    assumptions: {
      key: string;
      value: string;
      reason?: string;
    }[];
    nextMoves: string[];         // financial checks, buffers, targets
  };

  actionPlan: {
    timeline: {
      week: string;              // e.g. "Week 1–2"
      tasks: string[];
    }[];
    nextMoves: string[];         // high-priority execution moves
  };

  risks: {
    matrix: {
      risk: string;
      probability: number;       // 0–100
      impact: number;            // 0–100
    }[];
    mitigations: {
      risk: string;
      strategy: string;
    }[];
    nextMoves: string[];         // monitoring + mitigation steps
  };

  tools: {
    category: string;
    list: {
      name: string;
      purpose: string;
    }[];
    nextMoves: string[];         // what to set up first & how
  };

  sources: {
    reasoning: string[];            // how estimates were made
    suggestedVerifications: string[]; // where to verify in real world
  };

  // Global checklist used by the bottom strip
  checklist: string[];              // 10–20 bullets
};
