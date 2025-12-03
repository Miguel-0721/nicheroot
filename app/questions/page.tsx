"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import OptionCard from "@/components/OptionCard";
import { QuestionType, HistoryItem } from "@/types/question-types";

export default function QuestionsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");

  /* --------------------------------------------------------
     LOAD USER INPUT SAFELY (prevents redirect loop)
  -------------------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("nicheroot_userInput");

    if (!saved || saved.trim() === "") {
      setTimeout(() => router.push("/start"), 50);
      return;
    }

    setUserInput(saved);
  }, []);

  /* --------------------------------------------------------
     FETCH FIRST QUESTION (after userInput is ready)
  -------------------------------------------------------- */
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
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  }

  /* --------------------------------------------------------
     HANDLE OPTION SELECTION
  -------------------------------------------------------- */
  function handleSelect(key: "A" | "B") {
    setSelected(key);
  }

  /* --------------------------------------------------------
     NEXT STEP (history now uses optionKey)
  -------------------------------------------------------- */
  async function goNext() {
    if (!selected) return;

    const chosen = question!.options.find((o) => o.key === selected);
    if (!chosen) return;

    const newHistory: HistoryItem[] = [
      ...history,
      {
        step,
        question: question!.question,
        optionKey: selected,      // <-- FIXED NAME
        optionLabel: chosen.label,
      },
    ];

    setHistory(newHistory);

    // Final step -> go to blueprint
    if (step >= 6) {
      if (typeof window !== "undefined") {
        localStorage.setItem("nicheroot_history", JSON.stringify(newHistory));
      }
      router.push("/blueprint");
      return;
    }

    setStep(step + 1);
    setSelected(null);

    await fetchQuestion(selected);
  }

  return (
    <main className="min-h-screen bg-[var(--background)] flex justify-center items-start pt-28 pb-20 px-6">
      <div className="max-w-3xl w-full">

        <h1 className="text-3xl font-bold mb-2">
          Step {step} <span className="text-[var(--brand-500)]">/ 6</span>
        </h1>

        {loading ? (
          <p className="mt-10 text-gray-500 text-lg">Loading question…</p>
        ) : error ? (
          <p className="mt-10 text-red-500">{error}</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={question?.question}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="mt-6"
            >
              <h2 className="text-xl font-semibold mb-6">
                {question?.question}
              </h2>

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

              <button
                onClick={goNext}
                disabled={!selected}
                className={`mt-6 w-full py-3 rounded-xl text-white font-semibold transition ${
                  selected
                    ? "bg-[var(--brand-500)] hover:bg-[var(--brand-600)]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Continue →
              </button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
