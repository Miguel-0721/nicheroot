"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import OptionCard from "@/components/OptionCard";
import { QuestionType, HistoryItem } from "@/types/question-types";

const MAX_STEPS = 6;

export default function Home() {
  const placeholders = [
    "Tell us about your background, skills, and goals...",
    "How much time can you commit each week?",
    "Do you prefer low risk or high income potential?",
    "What lifestyle do you want your business to support?",
    "Is there anything you want to avoid?",
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(placeholders[0]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % placeholders.length;
      setCurrentPlaceholder(placeholders[i]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const [illustrationLoaded, setIllustrationLoaded] = useState(false);

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

  const fetchNextQuestion = async (choiceOverride?: "A" | "B") => {
    try {
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

        setShowWizard(false);
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
    } catch (error) {
      console.error("Error in fetchNextQuestion:", error);
    }
  };

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

      {/* NAVBAR */}
      <header className="premium-header">
        <div className="nav-container">
          <div className="nav-logo">NicheRoot</div>

          <nav className="nav-links">
            <a href="#why" className="nav-link">Why it works</a>
            <a href="#how" className="nav-link">How it works</a>
            <a href="#who-its-for" className="nav-link">Who it's for</a>
          </nav>

          <button className="nav-btn" onClick={startFlow}>
            Start questions
          </button>
        </div>
      </header>



      {/* HERO SECTION — WITH NEW FIXES PRESERVED */}
      <section className="bg-white-section pt-24 pb-20">
        <div className="container flex flex-col lg:flex-row items-center gap-14">

          {/* TEXT SIDE */}
          <div className="flex-1 max-w-xl">
            <p className="badge">
              Smart business matching for real-world constraints
            </p>

            <h1 className="hero-title">
              Find the business that{" "}
              <span style={{ color: "var(--brand-500)" }}>fits your life.</span>
            </h1>

            <p className="hero-sub">
              NicheRoot analyzes your time, money, strengths, goals,
              and personality, then creates a personalized business
              direction and execution blueprint.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <button className="primary-btn" onClick={startFlow}>
                Start the 6 questions
              </button>

              <button
                className="text-[var(--brand-500)] font-medium"
                onClick={() =>
                  document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See how it works →
              </button>
            </div>
          </div>

          {/* IMAGE SIDE — with your exact new height fix */}
          <div className="flex-1 flex justify-end hero-img-wrapper">
            {!illustrationLoaded && (
              <div className="w-[560px] h-[360px] rounded-2xl bg-[#f3f4ff] flex items-center justify-center text-sm text-gray-500 shadow-md">
                Loading illustration…
              </div>
            )}

            <Image
              src="/illustration-light.png"
              alt="NicheRoot Illustration"
              width={520}
              height={350}
              className={`hero-illustration ${
                illustrationLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoadingComplete={() => setIllustrationLoaded(true)}
            />
          </div>
        </div>
      </section>



      {/* ALL OTHER PAGE SECTIONS — UNCHANGED */}
      {/* WHY */}
      <section id="why" className="section bg-gray-section">
        <div className="container">
          <h2 className="section-title">Why NicheRoot works</h2>
          <p className="section-sub">
            Most people fail not because they lack talent, but because they
            choose a direction that doesn’t fit their life. NicheRoot solves
            this with smart guided trade-off questions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mt-10">
            <div className="card">
              <div className="icon">➕</div>
              <h3 className="card-title">Built for real constraints</h3>
              <p>Your time, money, personality, and energy are first-class inputs.</p>
            </div>

            <div className="card">
              <div className="icon">🔍</div>
              <h3 className="card-title">Smart decision engine</h3>
              <p>6 guided A/B trade-off questions — not endless idea lists.</p>
            </div>

            <div className="card">
              <div className="icon">✔️</div>
              <h3 className="card-title">Actionable blueprint</h3>
              <p>A niche, monetization system, and roadmap tailored to you.</p>
            </div>
          </div>
        </div>
      </section>


      {/* HOW */}
      <section id="how" className="section bg-white-section">
        <div className="container">
          <h2 className="section-title">How NicheRoot works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mt-10">
            <div className="card">
              <p className="text-xs font-semibold text-[var(--brand-500)] mb-1">STEP 1</p>
              <h3 className="card-title">Describe your reality</h3>
              <p>Your time, money, personality, and goals.</p>
            </div>

            <div className="card">
              <p className="text-xs font-semibold text-[var(--brand-500)] mb-1">STEP 2</p>
              <h3 className="card-title">Answer 6 trade-off questions</h3>
              <p>Reveal your best business direction without overload.</p>
            </div>

            <div className="card">
              <p className="text-xs font-semibold text-[var(--brand-500)] mb-1">STEP 3</p>
              <h3 className="card-title">Receive your blueprint</h3>
              <p>Your niche, tools, and next steps — tailored to your life.</p>
            </div>
          </div>
        </div>
      </section>


      {/* BLUEPRINT */}
      <section className="section section-blueprint bg-gray-section">
        <div className="container">
          <h2 className="section-title">What your blueprint looks like</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10 items-start">
            <div className="card">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-700">
                Built from your answers
              </h4>

              <ul className="mt-4 space-y-2 text-gray-700">
                <li>Time vs income preference</li>
                <li>Online vs offline leaning</li>
                <li>Skill vs capital strength</li>
              </ul>

              <p className="mt-5 text-gray-600">
                Your blueprint adapts to your life — not vague idea lists.
              </p>
            </div>

            <div className="blueprint-card">
              <p className="text-xs uppercase tracking-wide text-indigo-200">Example snapshot</p>
              <h3 className="mt-2 text-xl font-semibold">
                Low-ticket, high-volume digital service
              </h3>
              <p className="mt-2 text-sm text-indigo-100">
                Ideal for someone wanting flexibility, low risk, and independence.
              </p>

              <h4 className="mt-6 text-sm font-semibold">Monetization</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Monthly retainers</li>
                <li>• Packaged mini-services</li>
                <li>• Upsell add-ons</li>
              </ul>

              <h4 className="mt-6 text-sm font-semibold">First 30 days</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Define core offer</li>
                <li>• Validate with conversations</li>
                <li>• Build simple landing page</li>
                <li>• Acquire first clients</li>
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* AI INPUT */}
      <section className="section section-ai bg-white-section">
        <div className="container">
          <div className="ai-input-wrapper">
            <h2 className="ai-input-title">Tell us about your situation</h2>
            <p className="ai-input-sub">
              This helps our AI understand your time, strengths, constraints, and goals.
            </p>

            <p className="ai-input-hint">
              <span className="ai-dot"></span> AI will analyze your description.
            </p>

            <textarea
              className="ai-textarea"
              placeholder={currentPlaceholder}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />

            <button className="ai-start-btn" onClick={startFlow}>
              Start the 6 questions
            </button>
          </div>
        </div>
      </section>


      {/* WHO IT'S FOR */}
      <section id="who-its-for" className="section bg-gray-section">
        <div className="container">
          <h2 className="section-title">Who NicheRoot is for</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mt-10">
            <div className="card">
              <h3 className="card-title">People who want clarity</h3>
              <p>Perfect if you're overwhelmed by ideas.</p>
            </div>

            <div className="card">
              <h3 className="card-title">People who value time</h3>
              <p>No fluff — just what matters.</p>
            </div>

            <div className="card">
              <h3 className="card-title">People who want a plan</h3>
              <p>Your blueprint is based on real constraints.</p>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <button className="primary-btn" onClick={startFlow}>
              Start the 6-question flow
            </button>
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="py-10 text-center text-sm text-gray-500">
        <p>NicheRoot — Smart business matching</p>
        <p>© {new Date().getFullYear()} NicheRoot. All rights reserved.</p>
      </footer>





      {/* ------------- MODAL UPDATED ------------- */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-6 md:p-10 relative"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
            >

              {/* CLOSE BUTTON */}
              <button
                className={`absolute right-4 top-4 h-9 w-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition ${
                  loadingBlueprint ? "opacity-60 cursor-not-allowed" : ""
                }`}
                onClick={closeWizard}
                disabled={loadingBlueprint}
              >
                ✕
              </button>

              {/* HEADER + PROGRESS */}
              <div className="mb-8">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-600">
                  NicheRoot — Guided Flow
                </p>

                <div className="flex flex-wrap justify-between mt-2">
                  <p className="text-sm text-gray-700">
                    Step {question ? question.step : step} of {MAX_STEPS}
                  </p>
                  <p className="text-xs text-gray-500">
                    Your answers shape a personalized business blueprint.
                  </p>
                </div>

                <div className="mt-4 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {!question ? (
                <div className="py-16 text-center text-gray-500">Loading question…</div>
              ) : (
                <>
                  <h2 className="text-xl md:text-2xl font-semibold mb-2">{question.question}</h2>
                  <p className="text-sm text-gray-600 mb-8">Choose the option that fits your life best.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {question.options.map((opt) => (
                      <OptionCard
                        key={opt.key}
                        option={opt}
                        selected={selectedChoice === opt.key}
                        onSelect={() => setSelectedChoice(opt.key)}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
                      onClick={closeWizard}
                      disabled={loadingBlueprint}
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => selectedChoice && fetchNextQuestion(selectedChoice)}
                      disabled={!selectedChoice || loadingBlueprint}
                      className={`px-6 py-2 rounded-lg text-white text-sm font-medium transition
                        ${
                          !selectedChoice || loadingBlueprint
                            ? "bg-indigo-300 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700"
                        }
                      `}
                    >
                      {loadingBlueprint ? "Generating…" : "Continue"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </main>
  );
}
