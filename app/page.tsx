"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OptionCard from "@/components/OptionCard";
import { QuestionType, HistoryItem } from "@/types/question-types";

const MAX_STEPS = 6;

export default function Home() {
  const [illustrationLoaded, setIllustrationLoaded] = useState(false);

  // ---- QUESTION FLOW STATE ----
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userInput, setUserInput] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<"A" | "B" | null>(null);
  const [loadingBlueprint, setLoadingBlueprint] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const progressPercent = question
    ? (question.step / MAX_STEPS) * 100
    : (step / MAX_STEPS) * 100;

  // ---- FETCH NEXT QUESTION / FINAL STEP ----
  const fetchNextQuestion = async (choiceOverride?: "A" | "B") => {
    try {
      let updatedHistory = history;
      const finalChoice = choiceOverride ?? selectedChoice ?? undefined;

      // Save last choice into history
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

      // Final step → generate blueprint
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

        setShowWizard(false);
        window.location.href = "/blueprint";
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
        setSelectedChoice(null);
      }
    } catch (error) {
      console.error("Error in fetchNextQuestion:", error);
    }
  };

  // ---- START FLOW ----
  const startFlow = () => {
    setShowWizard(true);
    setHistory([]);
    setSelectedChoice(null);
    setStep(1);
    setQuestion(null);
    setLoadingBlueprint(false);

    fetchNextQuestion();
  };

  const closeWizard = () => {
    if (loadingBlueprint) return;
    setShowWizard(false);
    setSelectedChoice(null);
    setQuestion(null);
    setStep(1);
    setHistory([]);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-gray-900">
      {/* ============================
          PREMIUM STICKY HEADER
      ============================ */}
      <header className="premium-header">
        <div className="nav-container">
          {/* LOGO */}
          <div className="nav-logo">NicheRoot</div>

          {/* NAVIGATION */}
          <nav className="nav-links">
            <a href="#why" className="nav-link">
              Why it works
            </a>
            <a href="#how" className="nav-link">
              How it works
            </a>
            <a href="#who-its-for" className="nav-link">
              Who it&apos;s for
            </a>
          </nav>

          {/* CTA */}
          <button className="nav-btn" onClick={startFlow}>
            Start questions
          </button>
        </div>
      </header>

      {/* Spacer under fixed header */}
      <div className="pt-24" />

      {/* ============================
          HERO SECTION
      ============================ */}
      <section className="section bg-white-section">
        <div className="container flex flex-col lg:flex-row items-center gap-14">
          {/* LEFT: TEXT */}
          <div className="flex-1 max-w-xl">
            <p className="badge">Smart business matching for real-world constraints</p>

            <h1 className="hero-title">
              Find the business that{" "}
              <span style={{ color: "var(--brand-500)" }}>fits your life.</span>
            </h1>

            <p className="hero-sub">
              NicheRoot analyzes your time, money, strengths, goals, and
              personality, then creates a personalized business direction and
              execution blueprint built for your reality.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <button className="primary-btn" onClick={startFlow}>
                Start the 6 questions
              </button>
              <button
                className="text-[var(--brand-500)] font-medium"
                onClick={() =>
                  document
                    .getElementById("how")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See how it works →
              </button>
            </div>
          </div>

          {/* RIGHT: ILLUSTRATION */}
          <div className="flex-1 flex justify-end">
            {!illustrationLoaded && (
              <div className="w-[560px] h-[360px] rounded-2xl bg-[#f3f4ff] flex items-center justify-center text-sm text-gray-500 shadow-md">
                Loading illustration…
              </div>
            )}

            <Image
              src="/illustration-light.png"
              alt="NicheRoot Illustration"
              width={560}
              height={380}
              className={`hero-illustration ${
                illustrationLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoadingComplete={() => setIllustrationLoaded(true)}
            />
          </div>
        </div>
      </section>

      {/* ============================
          WHY SECTION
      ============================ */}
      <section id="why" className="section bg-gray-section">
        <div className="container">
          <h2 className="section-title">Why NicheRoot works</h2>
          <p className="section-sub">
            Most people fail at business not because of lack of talent, but
            because they choose the wrong direction for their life or
            constraints. NicheRoot solves this with guided trade-off questions
            that reveal your best direction.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mt-10">
            <div className="card">
              <div className="icon">➕</div>
              <h3 className="card-title">Built for real constraints</h3>
              <p>
                Your time, money, personality, and energy are first-class inputs — not
                afterthoughts.
              </p>
            </div>

            <div className="card">
              <div className="icon">🔍</div>
              <h3 className="card-title">Smart decision engine</h3>
              <p>
                No endless idea lists. Just 6 guided A/B trade-off questions that
                reveal your best direction.
              </p>
            </div>

            <div className="card">
              <div className="icon">✔️</div>
              <h3 className="card-title">Actionable blueprint</h3>
              <p>
                A niche, monetization systems, tools, and a step-by-step roadmap
                tailored to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================
          HOW SECTION
      ============================ */}
      <section id="how" className="section bg-white-section">
        <div className="container">
          <h2 className="section-title">How NicheRoot works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mt-10">
            <div className="card">
              <p className="text-xs font-semibold text-[var(--brand-500)] mb-1">
                STEP 1
              </p>
              <h3 className="card-title">Describe your reality</h3>
              <p>Tell us about your time, money, personality, and goals.</p>
            </div>

            <div className="card">
              <p className="text-xs font-semibold text-[var(--brand-500)] mb-1">
                STEP 2
              </p>
              <h3 className="card-title">Answer 6 trade-off questions</h3>
              <p>These reveal your best business direction without overload.</p>
            </div>

            <div className="card">
              <p className="text-xs font-semibold text-[var(--brand-500)] mb-1">
                STEP 3
              </p>
              <h3 className="card-title">Receive your blueprint</h3>
              <p>
                Your niche, monetization, tools, and next steps — tailored to your
                life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================
          BLUEPRINT PREVIEW
      ============================ */}
      <section className="section bg-gray-section">
        <div className="container">
          <h2 className="section-title">What your blueprint looks like</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10 items-stretch">
            {/* LEFT */}
            <div className="card">
              <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                Built from your answers
              </h4>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>Time vs income preference</li>
                <li>Online vs offline leaning</li>
                <li>Skill vs capital strength</li>
              </ul>
              <p className="mt-5 text-gray-600">
                Your blueprint adapts to your life — not vague “top 100 business
                ideas”.
              </p>
            </div>

            {/* RIGHT */}
            <div className="blueprint-card">
              <p className="text-xs uppercase tracking-wide text-indigo-200">
                Example snapshot
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                Low-ticket, high-volume digital service
              </h3>
              <p className="mt-2 text-sm text-indigo-100">
                Ideal for someone wanting flexibility, low risk, and location
                independence.
              </p>

              <h4 className="mt-6 text-sm font-semibold">Monetization</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Monthly retainers</li>
                <li>• Packaged mini-services</li>
                <li>• Upsell add-ons</li>
              </ul>

              <h4 className="mt-6 text-sm font-semibold">First 30 days</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Define your core offer</li>
                <li>• Validate with 3–5 conversations</li>
                <li>• Create a simple landing page</li>
                <li>• Get 2–3 paid test clients</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================
          YOUR SITUATION
      ============================ */}
      <section className="section bg-white-section">
        <div className="container">
          <h2 className="section-title">Tell us about your situation</h2>
          <p className="section-sub mb-6">
            Be honest — the more real your description is, the more accurate your
            blueprint becomes.
          </p>

          <textarea
            className="text-area"
            placeholder="For example: • Your background or current work • Available hours weekly • Budget you can invest • What you want (and don’t want)"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />

          <button className="primary-btn mt-7" onClick={startFlow}>
            Start the 6 questions
          </button>
        </div>
      </section>

      {/* ============================
          WHO IT'S FOR
      ============================ */}
      <section id="who-its-for" className="section bg-gray-section">
        <div className="container">
          <h2 className="section-title">Who NicheRoot is for</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mt-10">
            <div className="card">
              <h3 className="card-title">People who want clarity</h3>
              <p>Perfect if you&apos;re overwhelmed by too many ideas.</p>
            </div>

            <div className="card">
              <h3 className="card-title">People who value time</h3>
              <p>No fluff — just what actually matters.</p>
            </div>

            <div className="card">
              <h3 className="card-title">People who want a plan</h3>
              <p>Your blueprint is based on real constraints, not fantasy.</p>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <button className="primary-btn" onClick={startFlow}>
              Start the 6-question flow
            </button>
          </div>
        </div>
      </section>

      {/* ============================
          FOOTER
      ============================ */}
      <footer className="py-10 text-center text-sm text-gray-500">
        <p>NicheRoot — Smart business matching</p>
        <p>© {new Date().getFullYear()} NicheRoot. All rights reserved.</p>
      </footer>

      {/* ============================
          FULLSCREEN QUESTION WIZARD
      ============================ */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl p-6 md:p-8"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Wizard header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    NicheRoot · Guided flow
                  </p>
                  <p className="text-sm text-gray-600">
                    Step {question ? question.step : step} of {MAX_STEPS}
                  </p>
                </div>

                <button
                  onClick={closeWizard}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                  disabled={loadingBlueprint}
                >
                  Close ✕
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* CONTENT */}
              {loadingBlueprint ? (
                <div className="py-16 text-center">
                  <p className="text-lg font-semibold mb-2">
                    Generating your business blueprint...
                  </p>
                  <p className="text-gray-500">
                    Analyzing your answers and building a plan that fits your
                    constraints.
                  </p>
                </div>
              ) : !question ? (
                <div className="py-16 text-center">
                  <p className="text-gray-600 text-sm">
                    Loading your first question...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold mb-1">
                      {question.question}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Choose the option that feels most aligned with your real
                      energy and life — not what you think you &quot;should&quot; do.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map((opt) => (
                      <OptionCard
                        key={opt.key}
                        option={opt}
                        onSelect={() => setSelectedChoice(opt.key)}
                        selected={selectedChoice === opt.key}
                      />
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                      onClick={closeWizard}
                      disabled={loadingBlueprint}
                    >
                      Cancel
                    </button>
                    <button
                      className={`px-5 py-2 text-sm rounded-lg font-semibold transition ${
                        selectedChoice
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                      onClick={() =>
                        selectedChoice && fetchNextQuestion(selectedChoice)
                      }
                      disabled={!selectedChoice || loadingBlueprint}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
