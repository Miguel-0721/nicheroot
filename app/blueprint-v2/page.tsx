"use client";
import BlueprintBlockRenderer from "@/components/BlueprintBlockRenderer";

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
  blocks: {
    type: "paragraph" | "list" | "table";
    value: any;
  }[];
  nextMoves?: string[];
};

  }[];
};

function cleanTitle(title: string) {
  return title.replace(/^\d+\.\s*/, "");
}

function describeFit(score: number) {
  if (score >= 75) return "Strong fit with clear constraints";
  if (score >= 60) return "Moderate fit with notable constraints";
  if (score >= 45) return "Weak to moderate fit";
  return "Poor fit under current constraints";
}

function describeRisk(score: number) {
  if (score >= 75) return "High uncertainty and execution risk";
  if (score >= 60) return "Meaningful risk with unclear demand";
  if (score >= 45) return "Moderate risk";
  return "Lower relative risk, not guaranteed";
}



/* ---------------- PAGE ---------------- */

export default function BlueprintV2Page() {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const [hasJumpedAhead, setHasJumpedAhead] = useState(false);


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

const CANONICAL_SECTION_ORDER = [
  "what-this-business-actually-is",
  "who-this-is-for-and-who-it-isnt",
  "day-to-day-operational-reality",
  "problem-and-market-reality",
  "demand-signals-and-market-evidence",
  "pricing-reality-and-willingness-to-pay",
  "tools-skills-and-setup-required",
  "execution-path-first-30-days",
  "common-failure-patterns",
  "risks-tradeoffs-and-assumptions",
];

const sortedSections = [...data.sections]
  .map((s: any) => ({
    ...s,
    title: cleanTitle(s.title),
  }))
  .sort((a, b) => {
    const ai = CANONICAL_SECTION_ORDER.indexOf(a.id);
    const bi = CANONICAL_SECTION_ORDER.indexOf(b.id);

    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;

    return ai - bi;
  });

setBlueprint({
  ...data,
  sections: sortedSections,
});

setActiveSectionId(sortedSections[0]?.id ?? null);


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


{/* Blueprint orientation */}
<div className="mx-auto max-w-7xl px-6 pt-6">
  <div className="rounded-xl border bg-white p-5 space-y-3">
    <p className="text-sm text-gray-700">
      This blueprint was generated based on the idea you selected and the
      context you provided earlier.
    </p>

    <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
      <p className="font-medium text-gray-900 mb-1">
        What this blueprint is
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>A realistic breakdown of how this business works in practice</li>
        <li>A way to understand effort, risk, and daily reality</li>
        <li>A decision-support tool before you commit time or money</li>
      </ul>
    </div>

    <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
      <p className="font-medium text-gray-900 mb-1">
        What this blueprint is not
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Not a promise of success</li>
        <li>Not financial or investment advice</li>
        <li>Not a guarantee of income or demand</li>
      </ul>
    </div>

    <p className="text-xs text-gray-500">
      Read from top to bottom. If a section clearly does not fit your situation,
      that’s a valid signal to stop or reconsider the idea.
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
  onClick={() => {
  const currentIndex = blueprint.sections.findIndex(
    s => s.id === activeSectionId
  );
  const targetIndex = blueprint.sections.findIndex(
    s => s.id === section.id
  );

 if (targetIndex > currentIndex + 1 && !hasJumpedAhead) {
  setHasJumpedAhead(true);
}

if (targetIndex <= currentIndex) {
  setHasJumpedAhead(false);
}

  setActiveSectionId(section.id);
}}

  className={`cursor-pointer rounded-md px-2 py-1 transition ${
    isActive
      ? "bg-blue-50 text-blue-600 font-medium"
      : "text-gray-600 hover:bg-gray-100"
  }`}
>
  {section.id === blueprint.sections[0].id && (
    <span className="mr-1 text-[10px] uppercase tracking-wide text-gray-400">
      Start here
    </span>
  )}
  {cleanTitle(section.title)}
</li>


              );
            })}
          </ul>
        </aside>

        {/* Main content */}
        <main className="col-span-6 space-y-6">
       {activeSection && (
  <section className="bg-white rounded-xl border p-6 space-y-5">
<p className="text-xs uppercase text-gray-400">
  Section{" "}
  {blueprint.sections.findIndex(s => s.id === activeSectionId) + 1}
  {" "}of {blueprint.sections.length}
</p>

<p className="text-sm font-medium text-gray-700">
  {cleanTitle(activeSection.title)}
</p>




{activeSection.id === "what-this-business-actually-is" && (
  <h2 className="text-2xl font-semibold text-gray-900 mt-1">
    {blueprint.meta.nicheTitle}
  </h2>
)}


{/* Fallback if something goes wrong */}
{!activeSection.content.blocks?.length && (
  <p className="text-sm text-gray-400 italic">
    No content available for this section.
  </p>
)}


{hasJumpedAhead && (
  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
    You jumped ahead in the blueprint. Earlier sections often provide important
    context that may change how you interpret this section.
  </div>
)}



{/* ✅ ACTUAL BLOCK RENDERER */}
{activeSection.content.blocks?.length > 0 && (
  <BlueprintBlockRenderer
    blocks={activeSection.content.blocks}
      />
      )}
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
            <p className="text-xs text-gray-500">
              {describeFit(blueprint.meta.scores.fit)}
            </p>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <h4 className="text-sm font-semibold mb-2">Risk Level</h4>
            <p className="text-lg font-medium">
              {blueprint.meta.scores.risk}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {describeRisk(blueprint.meta.scores.risk)}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}