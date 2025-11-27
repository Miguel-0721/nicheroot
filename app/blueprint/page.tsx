"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
  decisions?: {
    step: number;
    question: string;
    choice?: string;
    optionLabel?: string;
  }[];
};

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

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-gray-900">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        {/* Top bar */}
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

        {/* Gradient header card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mb-10"
        >
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 p-6 md:p-8">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-100 mb-2">
              Your personalized result
            </p>
            <h1 className="text-2xl md:text-4xl font-semibold leading-tight mb-3">
              {blueprint.title}
            </h1>
            <p className="text-sm md:text-base text-blue-100 max-w-3xl">
              {blueprint.summary}
            </p>
          </div>
        </motion.div>

        {/* Main layout grid */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {/* Main column */}
          <div className="md:col-span-2 space-y-6">
            {/* Niche */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-1">
                Recommended Direction
              </h2>
              <p className="text-xl font-semibold mb-2">
                {blueprint.nicheSuggestion}
              </p>
              {blueprint.basedOnUser && (
                <p className="text-sm text-gray-600">
                  This niche is suggested based on your background, constraints,
                  and what you said you want:{" "}
                  <span className="italic">
                    “{blueprint.basedOnUser}”
                  </span>
                  .
                </p>
              )}
            </section>

            {/* Monetization */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-1">
                Monetization Paths
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                These are realistic ways you could earn money with this niche.
              </p>
              <ul className="list-disc ml-5 space-y-1 text-gray-800 text-sm">
                {blueprint.monetization.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </section>

            {/* Step-by-step guide */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-1">
                Step-by-step starting plan
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Follow these steps in order. Treat them like a checklist for the
                next weeks and months.
              </p>
              <ol className="list-decimal ml-5 space-y-1 text-gray-800 text-sm">
                {blueprint.stepByStepGuide.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </section>
          </div>

          {/* Sidebar column */}
          <div className="space-y-6">
            {/* Snapshot */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-3">
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
              <h3 className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-2">
                Tools & resources
              </h3>
              <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                {blueprint.toolsNeeded.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>

            {/* Example names */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-2">
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

            {/* Decision path (optional) */}
            {Array.isArray(blueprint.decisions) &&
              blueprint.decisions.length > 0 && (
                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-2">
                    How we got here
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    A quick view of some of the choices you made in the question
                    flow.
                  </p>
                  <ul className="space-y-2 text-xs text-gray-700">
                    {blueprint.decisions.slice(0, 4).map((d, i) => (
                      <li key={i} className="border-l-2 border-blue-500 pl-2">
                        <span className="font-medium">Step {d.step}:</span>{" "}
                        {d.optionLabel || d.choice}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
          </div>
        </div>
      </div>
    </main>
  );
}
