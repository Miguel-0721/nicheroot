"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  BusinessBlueprint,
  BlueprintSection,
  SectionContent,
  ChartBlock,
  DiagramBlock,
} from "@/types/blueprint-types";

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

  const [blueprint, setBlueprint] = useState<BusinessBlueprint | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savedList, setSavedList] = useState<SavedBlueprint[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  /* ---------------- LOAD FROM LOCALSTORAGE BY ID ---------------- */
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

    setLoading(false);
  }, [searchParams]);

  /* ---------------- DISPLAY NAME ---------------- */
  const displayName = useMemo(() => {
    if (!blueprint) return "Your blueprint";
    const raw = blueprint.meta?.modelName?.trim() ?? "";
    if (!raw) return "Your blueprint";
    return raw.length < 90 ? raw : raw.slice(0, 90) + "…";
  }, [blueprint]);

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
  const sectionTabs =
    blueprint?.sections?.map((section) => ({
      id: section.id,
      label: section.title,
      icon: iconForSection(section.id),
    })) ?? [];

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
  return (
    <main className="min-h-screen bg-[var(--background)] py-16 px-4 md:px-6 text-gray-900">
      <div className="mx-auto max-w-6xl space-y-10">
        {/* HERO HEADER */}
        <header className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-[var(--brand-500)] shadow-sm ring-1 ring-gray-200">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-500)] text-white text-[9px] font-bold">
                  N
                </span>
                NicheRoot · Business Blueprint
              </div>

              <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
                {displayName}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-gray-600">
                Generated from your answers and trade-offs. Treat this as a
                living plan you refine as you learn more.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <select
                value={currentId ?? ""}
                onChange={(e) => handleSelectSaved(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-400)] md:w-72"
              >
                {savedList.length === 0 && (
                  <option value="">Current blueprint</option>
                )}
                {savedList
                  .slice()
                  .reverse()
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
              </select>

              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center rounded-full bg-[var(--brand-500)] px-4 py-2 text-xs font-medium text-white shadow hover:bg-[var(--brand-400)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-400)]"
              >
                Print / Save as PDF
              </button>
            </div>
          </div>

          {/* SUMMARY STRIP */}
          <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
            <SummaryCard label="Business model" value={meta.modelName} />
            <SummaryCard label="Difficulty" value={meta.difficulty} />
            <SummaryCard label="Startup cost" value={meta.startupCost} />
            <SummaryCard
              label="Time to first results"
              value={meta.expectedTimeline}
            />
            <SummaryCard
              label="Overall profile"
              value={`${meta.difficulty} · ${meta.startupCost}`}
            />
          </section>

          {/* SCORE CARDS */}
          {scoreCards.length > 0 && (
            <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {scoreCards.map((card) => (
                <div
                  key={card.key}
                  className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-4 shadow-sm ring-1 ring-indigo-100"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">
                    {card.label}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold">
                      {typeof card.value === "number"
                        ? card.value
                        : card.value}
                    </span>
                    {typeof card.value === "number" && (
                      <span className="text-xs text-gray-500">/ 100</span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {card.hint}
                  </p>
                </div>
              ))}
            </section>
          )}
        </header>

        {/* MAIN LAYOUT */}
        <section className="grid items-start gap-8 lg:grid-cols-[260px,1fr]">
          {/* SIDEBAR */}
          <aside className="space-y-4">
            <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
              <p className="mb-3 text-[11px] font-semibold uppercase text-gray-500">
                Sections
              </p>
              <div className="flex flex-col gap-1">
                {allTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition ${
                      tab.id === activeTab
                        ? "bg-[var(--brand-500)] text-white shadow-sm"
                        : "text-gray-700 hover:bg-indigo-50"
                    }`}
                  >
                    <span className="text-sm">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-indigo-50/70 p-4 text-[12px] text-gray-800 shadow-sm ring-1 ring-indigo-100">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                How to use this
              </p>
              <p className="mb-1">
                Move through the sections in order. Each section ends with{" "}
                <span className="font-semibold">Next moves</span> — those are
                your immediate action steps.
              </p>
              <p className="mt-1 text-[11px] text-gray-600">
                Revisit this blueprint after you test assumptions or make major
                decisions.
              </p>
            </div>
          </aside>

          {/* CONTENT CARD */}
          <div className="space-y-6 rounded-3xl bg-white p-7 shadow-lg ring-1 ring-black/5">
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
                <SectionContentRenderer content={activeSection.content} />
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
    <div className="space-y-4">
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          {eyebrow}
        </p>
      )}
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <div className="space-y-4 text-[14px] text-gray-800">{children}</div>
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

/* ---------- CONTENT RENDERER FOR SECTIONS ---------- */

function SectionContentRenderer({ content }: { content: SectionContent }) {
  const {
    paragraphs,
    lists,
    tables,
    charts,
    diagrams,
    images,
    examples,
    nextMoves,
  } = content;

  return (
    <div className="space-y-6">
      {/* paragraphs */}
      {paragraphs && paragraphs.length > 0 && (
        <div className="space-y-3">
          {paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      )}

      {/* lists */}
      {lists && lists.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {lists.map((block, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-gray-50 p-4 text-[13px] ring-1 ring-gray-200"
            >
              {block.title && (
                <h3 className="mb-2 text-[13px] font-semibold text-gray-900">
                  {block.title}
                </h3>
              )}
              <ul className="list-disc pl-4 space-y-1">
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* tables */}
      {tables && tables.length > 0 && (
        <div className="space-y-4">
          {tables.map((table, idx) => (
            <div
              key={idx}
              className="overflow-x-auto rounded-xl bg-gray-50 p-3 text-[12px] ring-1 ring-gray-200"
            >
              {table.title && (
                <p className="mb-2 text-[11px] font-semibold uppercase text-gray-600">
                  {table.title}
                </p>
              )}
              <table className="min-w-full border-separate border-spacing-y-1">
                <thead className="text-[11px] text-gray-500">
                  <tr>
                    {table.columns.map((col, i) => (
                      <th key={i} className="px-2 py-1 text-left">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="bg-white/70">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-2 py-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* charts */}
      {charts && charts.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {charts.map((chart, idx) => (
            <ChartBlockRenderer key={idx} chart={chart} />
          ))}
        </div>
      )}

      {/* diagrams */}
      {diagrams && diagrams.length > 0 && (
        <div className="space-y-4">
          {diagrams.map((diagram, idx) => (
            <DiagramBlockRenderer key={idx} diagram={diagram} />
          ))}
        </div>
      )}

      {/* images */}
      {images && images.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {images.map((img, idx) => (
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

      {/* examples */}
      {examples && examples.length > 0 && (
        <div className="space-y-3">
          {examples.map((ex, idx) => (
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
                {ex.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* next moves */}
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
    yKeys && yKeys.length > 0
      ? yKeys
      : firstRow
      ? Object.keys(firstRow).filter(
          (k) => typeof (firstRow as any)[k] === "number"
        )
      : [];

  // If no data or no keys → Show friendly message
  if (!data || data.length === 0 || (!safeXKey && type !== "pie") || safeYKeys.length === 0) {
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
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey={safeXKey} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                dataKey={safeYKeys[0]}
                fill={palette[0]}
                stroke={palette[0]}
                fillOpacity={0.4}
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

      {note && (
        <p className="mt-2 text-[11px] text-gray-500">{note}</p>
      )}
    </div>
  );
}

/* ---------- DIAGRAM RENDERER ---------- */

function DiagramBlockRenderer({ diagram }: { diagram: DiagramBlock }) {
  const { title, type, nodes, connections, notes } = diagram;

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
    <div className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-gray-200">
      {title && (
        <p className="text-[12px] font-semibold uppercase text-gray-700">
          {title}
        </p>
      )}
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
      {notes && notes.length > 0 && (
        <ul className="mt-2 list-disc pl-4 text-[12px] text-gray-600">
          {notes.map((n, idx) => (
            <li key={idx}>{n}</li>
          ))}
        </ul>
      )}
    </div>
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

function iconForSection(id: string): string {
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
