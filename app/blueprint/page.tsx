"use client";

import { useEffect, useState } from "react";
import { BusinessBlueprint } from "@/types/blueprint-types";

export default function BlueprintPage() {
  const [blueprint, setBlueprint] = useState<BusinessBlueprint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nicheroot_blueprint");

      if (!stored) {
        setBlueprint(null);
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(stored);
      setBlueprint(parsed);
    } catch (err) {
      console.error("Failed to load blueprint:", err);
      setBlueprint(null);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your blueprint…
      </main>
    );
  }

  if (!blueprint) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-2xl p-10 max-w-xl text-center">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            No blueprint found. Please complete the questions again.
          </p>
          <a
            href="/"
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Back to home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="container max-w-4xl mx-auto px-4">
        {/* TITLE */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {blueprint.title}
        </h1>

        <p className="text-lg text-gray-600 mb-12">
          {blueprint.subtitle}
        </p>

        <section className="space-y-10">

          <BlueprintSection
            title="Your Situation Summary"
            content={blueprint.situationSummary}
          />

          <BlueprintSection
            title="Recommended Direction"
            content={blueprint.recommendedDirection}
          />

          <BlueprintSection
            title="Business Model Summary"
            content={blueprint.businessModelSummary}
          />

          <BlueprintList
            title="Example Offers"
            items={blueprint.exampleOffers}
          />

          <BlueprintList
            title="Monetization Options"
            items={blueprint.monetization}
          />

          <BlueprintList
            title="How to Find Customers"
            items={blueprint.howToFindCustomers}
          />

          <BlueprintList
            title="Step-by-Step Guide"
            items={blueprint.stepByStepGuide}
          />

          <BlueprintList
            title="Day One Actions"
            items={blueprint.dayOneActions}
          />

          <BlueprintList
            title="First 30 Days"
            items={blueprint.first30Days}
          />

          <BlueprintList
            title="Key Risks"
            items={blueprint.keyRisks}
          />

          <BlueprintList
            title="How to Reduce Risk"
            items={blueprint.howToDeRisk}
          />

          <BlueprintList
            title="Growth Levers"
            items={blueprint.growthLevers}
          />

        </section>

        {/* BACK BUTTON */}
        <div className="mt-14 text-center">
          <a
            href="/"
            className="px-6 py-3 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition"
          >
            Start Over
          </a>
        </div>
      </div>
    </main>
  );
}

/* -----------------------------------------
   REUSABLE BLUEPRINT COMPONENTS
------------------------------------------ */

function BlueprintSection({ title, content }: { title: string; content: string }) {
  if (!content) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
        {content}
      </p>
    </div>
  );
}

function BlueprintList({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <ul className="list-disc ml-6 space-y-2 text-gray-700 leading-relaxed">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
