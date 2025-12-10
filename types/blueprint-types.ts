// types/blueprint-types.ts

/**
 * High-level scoring metrics for the whole blueprint.
 * These are shown in the header / summary area.
 */
export type BlueprintScoreMetrics = {
  risk: number;         // 0–100
  skillFit: number;     // 0–100
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
export type SectionContent = {
  /** 1–N paragraphs of explanatory text. */
  paragraphs?: string[];

  /** 0–N bullet lists with optional headings. */
  lists?: ListBlock[];

  /** 0–N tables for structured comparisons / frameworks. */
  tables?: TableBlock[];

  /** 0–N charts for numeric or time-series data. */
  charts?: ChartBlock[];

  /** 0–N conceptual diagrams (funnels, journeys, canvases, etc.). */
  diagrams?: DiagramBlock[];

  /** 0–N image / illustration references. */
  images?: ImageBlock[];

  /** 0–N example collections (e.g. example offers, messages). */
  examples?: ExampleBlock[];

  /**
   * Concrete action items for this specific section.
   * These should be very practical, beginner-friendly steps.
   */
  nextMoves?: string[];
};

/**
 * A logical section of the blueprint (e.g. "Executive Overview",
 * "Market & Demand", "Offer & Pricing").
 *
 * The UI will:
 * - use `id` as a stable key and for URLs / analytics,
 * - show `title` and `eyebrow` in the header,
 * - render blocks from `content` in order.
 */
export type BlueprintSection = {
  /** Stable identifier, e.g. "executive-overview" */
  id: string;
  /** Human-facing section title, e.g. "Executive Overview" */
  title: string;
  /** Small label above the title, e.g. "High-level snapshot" */
  eyebrow?: string;
  /** Main content blocks for this section. */
  content: SectionContent;
};

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
