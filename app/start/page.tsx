"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

const placeholders = [
  "Tell us about your time, money, and what you want your life to look like...",
  "What does your current schedule and income situation look like?",
  "How much time and money can you realistically put into a new business?",
  "What are you trying to fix or improve in your life with this business?",
  "What would a “good” outcome from this business look like for you?",
];

export default function StartPage() {
  const router = useRouter();

  const [placeholder, setPlaceholder] = useState(placeholders[0]);
  const [userInput, setUserInput] = useState("");
  const [hasTyped, setHasTyped] = useState(false);

  // Rotate placeholder text (only while user hasn't typed yet)
  useEffect(() => {
    if (hasTyped) return;

    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % placeholders.length;
      setPlaceholder(placeholders[i]);
    }, 3200);

    return () => clearInterval(interval);
  }, [hasTyped]);

  const trimmed = userInput.trim();
  const disabled = trimmed.length < 20; // simple guard so people write at least a bit

  const handleStart = () => {
    if (disabled) return;

    if (typeof window !== "undefined") {
      localStorage.setItem("nicheroot_userInput", trimmed);
    }
    router.push("/questions");
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-gray-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 pb-16 pt-24 md:flex-row md:items-start md:pt-28">
        {/* LEFT: TEXT + TEXTAREA */}
        <motion.section
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="flex-1"
        >
          {/* Small breadcrumb / badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1 text-xs font-semibold text-[var(--brand-500)]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-500)] text-[10px] font-bold text-white">
              NR
            </span>
            <span>NicheRoot Decision Flow</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tell us about your{" "}
            <span className="text-[var(--brand-500)]">real situation</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
            This isn&apos;t a generic idea list. NicheRoot uses your story,
            constraints, and goals to suggest a business direction that can
            actually fit your time, money, and energy.
          </p>

          {/* Textarea */}
          <div className="mt-8">
            <label
              htmlFor="context"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Your context
            </label>
            <textarea
              id="context"
              rows={7}
              className="w-full rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-sm text-gray-900 shadow-sm outline-none ring-0 transition focus:border-[var(--brand-500)] focus:shadow-[0_18px_45px_rgba(88,80,236,0.15)]"
              placeholder={placeholder}
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                if (!hasTyped) setHasTyped(true);
              }}
            />

            <p className="mt-2 text-xs text-gray-500">
              1–2 paragraphs is enough. The more honest you are about your time,
              money, and energy, the better your recommendations.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={handleStart}
              disabled={disabled}
              className={`inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold shadow-md transition-all
              ${
                disabled
                  ? "cursor-not-allowed bg-gray-300 text-gray-100 opacity-80 shadow-none pointer-events-none"
                  : "bg-[var(--brand-500)] text-white hover:bg-[var(--brand-400)] hover:shadow-[0_18px_45px_rgba(88,80,236,0.25)]"
              }`}
            >
              Start the 6 trade-off questions
            </button>
            <p className="text-xs text-gray-500">
              You can always refine your answers later. This just gives NicheRoot
              a starting snapshot.
            </p>
          </div>
        </motion.section>

        {/* RIGHT: EXPLANATION / ILLUSTRATION */}
        <motion.aside
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="flex-1 rounded-3xl border border-gray-100 bg-gradient-to-b from-white to-[#fafaff] p-5 shadow-lg ring-1 ring-black/5 sm:p-6 md:p-8"
        >
          <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
            How this works
          </div>

          <p className="text-sm text-gray-700">
            We&apos;ll turn your story into{" "}
            <span className="font-semibold text-[var(--brand-500)]">
              6 smart A/B questions
            </span>{" "}
            that gradually narrow down the business model that fits your life,
            not just what looks good on paper.
          </p>

          <ol className="mt-6 space-y-4 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-[var(--brand-500)]">
                1
              </span>
              <div>
                <div className="font-semibold text-gray-900">
                  You describe your time, money, and goals.
                </div>
                <p className="text-xs text-gray-600">
                  Mention your schedule, financial reality, and what you want
                  this business to change.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-[var(--brand-500)]">
                2
              </span>
              <div>
                <div className="font-semibold text-gray-900">
                  NicheRoot asks 6 targeted trade-off questions.
                </div>
                <p className="text-xs text-gray-600">
                  Each question helps narrow down which models make sense for
                  your time, risk tolerance, and energy.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-[var(--brand-500)]">
                3
              </span>
              <div>
                <div className="font-semibold text-gray-900">
                  You get a personalized business blueprint.
                </div>
                <p className="text-xs text-gray-600">
                  Clear direction, one main model, and concrete next steps you
                  can actually execute.
                </p>
              </div>
            </li>
          </ol>

          <div className="mt-7 rounded-2xl bg-indigo-50/80 p-4 text-xs text-gray-700">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--brand-500)]">
              Tip for better results
            </div>
            <p>
              Mention your work schedule, income needs, risk comfort, and any
              skills you already have. That&apos;s what makes your blueprint feel{" "}
              <span className="font-semibold">tailored</span> instead of generic.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <Image
              src="/flowchart2.png"
              alt="NicheRoot decision flow illustration"
              width={360}
              height={360}
              className="max-h-[260px] w-auto object-contain drop-shadow-lg"
              priority
            />
          </div>
        </motion.aside>
      </div>
    </main>
  );
}
