"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import OptionCard from "@/components/OptionCard";
import { QuestionType, HistoryItem } from "@/types/question-types";

const MAX_STEPS = 6;

const PHASE_LABELS = [
  "Your constraints",
  "Work style",
  "Risk profile",
  "Skills & strengths",
  "Market leaning",
  "Execution style",
];

export default function QuestionsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");

  // Load intro from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("nicheroot_userInput");

    if (!saved || saved.trim() === "") {
      setTimeout(() => router.push("/start"), 50);
      return;
    }

    setUserInput(saved);
  }, [router]);

  // First auto question load
  useEffect(() => {
    if (!userInput) return;
    fetchQuestion(null);
  }, [userInput]);

  async function fetchQuestion(choice: "A" | "B" | null) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step,
          userInput,
          history,
          choice,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setQuestion(data.question);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching question:", err);
      setError(err.message || "Failed to load next question.");
      setLoading(false);
    }
  }

  function handleSelect(key: "A" | "B") {
    setSelected(key);
  }

  // -------------------------------
  // FULLY FIXED goNext()
  // -------------------------------
  async function goNext() {
    if (!selected || !question) return;

    const chosen = question.options.find((o) => o.key === selected);
    if (!chosen) return;

    const newHistory: HistoryItem[] = [
      ...history,
      {
        step,
        question: question.question,
        choice: selected,
        optionLabel: chosen.label,
      },
    ];

    setHistory(newHistory);

    // 1) If final step → generate blueprint
    if (step >= MAX_STEPS) {
      try {
        setLoading(true);

        const res = await fetch("/api/generate-blueprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userInput,
            history: newHistory,
          }),
        });

        const data = await res.json();

        if (data.error) {
          console.error("Blueprint generation failed:", data.error);
          setError(data.error);
          setLoading(false);
          return;
        }

        // 100% correct way to encode for URL
        const encoded = encodeURIComponent(JSON.stringify(data));

        router.push(`/blueprint?data=${encoded}`);
        return;
      } catch (err: any) {
        console.error("AI Blueprint error:", err);
        setError("Failed to generate blueprint. Try again.");
        setLoading(false);
        return;
      }
    }

    // 2) Otherwise → continue asking questions
    const nextStep = step + 1;
    setStep(nextStep);
    setSelected(null);

    await fetchQuestion(selected);
  }

  const progress = (step / MAX_STEPS) * 100;
  const activePhaseIndex = Math.min(step - 1, PHASE_LABELS.length - 1);

  return (
    <main className="min-h-screen bg-[var(--background)] text-gray-900">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-24 sm:pt-28">
        
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--brand-500)]">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-500)] text-[9px] font-bold text-white">
                N
              </span>
              NicheRoot Decision Flow
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Question {step}{" "}
              <span className="text-[var(--brand-500)]">/ {MAX_STEPS}</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm text-gray-600">
              Smart trade-off questions that match your goals to one strong business direction.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="rounded-2xl bg-white/90 px-4 py-3 text-xs shadow-sm ring-1 ring-black/5 sm:min-w-[220px]">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Progress toward your personalized blueprint
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[var(--brand-500)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] text-gray-500">
              {Math.round(progress)}% complete
            </div>
          </div>
        </div>

        {/* Phase mini-nav */}
        <div className="mb-6 flex flex-wrap gap-2 text-[11px] font-medium text-gray-500">
          {PHASE_LABELS.map((label, idx) => {
            const active = idx === activePhaseIndex;
            return (
              <div
                key={label}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${
                  active
                    ? "border-[var(--brand-500)] bg-indigo-50 text-[var(--brand-500)]"
                    : "border-transparent text-gray-500"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    active ? "bg-[var(--brand-500)]" : "bg-gray-300"
                  }`}
                />
                {label}
              </div>
            );
          })}
        </div>

        {/* Main Question Area */}
        {loading ? (
          <p className="mt-16 text-center text-sm text-gray-500">
            Loading your next question…
          </p>
        ) : error ? (
          <div className="mt-10 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.section
              key={question?.question}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl bg-white/90 p-5 shadow-lg ring-1 ring-black/5 sm:p-7"
            >
              {/* Question */}
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-500)]">
                  Current phase: {PHASE_LABELS[activePhaseIndex]}
                </p>

                <h2 className="mt-2 text-lg font-semibold text-gray-900 sm:text-xl">
                  {question?.question}
                </h2>

                <p className="mt-2 text-xs text-gray-500">
                  Each answer narrows down a single strong business direction.
                </p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {question?.options.map((opt) => (
                  <OptionCard
                    key={opt.key}
                    option={opt}
                    selected={selected === opt.key}
                    onSelect={() => handleSelect(opt.key)}
                  />
                ))}
              </div>

              {/* Continue Button */}
              <div className="mt-6">
                <button
                  onClick={goNext}
                  disabled={!selected}
                  className={`w-full rounded-full px-8 py-3 text-sm font-semibold shadow-md transition-all ${
                    !selected
                      ? "cursor-not-allowed bg-gray-300 text-gray-100 opacity-80 shadow-none"
                      : "bg-[var(--brand-500)] text-white hover:bg-[var(--brand-400)] hover:shadow-[0_18px_45px_rgba(88,80,236,0.25)] active:scale-[0.98]"
                  }`}
                >
                  Continue →
                </button>
              </div>
            </motion.section>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
