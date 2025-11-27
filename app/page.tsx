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

    // Save last choice
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

      // Store blueprint in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "nicheroot_blueprint",
          JSON.stringify(data.blueprint)
        );
      }

      // Redirect to blueprint page
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

  const progressPercent = question ? (question.step / MAX_STEPS) * 100 : 0;

  // -------------------------------
  // RENDER
  // -------------------------------
  return (
    <main className="min-h-screen bg-[#F4F6FB] text-gray-900">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        {/* Top badge (same family as blueprint) */}
        <div className="flex justify-between items-center mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            NicheRoot · Smart business matching
          </span>
        </div>

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
          <div className="relative mt-6">
            {/* Glow behind card */}
            <div className="pointer-events-none absolute inset-0 translate-y-4 scale-105 blur-3xl bg-gradient-to-r from-blue-500/18 via-indigo-500/18 to-purple-500/18" />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative bg-white border border-gray-200 shadow-sm rounded-3xl p-8 md:p-10 space-y-6"
            >
              <header className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                  Let’s find a business that fits you.
                </h1>
                <p className="text-gray-600 text-sm md:text-base max-w-3xl">
                  Describe your background, skills, goals, budget, and what you
                  want from your next chapter. NicheRoot will use this to guide
                  you through a short series of trade-off questions and then
                  generate a tailored business blueprint.
                </p>
              </header>

              <div className="grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-6 items-start">
                {/* Textarea */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                    Your situation
                  </label>
                  <textarea
                    className="w-full h-40 md:h-48 p-4 border border-gray-300 rounded-2xl shadow-sm 
                               focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-sm"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="For example: 
• Your current work or studies
• How much time you realistically have per week
• How much money you can invest
• What you do NOT want (stress, employees, etc.)
• What an ideal business would feel like for you"
                  />
                  <p className="text-[11px] text-gray-500">
                    Don’t worry about writing it “perfectly”. Honest, messy
                    text is better than something that sounds impressive.
                  </p>
                </div>

                {/* Side helper card */}
                <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-2xl p-4 md:p-5">
                  <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                    What you’ll get
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• A suggested business direction that fits your reality</li>
                    <li>• Clear monetization ideas and first steps</li>
                    <li>• A simple roadmap you can actually follow</li>
                    <li>• No generic “100 business ideas” spam</li>
                  </ul>
                  <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2 text-[11px] text-blue-900">
                    <span className="font-semibold mr-1">Tip:</span>
                    Mention both your constraints (time, money, energy) and your
                    strengths. The better the input, the sharper the blueprint.
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={startFlow}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium
                             hover:shadow-md hover:shadow-blue-500/30 transition text-sm"
                >
                  Start questions
                </button>
              </div>
            </motion.div>
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
              {/* Progress + Title */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Step {question.step} of {MAX_STEPS}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-semibold mt-1">
                    {question.question}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose the option that feels more aligned with how you
                    actually want to work and live, not what sounds impressive.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Option cards */}
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

              {/* Continue button */}
              <div className="flex justify-end">
                <button
                  disabled={!selectedChoice}
                  onClick={() =>
                    selectedChoice && fetchNextQuestion(selectedChoice)
                  }
                  className={`px-6 py-3 rounded-xl font-medium text-sm transition
                    ${
                      selectedChoice
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md hover:shadow-blue-500/30"
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
