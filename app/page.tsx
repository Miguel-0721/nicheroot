"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OptionCard from "@/components/OptionCard";
import { QuestionType, HistoryItem } from "@/types/question-types";

const MAX_STEPS = 6;

export default function Home() {
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userInput, setUserInput] = useState("");

  const [loadingBlueprint, setLoadingBlueprint] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<"A" | "B" | null>(null);

  // -------------------------------
  // Fetch Next Question / Final Step
  // -------------------------------
  const fetchNextQuestion = async (choiceOverride?: "A" | "B") => {
    let updatedHistory = history;
    const finalChoice = choiceOverride ?? selectedChoice ?? undefined;

    if (finalChoice && question) {
      const chosenOption = question.options.find(
        (opt) => opt.key === finalChoice
      );

      if (chosenOption) {
        updatedHistory = [
          ...history,
          {
            step,
            question: question.question,
            choice: finalChoice,
            optionLabel: chosenOption.label,
          },
        ];
        setHistory(updatedHistory);
      }
    }

    const nextStep = step + (finalChoice ? 1 : 0);

    // -------------------------------
    // Final Step → Generate Blueprint
    // -------------------------------
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

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "nicheroot_blueprint",
          JSON.stringify(data.blueprint)
        );
      }

      window.location.href = "/blueprint";
      return;
    }
    // -------------------------------
    // Fetch next question
    // -------------------------------
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
      setSelectedChoice(null);
    }
  };

  // -------------------------------
  // Start Flow
  // -------------------------------
  const startFlow = () => {
    setHistory([]);
    setSelectedChoice(null);
    setStep(1);
    fetchNextQuestion();
  };

  const progressPercent = question
    ? (question.step / MAX_STEPS) * 100
    : 0;
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
              Please wait a moment while we build your personalized plan.
            </p>
          </div>
        )}

        {/* INTRO SCREEN */}
        {!question && !loadingBlueprint && (
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
        {question && !loadingBlueprint && (
          <AnimatePresence mode="wait">
            <motion.div
              key={question.step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-16 space-y-8"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Step {question.step} of {MAX_STEPS}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-semibold mt-1">
                    {question.question}
                  </h2>
                </div>

                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {question.options.map((opt) => (
                  <OptionCard
                    key={opt.key}
                    option={opt}
                    onSelect={(key) => setSelectedChoice(key)}
                    selected={selectedChoice === opt.key}
                  />
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  disabled={!selectedChoice}
                  onClick={() => selectedChoice && fetchNextQuestion(selectedChoice)}
                  className={`px-6 py-3 rounded-xl font-medium transition
                    ${
                      selectedChoice
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </main>
  );
}
