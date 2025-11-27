"use client";

import { useEffect, useState } from "react";

export default function BlueprintPage() {
  const [blueprint, setBlueprint] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("nicheroot_blueprint");
    if (saved) {
      setBlueprint(JSON.parse(saved));
    }
  }, []);

  if (!blueprint) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F7F8FA] text-gray-900">
        <p className="text-lg text-gray-600">Loading your business blueprint...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">

        {/* HEADER */}
        <header className="space-y-2">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
            Your Personalized Result
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold">
            {blueprint.title}
          </h1>

          <p className="text-gray-600 text-lg">
            {blueprint.summary}
          </p>
        </header>

        {/* NICHE */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Your Niche</h2>
          <p>{blueprint.nicheSuggestion}</p>
        </section>

        {/* MONETIZATION */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Monetization</h2>
          <ul className="list-disc ml-6 space-y-1">
            {blueprint.monetization.map((m: string, i: number) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </section>

        {/* STEPS */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Step-by-step Actions</h2>
          <ol className="list-decimal ml-6 space-y-1">
            {blueprint.stepByStepGuide.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </section>

        {/* TOOLS */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Tools You'll Need</h2>
          <ul className="list-disc ml-6 space-y-1">
            {blueprint.toolsNeeded.map((t: string, i: number) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </section>

        {/* NAMES */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Example Names</h2>
          <ul className="list-disc ml-6 space-y-1">
            {blueprint.exampleNames.map((n: string, i: number) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </section>

      </div>
    </main>
  );
}
