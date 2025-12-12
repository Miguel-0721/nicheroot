"use client";

import { useEffect, useState } from "react";

/* ---------------- TYPES (lightweight) ---------------- */

type Blueprint = {
  meta: {
    nicheTitle: string;
    modelName?: string;
    difficulty?: string;
    startupCost?: string;
    expectedTimeline?: string;
    scores: {
      fit: number;
      risk: number;
      demand: number;
      monetization: number;
    };
  };
  sections: {
    id: string;
    title: string;
    content: {
      paragraphs?: string[];
      lists?: { title?: string; items: string[] }[];
      nextMoves?: string[];
    };
  }[];
};

/* ---------------- PAGE ---------------- */

export default function BlueprintV2Page() {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- LOAD + GENERATE ---------------- */

  useEffect(() => {
    const raw = sessionStorage.getItem("nicheroot_active_idea");
const userContext =
  sessionStorage.getItem("nicheroot_user_context") || "";

    if (!raw) {
      setError("No idea selected. Please go back and select an idea.");
      setLoading(false);
      return;
    }

    const idea = JSON.parse(raw);

    async function generateBlueprint() {
      try {
        setLoading(true);

      const res = await fetch("/api/generate-blueprint-v2", {

          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
  idea,
  userContext,
}),

        });

        if (!res.ok) {
          throw new Error("Failed to generate blueprint");
        }

        const data = await res.json();

        setBlueprint(data);
        setActiveSectionId(data.sections[0]?.id ?? null);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    generateBlueprint();
  }, []);

  /* ---------------- STATES ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-medium">Generating your blueprint…</p>
          <p className="text-sm text-gray-500 mt-1">
            This takes about 10–20 seconds
          </p>
        </div>
      </div>
    );
  }

  if (error || !blueprint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600">{error ?? "Blueprint failed to load"}</p>
      </div>
    );
  }

  const activeSection = blueprint.sections.find(
    (s) => s.id === activeSectionId
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <h1 className="text-xl font-semibold">Your Business Blueprint</h1>
          <p className="text-sm text-gray-500">
            A personalized plan based on your selected idea
          </p>
        </div>
      </div>

      {/* Layout */}
      <div className="mx-auto max-w-7xl px-6 py-8 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-3 bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold mb-3">Sections</h3>
          <ul className="space-y-2 text-sm">
            {blueprint.sections.map((section) => {
              const isActive = section.id === activeSectionId;
              return (
                <li
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`cursor-pointer rounded-md px-2 py-1 transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {section.title}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Main content */}
        <main className="col-span-6 space-y-6">
          {activeSection && (
            <section className="bg-white rounded-xl border p-6">
              <p className="text-xs uppercase text-gray-400 mb-2">
                {activeSection.title}
              </p>

              {activeSection.id === "executive-overview" && (
                <h2 className="text-2xl font-semibold mb-3">
                  {blueprint.meta.nicheTitle}
                </h2>
              )}

              <div className="space-y-4 text-sm text-gray-700">
                {activeSection.content.paragraphs?.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {activeSection.content.lists?.map((list, i) => (
                <div key={i} className="mt-4">
                  {list.title && (
                    <h4 className="font-medium mb-1">{list.title}</h4>
                  )}
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {list.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {activeSection?.content.nextMoves && (
            <section className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-2">Next Focus</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {activeSection.content.nextMoves.map((move, i) => (
                  <li key={i}>{move}</li>
                ))}
              </ul>
            </section>
          )}
        </main>

        {/* Right panel */}
        <aside className="col-span-3 space-y-4">
          <div className="bg-white rounded-xl border p-4">
            <h4 className="text-sm font-semibold mb-2">Fit Score</h4>
            <p className="text-3xl font-bold text-blue-600">
              {blueprint.meta.scores.fit}
            </p>
            <p className="text-xs text-gray-500">Strong match</p>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <h4 className="text-sm font-semibold mb-2">Risk Level</h4>
            <p className="text-lg font-medium">
              {blueprint.meta.scores.risk}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
