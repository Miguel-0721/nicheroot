"use client";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  BusinessBlueprint,
  BlueprintSection,
  SectionContent,
  ChartBlock,
  DiagramBlock,
} from "@/types/blueprint-types";

import type { BlueprintIdea } from "@/types/idea";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

type SavedBlueprint = {
  id: string;
  createdAt: string;
  label: string;
  data: BusinessBlueprint;
};

const STORAGE_KEY = "nicheroot_blueprints_v2";

export default function BlueprintPage() {
  const searchParams = useSearchParams();

/* ---------------- SMALL HOVER TOOLTIP ---------------- */
function HoverTooltip({ text, color }: { text: string; color: string }) {
  const bg = {
    risk: "bg-rose-600/95 border-rose-400/60",
    skillFit: "bg-emerald-600/95 border-emerald-400/60",
    demand: "bg-blue-600/95 border-blue-400/60",
    monetization: "bg-purple-600/95 border-purple-400/60",
  }[color] || "bg-gray-900/95 border-gray-700/60";

  return (
    <div
      className={`
        absolute left-1/2 top-full mt-2 -translate-x-1/2 w-64
        rounded-lg backdrop-blur-sm text-white text-xs p-3 shadow-xl
        opacity-0 group-hover:opacity-100 pointer-events-none
        transition-all duration-200 z-50 border
        ${bg}
      `}
    >
      {text}
    </div>
  );
}



  
  const [blueprint, setBlueprint] = useState<BusinessBlueprint | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeIdea, setActiveIdea] = useState<BlueprintIdea | null>(null);
  const [savedList, setSavedList] = useState<SavedBlueprint[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);


  
  /* ---------------- LOAD FROM LOCALSTORAGE BY ID ---------------- */
  
  // 🔹 Load active idea immediately (Explore → Blueprint)
useEffect(() => {
  const raw = sessionStorage.getItem("nicheroot_active_idea");
  if (!raw) return;

  try {
    setActiveIdea(JSON.parse(raw));
  } catch {
    console.warn("Invalid active idea in sessionStorage");
  }
}, []);

  
  useEffect(() => {
    if (typeof window === "undefined") return;


    
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: SavedBlueprint[] = raw ? JSON.parse(raw) : [];

      // Keep only v2 blueprints (with meta + sections)
      const valid = parsed.filter(
        (b) =>
          b &&
          b.data &&
          (b.data as any).meta &&
          Array.isArray((b.data as any).sections)
      );

      setSavedList(valid);

      const idFromUrl = searchParams.get("id");

      if (idFromUrl) {
        const found = valid.find((b) => b.id === idFromUrl);
        if (found) {
          setBlueprint(found.data);
          (window as any).__blueprint = found.data;

          setCurrentId(found.id);
          if (found.data.sections?.length > 0) {
            setActiveTab(found.data.sections[0].id);
          } else {
            setActiveTab("checklist");
          }
        } else {
          setBlueprint(null);
          setActiveTab(null);
        }
      } else if (valid.length > 0) {
        // fallback: last blueprint
        const last = valid[valid.length - 1];
        setBlueprint(last.data);
        setCurrentId(last.id);
        if (last.data.sections?.length > 0) {
          setActiveTab(last.data.sections[0].id);
        } else {
          setActiveTab("checklist");
        }
      } else {
        setBlueprint(null);
        setActiveTab(null);
      }
    } catch (e) {
      console.error("Failed to load blueprints from localStorage:", e);
      setBlueprint(null);
      setActiveTab(null);
    }


// 🔹 If no saved blueprint exists BUT we have an active idea,
// we will generate a new blueprint (handled next step)



    setLoading(false);
  }, [searchParams]);

// 🔹 Generate blueprint from active idea (Explore → Blueprint)
useEffect(() => {
  if (!activeIdea) return;
  if (blueprint) return;

  const idea = activeIdea; // ✅ snapshot (now TypeScript knows it's not null)

  async function generateFromIdea() {
    setLoading(true);

    try {
      const res = await fetch("/api/generate-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea, // ✅ use snapshot
          source: "explore",
        }),
      });

      const data = await res.json();

      const newSaved = {
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
        label: idea.name, // ✅ use snapshot
        data,
      };

      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const updated = [...existing, newSaved];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      setBlueprint(data);
      setCurrentId(newSaved.id);

      if (data.sections?.length > 0) {
        setActiveTab(data.sections[0].id);
      }

      sessionStorage.removeItem("nicheroot_active_idea");
      sessionStorage.removeItem("nicheroot_user_context");
    } catch (e) {
      console.error("Blueprint generation failed", e);
    } finally {
      setLoading(false);
    }
  }

  generateFromIdea();
}, [activeIdea, blueprint]);




  /* ---------------- DISPLAY NAME ---------------- */
const displayName = useMemo(() => {
  if (!blueprint) return "Your blueprint";

  const niche = blueprint.meta?.nicheTitle?.trim();
  const model = blueprint.meta?.modelName?.trim();
  const raw = niche || model || "";

  if (!raw) return "Your blueprint";
  return raw.length < 90 ? raw : raw.slice(0, 90) + "…";
}, [blueprint]);


  /* ---------------- SCORE EXPLANATIONS (FULL PREMIUM VERSION) ---------------- */
const scoreExplanations: Record<string, string> = {
  risk: `
Risk Score reflects how stable or fragile this business model is.

Calculated from:
• Market volatility in your selected niche
• Dependency on a small number of clients
• Operational complexity and failure rate patterns
• One-time revenue vs recurring revenue balance

Lower scores indicate higher risk.
To improve: choose models with recurring revenue, broader demand, or simpler operations.

This score is based on your personal inputs + market assumptions.
`,

  skillFit: `
Skill Fit measures how strongly your existing strengths align with this model.

Calculated from:
• The skills you selected during matching
• Core competencies required (sales, technical, creative, operational)
• Level of specialization the model requires

Higher scores mean you naturally fit this business.
To improve: choose ideas that rely more on your strongest proven abilities.

This score is based on your personal inputs + model competencies.
`,

  demand: `
Demand Score estimates current and emerging market appetite.

Calculated from:
• Search trends and audience size
• Market growth rates
• Existing saturation and competitor intensity
• How necessary or urgent the product/service is

Higher scores indicate easier customer acquisition.
To improve: target broader markets or underserved segments.

This score is based on your personal inputs + market data patterns.
`,

  monetization: `
Monetization Score evaluates earning strength and revenue potential.

Calculated from:
• Number and quality of revenue streams
• Pricing power and margin potential
• Scalability of the offer
• Profitability benchmarks in similar business models

Higher scores mean stronger earning potential.
To improve: choose models with stronger pricing, multiple revenue streams, or low cost of delivery.

This score is based on your personal inputs + financial assumptions for the model.
`,
};



  /* ---------------- SCORE CARDS ---------------- */
  const scoreCards = useMemo(() => {
    if (!blueprint?.meta?.scores) return [];
    const s = blueprint.meta.scores;

    return [
      {
        key: "risk",
        label: "Risk score",
        value: s.risk,
        hint: "How aggressive and fragile this model is.",
      },
      {
        key: "skillFit",
        label: "Skill fit",
        value: s.skillFit,
        hint: "How well it matches your strengths.",
      },
      {
        key: "demand",
        label: "Demand score",
        value: s.demand,
        hint: "Estimated market appetite.",
      },
      {
        key: "monetization",
        label: "Monetization",
        value: s.monetization,
        hint: "Strength of the revenue engine.",
      },
    ];
  }, [blueprint]);

  /* ---------------- NEXT ACTIONS STRIP ---------------- */
  const nextActions = useMemo(() => {
    if (!blueprint) return [];
    if (blueprint.globalChecklist?.length) {
      return blueprint.globalChecklist.slice(0, 5);
    }
    const firstSection = blueprint.sections?.[0];
    if (firstSection?.content?.nextMoves?.length) {
      return firstSection.content.nextMoves.slice(0, 5);
    }
    return [];
  }, [blueprint]);

  function handleSelectSaved(id: string) {
    const found = savedList.find((b) => b.id === id);
    if (!found) return;
    setCurrentId(id);
    setBlueprint(found.data);
(window as any).__blueprint = found.data;


    if (found.data.sections?.length > 0) {
      setActiveTab(found.data.sections[0].id);
    } else {
      setActiveTab("checklist");
    }
  }

  function handlePrint() {
    if (typeof window !== "undefined") window.print();
  }

  
  // Build tabs dynamically from sections + checklist

if (!blueprint || !blueprint.sections || !Array.isArray(blueprint.sections)) {
  return (
    <main className="min-h-screen bg-[var(--background)] pt-24 px-6">
      <p className="text-sm text-red-500">
        Invalid blueprint format. Please generate a new blueprint.
      </p>
    </main>
  );
}

 const sectionTabs = blueprint.sections.map((section) => ({
  id: section.id,
  label: section.title,
  icon: iconForSection(section.id),
}));

  const allTabs = [
    ...sectionTabs,
    { id: "checklist", label: "Checklist", icon: "☑️" },
  ];

  /* ---------------- LOADING / EMPTY ---------------- */
  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] pt-24 px-6">
        <p className="text-sm text-gray-500">Loading…</p>
      </main>
    );
  }

  if (!blueprint) {
    return (
      <main className="min-h-screen bg-[var(--background)] pt-24 px-6">
        <p className="text-sm text-red-500">
          No blueprint available. Go through the questions again.
        </p>
      </main>
    );
  }

  const activeSection =
    activeTab && activeTab !== "checklist"
      ? blueprint.sections.find((s) => s.id === activeTab) ?? null
      : null;

  const meta = blueprint.meta;

  /* =====================================================================
     PAGE
  ===================================================================== */
  if (blueprint) {
  (window as any).__blueprint = blueprint;
}
  
  return (
   <main className="min-h-screen bg-[var(--background)] pt-10 pb-16 px-4 md:px-6 text-gray-900">

      <div className="mx-auto max-w-6xl space-y-10">
   <header className="px-1 pt-1">



  {/* TOP ROW: TITLE + ACTIONS */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

{/* LEFT → Title Group */}
<div className="max-w-3xl space-y-1 pt-2">
  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--brand-500)]">
    Business Blueprint
  </p>

  <h1 className="text-4xl font-semibold leading-snug text-gray-900 tracking-tight">
    {displayName}
  </h1>

  <p className="text-[15px] text-gray-600 max-w-xl leading-relaxed">
    Generated from your constraints, goals, and trade-offs.
  </p>
</div>


{/* ❤️ ADD THIS EXACT DIVIDER HERE */}
<div className="h-px bg-gray-200/70 mt-4"></div>

{/* RIGHT → Actions Group */}




    {/* RIGHT → Actions Group */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

      {/* Selector */}
      <div className="flex flex-col">
        <label className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 mb-1">
          Your saved blueprints
        </label>

        <div className="relative">
          <select
            value={currentId ?? ""}
            onChange={(e) => handleSelectSaved(e.target.value)}
            className="w-40 rounded-full border border-gray-300 bg-white px-4 pr-8 py-1.5 text-sm shadow-sm hover:border-gray-400 transition"
          >
            <option value="">Current Blueprint</option>
            {savedList.slice().reverse().map((b) => (
              <option key={b.id} value={b.id}>{b.label}</option>
            ))}
          </select>

          {/* SVG Chevron */}
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Slim Print Button */}
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-500)]
                   px-4 py-1.5 text-sm font-medium text-white shadow-sm
                   hover:bg-[var(--brand-400)] transition active:scale-[0.97]
                   focus:ring-2 focus:ring-[var(--brand-400)]"
      >
        <span className="text-base leading-none">🖨️</span>
        PDF
      </button>

    </div>
  </div>

</header>







<div className="h-px bg-gray-200/70 mt-4 mb-4"></div>


{/* === SCORE CARDS (Premium Clean SaaS Style – Recommended) === */}
{scoreCards.length > 0 && (
  <section className="grid gap-5 sm:grid-cols-2 md:grid-cols-4 mt-6">





    {scoreCards.map((card, idx) => {
      const borderColors: Record<string, string> = {
        risk: "border-rose-300",
        skillFit: "border-emerald-300",
        demand: "border-blue-300",
        monetization: "border-purple-300",
      };

      const textColors: Record<string, string> = {
        risk: "text-rose-600",
        skillFit: "text-emerald-600",
        demand: "text-blue-600",
        monetization: "text-purple-600",
      };

      const icons: Record<string, string> = {
        risk: "🔥",
        skillFit: "🎯",
        demand: "📈",
        monetization: "💰",
      };

      return (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.05 }}
          className={`rounded-lg bg-white p-4 shadow border ${borderColors[card.key]}
              transition-all hover:shadow-md`}


        >
       {/* Icon + Label + Tooltip trigger */}
<div className="flex items-center gap-2 mb-1 relative">


  {/* Icon */}
  <span className="text-lg">{icons[card.key]}</span>

  {/* Label */}
  <p className={`text-[12px] uppercase font-semibold tracking-wide ${textColors[card.key]}`}>
    {card.label}
  </p>

  {/* INFO ICON WITH TOOLTIP */}
  <div className="relative group inline-flex items-center">
    <span className="text-gray-400 text-sm cursor-pointer select-none">ⓘ</span>
    <HoverTooltip text={scoreExplanations[card.key]} color={card.key} />

  </div>

</div>


          {/* Value */}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-gray-900">
              {card.value}
            </span>
            <span className="text-xs text-gray-600">/ 100</span>
          </div>

          {/* Hint */}
          <p className="mt-1 text-[11px] text-gray-600">{card.hint}</p>
        </motion.div>
      );
    })}
  </section>
)}










        {/* MAIN LAYOUT */}
        <section className="grid items-start gap-8 lg:grid-cols-[260px,1fr] mt-4">

          {/* SIDEBAR */}
          <aside className="space-y-4 pr-2">

  {/* Modern Minimal Sidebar */}
  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
    <p className="mb-3 text-[11px] font-semibold uppercase text-gray-500 tracking-wide">
      Sections
    </p>

    <nav className="flex flex-col">
      {allTabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative flex items-center gap-2 px-3 py-2 text-left text-sm transition
              ${isActive ? "font-semibold text-gray-900" : "text-gray-600 hover:text-gray-900"}
            `}
          >
            {/* Left accent bar */}
            <span
              className={`
                absolute left-0 top-0 h-full w-[3px] rounded-r-md transition-all
                ${isActive ? "bg-[var(--brand-500)]/80" : "bg-transparent"}

              `}
            />

            {/* Icon */}
            <span className={`${isActive ? "text-[var(--brand-500)]" : "text-gray-400"}`}>
              {tab.icon}
            </span>

            {/* Label */}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  </div>

  {/* Sidebar help box */}
  <div className="rounded-2xl bg-indigo-50 p-4 text-[12px] text-gray-800 shadow-sm ring-1 ring-indigo-100">
    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
      How to use this
    </p>
    <p className="mb-1">
      Move through the sections in order. Each section ends with{" "}
      <span className="font-semibold">Next moves</span>.
    </p>
    <p className="mt-1 text-[11px] text-gray-600">
      Revisit this blueprint as your assumptions evolve.
    </p>
  </div>

</aside>


          {/* CONTENT CARD */}
          <div className="space-y-6 rounded-xl bg-white p-5 shadow ring-1 ring-gray-200">

            {/* SECTION CONTENT */}
            {activeTab === "checklist" ? (
              <SectionBlock
                title="Global checklist"
                eyebrow="High-level to-do list from zero to first stable revenue."
              >
                <ChecklistBlock checklist={blueprint.globalChecklist} />
              </SectionBlock>
            ) : activeSection ? (
           <SectionBlock
  title={activeSection.title}
  eyebrow={activeSection.eyebrow}
>
  <SectionContentRenderer
    content={activeSection.content}
    meta={meta}
    isExecutive={activeSection.id === "executive-overview"}
  />
</SectionBlock>

            ) : (
              <p className="text-sm text-gray-500">
                Select a section from the sidebar to view the details.
              </p>
            )}
          </div>
        </section>

        {/* GLOBAL NEXT ACTION STRIP */}
        {nextActions.length > 0 && (
          <div className="rounded-3xl bg-white/90 p-5 text-[13px] shadow ring-1 ring-gray-200">
            <p className="mb-2 text-[11px] font-semibold uppercase text-gray-500">
              Immediate next moves
            </p>
            <ol className="list-decimal space-y-1 pl-5">
              {nextActions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}

/* =====================================================================
   SUBCOMPONENTS
===================================================================== */

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/90 p-4 text-xs shadow-sm ring-1 ring-gray-200">
      <p className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="text-[13px] text-gray-800 line-clamp-3">{value}</p>
    </div>
  );
}

function SectionBlock({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Eyebrow */}
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          {eyebrow}
        </p>
      )}

      {/* Title */}
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
        {title}
      </h2>

      {/* Content wrapper */}
      <div className="prose prose-sm max-w-none text-gray-800 space-y-6">
        {children}
      </div>
    </div>
  );
}

function NextMovesBlock({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-6 rounded-xl bg-gray-50 p-4 text-[13px] ring-1 ring-gray-200">
      <p className="mb-2 text-[11px] uppercase tracking-wide text-gray-500">
        Next moves
      </p>
      <ul className="space-y-1 list-disc pl-4">
        {items.map((it, idx) => (
          <li key={idx}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
/* ---------- SECTION CONTENT RENDERER (CLEAN + STABLE) ---------- */
function SectionContentRenderer({
  content,
  meta,
  isExecutive,
}: {
  content: SectionContent;
  meta: BusinessBlueprint["meta"];
  isExecutive?: boolean;
}) {
  const {
    paragraphs = [],
    lists = [],
    tables = [],
    charts = [],
    diagrams = [],
    images = [],
    examples = [],
    nextMoves = [],
  } = content;

  // ---------- BUSINESS SNAPSHOT (only for Executive Overview) ----------
  let snapshot: React.ReactNode = null;


  if (isExecutive && meta) {
    snapshot = (
      <div className="rounded-xl bg-gray-50 p-4 text-[13px] ring-1 ring-gray-200 space-y-1">
        <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">
          Business Snapshot
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-gray-700">
          <p>
            <span className="font-semibold">Business model:</span>{" "}
            {meta.modelName}
          </p>
          <p>
            <span className="font-semibold">Difficulty:</span>{" "}
            {meta.difficulty}
          </p>
          <p>
            <span className="font-semibold">Startup cost:</span>{" "}
            {meta.startupCost}
          </p>
          <p>
            <span className="font-semibold">First results:</span>{" "}
            {meta.expectedTimeline}
          </p>
          <p>
            <span className="font-semibold">Profile:</span>{" "}
            {meta.difficulty} · {meta.startupCost}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Snapshot box at the top (only for Executive Overview) */}
      {snapshot}

      {/* ---------- PARAGRAPHS ---------- */}
      {paragraphs.length > 0 && (
        <div className="space-y-3">
          {paragraphs.map((p, idx) => (
            <div
              key={idx}
              className="prose prose-sm text-gray-800 whitespace-pre-wrap"
            >
              <ReactMarkdown>{p}</ReactMarkdown>
            </div>
          ))}
        </div>
      )}

      {/* ---------- LIST BLOCKS (Strengths, Weaknesses, Opportunity) ---------- */}
      {lists.length > 0 && (
        <div className="space-y-4">
          {/* Row 1: Strengths + Weaknesses */}
          <div className="grid gap-4 md:grid-cols-2">
            {lists
              .filter(
                (l: any) =>
                  l.type === "strengths" ||
                  l.type === "weaknesses" ||
                  !l.type // backwards compatibility
              )
              .map((block: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-gray-50 p-5 shadow-sm ring-1 ring-gray-200"
                >
                  <h3 className="mb-3 text-[14px] font-semibold text-gray-900">
                    {block.title}
                  </h3>

                  <ul className="list-disc pl-5 space-y-1.5 text-[13px]">
                    {block.items.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>

          {/* Row 2: Opportunity → Full width purple */}
          {lists.some((l: any) => l.type === "opportunity") && (
            <div className="rounded-2xl bg-indigo-50 p-5 shadow-sm ring-1 ring-indigo-200">
              {lists
                .filter((l: any) => l.type === "opportunity")
                .map((block: any, idx: number) => (
                  <div key={idx}>
                    <h3 className="mb-3 text-[14px] font-semibold text-indigo-900">
                      {block.title}
                    </h3>

                    <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-indigo-900/90">
                      {block.items.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ---------- TABLES ---------- */}
      {tables.length > 0 && (
        <div className="space-y-4">
          {tables.map((table: any, idx: number) => (
            <div
              key={idx}
              className="overflow-x-auto rounded-xl bg-gray-50 p-4 text-[12px] ring-1 ring-gray-200 space-y-3"
            >
              {table.title && (
                <p className="text-[12px] font-semibold uppercase text-gray-700">
                  {table.title}
                </p>
              )}

              <table className="min-w-full border-separate border-spacing-y-1">
                <thead className="text-[11px] text-gray-500">
                  <tr>
                    {table.columns.map((col: string, i: number) => (
                      <th key={i} className="px-2 py-1 text-left">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {table.rows.map((row: string[], rIdx: number) => (
                    <tr key={rIdx} className="bg-white/70">
                      {row.map((cell: string, cIdx: number) => (
                        <td key={cIdx} className="px-2 py-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {table.explanation && (
                <div className="mt-3 ml-1">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Insight
                  </p>
                  <p className="text-[13px] text-gray-700 leading-relaxed">
                    {table.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ---------- CHARTS ---------- */}
      {charts.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {charts.map((chart, idx) => (
            <ChartBlockRenderer key={idx} chart={chart as ChartBlock} />
          ))}
        </div>
      )}

      {/* ---------- DIAGRAMS ---------- */}
      {diagrams.length > 0 && (
        <div className="space-y-4">
          {diagrams.map((d, idx) => (
            <DiagramBlockRenderer key={idx} diagram={d as DiagramBlock} />
          ))}
        </div>
      )}

      {/* ---------- IMAGES ---------- */}
      {images.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {images.map((img: any, idx: number) => (
            <figure
              key={idx}
              className="overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-200"
            >
              <img
                src={img.url}
                alt={img.caption || img.title || "Blueprint illustration"}
                className="h-48 w-full object-cover"
              />
              {(img.title || img.caption) && (
                <figcaption className="p-3 text-[12px] text-gray-700">
                  {img.title && (
                    <p className="font-semibold text-gray-900">{img.title}</p>
                  )}
                  {img.caption && <p>{img.caption}</p>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {/* ---------- EXAMPLES ---------- */}
      {examples.length > 0 && (
        <div className="space-y-3">
          {examples.map((ex: any, idx: number) => (
            <div
              key={idx}
              className="rounded-xl bg-indigo-50/80 p-4 text-[13px] ring-1 ring-indigo-100"
            >
              {ex.title && (
                <p className="mb-2 text-[12px] font-semibold uppercase text-indigo-700">
                  {ex.title}
                </p>
              )}
              <ul className="list-disc pl-4 space-y-1">
                {ex.items.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* ---------- NEXT MOVES ---------- */}
      <NextMovesBlock items={nextMoves} />
    </div>
  );
}


/* ---------- CHART RENDERER (FINAL FIXED VERSION) ---------- */
function ChartBlockRenderer({ chart }: { chart: ChartBlock }) {
  const { title, type, data = [], xKey, yKeys, note } = chart;

  // Try to infer keys from the first row if user didn't supply xKey/yKeys
  const firstRow = data && data.length > 0 ? data[0] : undefined;

  const safeXKey =
    xKey ||
    (type === "pie"
      ? undefined
      : firstRow
      ? Object.keys(firstRow)[0]
      : undefined);

  const safeYKeys =
    (yKeys && yKeys.length > 0
      ? yKeys
      : firstRow
      ? Object.keys(firstRow).filter(
          (k) => typeof (firstRow as any)[k] === "number"
        )
      : []) as string[];

  // If no data or no keys → Show friendly message
  if (
    !data ||
    data.length === 0 ||
    (!safeXKey && type !== "pie") ||
    safeYKeys.length === 0
  ) {
    return (
      <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200 text-[12px] text-gray-500">
        {title && (
          <p className="mb-2 text-[12px] font-semibold uppercase text-gray-600">
            {title}
          </p>
        )}
        No visual data available for this chart.
      </div>
    );
  }

  // Prevent 0x0 container (this was breaking your other charts)
  const containerStyle = {
    minHeight: 260,
    width: "100%",
  };

  const palette = ["#6366F1", "#10B981", "#F97316", "#EC4899"];

  return (
    <div className="flex flex-col rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
      {title && (
        <p className="mb-2 text-[12px] font-semibold uppercase text-gray-600">
          {title}
        </p>
      )}

      <div style={containerStyle}>
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={safeXKey} />
              <YAxis />
              <Tooltip />
              {safeYKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={palette[i % palette.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          ) : type === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={safeXKey} />
              <YAxis />
              <Tooltip />
              {safeYKeys.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={palette[i % palette.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          ) : type === "pie" ? (
            <PieChart>
              <Pie
                data={data}
                dataKey={safeYKeys[0]}
                nameKey={safeXKey || "label"}
                fill={palette[0]}
                label
              />
            </PieChart>
          ) : type === "radar" ? (
            <RadarChart
              data={data}
              cx="50%"
              cy="50%"
              outerRadius="68%"
              margin={{ top: 20, right: 90, bottom: 20, left: 20 }}
            >
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis
                dataKey={safeXKey}
                tick={{
                  fontSize: 12,
                  fill: "#4B5563",
                  width: 80,
                }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                stroke="#E5E7EB"
              />
              <Radar
                dataKey={safeYKeys[0]}
                fill={palette[0]}
                stroke={palette[0]}
                fillOpacity={0.45}
              />
            </RadarChart>
          ) : type === "funnel" ? (
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey={safeXKey} type="category" />
              <Tooltip />
              <Bar dataKey={safeYKeys[0]} fill={palette[0]} />
            </BarChart>
          ) : type === "heatmap" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={safeXKey} />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey={safeYKeys[0]}
                fill={palette[0]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            // FINAL fallback
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={safeXKey} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={safeYKeys[0]} fill={palette[0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Insight below chart */}
      {chart.explanation && (
        <div className="mt-3 ml-1">
          <p className="text-[11px] font-semibold uppercase text-gray-500 tracking-wide">
            Insight
          </p>
          <p className="text-[13px] leading-relaxed text-gray-700">
            {chart.explanation}
          </p>
        </div>
      )}

      {note && (
        <p className="mt-2 text-[11px] text-gray-500">{note}</p>
      )}
    </div>
  );
}

/* ---------- DIAGRAM RENDERER ---------- */
function DiagramBlockRenderer({ diagram }: { diagram: DiagramBlock }) {
  const { title, type, nodes, connections, notes, explanation } = diagram;

  // Build a simple linear flow if connections are present
  const orderedNodes =
    connections && connections.length > 0
      ? buildLinearFlow(nodes, connections)
      : nodes;

  const chipColor =
    type === "funnel"
      ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
      : type === "customer-journey"
      ? "bg-indigo-50 text-indigo-800 ring-indigo-100"
      : type === "value-chain"
      ? "bg-amber-50 text-amber-800 ring-amber-100"
      : "bg-gray-50 text-gray-800 ring-gray-200";

  return (
    <>
      <div className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-gray-200">
        {/* Title */}
        {title && (
          <p className="text-[12px] font-semibold uppercase text-gray-700">
            {title}
          </p>
        )}

        {/* Node Flow */}
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          {orderedNodes.map((node, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs ring-1 ${chipColor}`}
              >
                {node}
              </span>
              {idx < orderedNodes.length - 1 && (
                <span className="text-gray-400 text-sm">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        {notes && notes.length > 0 && (
          <ul className="mt-2 list-disc pl-4 text-[12px] text-gray-600">
            {notes.map((n, idx) => (
              <li key={idx}>{n}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Insight BELOW the card */}
      {explanation && (
        <div className="mt-3 ml-1">
          <p className="text-[11px] font-semibold uppercase text-gray-500 tracking-wide">
            Insight
          </p>
          <p className="text-[13px] leading-relaxed text-gray-700">
            {explanation}
          </p>
        </div>
      )}
    </>
  );
}

/* ---------- CHECKLIST ---------- */
function ChecklistBlock({ checklist }: { checklist: string[] }) {
  if (!checklist || checklist.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No checklist items were generated for this blueprint.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {checklist.map((item, idx) => (
        <label
          key={idx}
          className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-[14px] ring-1 ring-gray-200"
        >
          <input type="checkbox" className="h-4 w-4" />
          <span>{item}</span>
        </label>
      ))}
    </div>
  );
}

/* ---------- HELPERS ---------- */

function buildLinearFlow(
  nodes: string[],
  connections: [number, number][]
): string[] {
  if (!nodes || nodes.length === 0) return [];
  if (!connections || connections.length === 0) return nodes;

  const outgoing = new Map<number, number>();
  const incoming = new Set<number>();

  connections.forEach(([from, to]) => {
    if (!outgoing.has(from)) outgoing.set(from, to);
    incoming.add(to);
  });

  let start = 0;
  for (let i = 0; i < nodes.length; i++) {
    if (!incoming.has(i) && outgoing.has(i)) {
      start = i;
      break;
    }
  }

  const ordered: string[] = [];
  const visited = new Set<number>();
  let current: number | undefined = start;

  while (current !== undefined && !visited.has(current)) {
    visited.add(current);
    ordered.push(nodes[current]);
    current = outgoing.get(current);
  }

  // Fallback: if something went weird, just return nodes
  return ordered.length > 0 ? ordered : nodes;
}

function iconForSection(id?: string): string {
  if (!id || typeof id !== "string") return "📄"; // safety fallback

  if (id.includes("executive")) return "✨";
  if (id.includes("founder")) return "🧑‍💻";
  if (id.includes("business-model")) return "📊";
  if (id.includes("market")) return "📈";
  if (id.includes("competition")) return "⚔️";
  if (id.includes("icp") || id.includes("persona")) return "🎯";
  if (id.includes("value")) return "💎";
  if (id.includes("offer") || id.includes("pricing")) return "💰";
  if (id.includes("financial")) return "📑";
  if (id.includes("action")) return "✅";
  if (id.includes("risk")) return "⚠️";
  if (id.includes("tool")) return "🧰";

  return "📄";
}
