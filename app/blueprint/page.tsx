"use client";

import { useEffect, useState, ReactNode } from "react";
import { motion } from "framer-motion";

type DecisionItem = {
  step: number;
  question: string;
  choice?: string;
  optionLabel?: string;
};

type Blueprint = {
  title: string;
  summary: string;
  nicheSuggestion: string;
  monetization: string[];
  stepByStepGuide: string[];
  toolsNeeded: string[];
  exampleNames: string[];
  basedOnUser?: string;
  totalStepsAnswered?: number;
  decisions?: DecisionItem[];
};

// Simple collapsible section component
type CollapsibleProps = {
  title: string;
  kicker?: string;
  icon?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

function CollapsibleSection({
  title,
  kicker,
  icon,
  defaultOpen = true,
  children,
}: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3 text-left">
          {icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-lg">
              {icon}
            </span>
          )}
          <div>
            {kicker && (
              <p className="text-[11px] font-semibold tracking-wide uppercase text-gray-400">
                {kicker}
              </p>
            )}
            <h2 className="text-sm md:text-base font-semibold text-gray-900">
              {title}
            </h2>
          </div>
        </div>

        <span
          className={`ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs text-gray-500 transition-transform ${
            open ? "rotate-90" : ""
          }`}
        >
          ❯
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 text-sm text-gray-800">{children}</div>
      )}
    </section>
  );
}

export default function BlueprintPage() {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("nicheroot_blueprint");
    if (saved) {
      try {
        setBlueprint(JSON.parse(saved));
      } catch {
        setBlueprint(null);
      }
    }
  }, []);

  if (!blueprint) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F7F8FA] text-gray-900">
        <div className="text-center space-y-3">
          <p className="text-lg text-gray-600">
            No blueprint found for this session.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            ← Start again
          </button>
        </div>
      </main>
    );
  }

  const hasDecisions =
    Array.isArray(blueprint.decisions) && blueprint.decisions.length > 0;

  return (
    <main className="min-h-screen bg-[#F4F6FB] text-gray-900">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10 lg:py-16">
        {/* Top nav row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              NicheRoot · Personalized Blueprint
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => (window.location.href = "/")}
              className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              ← Start over
            </button>
            <button
              disabled
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-medium text-white shadow-md shadow-blue-500/20 opacity-80 cursor-not-allowed"
            >
              Download PDF (soon)
            </button>
          </div>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative mb-10"
        >
          {/* Glow behind card */}
          <div className="pointer-events-none absolute inset-0 translate-y-4 scale-105 blur-3xl bg-gradient-to-r from-blue-500/35 via-indigo-500/30 to-purple-500/30" />
          <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 p-6 md:p-8 overflow-hidden">
            {/* subtle top gloss */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-white/10 opacity-30" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100 mb-2">
              Your personalized result
            </p>
            <h1 className="text-2xl md:text-4xl font-semibold leading-tight mb-3 max-w-3xl">
              {blueprint.title}
            </h1>
            <p className="text-sm md:text-base text-blue-100 max-w-3xl">
              {blueprint.summary}
            </p>
          </div>
        </motion.div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,0.9fr)] gap-6 items-start">
          {/* LEFT MAIN COLUMN */}
          <div className="space-y-6">
            {/* Niche & fit */}
            <CollapsibleSection
              icon="🎯"
              kicker="Recommended Direction"
              title="Your core niche"
              defaultOpen={true}
            >
              <div className="space-y-3">
                {/* ribbons */}
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 text-[11px] font-medium">
                    ✅ Beginner-friendly
                  </span>
                  <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 text-[11px] font-medium">
                    💸 Low / moderate capital
                  </span>
                  <span className="inline-flex items-center rounded-full bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 text-[11px] font-medium">
                    📈 Scalable model
                  </span>
                </div>

                <p className="text-lg font-semibold">
                  {blueprint.nicheSuggestion}
                </p>

                {blueprint.basedOnUser ? (
                  <p className="text-sm text-gray-600">
                    This direction was chosen because of the way you described
                    your background and constraints:{" "}
                    <span className="italic">
                      “{blueprint.basedOnUser}”
                    </span>
                    .
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    This direction is based on the answers you gave about your
                    time, budget, risk tolerance, and preferred type of work.
                  </p>
                )}

                {/* mini insight box */}
                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5 text-xs text-blue-900">
                  <span className="font-semibold mr-1">Insight:</span>
                  This niche should feel more aligned than a random “best
                  online business” list. Use it as a starting point, not a
                  prison.
                </div>
              </div>
            </CollapsibleSection>

            {/* Monetization */}
            <CollapsibleSection
              icon="💰"
              kicker="Revenue Model"
              title="How this niche can make money"
              defaultOpen={true}
            >
              <p className="text-sm text-gray-600 mb-3">
                These are realistic ways you can earn with this niche. You do
                not need to use all of them on day one.
              </p>
              <ul className="list-disc ml-5 space-y-1 text-gray-800 text-sm">
                {blueprint.monetization.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </CollapsibleSection>

            {/* Steps */}
            <CollapsibleSection
              icon="🧭"
              kicker="Execution Roadmap"
              title="Step-by-step starting plan"
              defaultOpen={true}
            >
              <p className="text-sm text-gray-600 mb-3">
                Treat this like a checklist for the next weeks and months. Aim
                to complete each step before jumping to the next shiny idea.
              </p>
              <ol className="list-decimal ml-5 space-y-1 text-gray-800 text-sm">
                {blueprint.stepByStepGuide.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>

              {/* common mistakes box */}
              <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2.5 text-xs text-amber-900">
                <span className="font-semibold mr-1">Common trap:</span>
                Collecting more ideas instead of executing this one. Give this
                plan a fair test window before restarting from zero.
              </div>
            </CollapsibleSection>
          </div>

          {/* RIGHT SIDEBAR (sticky) */}
          <aside className="space-y-5 lg:sticky lg:top-20">
            {/* Snapshot */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-3">
                Snapshot
              </h3>
              <div className="space-y-2 text-sm text-gray-800">
                {typeof blueprint.totalStepsAnswered === "number" && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Questions answered</span>
                    <span className="font-medium">
                      {blueprint.totalStepsAnswered}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Generated in</span>
                  <span className="font-medium">NicheRoot</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Ready to start
                  </span>
                </div>
              </div>
            </section>

            {/* Tools */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-2">
                Tools & resources
              </h3>
              <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                {blueprint.toolsNeeded.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>

            {/* Names */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-2">
                Example brand names
              </h3>
              <ul className="space-y-1 text-sm text-gray-800">
                {blueprint.exampleNames.map((n, i) => (
                  <li
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    {n}
                  </li>
                ))}
              </ul>
            </section>

            {/* Decision path */}
            {hasDecisions && (
              <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-2">
                  How we got here
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  A few of the choices you selected in the question flow.
                </p>
                <ul className="space-y-2 text-xs text-gray-700">
                  {blueprint.decisions!.slice(0, 4).map((d, i) => (
                    <li
                      key={i}
                      className="border-l-2 border-blue-500/70 pl-2"
                    >
                      <span className="font-semibold">
                        Step {d.step}:
                      </span>{" "}
                      {d.optionLabel || d.choice}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-gray-200 text-[11px] text-gray-500 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <span>
            NicheRoot · Constraint-based business matching for real-world
            founders.
          </span>
          <span>Blueprint generated for this session only · v0.1</span>
        </footer>
      </div>
    </main>
  );
}
