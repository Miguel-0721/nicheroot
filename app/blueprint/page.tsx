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
  { id: "executive", label: "Executive summary" },
  { id: "founderFit", label: "Founder fit" },
  { id: "model", label: "Business model" },
  { id: "market", label: "Market & demand" },
  { id: "competition", label: "Competition" },
  { id: "audience", label: "Target audience" },
  { id: "value", label: "Value proposition" },
  { id: "monetization", label: "Monetization & pricing" },
  { id: "financials", label: "Financials" },
  { id: "action", label: "Action plan" },
  { id: "risks", label: "Risks" },
  { id: "tools", label: "Tools & stack" },
  { id: "sources", label: "Reasoning & sources" },
  { id: "checklist", label: "Checklist" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function BlueprintPage() {
  const searchParams = useSearchParams();

  const [blueprint, setBlueprint] = useState<BusinessBlueprint | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("executive");
  const [loading, setLoading] = useState<boolean>(true);
  const [savedList, setSavedList] = useState<SavedBlueprint[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  /* ---------------- LOAD SAVED ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setSavedList(parsed);
    } catch {}
  }, []);

  /* ---------------- LOAD BLUEPRINT FROM URL ---------------- */
  useEffect(() => {
    const encoded = searchParams.get("data");

    if (!encoded || encoded === "undefined") {
      setBlueprint(null);
      setLoading(false);
      return;
    }

    try {
      // 🔥 FIX — DO NOT decodeURIComponent. Just parse.
      const parsed = JSON.parse(encoded) as BusinessBlueprint;

      setBlueprint(parsed);
      setActiveTab("executive");

      if (typeof window !== "undefined") {
        let exist: SavedBlueprint[] = [];
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) exist = JSON.parse(raw);
        } catch {}

        const id = Date.now().toString();
        const createdAt = new Date().toISOString();
        const label = createLabel(parsed, createdAt);

        const updated = [...exist, { id, createdAt, label, data: parsed }];
        const trimmed = updated.slice(-8);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

        setSavedList(trimmed);
        setCurrentId(id);
      }
    } catch (err) {
      console.error("Blueprint decode failed:", err);
      setBlueprint(null);
    }

    setLoading(false);
  }, [searchParams]);

  /* ---------------- NAME ---------------- */
  const displayName = useMemo(() => {
    if (!blueprint) return "Your blueprint";
    const raw = blueprint.executiveSummary.model.trim();
    return raw.length < 90 ? raw : raw.slice(0, 90) + "…";
  }, [blueprint]);

  /* ---------------- NEXT ACTIONS ---------------- */
  const nextActions = useMemo(() => {
    if (!blueprint) return [];
    if (blueprint.checklist?.length)
      return blueprint.checklist.slice(0, 5);

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

  /* ---------------- LOADING / ERROR ---------------- */
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

  /* ---------------- PAGE ---------------- */
  return (
    <main className="min-h-screen bg-[var(--background)] py-20 px-5 text-gray-900">
      <div className="mx-auto max-w-6xl space-y-10">

        {/* HEADER */}
        <header className="flex flex-col gap-4 md:flex-row md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-[var(--brand-500)]">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-500)] text-white text-[9px] font-bold">N</span>
              NicheRoot · Blueprint
            </div>

            <h1 className="text-3xl font-semibold">{displayName}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Generated from your inputs and decisions.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <select
              value={currentId ?? ""}
              onChange={(e) => handleSelectSaved(e.target.value)}
              className="rounded-full border px-3 py-2 text-xs shadow-sm"
            >
              {savedList.length === 0 && <option value="">Current blueprint</option>}
              {savedList.slice().reverse().map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="rounded-full bg-[var(--brand-500)] px-4 py-2 text-xs text-white shadow hover:bg-[var(--brand-400)]"
            >
              Print / Save as PDF
            </button>
          </div>
        </header>

        {/* SUMMARY STRIP */}
        <section className="space-y-3">
          <p className="text-[11px] font-semibold uppercase text-gray-500">Executive summary</p>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Business model" value={executiveSummary.model} />
            <SummaryCard label="Audience" value={executiveSummary.audience} />
            <SummaryCard label="Startup cost" value={executiveSummary.startupCost} />
            <SummaryCard label="Time to results" value={executiveSummary.timeToFirstResults} />
            <SummaryCard label="Complexity" value={executiveSummary.complexity} />
          </div>
        </section>

        {/* LAYOUT */}
        <section className="grid gap-8 lg:grid-cols-[260px,1fr]">
          {/* SIDEBAR */}
          <aside className="space-y-4">
            <div className="rounded-3xl bg-white p-4 shadow ring-1 ring-gray-200">
              <p className="mb-3 text-[11px] font-semibold uppercase text-gray-500">
                Sections
              </p>
              <div className="flex flex-col gap-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-3 py-2 text-xs font-medium ${
                      tab.id === activeTab
                        ? "bg-[var(--brand-500)] text-white"
                        : "hover:bg-indigo-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* CONTENT */}
          <div className="rounded-3xl bg-white p-7 shadow-lg ring-1 ring-black/5 space-y-6">

            {/* EXECUTIVE TAB */}
            {activeTab === "executive" && (
              <SectionBlock title="Executive summary">
                <p className="text-[15px]">{executiveSummary.model}</p>
                <p className="text-[14px] text-gray-600 mt-3">
                  Audience: {executiveSummary.audience}
                </p>

                <NextMovesBlock items={executiveSummary.nextMoves} />
              </SectionBlock>
            )}

            {/* FOUNDER FIT */}
            {activeTab === "founderFit" && (
              <SectionBlock title="Founder fit">
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
              <SectionBlock title="Business model">
                <p className="text-[15px] mb-4">{blueprint.businessModel.description}</p>

                <div className="flex flex-wrap gap-2">
                  {blueprint.businessModel.valueChain.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full text-[13px]">
                      <span className="h-5 w-5 bg-[var(--brand-500)] text-white flex items-center justify-center rounded-full text-[10px]">{idx + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>

                <NextMovesBlock items={blueprint.businessModel.nextMoves} />
              </SectionBlock>
            )}

            {/* MARKET */}
            {activeTab === "market" && (
              <SectionBlock title="Market & demand">
                <p className="mb-4">{blueprint.marketAnalysis.overview}</p>

                <div className="grid gap-6 md:grid-cols-[1.1fr,1fr]">
                  <div className="h-64">
                    <DemandTrendChart data={blueprint.marketAnalysis.demandTrend} />
                  </div>

                  <div className="text-[13px] space-y-2">
                    <h3 className="font-semibold">Key segments</h3>
                    {blueprint.marketAnalysis.segments.map((seg, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-xl">
                        <p className="font-semibold">{seg.name} · {seg.size}</p>
                        <p className="text-gray-600 text-[12px]">{seg.opportunity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <NextMovesBlock items={blueprint.marketAnalysis.nextMoves} />
              </SectionBlock>
            )}

            {/* COMPETITION */}
            {activeTab === "competition" && (
              <SectionBlock title="Competition">
                <div className="overflow-x-auto text-[12px]">
                  <table className="min-w-full border-separate border-spacing-y-1">
                    <thead className="text-gray-500 text-[11px]">
                      <tr>
                        <th className="px-2 py-1 text-left">Name</th>
                        <th className="px-2 py-1 text-left">Strength</th>
                        <th className="px-2 py-1 text-left">Weakness</th>
                        <th className="px-2 py-1 text-left">Differentiation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blueprint.competition.table.map((c, idx) => (
                        <tr key={idx} className="bg-gray-50 rounded-xl">
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
              <SectionBlock title="Target audience">
                <PersonaBlock persona={blueprint.targetAudience.persona} />

                <NextMovesBlock items={blueprint.targetAudience.nextMoves} />
              </SectionBlock>
            )}

            {/* VALUE PROP */}
            {activeTab === "value" && (
              <SectionBlock title="Value proposition">
                <ValueCanvasBlock valueProp={blueprint.valueProposition} />

                <NextMovesBlock items={blueprint.valueProposition.nextMoves} />
              </SectionBlock>
            )}

            {/* MONETIZATION */}
            {activeTab === "monetization" && (
              <SectionBlock title="Monetization">
                <MonetizationBlock monetization={blueprint.monetization} />

                <NextMovesBlock items={blueprint.monetization.nextMoves} />
              </SectionBlock>
            )}

            {/* FINANCIALS */}
            {activeTab === "financials" && (
              <SectionBlock title="Financials">
                <div className="grid gap-6 md:grid-cols-[1.1fr,1fr]">
                  <div className="h-72">
                    <FinancialProjectionChart data={blueprint.financials.projection} />
                  </div>
                  <div className="h-72">
                    <CostBreakdownPie data={blueprint.financials.costBreakdown} />
                  </div>
                </div>

                <NextMovesBlock items={blueprint.financials.nextMoves} />
              </SectionBlock>
            )}

            {/* ACTION PLAN */}
            {activeTab === "action" && (
              <SectionBlock title="Action plan">
                <ActionTimeline timeline={blueprint.actionPlan.timeline} />

                <NextMovesBlock items={blueprint.actionPlan.nextMoves} />
              </SectionBlock>
            )}

            {/* RISKS */}
            {activeTab === "risks" && (
              <SectionBlock title="Risks">
                <RiskBlock risks={blueprint.risks} />

                <NextMovesBlock items={blueprint.risks.nextMoves} />
              </SectionBlock>
            )}

            {/* TOOLS */}
            {activeTab === "tools" && (
              <SectionBlock title="Tools & stack">
                <ToolsBlock tools={blueprint.tools} />

                <NextMovesBlock items={blueprint.tools.nextMoves} />
              </SectionBlock>
            )}

            {/* SOURCES */}
            {activeTab === "sources" && (
              <SectionBlock title="Reasoning & sources">
                <SourcesBlock sources={blueprint.sources} />
              </SectionBlock>
            )}

            {/* CHECKLIST */}
            {activeTab === "checklist" && (
              <SectionBlock title="Checklist">
                <ChecklistBlock checklist={blueprint.checklist} />
              </SectionBlock>
            )}

          </div>
        </section>

        {/* NEXT ACTION STRIP */}
        {nextActions.length > 0 && (
          <div className="bg-white/90 p-5 rounded-3xl shadow ring-1 ring-gray-200 text-[13px]">
            <p className="text-[11px] uppercase text-gray-500 font-semibold mb-2">
              Immediate next moves
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              {nextActions.map((step, idx) => <li key={idx}>{step}</li>)}
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
    <div className="bg-white/90 p-4 rounded-2xl shadow-sm ring-1 ring-gray-200 text-xs">
      <p className="uppercase text-[11px] tracking-wide text-gray-500 mb-1">
        {label}
      </p>
      <p className="text-[13px] text-gray-800 line-clamp-4">{value}</p>
    </div>
  );
}

function NextMovesBlock({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-gray-50 p-4 rounded-xl ring-1 ring-gray-200 text-[13px] mt-6">
      <p className="uppercase text-[11px] tracking-wide text-gray-500 mb-2">
        Next moves
      </p>
      <ul className="list-disc pl-4 space-y-1">
        {items.map((it, idx) => <li key={idx}>{it}</li>)}
      </ul>
    </div>
  );
}

function SectionBlock({ title, children }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
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
        <Radar dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} />
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
        <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={false} />
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
        <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
        <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CostBreakdownPie({ data }: any) {
  const formatted = data.map((d: any) => ({ name: d.category, value: d.percent }));
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
      <h3 className="text-lg font-semibold">{persona.name}</h3>
      <p>{persona.description}</p>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <h4 className="font-semibold">Pains</h4>
          <ul className="list-disc pl-4">
            {persona.pains.map((p: string, i: number) => <li key={i}>{p}</li>)}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Goals</h4>
          <ul className="list-disc pl-4">
            {persona.goals.map((p: string, i: number) => <li key={i}>{p}</li>)}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Motivations</h4>
          <ul className="list-disc pl-4">
            {persona.motivations.map((p: string, i: number) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ValueCanvasBlock({ valueProp }: any) {
  return (
    <div className="grid gap-6 md:grid-cols-2 text-[14px]">
      <div className="bg-gray-50 p-4 rounded-xl ring-1 ring-gray-200 space-y-3">
        <h4 className="font-semibold">Pains</h4>
        <ul className="list-disc pl-4">
          {valueProp.pains.map((p: any, i: number) => <li key={i}>{p}</li>)}
        </ul>

        <h4 className="font-semibold">Pain relievers</h4>
        <ul className="list-disc pl-4">
          {valueProp.painRelievers.map((p: any, i: number) => <li key={i}>{p}</li>)}
        </ul>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl ring-1 ring-gray-200 space-y-3">
        <h4 className="font-semibold">Gains</h4>
        <ul className="list-disc pl-4">
          {valueProp.gains.map((p: any, i: number) => <li key={i}>{p}</li>)}
        </ul>

        <h4 className="font-semibold">Gain creators</h4>
        <ul className="list-disc pl-4">
          {valueProp.gainCreators.map((p: any, i: number) => <li key={i}>{p}</li>)}
        </ul>
      </div>
    </div>
  );
}

function MonetizationBlock({ monetization }: any) {
  return (
    <div className="space-y-6 text-[14px]">
      <div>
        <h3 className="font-semibold">Revenue streams</h3>
        {monetization.streams.map((s: any, i: number) => (
          <div key={i} className="bg-gray-50 rounded-xl p-3 ring-1 ring-gray-200">
            <p className="font-semibold">{s.name} · {s.percent}%</p>
            <p className="text-gray-600 text-[13px]">{s.description}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold">Pricing</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-indigo-50 p-3 rounded-xl">
            <p className="text-xs uppercase">Low</p>
            <p className="text-lg font-semibold">${monetization.pricing.low}</p>
          </div>

          <div className="bg-indigo-100 p-3 rounded-xl">
            <p className="text-xs uppercase">Recommended</p>
            <p className="text-lg font-semibold">${monetization.pricing.recommended}</p>
          </div>

          <div className="bg-indigo-50 p-3 rounded-xl">
            <p className="text-xs uppercase">Premium</p>
            <p className="text-lg font-semibold">${monetization.pricing.premium}</p>
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
        <div key={idx} className="bg-gray-50 p-4 rounded-xl ring-1 ring-gray-200">
          <p className="font-semibold">{t.week}</p>
          <ul className="list-disc pl-4 mt-2">
            {t.tasks.map((task: any, i: number) => <li key={i}>{task}</li>)}
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
        <h3 className="font-semibold">Risk matrix</h3>
        {risks.matrix.map((r: any, i: number) => (
          <div key={i} className="bg-gray-50 rounded-xl p-3 ring-1 ring-gray-200">
            <p className="font-semibold">{r.risk}</p>
            <p className="text-gray-600 text-[13px]">
              Probability: {r.probability}/100 · Impact: {r.impact}/100
            </p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold">Mitigations</h3>
        {risks.mitigations.map((m: any, i: number) => (
          <div key={i} className="bg-gray-50 rounded-xl p-3 ring-1 ring-gray-200">
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
      <h3 className="font-semibold">{tools.category}</h3>

      {tools.list.map((t: any, i: number) => (
        <div key={i} className="bg-gray-50 rounded-xl p-3 ring-1 ring-gray-200">
          <p className="font-semibold">{t.name}</p>
          <p className="text-gray-700 text-[13px]">{t.purpose}</p>
        </div>
      ))}
    </div>
  );
}

function SourcesBlock({ sources }: any) {
  return (
    <div className="space-y-6 text-[14px]">
      <div>
        <h3 className="font-semibold">Reasoning</h3>
        <ul className="list-disc pl-4">
          {sources.reasoning.map((r: any, i: number) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold">Suggested verifications</h3>
        <ul className="list-disc pl-4">
          {sources.suggestedVerifications.map((v: any, i: number) => <li key={i}>{v}</li>)}
        </ul>
      </div>
    </div>
  );
}

function ChecklistBlock({ checklist }: any) {
  return (
    <div className="space-y-2">
      {checklist.map((item: any, idx: number) => (
        <label key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl ring-1 ring-gray-200">
          <input type="checkbox" className="h-4 w-4" />
          <span>{item}</span>
        </label>
      ))}
    </div>
  );
}
