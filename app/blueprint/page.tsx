"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { BusinessBlueprint } from "@/types/blueprint-types";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
} from "recharts";

type SavedBlueprint = {
  id: string;
  createdAt: string;
  label: string;
  data: BusinessBlueprint;
};

const STORAGE_KEY = "nicheroot_blueprints_v2";

const TABS = [
  { id: "executive", label: "Executive summary", icon: "✨" },
  { id: "founderFit", label: "Founder fit", icon: "🧑‍💻" },
  { id: "model", label: "Business model", icon: "📊" },
  { id: "market", label: "Market & demand", icon: "📈" },
  { id: "competition", label: "Competition", icon: "⚔️" },
  { id: "audience", label: "Target audience", icon: "🎯" },
  { id: "value", label: "Value proposition", icon: "💎" },
  { id: "monetization", label: "Monetization & pricing", icon: "💰" },
  { id: "financials", label: "Financials", icon: "📑" },
  { id: "action", label: "Action plan", icon: "✅" },
  { id: "risks", label: "Risks", icon: "⚠️" },
  { id: "tools", label: "Tools & stack", icon: "🧰" },
  { id: "sources", label: "Reasoning & sources", icon: "🔍" },
  { id: "checklist", label: "Checklist", icon: "☑️" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function BlueprintPage() {
  const searchParams = useSearchParams();

  const [blueprint, setBlueprint] = useState<BusinessBlueprint | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("executive");
  const [loading, setLoading] = useState<boolean>(true);
  const [savedList, setSavedList] = useState<SavedBlueprint[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  /* ---------------- LOAD FROM LOCALSTORAGE BY ID ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: SavedBlueprint[] = raw ? JSON.parse(raw) : [];
      setSavedList(parsed);

      const idFromUrl = searchParams.get("id");

      if (idFromUrl) {
        const found = parsed.find((b) => b.id === idFromUrl);
        if (found) {
          setBlueprint(found.data);
          setCurrentId(found.id);
        } else {
          setBlueprint(null);
        }
      } else if (parsed.length > 0) {
        // fallback: last blueprint
        const last = parsed[parsed.length - 1];
        setBlueprint(last.data);
        setCurrentId(last.id);
      } else {
        setBlueprint(null);
      }
    } catch (e) {
      console.error("Failed to load blueprints from localStorage:", e);
      setBlueprint(null);
    }

    setLoading(false);
  }, [searchParams]);

  /* ---------------- DISPLAY NAME ---------------- */
  const displayName = useMemo(() => {
    if (!blueprint) return "Your blueprint";
    const raw = blueprint.executiveSummary.model.trim();
    return raw.length < 90 ? raw : raw.slice(0, 90) + "…";
  }, [blueprint]);

  /* ---------------- SCORE CARDS (SAFE, FLEXIBLE) ---------------- */
  const scoreCards = useMemo(() => {
    if (!blueprint) return [];

    const exec: any = blueprint.executiveSummary as any;

    const metrics = exec.metrics || {};
    const items = [
      {
        key: "risk",
        label: "Risk score",
        value: metrics.riskScore ?? exec.riskScore,
        hint: "How aggressive this model is.",
      },
      {
        key: "skill",
        label: "Skill fit",
        value: metrics.skillFit ?? exec.skillFitScore,
        hint: "How well it matches your strengths.",
      },
      {
        key: "demand",
        label: "Demand score",
        value: metrics.demandScore ?? exec.demandScore,
        hint: "Estimated market appetite.",
      },
      {
        key: "monetization",
        label: "Monetization",
        value: metrics.monetizationScore ?? exec.monetizationScore,
        hint: "Strength of revenue engine.",
      },
    ];

    return items.filter(
      (item) => item.value !== undefined && item.value !== null
    );
  }, [blueprint]);

  /* ---------------- NEXT ACTIONS ---------------- */
  const nextActions = useMemo(() => {
    if (!blueprint) return [];
    if (blueprint.checklist?.length) return blueprint.checklist.slice(0, 5);

    if (blueprint.actionPlan?.timeline?.length) {
      const tasks = blueprint.actionPlan.timeline.flatMap((w) => w.tasks);
      return tasks.slice(0, 5);
    }

    return [];
  }, [blueprint]);

  function handleSelectSaved(id: string) {
    const found = savedList.find((b) => b.id === id);
    if (!found) return;
    setCurrentId(id);
    setBlueprint(found.data);
    setActiveTab("executive");
  }

  function handlePrint() {
    if (typeof window !== "undefined") window.print();
  }

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

  const { executiveSummary } = blueprint;

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
                living plan you can refine over time.
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
            <SummaryCard label="Business model" value={executiveSummary.model} />
            <SummaryCard label="Audience" value={executiveSummary.audience} />
            <SummaryCard
              label="Startup cost"
              value={executiveSummary.startupCost}
            />
            <SummaryCard
              label="Time to results"
              value={executiveSummary.timeToFirstResults}
            />
            <SummaryCard
              label="Complexity"
              value={executiveSummary.complexity}
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
                {TABS.map((tab) => (
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
                Start at the top and work your way down. Each section ends with{" "}
                <span className="font-semibold">Next moves</span> — treat these
                as your immediate action items.
              </p>
              <p className="mt-1 text-[11px] text-gray-600">
                Revisit this blueprint after big decisions or new insights.
              </p>
            </div>
          </aside>

          {/* CONTENT CARD */}
          <div className="space-y-6 rounded-3xl bg-white p-7 shadow-lg ring-1 ring-black/5">
            {/* EXECUTIVE TAB */}
            {activeTab === "executive" && (
              <SectionBlock
                title="Executive summary"
                eyebrow="High-level snapshot of the business."
              >
                <p className="text-[15px]">{executiveSummary.model}</p>
                <p className="mt-3 text-[14px] text-gray-600">
                  <span className="font-semibold">Audience:</span>{" "}
                  {executiveSummary.audience}
                </p>

                <NextMovesBlock items={executiveSummary.nextMoves} />
              </SectionBlock>
            )}

            {/* FOUNDER FIT */}
            {activeTab === "founderFit" && (
              <SectionBlock
                title="Founder fit"
                eyebrow="How well this business matches your profile."
              >
                <div className="grid gap-6 md:grid-cols-[1.2fr,1fr]">
                  <div className="h-64">
                    <FounderFitRadar data={blueprint.founderFit.radar} />
                  </div>
                  <p className="text-[15px]">{blueprint.founderFit.summary}</p>
                </div>

                <NextMovesBlock items={blueprint.founderFit.nextMoves} />
              </SectionBlock>
            )}

            {/* BUSINESS MODEL */}
            {activeTab === "model" && (
              <SectionBlock
                title="Business model"
                eyebrow="Core engine of how money is made."
              >
                <p className="mb-4 text-[15px]">
                  {blueprint.businessModel.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {blueprint.businessModel.valueChain.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[13px]"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-500)] text-[10px] text-white">
                        {idx + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>

                <NextMovesBlock items={blueprint.businessModel.nextMoves} />
              </SectionBlock>
            )}

            {/* MARKET */}
            {activeTab === "market" && (
              <SectionBlock
                title="Market & demand"
                eyebrow="Demand, growth and key segments."
              >
                <p className="mb-4 text-[15px]">
                  {blueprint.marketAnalysis.overview}
                </p>

                <div className="grid gap-6 md:grid-cols-[1.1fr,1fr]">
                  <div className="h-64">
                    <DemandTrendChart
                      data={blueprint.marketAnalysis.demandTrend}
                    />
                  </div>

                  <div className="space-y-2 text-[13px]">
                    <h3 className="font-semibold text-gray-800">
                      Key segments
                    </h3>
                    {blueprint.marketAnalysis.segments.map((seg, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200"
                      >
                        <p className="font-semibold">
                          {seg.name} · {seg.size}
                        </p>
                        <p className="text-[12px] text-gray-600">
                          {seg.opportunity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <NextMovesBlock items={blueprint.marketAnalysis.nextMoves} />
              </SectionBlock>
            )}

            {/* COMPETITION */}
            {activeTab === "competition" && (
              <SectionBlock
                title="Competition"
                eyebrow="Who you’re up against and your edge."
              >
                <div className="overflow-x-auto text-[12px]">
                  <table className="min-w-full border-separate border-spacing-y-1">
                    <thead className="text-[11px] text-gray-500">
                      <tr>
                        <th className="px-2 py-1 text-left">Name</th>
                        <th className="px-2 py-1 text-left">Strength</th>
                        <th className="px-2 py-1 text-left">Weakness</th>
                        <th className="px-2 py-1 text-left">
                          Differentiation
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {blueprint.competition.table.map((c, idx) => (
                        <tr key={idx} className="rounded-xl bg-gray-50">
                          <td className="px-2 py-2 font-semibold">{c.name}</td>
                          <td className="px-2 py-2">{c.strength}</td>
                          <td className="px-2 py-2">{c.weakness}</td>
                          <td className="px-2 py-2">{c.differentiation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <NextMovesBlock items={blueprint.competition.nextMoves} />
              </SectionBlock>
            )}

            {/* AUDIENCE */}
            {activeTab === "audience" && (
              <SectionBlock
                title="Target audience"
                eyebrow="Who you’re serving and what they need."
              >
                <PersonaBlock persona={blueprint.targetAudience.persona} />

                <NextMovesBlock items={blueprint.targetAudience.nextMoves} />
              </SectionBlock>
            )}

            {/* VALUE PROP */}
            {activeTab === "value" && (
              <SectionBlock
                title="Value proposition"
                eyebrow="Why customers choose you over others."
              >
                <ValueCanvasBlock valueProp={blueprint.valueProposition} />

                <NextMovesBlock items={blueprint.valueProposition.nextMoves} />
              </SectionBlock>
            )}

            {/* MONETIZATION */}
            {activeTab === "monetization" && (
              <SectionBlock
                title="Monetization & pricing"
                eyebrow="Revenue streams and pricing structure."
              >
                <MonetizationBlock monetization={blueprint.monetization} />

                <NextMovesBlock items={blueprint.monetization.nextMoves} />
              </SectionBlock>
            )}

            {/* FINANCIALS */}
            {activeTab === "financials" && (
              <SectionBlock
                title="Financials"
                eyebrow="Revenue, costs and cost structure."
              >
                <div className="grid gap-6 md:grid-cols-[1.1fr,1fr]">
                  <div className="h-72">
                    <FinancialProjectionChart
                      data={blueprint.financials.projection}
                    />
                  </div>
                  <div className="h-72">
                    <CostBreakdownPie
                      data={blueprint.financials.costBreakdown}
                    />
                  </div>
                </div>

                <NextMovesBlock items={blueprint.financials.nextMoves} />
              </SectionBlock>
            )}

            {/* ACTION PLAN */}
            {activeTab === "action" && (
              <SectionBlock
                title="Action plan"
                eyebrow="Concrete steps to get moving."
              >
                <ActionTimeline timeline={blueprint.actionPlan.timeline} />

                <NextMovesBlock items={blueprint.actionPlan.nextMoves} />
              </SectionBlock>
            )}

            {/* RISKS */}
            {activeTab === "risks" && (
              <SectionBlock
                title="Risks"
                eyebrow="What could go wrong and how to respond."
              >
                <RiskBlock risks={blueprint.risks} />

                <NextMovesBlock items={blueprint.risks.nextMoves} />
              </SectionBlock>
            )}

            {/* TOOLS */}
            {activeTab === "tools" && (
              <SectionBlock
                title="Tools & stack"
                eyebrow="Suggested tools and infrastructure."
              >
                <ToolsBlock tools={blueprint.tools} />

                <NextMovesBlock items={blueprint.tools.nextMoves} />
              </SectionBlock>
            )}

            {/* SOURCES */}
            {activeTab === "sources" && (
              <SectionBlock
                title="Reasoning & sources"
                eyebrow="How this plan was constructed."
              >
                <SourcesBlock sources={blueprint.sources} />
              </SectionBlock>
            )}

            {/* CHECKLIST */}
            {activeTab === "checklist" && (
              <SectionBlock
                title="Checklist"
                eyebrow="Quick progress tracker."
              >
                <ChecklistBlock checklist={blueprint.checklist} />
              </SectionBlock>
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

function createLabel(data: BusinessBlueprint, createdAtISO: string): string {
  const raw = data.executiveSummary.model.trim();
  const date = new Date(createdAtISO).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
  if (!raw) return `Blueprint · ${date}`;
  return raw.length > 70 ? raw.slice(0, 70) + "… · " + date : raw + " · " + date;
}

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

function FounderFitRadar({ data }: any) {
  const dataset = [
    { metric: "Risk tolerance", value: data.riskTolerance },
    { metric: "Available time", value: data.availableTime },
    { metric: "Available capital", value: data.availableCapital },
    { metric: "Skill leverage", value: data.skillLeverage },
    { metric: "Market preference", value: data.marketPreference },
    { metric: "Work style", value: data.workStyle },
  ];

  return (
    <ResponsiveContainer>
      <RadarChart data={dataset}>
        <PolarGrid />
        <PolarAngleAxis dataKey="metric" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar
          dataKey="value"
          stroke="#6366F1"
          fill="#6366F1"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function DemandTrendChart({ data }: any) {
  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#6366F1"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function FinancialProjectionChart({ data }: any) {
  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#10B981"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#EF4444"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CostBreakdownPie({ data }: any) {
  const formatted = data.map((d: any) => ({
    name: d.category,
    value: d.percent,
  }));
  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie data={formatted} dataKey="value" nameKey="name" fill="#6366F1" label />
      </PieChart>
    </ResponsiveContainer>
  );
}

function PersonaBlock({ persona }: any) {
  return (
    <div className="space-y-4 text-[14px]">
    <h3 className="text-lg font-semibold text-gray-900">{persona.name}</h3>
    <p>{persona.description}</p>

    <div className="grid gap-4 md:grid-cols-3">
      <div>
        <h4 className="font-semibold">Pains</h4>
        <ul className="list-disc pl-4">
          {persona.pains.map((p: string, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold">Goals</h4>
        <ul className="list-disc pl-4">
          {persona.goals.map((p: string, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold">Motivations</h4>
        <ul className="list-disc pl-4">
          {persona.motivations.map((p: string, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
  );
}

function ValueCanvasBlock({ valueProp }: any) {
  return (
    <div className="grid gap-6 text-[14px] md:grid-cols-2">
      <div className="space-y-3 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
        <h4 className="font-semibold">Pains</h4>
        <ul className="list-disc pl-4">
          {valueProp.pains.map((p: any, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>

        <h4 className="font-semibold">Pain relievers</h4>
        <ul className="list-disc pl-4">
          {valueProp.painRelievers.map((p: any, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
        <h4 className="font-semibold">Gains</h4>
        <ul className="list-disc pl-4">
          {valueProp.gains.map((p: any, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>

        <h4 className="font-semibold">Gain creators</h4>
        <ul className="list-disc pl-4">
          {valueProp.gainCreators.map((p: any, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MonetizationBlock({ monetization }: any) {
  return (
    <div className="space-y-6 text-[14px]">
      <div>
        <h3 className="font-semibold text-gray-900">Revenue streams</h3>
        {monetization.streams.map((s: any, i: number) => (
          <div
            key={i}
            className="mt-2 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200"
          >
            <p className="font-semibold">
              {s.name} · {s.percent}%
            </p>
            <p className="text-[13px] text-gray-600">{s.description}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">Pricing</h3>
        <div className="mt-2 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-indigo-50 p-3">
            <p className="text-xs uppercase text-gray-600">Low</p>
            <p className="text-lg font-semibold">
              ${monetization.pricing.low}
            </p>
          </div>

          <div className="rounded-xl bg-indigo-100 p-3">
            <p className="text-xs uppercase text-gray-600">Recommended</p>
            <p className="text-lg font-semibold">
              ${monetization.pricing.recommended}
            </p>
          </div>

          <div className="rounded-xl bg-indigo-50 p-3">
            <p className="text-xs uppercase text-gray-600">Premium</p>
            <p className="text-lg font-semibold">
              ${monetization.pricing.premium}
            </p>
          </div>
        </div>
      </div>

      <p className="text-gray-700">{monetization.justification}</p>
    </div>
  );
}

function ActionTimeline({ timeline }: any) {
  return (
    <div className="space-y-4">
      {timeline.map((t: any, idx: number) => (
        <div
          key={idx}
          className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200"
        >
          <p className="font-semibold text-gray-900">{t.week}</p>
          <ul className="mt-2 list-disc pl-4">
            {t.tasks.map((task: any, i: number) => (
              <li key={i}>{task}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function RiskBlock({ risks }: any) {
  return (
    <div className="space-y-6 text-[14px]">
      <div>
        <h3 className="font-semibold text-gray-900">Risk matrix</h3>
        {risks.matrix.map((r: any, i: number) => (
          <div
            key={i}
            className="mt-2 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200"
          >
            <p className="font-semibold">{r.risk}</p>
            <p className="text-[13px] text-gray-600">
              Probability: {r.probability}/100 · Impact: {r.impact}/100
            </p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">Mitigations</h3>
        {risks.mitigations.map((m: any, i: number) => (
          <div
            key={i}
            className="mt-2 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200"
          >
            <p className="font-semibold">{m.risk}</p>
            <p>{m.strategy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolsBlock({ tools }: any) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">{tools.category}</h3>

      {tools.list.map((t: any, i: number) => (
        <div
          key={i}
          className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200"
        >
          <p className="font-semibold">{t.name}</p>
          <p className="text-[13px] text-gray-700">{t.purpose}</p>
        </div>
      ))}
    </div>
  );
}

function SourcesBlock({ sources }: any) {
  return (
    <div className="space-y-6 text-[14px]">
      <div>
        <h3 className="font-semibold text-gray-900">Reasoning</h3>
        <ul className="list-disc pl-4">
          {sources.reasoning.map((r: any, i: number) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">Suggested verifications</h3>
        <ul className="list-disc pl-4">
          {sources.suggestedVerifications.map((v: any, i: number) => (
            <li key={i}>{v}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ChecklistBlock({ checklist }: any) {
  return (
    <div className="space-y-2">
      {checklist.map((item: any, idx: number) => (
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
