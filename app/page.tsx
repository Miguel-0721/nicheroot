"use client";

import { useState } from "react";
import OptionCard from "../components/OptionCard";
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

    // FINAL STEP → GENERATE BLUEPRINT
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

    // GET NEXT QUESTION
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
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* LOADING BLUEPRINT */}
        {loadingBlueprint && (
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold mb-4">
              Generating your business blueprint...
            </h2>
            <p className="text-neutral-300">
              I’m analyzing your answers and story to prepare your result.
            </p>
          </div>
        )}

        {/* BLUEPRINT OUTPUT */}
        {blueprint && !loadingBlueprint && (
          <div className="space-y-6 mt-4">

            <h1 className="text-4xl font-extrabold mb-2">
              {blueprint.title}
            </h1>
            <p className="text-neutral-300 mb-6">{blueprint.summary}</p>

            <section className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
              <h2 className="text-xl font-semibold mb-2">Your Niche</h2>
              <p>{blueprint.nicheSuggestion}</p>
            </section>

            <section className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
              <h2 className="text-xl font-semibold mb-2">Monetization</h2>
              <ul className="list-disc ml-6 space-y-1">
                {blueprint.monetization.map((m: string, i: number) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </section>

            <section className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
              <h2 className="text-xl font-semibold mb-2">
                Step-by-step Actions
              </h2>
              <ol className="list-decimal ml-6 space-y-1">
                {blueprint.stepByStepGuide.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </section>

            <section className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
              <h2 className="text-xl font-semibold mb-2">Tools You’ll Need</h2>
              <ul className="list-disc ml-6 space-y-1">
                {blueprint.toolsNeeded.map((t: string, i: number) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>

            <section className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
              <h2 className="text-xl font-semibold mb-2">Example Names</h2>
              <ul className="list-disc ml-6 space-y-1">
                {blueprint.exampleNames.map((n: string, i: number) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* FIRST INPUT SCREEN */}
        {!question && !blueprint && !loadingBlueprint && (
          <div className="mt-12 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
            <h1 className="text-3xl font-bold mb-3">Tell me about you</h1>
            <p className="text-neutral-300 text-sm mb-4">
              This helps personalize your questions.
            </p>

            <textarea
              className="w-full h-40 bg-black/40 p-3 border border-neutral-700 rounded-lg"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Write about your background, skills, goals, budget, etc."
            />

            <button
              onClick={startFlow}
              className="mt-4 px-5 py-2.5 bg-white text-black rounded-lg hover:bg-neutral-200"
            >
              Start
            </button>
          </div>
        )}

        {/* QUESTION SCREEN */}
        {question && !blueprint && !loadingBlueprint && (
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-semibold">
              Step {question.step} of {MAX_STEPS}
            </h2>

            <p className="text-lg">{question.question}</p>

            <div className="grid grid-cols-1 gap-4">
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
