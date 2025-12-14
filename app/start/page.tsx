"use client";

import { useMemo, useState, useEffect } from "react";

import { useRouter } from "next/navigation";

const EXAMPLES = [
  "I want an online business I can start with under €500. I can do 5–8 hours per week. I’m open to learning new skills.",
  "I want a scalable digital business that could reach €5k/month within a year. I prefer online tools or services.",
  "I want something low-risk and simple. I have basic tech skills and enjoy research, writing, and problem-solving.",
];

export default function StartPage() {
  const router = useRouter();
  const [text, setText] = useState("");
const [loading, setLoading] = useState(false);



  const charCount = text.length;
  const canContinue = useMemo(() => text.trim().length >= 30, [text]);

  function onUseExample(example: string) {
    setText(example);
  }

async function onContinue() {
  const trimmed = text.trim();
  if (trimmed.length < 30) return;

  setLoading(true); // ✅ ADD THIS

  try {
    const res = await fetch("/api/generate-ideas-v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userInput: trimmed,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to generate ideas");
    }

    const ideas = await res.json();

    sessionStorage.setItem(
      "nicheroot_ideas_v2",
      JSON.stringify(ideas)
    );

    localStorage.setItem(
      "nicheroot_v2_onboarding",
      JSON.stringify({
        onboardingText: trimmed,
        createdAt: Date.now(),
      })
    );

    router.push("/explore");
  } catch (err) {
    console.error("Explore error:", err);
    alert("Something went wrong generating ideas.");
    setLoading(false); // ✅ ADD THIS
  }
}




  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            NicheRoot v2 • Business Idea Explorer
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Tell me what you’re looking for
          </h1>

          <p className="mt-3 text-base leading-7 text-gray-600">
            Describe your goals, budget, skills, and time. I’ll generate{" "}
            <span className="font-medium text-gray-900">
              100 business ideas
            </span>{" "}
            and help you narrow down the best ones.
          </p>
        </div>

        {/* Input box */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Your situation
          </label>

         <textarea
  value={text}
  onChange={(e) => setText(e.target.value)}
  disabled={loading} // ✅ ADD THIS
  placeholder="Example: I want an online business with low startup costs..."
  className={`h-40 w-full resize-none rounded-xl border px-4 py-3 text-[15px] leading-6 outline-none
    ${loading
      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
      : "bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-300 border-gray-200"
    }`}
 />


          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-gray-500">
              {charCount} characters •{" "}
              <span className={canContinue ? "text-emerald-600" : ""}>
                minimum 30 recommended
              </span>
            </div>

           <button
  onClick={onContinue}
  disabled={!canContinue || loading}
  className={`rounded-xl px-4 py-2 text-sm font-semibold transition
    ${
      loading
        ? "bg-gray-400 cursor-not-allowed text-white"
        : canContinue
        ? "bg-gray-900 text-white hover:bg-gray-800"
        : "cursor-not-allowed bg-gray-200 text-gray-500"
    }`}
>
  {loading ? "Generating ideas…" : "Explore ideas →"}
</button>

          </div>
        </div>

        {/* Examples */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-900">
            Need inspiration?
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Click an example to autofill, then edit it.
          </p>

          <div className="mt-3 grid gap-3">
            {EXAMPLES.map((example, i) => (
              <button
                key={i}
                onClick={() => onUseExample(example)}
                className="rounded-2xl border border-gray-200 bg-white p-4 text-left text-sm text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
              >
                {example}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <span className="font-semibold">Tip:</span> The more specific you are
            about budget, time, and skills, the better your results.
          </div>
        </div>
      </div>
    </main>
  );
}
