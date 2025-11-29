"use client";

import React, { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * We keep the blueprint type loose on purpose so the page
 * doesn't crash if the API shape changes slightly.
 */
type Blueprint = Record<string, any>;

function safeArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === "string");
  }
  if (typeof value === "string") {
    return [value];
  }
  return [];
}

export default function BlueprintPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { blueprint, error } = useMemo(() => {
    const raw = searchParams.get("result");

    if (!raw) {
      return {
        blueprint: null as Blueprint | null,
        error: "No blueprint data found in the URL.",
      };
    }

    try {
      // Sometimes the result may already be decoded, so we try decodeURIComponent
      // but fall back to raw if it fails.
      let decoded = raw;
      try {
        decoded = decodeURIComponent(raw);
      } catch {
        // ignore and use raw
      }

      const parsed = JSON.parse(decoded) as Blueprint;
      return { blueprint: parsed, error: null as string | null };
    } catch (e) {
      console.error("Failed to parse blueprint:", e);
      return {
        blueprint: null as Blueprint | null,
        error: "We couldn't read your blueprint data.",
      };
    }
  }, [searchParams]);

  if (error || !blueprint) {
    return (
      <main className="min-h-screen bg-[#f5f5fa]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Something went wrong
            </h1>
            <p className="text-gray-600">
              {error ??
                "We couldn't load your business blueprint. Please go back and try generating it again."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition"
            >
              Back to start
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Safely read all fields with fallbacks
  const title: string =
    blueprint.title ?? "Your Personalized Business Blueprint";
  const subtitle: string =
    blueprint.subtitle ??
    "A focused, executable direction based on your answers.";

  const situationSummary: string =
    blueprint.situationSummary ??
    blueprint.howWeSeeYourSituation ??
    "This blueprint summarizes your constraints, preferences, and goals.";

  const recommendedDirection: string =
    blueprint.recommendedDirection ??
    "Here is the recommended direction based on your answers.";

  const businessModelSummary: string =
    blueprint.businessModelSummary ??
    blueprint.businessSummary ??
    "This is the core business model we suggest you follow.";

  const exampleOffers = safeArray(
    blueprint.exampleOffers ?? blueprint.exampleOfferIdeas
  );
  const monetization = safeArray(blueprint.monetization);
  const howToFindCustomers = safeArray(
    blueprint.howToFindCustomers ?? blueprint.customerAcquisition
  );
  const stepByStepGuide = safeArray(
    blueprint.stepByStepGuide ?? blueprint.executionSteps
  );
  const dayOneActions = safeArray(
    blueprint.dayOneActions ?? blueprint.firstDayActions
  );
  const first30Days = safeArray(
    blueprint.first30Days ?? blueprint.firstMonthPlan
  );
  const keyRisks = safeArray(blueprint.keyRisks ?? blueprint.risks);
  const howToDeRisk = safeArray(
    blueprint.howToDeRisk ?? blueprint.riskMitigation
  );
  const growthLevers = safeArray(
    blueprint.growthLevers ?? blueprint.scalingIdeas
  );

  return (
    <main className="min-h-screen bg-[#f5f5fa]">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="mb-10 space-y-3">
          <p className="text-xs font-semibold tracking-[0.2em] text-indigo-500 uppercase">
            NICHEROOT — BUSINESS BLUEPRINT
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight">
            {title}
          </h1>
          <p className="text-gray-600 max-w-3xl">{subtitle}</p>
        </header>

        {/* Situation */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              How we see your situation
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              {situationSummary}
            </p>
          </div>
        </section>

        {/* 2-column top summary */}
        <section className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Recommended direction
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {recommendedDirection}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Business model summary
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {businessModelSummary}
            </p>
          </div>
        </section>

        {/* Example offers + Monetization */}
        <section className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Example offers
            </h3>
            {exampleOffers.length > 0 ? (
              <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                {exampleOffers.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                Specific offer ideas will appear here based on your answers.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Monetization
            </h3>
            {monetization.length > 0 ? (
              <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                {monetization.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                Revenue streams and pricing levers will appear here.
              </p>
            )}
          </div>
        </section>

        {/* Customers + Step-by-step */}
        <section className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              How to find customers
            </h3>
            {howToFindCustomers.length > 0 ? (
              <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                {howToFindCustomers.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                Acquisition channels will show up here based on your blueprint.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Step-by-step guide
            </h3>
            {stepByStepGuide.length > 0 ? (
              <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-800">
                {stepByStepGuide.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-gray-500">
                A detailed execution sequence will be generated here.
              </p>
            )}
          </div>
        </section>

        {/* Day-one + First 30 days */}
        <section className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Day-one actions
            </h3>
            {dayOneActions.length > 0 ? (
              <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                {dayOneActions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                Immediate “today” tasks will be listed here.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              First 30 days
            </h3>
            {first30Days.length > 0 ? (
              <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                {first30Days.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                A structured first-month plan will go here.
              </p>
            )}
          </div>
        </section>

        {/* Risks + De-risk */}
        <section className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Key risks
            </h3>
            {keyRisks.length > 0 ? (
              <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                {keyRisks.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                The main failure modes for your business will be summarized
                here.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              How to de-risk it
            </h3>
            {howToDeRisk.length > 0 ? (
              <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                {howToDeRisk.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                Concrete strategies for reducing risk will be listed here.
              </p>
            )}
          </div>
        </section>

        {/* Growth levers */}
        <section className="mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Growth levers
            </h3>
            {growthLevers.length > 0 ? (
              <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                {growthLevers.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                When you are ready to scale, strategic levers will be suggested
                here.
              </p>
            )}
          </div>
        </section>

        {/* Footer button */}
        <div className="flex justify-end">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm font-medium hover:bg-gray-200 transition"
          >
            Start over
          </button>
        </div>
      </div>
    </main>
  );
}
