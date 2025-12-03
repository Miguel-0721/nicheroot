"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [illustrationLoaded, setIllustrationLoaded] = useState(false);

  return (
    <main className="min-h-screen bg-[var(--background)] text-gray-900">
      {/* NAVBAR */}
      <header className="premium-header">
        <div className="nav-container">
          <div className="nav-logo">NicheRoot</div>

          <nav className="nav-links">
            <a href="#why" className="nav-link">
              Why it works
            </a>
            <a href="#how" className="nav-link">
              How it works
            </a>
            <a href="#who-its-for" className="nav-link">
              Who it's for
            </a>
          </nav>

          {/* Redirect to /start */}
          <button
            className="nav-btn"
            onClick={() => (window.location.href = "/start")}
          >
            Start questions
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-white-section pt-24 pb-20">
        <div className="container flex flex-col lg:flex-row items-center gap-14">
          <div className="flex-1 max-w-xl">
            <p className="badge">
              Smart business matching for real-world constraints
            </p>

            <h1 className="hero-title">
              Find the business that{" "}
              <span style={{ color: "var(--brand-500)" }}>fits your life.</span>
            </h1>

            <p className="hero-sub">
              NicheRoot analyzes your time, money, strengths, goals, and
              personality — then generates a personalized business direction.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <button
                className="primary-btn"
                onClick={() => (window.location.href = "/start")}
              >
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
              onLoad={() => setIllustrationLoaded(true)}
            />
          </div>
        </div>
      </section>

      {/* WHY SECTION */}
      <section id="why" className="section bg-gray-section">
        <div className="container">
          <h2 className="section-title">Why NicheRoot works</h2>
          <p className="section-sub">
            Most people fail because they pick a business that doesn’t fit their
            life. NicheRoot fixes that with smart guided questions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mt-10">
            <div className="card">
              <div className="icon">➕</div>
              <h3 className="card-title">Built for real constraints</h3>
              <p>Your time, money, personality, and energy are inputs.</p>
            </div>

            <div className="card">
              <div className="icon">🔍</div>
              <h3 className="card-title">Smart decision engine</h3>
              <p>6 guided A/B questions reveal your ideal direction.</p>
            </div>

            <div className="card">
              <div className="icon">✔️</div>
              <h3 className="card-title">Actionable blueprint</h3>
              <p>Your niche, tools, and next steps tailored to your life.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW SECTION */}
      <section id="how" className="section bg-white-section">
        <div className="container">
          <h2 className="section-title">How NicheRoot works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mt-10">
            <div className="card">
              <p className="text-xs font-semibold text-[var(--brand-500)] mb-1">
                STEP 1
              </p>
              <h3 className="card-title">Describe your reality</h3>
              <p>Your time, money, personality, and goals.</p>
            </div>

            <div className="card">
              <p className="text-xs font-semibold text-[var(--brand-500)] mb-1">
                STEP 2
              </p>
              <h3 className="card-title">Answer 6 trade-off questions</h3>
              <p>Reveal your best direction without overload.</p>
            </div>

            <div className="card">
              <p className="text-xs font-semibold text-[var(--brand-500)] mb-1">
                STEP 3
              </p>
              <h3 className="card-title">Receive your blueprint</h3>
              <p>Your niche, tools, and next steps — tailored to your life.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BLUEPRINT PREVIEW */}
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
                Your blueprint adapts to your life — not random idea lists.
              </p>
            </div>

            <div className="blueprint-card">
              <p className="text-xs uppercase tracking-wide text-indigo-200">
                Example snapshot
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                Low-ticket, high-volume digital service
              </h3>
              <p className="mt-2 text-sm text-indigo-100">
                Ideal for someone wanting flexibility, low risk, and
                independence.
              </p>

              <h4 className="mt-6 text-sm font-semibold">Monetization</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Monthly retainers</li>
                <li>• Packaged services</li>
                <li>• Upsell add-ons</li>
              </ul>

              <h4 className="mt-6 text-sm font-semibold">First 30 Days</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Define your offer</li>
                <li>• Validate with conversations</li>
                <li>• Build landing page</li>
                <li>• Acquire first clients</li>
              </ul>
            </div>
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
              <p>Your blueprint adapts to your real constraints.</p>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <button
              className="primary-btn"
              onClick={() => (window.location.href = "/start")}
            >
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
    </main>
  );
}
