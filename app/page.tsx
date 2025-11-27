"use client";

import { useState } from "react";
import OptionCard from "@/components/OptionCard";
import { QuestionType, HistoryItem } from "@/types/question-types";

const MAX_STEPS = 6;

export default function Home() {
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userInput, setUserInput] = useState("");

  const [blueprint, setBlueprint] = useState<any>(null);
  const [loadingBlueprint, setLoadingBlueprint] = useState(false);

  const fetchNextQuestion = async (selectedChoice?: "A" | "B") => {
    let updatedHistory = history;

    // Save previous answer
    if (selectedChoice && question) {
      const chosenOption = question.options.find(
        (opt) => opt.key === selectedChoice
      );

      if (chosenOption) {
        updatedHistory = [
          ...history,
          {
            step,
            question: question.question,
            choice: selectedChoice,
            optionLabel: chosenOption.label,
          },
        ];
        setHistory(updatedHistory);
      }
    }

    const nextStep = step + (selectedChoice ? 1 : 0);

    // If final step → generate blueprint
    if (nextStep > MAX_STEPS) {
      setLoadingBlueprint(true);

      const res = await fetch("/api/generate-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput,
          history: updatedHistory,
        }),
      });

      const data = await res.json();
      setBlueprint(data.blueprint);
      setLoadingBlueprint(false);
      return;
    }

    // Fetch next question
    const res = await fetch("/api/next-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: nextStep,
        history: updatedHistory,
        userInput,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setQuestion(data.question);
      setStep(data.question.step);
    }
  };

  const startFlow = () => {
    fetchNextQuestion();
  };
  return (
    <main className="min-h-screen bg-[#F7F8FA] text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* LOADING BLUEPRINT */}
        {loadingBlueprint && (
          <div className="text-center mt-24">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Generating your business blueprint...
            </h2>
            <p className="text-gray-500">
              Analyzing your answers and building a tailored plan for you.
            </p>
          </div>
        )}

        {/* BLUEPRINT OUTPUT (will be moved to /blueprint later) */}
        {blueprint && !loadingBlueprint && (
          <div className="space-y-8 mt-4">
            <header className="space-y-3">
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                Your personalized result
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold">
                {blueprint.title}
              </h1>
              <p className="text-gray-600">
                {blueprint.summary}
              </p>
            </header>

            <section className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-2">Your Niche</h2>
              <p>{blueprint.nicheSuggestion}</p>
            </section>

            <section className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-2">Monetization</h2>
              <ul className="list-disc ml-6 space-y-1">
                {blueprint.monetization.map((m: string, i: number) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </section>

            <section className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-2">Step-by-step Actions</h2>
              <ol className="list-decimal ml-6 space-y-1">
                {blueprint.stepByStepGuide.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </section>

            <section className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-2">Tools You'll Need</h2>
              <ul className="list-disc ml-6 space-y-1">
                {blueprint.toolsNeeded.map((t: string, i: number) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>

            <section className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl mb-8">
              <h2 className="text-xl font-semibold mb-2">Example Names</h2>
              <ul className="list-disc ml-6 space-y-1">
                {blueprint.exampleNames.map((n: string, i: number) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* INTRO SCREEN */}
        {!question && !blueprint && !loadingBlueprint && (
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 md:p-10 mt-8 space-y-6">
            <header className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-semibold">
                Let’s find a business that fits you.
              </h1>
              <p className="text-gray-600">
                Describe your background, skills, goals, budget, and what you want
                from your next chapter.
              </p>
            </header>

            <textarea
              className="w-full h-40 md:h-48 p-4 border border-gray-300 rounded-xl shadow-sm 
                         focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Write freely about your situation..."
            />

            <div className="flex justify-end">
              <button
                onClick={startFlow}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium
                           hover:bg-blue-700 transition"
              >
                Start
              </button>
            </div>
          </div>
        )}

        {/* QUESTION SCREEN */}
        {question && !blueprint && !loadingBlueprint && (
          <div className="mt-16 space-y-8">
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Step {question.step} of {MAX_STEPS}
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold">
                {question.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {question.options.map((opt) => (
                <OptionCard
                  key={opt.key}
                  option={opt}
                  onSelect={(choice) => fetchNextQuestion(choice)}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
