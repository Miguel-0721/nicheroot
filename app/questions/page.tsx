"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import OptionCard from "@/components/OptionCard";
import { QuestionType, HistoryItem } from "@/types/question-types";
import type { BusinessBlueprint } from "@/types/blueprint-types";

const MAX_STEPS = 6;

const PHASE_LABELS = [
  "Your constraints",
  "Work style",
  "Risk profile",
  "Skills & strengths",
  "Market leaning",
  "Execution style",
];

const STORAGE_KEY = "nicheroot_blueprints_v2";

type SavedBlueprint = {
  id: string;
  createdAt: string;
  label: string;
  data: BusinessBlueprint;
};

/* --------------------------------------------------
   FIXED FOR BLUEPRINT V2
-------------------------------------------------- */
function createLabel(data: BusinessBlueprint, createdAtISO: string): string {
  const raw = data.meta?.modelName?.trim() ?? "Blueprint";

  const date = new Date(createdAtISO).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });

  if (!raw) return `Blueprint · ${date}`;

  return raw.length > 70
    ? raw.slice(0, 70) + "… · " + date
    : raw + " · " + date;
}

export default function QuestionsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");

  /* --------------------------------------------------
     LOAD INTRO FROM LOCALSTORAGE
  -------------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("nicheroot_userInput");

    if (!saved || saved.trim() === "") {
      router.push("/start");
      return;
    }

    setUserInput(saved);
  }, [router]);

  /* --------------------------------------------------
     FIRST QUESTION AUTO-LOAD
  -------------------------------------------------- */
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

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to load next question.");
      }

      const data = await res.json();
      if (!data.success || !data.question) {
        throw new Error(data.error || "No question returned.");
      }

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

/* --------------------------------------------------
   FINAL STEP → GENERATE BLUEPRINT (3-part version)
-------------------------------------------------- */
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

  // LAST STEP → GENERATE BLUEPRINT
  if (step >= MAX_STEPS) {
    try {
      setLoading(true);
      setError(null);

      console.log("NR DEBUG – HISTORY PAYLOAD:", newHistory);
      console.log("NR DEBUG – USER INPUT PAYLOAD:", userInput);

      // ================== PART 1 ==================
      const part1Res = await fetch("/api/generate-blueprint-part1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput,
          history: newHistory,
        }),
      });

      if (!part1Res.ok) throw new Error("Part 1 failed");
      const part1 = await part1Res.json();

// ================== EXECUTIVE OVERVIEW (NEW) ==================
const execRes = await fetch("/api/generate-blueprint-executive-overview", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userInput,
    history: newHistory,
    meta: part1.meta,
  }),
});

if (!execRes.ok) throw new Error("Executive Overview failed");

const execJson = await execRes.json();
if (!execJson?.section) {
  throw new Error("Executive Overview missing 'section'");
}

const executiveOverviewSection = execJson.section;

// Remove old EO from Part1
const filteredPart1Sections = part1.sectionsPart1.filter(
  (sec: any) => sec.id !== "executive-overview"
);



      if (!part1?.meta || !Array.isArray(part1.sectionsPart1)) {
        throw new Error("Part 1 response missing sections/meta");
      }

      // ================== PART 2 ==================
      const part2Res = await fetch("/api/generate-blueprint-part2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput,
          history: newHistory,
          part1,
        }),
      });

      if (!part2Res.ok) throw new Error("Part 2 failed");
      const part2 = await part2Res.json();

      if (!Array.isArray(part2.sectionsPart2)) {
        throw new Error("Part 2 response missing sectionsPart2");
      }

      // ================== PART 3 ==================
      const part3Res = await fetch("/api/generate-blueprint-part3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput,
          history: newHistory,
          part1,
          part2,
        }),
      });

      if (!part3Res.ok) throw new Error("Part 3 failed");
      const part3 = await part3Res.json();

      if (
        !Array.isArray(part3.sectionsPart3) ||
        !Array.isArray(part3.globalChecklist)
      ) {
        throw new Error("Part 3 missing required fields");
      }

      // ================== MERGE ALL PARTS ==================
   const blueprint: BusinessBlueprint = {
  meta: part1.meta,
  sections: [
    executiveOverviewSection,     // NEW version FIRST
    ...filteredPart1Sections,     // founder-fit + business-model
    ...part2.sectionsPart2,
    ...part3.sectionsPart3,
  ],
  globalChecklist: part3.globalChecklist,
};


      // ================== SAVE BLUEPRINT ==================
      let id = Date.now().toString();

      if (typeof window !== "undefined") {
        try {
          let exist: SavedBlueprint[] = [];
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) exist = JSON.parse(raw);

          const createdAt = new Date().toISOString();
          const label = createLabel(blueprint, createdAt);

          const updated: SavedBlueprint[] = [
            ...exist,
            { id, createdAt, label, data: blueprint },
          ];

          const trimmed = updated.slice(-8);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
          id = trimmed[trimmed.length - 1].id;
        } catch (e) {
          console.error("Failed to save blueprint:", e);
        }
      }

      // ================== REDIRECT ==================
      router.push(`/blueprint?id=${id}`);
      return;
    } catch (err: any) {
      console.error("AI Blueprint error (3-part):", err);
      setError(err.message || "Failed to generate blueprint. Try again.");
      setLoading(false);
      return;
    }
  }

  // NOT final step → load next question
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
              Question {step} <span className="text-[var(--brand-500)]">/ {MAX_STEPS}</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm text-gray-600">
              Smart trade-off questions that match your goals to a strong business direction.
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
