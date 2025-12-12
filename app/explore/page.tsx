"use client";

import { useEffect, useMemo, useState } from "react";
import IdeaDrawer from "@/components/IdeaDrawer";
import UpgradeModal from "@/components/UpgradeModal";


type Badge = "gold" | "silver" | "bronze" | "grey";

type Idea = {
  id: number;
  name: string;
  category: string;
  difficulty: string;
  demand: string;
  score: number;
  badge: Badge;
  locked?: boolean;
};

type OnboardingPayload = {
  onboardingText: string;
  createdAt: number;
};

const badgeStyles: Record<Badge, string> = {
  gold: "bg-amber-100 text-amber-800",
  silver: "bg-gray-100 text-gray-700",
  bronze: "bg-orange-100 text-orange-800",
  grey: "bg-gray-100 text-gray-400",
};

const MOCK_IDEAS: Idea[] = [
  {
    id: 1,
    name: "Freelance Coding Bootcamp",
    category: "Education",
    difficulty: "Medium",
    demand: "High",
    score: 82,
    badge: "gold",
  },
  {
    id: 2,
    name: "Virtual Event Planning Service",
    category: "Services",
    difficulty: "Low",
    demand: "Medium",
    score: 71,
    badge: "silver",
  },
  {
    id: 3,
    name: "Health Food Newsletter",
    category: "Content",
    difficulty: "Low",
    demand: "Medium",
    score: 68,
    badge: "bronze",
  },
  {
    id: 4,
    name: "Digital Marketing Agency",
    category: "Marketing",
    difficulty: "High",
    demand: "High",
    score: 79,
    badge: "gold",
  },
  {
    id: 5,
    name: "AI Resume Optimization Tool",
    category: "SaaS",
    difficulty: "High",
    demand: "High",
    score: 85,
    badge: "gold",
  },
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: i + 6,
    name: "Premium business idea",
    category: "—",
    difficulty: "—",
    demand: "—",
    score: 0,
    badge: "grey" as Badge,
    locked: true,
  })),
];

export default function ExplorePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [signal, setSignal] = useState("All");
  const [onboardingText, setOnboardingText] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [assistantThinking, setAssistantThinking] = useState(false);

const resetSelection = () => {
  setSelectedIdea(null);
  setAssistantThinking(false);
  setDrawerOpen(false);
};



  useEffect(() => {
    setIdeas(MOCK_IDEAS);

    // Read onboarding context from localStorage
    try {
      const raw = localStorage.getItem("nicheroot_v2_onboarding");
      if (raw) {
        const parsed = JSON.parse(raw) as OnboardingPayload;
        if (parsed?.onboardingText) {
          setOnboardingText(parsed.onboardingText);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      if (idea.locked) return true;

      if (category !== "All" && idea.category !== category) return false;
      if (difficulty !== "All" && idea.difficulty !== difficulty) return false;
      if (signal !== "All" && idea.badge !== signal.toLowerCase())
        return false;

      return true;
    });
  }, [ideas, category, difficulty, signal]);

  const assistantIntro = onboardingText
    ? `Based on what you shared, I focused on ideas that align with your time, budget, and goals.`
    : `You can start by exploring the ideas below. Add more context anytime to refine results.`;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Explore business ideas
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Ranked ideas based on fit, demand, and execution difficulty.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* LEFT: Assistant */}
          <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-gray-900">
              Assistant
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="rounded-xl bg-gray-100 p-3 space-y-2">
  <p>{assistantIntro}</p>

{assistantThinking && (
  <div className="rounded-lg bg-white p-3 text-xs text-gray-500 italic">
    Analyzing fit based on your context…
  </div>
)}

{!assistantThinking && selectedIdea && !selectedIdea.locked && (
  <div className="rounded-lg bg-white p-3 text-xs text-gray-700">
    <div className="mb-1 font-semibold text-gray-900">
      Why this idea stands out
    </div>

    <ul className="list-disc pl-4 space-y-1">
      <li>
        Strong demand with{" "}
        <span className="font-medium">
          {selectedIdea.difficulty.toLowerCase()}
        </span>{" "}
        execution difficulty
      </li>
      <li>Fits your available time and budget constraints</li>
      <li>Clear path to validation within weeks, not months</li>
    </ul>

    {/* NEW BUTTON */}
    <button
      onClick={resetSelection}
      className="mt-2 text-xs font-medium text-indigo-600 hover:underline"
    >
      Compare with another idea
    </button>
  </div>
)}


</div>


              {onboardingText && (
                <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-600">
                  <div className="mb-1 font-semibold text-gray-800">
                    Your context
                  </div>
                  <div className="line-clamp-5">{onboardingText}</div>
                </div>
              )}
            </div>

            <input
              disabled
              placeholder="Chat coming soon…"
              className="mt-4 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </aside>

          {/* RIGHT: Table */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 border-b border-gray-100 px-4 py-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
              >
                <option>All</option>
                <option>Education</option>
                <option>Services</option>
                <option>Content</option>
                <option>Marketing</option>
                <option>SaaS</option>
              </select>

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
              >
                <option>All</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>

              <select
                value={signal}
                onChange={(e) => setSignal(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
              >
                <option>All</option>
                <option>Gold</option>
                <option>Silver</option>
                <option>Bronze</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Idea</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Difficulty</th>
                    <th className="px-4 py-3 text-left">Demand</th>
                    <th className="px-4 py-3 text-left">Score</th>
                    <th className="px-4 py-3 text-left">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIdeas.map((idea) => (
       <tr
  key={idea.id}
  tabIndex={idea.locked ? -1 : 0}
onClick={() => {

if (drawerOpen) return;


 if (idea.locked) {
  setDrawerOpen(false);      // 👈 close drawer if open
  setSelectedIdea(null);     // 👈 clear context
  setUpgradeOpen(true);
  return;
}

  setAssistantThinking(true);
  setSelectedIdea(idea);
  setDrawerOpen(true);

  setTimeout(() => {
    setAssistantThinking(false);
  }, 400);
}}


 onKeyDown={(e) => {

if (drawerOpen) return;

  if (idea.locked && e.key === "Enter") {
    setUpgradeOpen(true);
    return;
  }

  if (!idea.locked && e.key === "Enter") {
    setAssistantThinking(true);
    setSelectedIdea(idea);
    setDrawerOpen(true);

    setTimeout(() => {
      setAssistantThinking(false);
    }, 400);
  }
}}


  className={`relative group border-t border-gray-100 hover:bg-gray-50 focus:outline-none focus:bg-indigo-50 ${

    idea.locked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
  }`}
>


                      <td className="px-4 py-3 font-medium text-gray-900">
                        {idea.locked ? (
                          <div className="h-4 w-40 rounded bg-gray-200 blur-sm" />
                        ) : (
                          idea.name
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {idea.locked ? "—" : idea.category}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {idea.locked ? "—" : idea.difficulty}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {idea.locked ? "—" : idea.demand}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {idea.locked ? "—" : idea.score}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            badgeStyles[idea.badge]
                          }`}
                        >
                          {idea.locked
                            ? "Locked"
                            : idea.badge.charAt(0).toUpperCase() +
                              idea.badge.slice(1)}
                        </span>
                      </td>
{idea.locked && (
  <div className="pointer-events-none absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
    This idea requires deeper analysis.
    <div className="mt-1 text-[11px] text-gray-300">
      Unlock Pro to see full details.
    </div>
  </div>
)}



                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-100 px-4 py-4">
             <button
  onClick={() => setUpgradeOpen(true)}
  className="w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
>
  Unlock all 100 ideas
</button>

            </div>
          </section>
        </div>
      </div>

 <IdeaDrawer
        idea={
          selectedIdea
            ? {
                id: String(selectedIdea.id),
                name: selectedIdea.name,
                category: selectedIdea.category,
                difficulty: selectedIdea.difficulty,
                demand: selectedIdea.demand,
                score: selectedIdea.score,
                signal:
                  selectedIdea.badge === "gold"
                    ? "Gold"
                    : selectedIdea.badge === "silver"
                    ? "Silver"
                    : "Bronze",
                locked: selectedIdea.locked,
              }
            : null
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userContext={onboardingText}
      />

<UpgradeModal
  open={upgradeOpen}
  onClose={() => {
    setUpgradeOpen(false);
    setAssistantThinking(false);
    setSelectedIdea(null);
    setDrawerOpen(false);
  }}
/>



    </main>
  );
}
