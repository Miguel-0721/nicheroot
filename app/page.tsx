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
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* ===========================
            STICKY GLASS HEADER
        ============================ */}
        <header className="fixed top-0 left-0 w-full backdrop-blur-md bg-white/70 border-b border-gray-200 z-50">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="font-semibold text-gray-900">NicheRoot</div>

            <nav className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#how-it-works" className="hover:text-gray-900">
                How it works
              </a>
              <a href="#features" className="hover:text-gray-900">
                Features
              </a>
              <a href="#who-its-for" className="hover:text-gray-900">
                Who it's for
              </a>
            </nav>

            <button
              onClick={startFlow}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              Start questions
            </button>
          </div>
        </header>

        {/* Push content below header */}
        <div className="pt-24" />

        {/* =====================================================
              HOMEPAGE (shown before questions)
        ====================================================== */}
        {!question && !loadingBlueprint && (
          <>
            {/* ===========================
                HERO SECTION
            ============================ */}
            <section className="mt-12 md:mt-20">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
                  Let’s find a business that{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    actually fits you.
                  </span>
                </h1>

                <p className="text-gray-600 text-lg mt-4 leading-relaxed">
                  Describe your reality — your time, money, strengths, and what
                  you want from your next chapter. NicheRoot will turn that into
                  a short decision flow and generate a personalized business
                  blueprint you can actually execute.
                </p>
              </div>
            </section>

            {/* ===========================
                VALUE PROPOSITION CARDS
            ============================ */}
            <section className="mt-16 grid md:grid-cols-3 gap-6" id="features">
              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Built for real constraints
                </h3>
                <p className="text-gray-600 text-sm">
                  Your time, money, lifestyle, and risk tolerance are treated as
                  first-class inputs — not afterthoughts.
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  A decision engine — not random ideas
                </h3>
                <p className="text-gray-600 text-sm">
                  No endless lists. Just smart A/B trade-off questions that
                  narrow down the right direction.
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Actionable blueprint
                </h3>
                <p className="text-gray-600 text-sm">
                  You’ll get a niche, monetization options, tools, and a
                  step-by-step roadmap — not generic advice.
                </p>
              </div>
            </section>

            {/* ===========================
                HOW IT WORKS (1 → 2 → 3)
            ============================ */}
            <section id="how-it-works" className="mt-20">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6">
                How NicheRoot works
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                  <p className="font-semibold text-gray-900">1. Describe</p>
                  <p className="text-gray-600 text-sm mt-2">
                    Tell us your constraints: time, money, preferences,
                    strengths, and what you want.
                  </p>
                </div>

                <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                  <p className="font-semibold text-gray-900">2. Decide</p>
                  <p className="text-gray-600 text-sm mt-2">
                    Answer 6 focused A/B questions built to reveal your best
                    business direction.
                  </p>
                </div>

                <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                  <p className="font-semibold text-gray-900">3. Blueprint</p>
                  <p className="text-gray-600 text-sm mt-2">
                    Get a personalized plan: niche, monetization methods,
                    roadmap, tools, and next steps.
                  </p>
                </div>
              </div>
            </section>

            {/* ===========================
                INPUT AREA
            ============================ */}
            <section className="mt-20 max-w-3xl">
              <h2 className="text-xl font-semibold mb-2">Your situation</h2>

              <textarea
                className="w-full h-48 p-4 border border-gray-300 rounded-xl shadow-sm 
                           focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="For example: 
• Your current work or studies
• How much time you realistically have per week
• How much money you can invest
• What you do NOT want (stress, employees)
• What an ideal business would feel like"
              />

              <p className="text-gray-500 text-xs mt-2">
                Don’t worry about writing it perfectly. Honest text is better
                than impressive-sounding text.
              </p>
            </section>

            {/* ===========================
                WHO IT'S FOR
            ============================ */}
            <section id="who-its-for" className="mt-20 grid md:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  People who want clarity
                </h3>
                <p className="text-gray-600 text-sm">
                  If you feel overwhelmed by too many ideas, this filters
                  everything to one path.
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  People who don’t want to waste time
                </h3>
                <p className="text-gray-600 text-sm">
                  No courses, no fluff — just high-signal decisions in minutes.
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  People who want a realistic plan
                </h3>
                <p className="text-gray-600 text-sm">
                  You get a blueprint based on your real constraints, not hustle
                  culture fantasies.
                </p>
              </div>
            </section>

            {/* ===========================
                FINAL CTA
            ============================ */}
            <section className="mt-20 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                Ready to find a business that fits your life?
              </h2>

              <button
                onClick={startFlow}
                className="px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
                           rounded-xl font-medium text-sm hover:shadow-md hover:shadow-blue-500/30 transition"
              >
                Start the 6 questions
              </button>
            </section>
          </>
        )}
        {/* =====================================================
            QUESTION FLOW SCREEN (A/B QUESTIONS)
        ====================================================== */}
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
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Step {question.step} of {MAX_STEPS}
                </p>

                <h2 className="text-2xl md:text-3xl font-semibold mt-1">
                  {question.question}
                </h2>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Options */}
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

        {/* =====================================================
            LOADING BLUEPRINT
        ====================================================== */}
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

        {/* =====================================================
            FOOTER
        ====================================================== */}
        <footer className="mt-24 py-10 text-center text-sm text-gray-500">
          <p>NicheRoot — Smart business matching</p>
          <p className="mt-1">© {new Date().getFullYear()} NicheRoot. All rights reserved.</p>
        </footer>

      </div>
    </main>
  );
}
