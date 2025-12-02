"use client";

import { useEffect, useState } from "react";
import { BusinessBlueprint } from "@/types/blueprint-types";

export default function BlueprintPage() {
  const [blueprint, setBlueprint] = useState<BusinessBlueprint | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nicheroot_blueprint");
      if (saved) {
        try {
          setBlueprint(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse blueprint:", e);
        }
      }
    }
  }, []);

  if (!blueprint) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>No blueprint found.</p>
      </div>
    );
  }

  /* -------------------------------------------- */
  /* Reusable Section Component */
  /* -------------------------------------------- */
  function Section({
    title,
    children,
    id,
  }: {
    title: string;
    children: React.ReactNode;
    id?: string;
  }) {
    return (
      <section id={id} className="mb-10 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
        <div className="text-gray-700 leading-relaxed">{children}</div>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">

        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900">{blueprint.title}</h1>
          <p className="text-gray-600 text-lg mt-2">{blueprint.subtitle}</p>

          {blueprint.whyThisFitsYou ? (
            <p className="mt-4 p-4 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 text-sm">
              <strong>Why this fits you:</strong> {blueprint.whyThisFitsYou}
            </p>
          ) : null}
        </div>

        {/* SECTION: Situation Summary */}
        <Section title="Your Situation Summary">
          <p>{blueprint.situationSummary}</p>
        </Section>

        {/* SECTION: Business Idea */}
        <Section title="Your Business Direction">
          <p>{blueprint.businessIdea}</p>
        </Section>

        {/* SECTION: Ideal Customer */}
        <Section title="Your Ideal Customer">
          <p>
            <strong className="text-gray-900">Profile:</strong>{" "}
            {blueprint.idealCustomer?.profile || "Not specified"}
          </p>

          <div className="mt-4">
            <strong className="text-gray-900">Pain Points:</strong>
            <ul className="list-disc ml-6 mt-1 space-y-1">
              {blueprint.idealCustomer?.painPoints?.length ? (
                blueprint.idealCustomer.painPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))
              ) : (
                <li>No pain points listed.</li>
              )}
            </ul>
          </div>

          <div className="mt-4">
            <strong className="text-gray-900">Where They Are:</strong>
            <ul className="list-disc ml-6 mt-1 space-y-1">
              {blueprint.idealCustomer?.whereTheyAre?.length ? (
                blueprint.idealCustomer.whereTheyAre.map((p, i) => (
                  <li key={i}>{p}</li>
                ))
              ) : (
                <li>No platforms listed.</li>
              )}
            </ul>
          </div>
        </Section>

        {/* SECTION: Offer Examples */}
        <Section title="Offer Examples">
          <ul className="list-disc ml-6 space-y-1">
            {blueprint.offerExamples?.length ? (
              blueprint.offerExamples.map((ex, i) => <li key={i}>{ex}</li>)
            ) : (
              <li>No offer examples provided.</li>
            )}
          </ul>
        </Section>

        {/* SECTION: Pricing */}
        <Section title="Pricing Strategy">
          <ul className="list-disc ml-6 space-y-1">
            {blueprint.pricing?.starter && <li><strong>Starter:</strong> {blueprint.pricing.starter}</li>}
            {blueprint.pricing?.standard && <li><strong>Standard:</strong> {blueprint.pricing.standard}</li>}
            {blueprint.pricing?.premium && <li><strong>Premium:</strong> {blueprint.pricing.premium}</li>}
          </ul>
        </Section>

        {/* SECTION: Monetization */}
        <Section title="Monetization">
          <ul className="list-disc ml-6 space-y-1">
            {blueprint.monetization?.length ? (
              blueprint.monetization.map((m, i) => <li key={i}>{m}</li>)
            ) : (
              <li>No monetization methods listed.</li>
            )}
          </ul>
        </Section>

        {/* SECTION: Marketing Plan */}
        <Section title="Marketing Plan">
          <div>
            <strong className="text-gray-900">Organic:</strong>
            <ul className="list-disc ml-6 space-y-1 mt-1">
              {blueprint.marketingPlan?.organic?.length ? (
                blueprint.marketingPlan.organic.map((o, i) => <li key={i}>{o}</li>)
              ) : (
                <li>No organic strategies.</li>
              )}
            </ul>
          </div>

          <div className="mt-4">
            <strong className="text-gray-900">Paid:</strong>
            <ul className="list-disc ml-6 space-y-1 mt-1">
              {blueprint.marketingPlan?.paid?.length ? (
                blueprint.marketingPlan.paid.map((p, i) => <li key={i}>{p}</li>)
              ) : (
                <li>No paid strategies.</li>
              )}
            </ul>
          </div>
        </Section>

        {/* SECTION: Step by Step Guide */}
        <Section title="Step-by-Step Guide">
          <ul className="list-decimal ml-6 space-y-1">
            {blueprint.stepByStepGuide?.length ? (
              blueprint.stepByStepGuide.map((s, i) => <li key={i}>{s}</li>)
            ) : (
              <li>No steps provided.</li>
            )}
          </ul>
        </Section>

        {/* SECTION: Day One Actions */}
        <Section title="Day One Actions">
          <ul className="list-disc ml-6 space-y-1">
            {blueprint.dayOneActions?.length ? (
              blueprint.dayOneActions.map((a, i) => <li key={i}>{a}</li>)
            ) : (
              <li>No day-one actions.</li>
            )}
          </ul>
        </Section>

        {/* SECTION: First 30 Days */}
        <Section title="First 30 Days">
          <ul className="list-disc ml-6 space-y-1">
            {blueprint.first30Days?.length ? (
              blueprint.first30Days.map((a, i) => <li key={i}>{a}</li>)
            ) : (
              <li>No 30-day plan.</li>
            )}
          </ul>
        </Section>

        {/* SECTION: Key Risks */}
        <Section title="Key Risks">
          <ul className="list-disc ml-6 space-y-1">
            {blueprint.keyRisks?.length ? (
              blueprint.keyRisks.map((r, i) => <li key={i}>{r}</li>)
            ) : (
              <li>No risks listed.</li>
            )}
          </ul>
        </Section>

        {/* SECTION: How to De-Risk */}
        <Section title="How to De-Risk">
          <ul className="list-disc ml-6 space-y-1">
            {blueprint.howToDeRisk?.length ? (
              blueprint.howToDeRisk.map((r, i) => <li key={i}>{r}</li>)
            ) : (
              <li>No risk mitigation steps.</li>
            )}
          </ul>
        </Section>

        {/* SECTION: Growth Levers */}
        <Section title="Growth Levers">
          <ul className="list-disc ml-6 space-y-1">
            {blueprint.growthLevers?.length ? (
              blueprint.growthLevers.map((g, i) => <li key={i}>{g}</li>)
            ) : (
              <li>No growth levers listed.</li>
            )}
          </ul>
        </Section>
      </div>
    </main>
  );
}
