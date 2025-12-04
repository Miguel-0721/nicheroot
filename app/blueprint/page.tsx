"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type BlueprintData = {
  overview?: string;
  situation?: string;
  strategy?: string;
  financials?: string;
  market?: string;
  actionPlan?: string;
  risks?: string;
  tools?: string;
  [key: string]: any;
};

type SavedBlueprint = {
  id: string;
  createdAt: string;
  label: string;
  data: BlueprintData;
};

const TABS = [
  "Overview",
  "Situation",
  "Strategy",
  "Financials",
  "Market",
  "Action Plan",
  "Risks",
  "Tools",
];

const STORAGE_KEY = "nicheroot_blueprints";

export default function BlueprintPage() {
  const searchParams = useSearchParams();

  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [loading, setLoading] = useState<boolean>(true);
  const [savedList, setSavedList] = useState<SavedBlueprint[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Load any previously saved blueprints on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: SavedBlueprint[] = JSON.parse(raw);
      if (Array.isArray(parsed)) setSavedList(parsed);
    } catch (err) {
      console.error("Failed to load saved blueprints:", err);
    }
  }, []);

  // Decode incoming blueprint from URL + auto-save as a new entry
  useEffect(() => {
    const encoded = searchParams.get("data");

    if (!encoded) {
      setLoading(false);
      return;
    }

    try {
      const decoded = JSON.parse(decodeURIComponent(encoded)) as BlueprintData;
      setBlueprint(decoded);
      setActiveTab("Overview");

      if (typeof window !== "undefined") {
        let existing: SavedBlueprint[] = [];
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) existing = parsed;
          }
        } catch {
          existing = [];
        }

        const id = Date.now().toString();
        const createdAt = new Date().toISOString();
        const label = createLabel(decoded, createdAt);

        const updated = [...existing, { id, createdAt, label, data: decoded }];
        const trimmed = updated.slice(-8); // keep last 8

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        setSavedList(trimmed);
        setCurrentId(id);
      }
    } catch (err) {
      console.error("Blueprint decode error:", err);
    }

    setLoading(false);
  }, [searchParams]);

  // Budget bar – safe: always called in same order
  const budgetPercents = useMemo(() => {
    if (!blueprint || !blueprint.financials) return [];

    const text = blueprint.financials;
    const matches = Array.from(text.matchAll(/(\d{1,3})\s*%/g));
    const nums = matches.map((m) => Number(m[1])).filter((n) => !isNaN(n));

    if (!nums.length) return [];
    const total = nums.reduce((a, b) => a + b, 0) || 1;

    return nums.map((n) => (100 * n) / total);
  }, [blueprint]);

  // Derived display name for the blueprint
  const displayName = useMemo(() => {
    if (!blueprint) return "Your current blueprint";
    const raw = (blueprint.overview || blueprint.strategy || "").trim();
    if (!raw) return "Your current blueprint";
    if (raw.length < 90) return raw;
    return raw.slice(0, 90) + "…";
  }, [blueprint]);

  // Lightweight "executive summary" cards
  const summaryCards = useMemo(
    () => [
      {
        label: "Business model",
        value:
          blueprint?.overview ||
          "High-level description of what this business actually does.",
      },
      {
        label: "Target audience",
        value:
          blueprint?.market ||
          "Who this is built for, and what problems they want solved.",
      },
      {
        label: "Startup cost level",
        value: findHint(blueprint?.financials, ["low", "medium", "high"]),
      },
      {
        label: "Time to first results",
        value:
          blueprint?.actionPlan ||
          "How quickly you can reach first meaningful outcomes.",
      },
      {
        label: "Complexity level",
        value: findHint(blueprint?.risks, ["simple", "moderate", "complex"]),
      },
    ],
    [blueprint]
  );

  // Tiny helper to safely read a section
  function get(section: keyof BlueprintData): string {
    const value = blueprint?.[section];
    return typeof value === "string"
      ? value
      : "This section could not be generated. Please try again.";
  }

  function handleSelectSaved(id: string) {
    const found = savedList.find((b) => b.id === id);
    if (!found) return;
    setCurrentId(id);
    setBlueprint(found.data);
    setActiveTab("Overview");
    // No need to touch URL; it’s just a local view switch
  }

  function handlePrint() {
    if (typeof window !== "undefined") window.print();
  }

  // Derived "next actions" from action plan / strategy (super simple)
  const nextActions = useMemo(() => {
    const text = (blueprint?.actionPlan || blueprint?.strategy || "").trim();
    if (!text) return [] as string[];

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (!lines.length) return [text];

    // Take first 3 lines as “most immediate” actions
    return lines.slice(0, 3);
  }, [blueprint]);

  // ---- CONDITIONAL RENDERING (after all hooks) ----

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] pt-24 px-6">
        <p className="text-sm text-gray-500">Loading your blueprint…</p>
      </main>
    );
  }

  if (!blueprint) {
    return (
      <main className="min-h-screen bg-[var(--background)] pt-24 px-6">
        <p className="text-sm text-red-500">No blueprint available.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] py-20 px-5 text-gray-900">
      <div className="mx-auto max-w-6xl space-y-10">
        {/* HEADER */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--brand-500)]">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-500)] text-[9px] font-bold text-white">
                N
              </span>
              <span>NicheRoot · Business Blueprint</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Your Personalized Business Blueprint
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Built from your story and six trade-off decisions to give you one
              coherent, long-term direction. Review the model, audience, and
              plan before you execute.
            </p>
          </div>

          <div className="flex flex-col gap-3 items-stretch sm:items-end">
            <div className="flex flex-col gap-1 sm:items-end">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                Saved blueprints
              </span>
              <select
                value={currentId ?? ""}
                onChange={(e) => handleSelectSaved(e.target.value)}
                className="min-w-[260px] rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
              >
                {savedList
                  .slice()
                  .reverse()
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand-500)] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[var(--brand-400)] hover:shadow-lg active:scale-[0.98] transition-all"
            >
              Print / Save as PDF
            </button>
          </div>
        </header>

        {/* EXEC SUMMARY ROW */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Executive summary
            </p>
            <p className="max-w-sm truncate text-[11px] text-gray-400">
              {displayName}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {summaryCards.map((card, idx) => (
              <div
                key={idx}
                className="flex h-full flex-col justify-between rounded-2xl bg-white/90 p-4 text-xs shadow-sm ring-1 ring-gray-200"
              >
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {card.label}
                </p>
                <p className="line-clamp-4 text-[13px] leading-relaxed text-gray-800">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* MAIN LAYOUT: SIDEBAR + CONTENT */}
        <section className="grid gap-8 lg:grid-cols-[250px,1fr]">
          {/* SIDEBAR */}
          <aside className="space-y-6">
            <div className="rounded-3xl bg-white/95 p-4 shadow-sm ring-1 ring-gray-200">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Sections
              </p>

              <div className="flex flex-col gap-1">
                {TABS.map((tab) => {
                  const active = tab === activeTab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center justify-between rounded-full px-3 py-2 text-xs font-medium transition-all ${
                        active
                          ? "bg-[var(--brand-500)] text-white shadow-md"
                          : "bg-transparent text-gray-700 hover:bg-indigo-50"
                      }`}
                    >
                      <span>{tab}</span>
                      {active && (
                        <span className="ml-2 h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hidden lg:block rounded-3xl bg-white/90 p-4 text-[11px] text-gray-700 shadow-sm ring-1 ring-gray-100">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                How to use this blueprint
              </p>
              <ol className="space-y-1 list-decimal pl-4">
                <li>
                  Start with <span className="font-semibold">Overview</span> to
                  see if the direction feels right.
                </li>
                <li>
                  Review{" "}
                  <span className="font-semibold">Strategy &amp; Financials</span>{" "}
                  to match your time, risk, and budget.
                </li>
                <li>
                  Turn the <span className="font-semibold">Action Plan</span>{" "}
                  into a 30-day checklist and execute one block at a time.
                </li>
              </ol>
            </div>
          </aside>

          {/* CONTENT CARD */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-7 shadow-lg ring-1 ring-black/5">
              {activeTab === "Overview" && (
                <TabBlock
                  title="Business Overview"
                  description="High-level snapshot of what this business is and why it exists."
                  content={get("overview")}
                />
              )}

              {activeTab === "Situation" && (
                <TabBlock
                  title="Your Situation"
                  description="Where you are starting from: constraints, assets, and goals."
                  content={get("situation")}
                />
              )}

              {activeTab === "Strategy" && (
                <TabBlock
                  title="Strategy"
                  description="Core strategic moves that make this business model work."
                  content={get("strategy")}
                />
              )}

              {activeTab === "Financials" && (
                <div className="space-y-6">
                  <TabBlock
                    title="Financial Model"
                    description="How money flows in and out of this business."
                    content={get("financials")}
                  />

                  {budgetPercents.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-800">
                        Budget split (approximate visual)
                      </h3>
                      <div className="flex h-3 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
                        {budgetPercents.map((p, i) => (
                          <div
                            key={i}
                            className="h-full bg-[var(--brand-500)] first:rounded-l-full last:rounded-r-full"
                            style={{ width: `${p}%` }}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-500">
                        This bar is based on percentage values detected in the
                        financial description (for example “40% to R&amp;D,
                        35% to infrastructure…”).
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Market" && (
                <TabBlock
                  title="Market & Audience"
                  description="Who this business serves and what they care about most."
                  content={get("market")}
                />
              )}

              {activeTab === "Action Plan" && (
                <TabBlock
                  title="Action Plan"
                  description="Concrete steps to move from idea to execution."
                  content={get("actionPlan")}
                />
              )}

              {activeTab === "Risks" && (
                <TabBlock
                  title="Risks & De-Risking"
                  description="Main failure points and how to reduce the downside."
                  content={get("risks")}
                />
              )}

              {activeTab === "Tools" && (
                <TabBlock
                  title="Recommended Tools & Stack"
                  description="Suggested platforms, apps, and infrastructure for this blueprint."
                  content={get("tools")}
                />
              )}
            </div>

            {/* NEXT ACTIONS STRIP */}
            {nextActions.length > 0 && (
              <div className="rounded-3xl bg-white/90 p-5 text-[13px] shadow-sm ring-1 ring-gray-200">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Immediate next moves
                </p>
                <p className="mb-3 text-[13px] text-gray-700">
                  Use these as your first concrete steps. Turn them into tasks
                  in your project manager or calendar.
                </p>
                <ol className="space-y-1 list-decimal pl-5 text-gray-800">
                  {nextActions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/* ----------------- HELPERS & SUBCOMPONENTS ----------------- */

function createLabel(data: BlueprintData, createdAtISO: string): string {
  const raw = (data.overview || data.strategy || "").trim();
  const date = new Date(createdAtISO);
  const short = date.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });

  if (raw.length === 0) return `Blueprint · ${short}`;
  const sliced = raw.length > 70 ? raw.slice(0, 70) + "…" : raw;
  return `${sliced} · ${short}`;
}

function findHint(text: string | undefined, words: string[]): string {
  if (!text) return "Not clearly specified";
  const lower = text.toLowerCase();
  for (const w of words) {
    if (lower.includes(w)) return capitalize(w);
  }
  return "Not clearly specified";
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderRichText(content: string) {
  // Convert simple bullet-like lines into an actual list if they exist
  const lines = content.split(/\r?\n/).map((l) => l.trim());
  const bulletLines = lines.filter((l) => /^[-•]/.test(l));

  if (bulletLines.length >= 2) {
    return (
      <ul className="ml-4 list-disc space-y-1 text-[15px] leading-relaxed text-gray-700">
        {lines.map((l, idx) => {
          if (!l) return null;
          if (/^[-•]/.test(l)) {
            return <li key={idx}>{l.replace(/^[-•]\s*/, "")}</li>;
          }
          return (
            <li key={idx} className="list-none">
              {l}
            </li>
          );
        })}
      </ul>
    );
  }

  // Otherwise render as paragraphs
  const paragraphs = content.split(/\n{2,}/).map((p) => p.trim());

  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-gray-700">
      {paragraphs.map((p, idx) => (
        <p key={idx}>{p}</p>
      ))}
    </div>
  );
}

function TabBlock({
  title,
  description,
  content,
}: {
  title: string;
  description?: string;
  content: string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-1 text-[13px] text-gray-500">{description}</p>
        )}
      </div>
      {renderRichText(content)}
    </div>
  );
}
