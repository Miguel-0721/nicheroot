// types/blueprint-types.ts

/**
 * High-level scoring metrics for the whole blueprint.
 * These are shown in the header / summary area.
 */
export type BlueprintScoreMetrics = {
  fit: number;          // 0–100
  risk: number;         // 0–100
  demand: number;       // 0–100
  monetization: number; // 0–100
};


/**
 * Meta information about the blueprint: short labels used
 * in the hero/header area and for quick filters later.
 */
export type BlueprintMeta = {
  nicheTitle: string;
  modelName: string;
  difficulty: string;
  startupCost: string;
  expectedTimeline: string;

  // NEW FIELDS
  timeCommitment: string;  // e.g. "5–8 hrs/week"
  modelSummary: string;    // 1-sentence summary of the model
  whyItFits: string;       // 1–2 sentence explanation of why it fits you

  scores: BlueprintScoreMetrics;
};



/**
 * Supported chart types for visualising data in sections.
 * You can map these to Recharts components in the UI.
 */
export type ChartType =
  | "line"
  | "bar"
  | "pie"
  | "radar"
  | "heatmap"
  | "funnel";

/**
 * Generic chart block.
 * - `data` is intentionally flexible so different chart types can shape it.
 * - `xKey` and `yKeys` help the UI know which fields to plot.
 */
export type ChartBlock = {
  title?: string;
  type: ChartType;
  xKey?: string;
  yKeys?: string[];
  data: any[];
  note?: string;
  explanation?: string; // NEW FIELD
};


/**
 * Diagram types describe conceptual flows rather than numeric charts.
 * You can later map these into custom React components (flow, canvas, etc.).
 */
export type DiagramType =
  | "flow"
  | "value-chain"
  | "customer-journey"
  | "canvas"
  | "funnel";

/**
 * Structured diagram block.
 * - `nodes` are labels.
 * - `connections` are pairs of node indices [from, to].
 */
export type DiagramBlock = {
  title?: string;
  type: DiagramType;
  nodes: string[];
  connections: [number, number][];
  notes?: string[];
  explanation: string; // NEW FIELD – required explanation text
};

/**
 * Simple image / illustration reference.
 * - `url` can be internal ("/images/...") or external.
 */
export type ImageBlock = {
  title?: string;
  url: string;
  caption?: string;
};

/**
 * A simple titled list of bullet items.
 */
export type ListBlock = {
  type?: "strengths" | "weaknesses" | "opportunity" | string;
  title?: string;
  items: string[];
};

/**
 * Table with column labels and string cell values.
 * You can keep it generic and let the UI decide how to render each cell.
 */
export type TableBlock = {
  title?: string;
  columns: string[];
  rows: string[][];
  explanation: string; // NEW FIELD ← required
};


/**
 * Group of examples under a small heading.
 * Useful for "sample offers", "sample niches", etc.
 */
export type ExampleBlock = {
  title?: string;
  items: string[];
};

/**
 * The core content payload for a single blueprint section.
 * Each section may use only some of these blocks.
 */

/**
 * A logical section of the blueprint (e.g. "Executive Overview",
 * "Market & Demand", "Offer & Pricing").
 *
 * The UI will:
 * - use `id` as a stable key and for URLs / analytics,
 * - show `title` and `eyebrow` in the header,
 * - render blocks from `content` in order.
 */
export type ContentBlock =
  | {
      type: "paragraph";
      value: string;
    }
  | {
      type: "list";
      value: {
        title?: string;
        ordered?: boolean;
        items: string[];
      };
    }
  | {
      type: "table";
      value: {
        title?: string;
        columns: string[];
        rows: string[][];
        explanation?: string;
      };
    };


export type BlueprintSection = {
  id: string
  title: string
  content: {
    blocks: ContentBlock[]
  }
}


/**
 * The full, modern NicheRoot blueprint shape.
 * This is what the /api/generate-blueprint route should return
 * and what the /blueprint page should render.
 */
export type BusinessBlueprint = {
  /** High-level labels and scores used in the hero and summary strip. */
  meta: BlueprintMeta;

  /**
   * Ordered list of sections (Executive Overview, Founder Fit,
   * Market, Competition, etc.). The UI will drive the sidebar
   * and active tab state from this array.
   */
  sections: BlueprintSection[];

  /**
   * Global checklist of concrete steps from zero to first stable revenue.
   * These are separate from per-section "nextMoves" and can be used
   * in a sticky footer, sidebar or dedicated "Checklist" tab.
   */
  globalChecklist: string[];
};
