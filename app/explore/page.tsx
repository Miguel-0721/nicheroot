"use client";

import { useEffect, useMemo, useState } from "react";
import IdeaDrawer from "@/components/IdeaDrawer";
import UpgradeModal from "@/components/UpgradeModal";

const IS_DEV = process.env.NODE_ENV === "development";

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
  reason?: string; // ✅ required
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
const PREVIEW_VISIBLE_COUNT = 5;


// ==============================
// Regen usage persistence (session only)
// ==============================
const REGEN_STORAGE_KEY = "nicheroot_regen_used";

function loadRegenUsed(): number {
  try {
    const raw = sessionStorage.getItem(REGEN_STORAGE_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

function saveRegenUsed(value: number) {
  try {
    sessionStorage.setItem(REGEN_STORAGE_KEY, String(value));
  } catch {}
}




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

function generateSessionIdeas(): Idea[] {
  const unlocked = MOCK_IDEAS.filter((i) => !i.locked);
  const locked = MOCK_IDEAS.filter((i) => i.locked);

  // Slight shuffle + score variance
  const randomized = unlocked
    .map((idea) => ({
      ...idea,
      score: Math.max(
        50,
        Math.min(95, idea.score + Math.floor(Math.random() * 11 - 5))
      ),
    }))
    .sort(() => Math.random() - 0.5);

  return [...randomized, ...locked];
}



function normalizeIdeas(rawIdeas: any[]): Idea[] {
  return rawIdeas.map((idea, index) => ({
    id: index + 1,
    name: idea.name || idea.title || "Untitled idea",
    category: idea.category || "General",
    difficulty: idea.difficulty || "Medium",
    demand: idea.demand || "Medium",
    score: typeof idea.score === "number" ? idea.score : 60,
    badge:
      typeof idea.score === "number" && idea.score >= 80
        ? "gold"
        : typeof idea.score === "number" && idea.score >= 70
        ? "silver"
        : "bronze",
    reason: typeof idea.reason === "string" ? idea.reason : undefined, // ✅ ADD THIS
    locked: index >= PREVIEW_VISIBLE_COUNT,
  }));
}






export default function ExplorePage() {
  const [chatInput, setChatInput] = useState("");

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [category, setCategory] = useState("All");

  const [difficulty, setDifficulty] = useState("All");
  const [signal, setSignal] = useState("All");
  const [onboardingText, setOnboardingText] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [assistantThinking, setAssistantThinking] = useState(false);

const [assistantMessage, setAssistantMessage] = useState<string | null>(null);



// TEMP: replace later with real auth / subscription check
const isProUser = true;


  
// TEMP: regeneration cap (UI-only)
const REGEN_LIMIT = 20;
const [regenUsed, setRegenUsed] = useState(() => loadRegenUsed());
const regenRemaining = REGEN_LIMIT - regenUsed;
const canRegenerate = isProUser && regenRemaining > 0;




const resetSelection = () => {
  setSelectedIdea(null);
  setAssistantThinking(false);
  setDrawerOpen(false);
};

const triggerAssistantThinking = () => {
  setAssistantThinking(true);
  setTimeout(() => {
    setAssistantThinking(false);
  }, 1200);
};

const handleChatSubmit = () => {
  const input = chatInput.toLowerCase().trim();
  if (!input) return;

  // Block regeneration attempts
  if (input.includes("generate") || input.includes("new ideas")) {
    setAssistantMessage(
  "I can help refine or explain the current ideas. To generate new ideas, use the Regenerate ideas button above."
);

    setChatInput("");
    return;
  }

setAssistantThinking(true);
setAssistantMessage(null);



// 🧠 EXPLANATION REQUESTS (no filtering, no regen)
if (
  input.includes("why") ||
  input.includes("explain") ||
  input.includes("rank") ||
  input.includes("top")
) {
  setAssistantThinking(true);

  setTimeout(() => {
  const topIdea = previewIdeas.find(i => !i.locked);


    if (!topIdea) {
      setAssistantMessage("I don’t have enough data to explain the rankings yet.");
    } else {
      setAssistantMessage(
        `The top idea ranks highest because it balances demand (${topIdea.demand.toLowerCase()}), execution difficulty (${topIdea.difficulty.toLowerCase()}), and your stated constraints. Compared to other options, it can be validated faster with less upfront risk.`
      );
    }

    setAssistantThinking(false);
  }, 800);

  setChatInput("");
  return;
}




// ✅ RESET FILTERS FIRST
setCategory("All");
setDifficulty("All");
setSignal("All");

// ✅ ADD THIS BLOCK (RIGHT HERE)
const didTriggerFilter =
  input.includes("saas") ||
  input.includes("content") ||
  input.includes("services") ||
  input.includes("education") ||
  input.includes("marketing") ||
  input.includes("low") ||
  input.includes("medium") ||
  input.includes("high") ||
  input.includes("hard") ||
  input.includes("gold") ||
  input.includes("silver") ||
  input.includes("bronze");

if (!didTriggerFilter) {
  setTimeout(() => {
    setAssistantThinking(false);
  }, 600);
  setChatInput("");
  return;
}






  // CATEGORY
  if (input.includes("saas")) setCategory("SaaS");
  if (input.includes("content")) setCategory("Content");
  if (input.includes("services")) setCategory("Services");
  if (input.includes("education")) setCategory("Education");
  if (input.includes("marketing")) setCategory("Marketing");

  // DIFFICULTY
  if (input.includes("low")) setDifficulty("Low");
  if (input.includes("medium")) setDifficulty("Medium");
  if (input.includes("high") || input.includes("hard")) setDifficulty("High");

  // SIGNAL
  if (input.includes("gold")) setSignal("Gold");
  if (input.includes("silver")) setSignal("Silver");
  if (input.includes("bronze")) setSignal("Bronze");

 setTimeout(() => {
  setAssistantThinking(false);
  setChatInput("");
}, 600);

};


useEffect(() => {
  // 1️⃣ Read onboarding context FIRST
  try {
    const raw = localStorage.getItem("nicheroot_v2_onboarding");
    if (raw) {
      const parsed = JSON.parse(raw) as OnboardingPayload;
      if (parsed?.onboardingText) {
        setOnboardingText(parsed.onboardingText);
      }
    }
  } catch {}

  // 2️⃣ Try API-generated ideas
  try {
  const raw = sessionStorage.getItem("nicheroot_ideas_v2");
if (raw) {
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed?.ideas) && parsed.ideas.length > 0) {
    const normalized = normalizeIdeas(parsed.ideas);
    setIdeas(normalized);
    setIsLoaded(true);
    return;
  }
}

  } catch {}

// 3️⃣ No API ideas
if (IS_DEV) {
  const generated = generateSessionIdeas();

  setIdeas(
    generated.map((idea, index) => ({
      ...idea,
      locked: index >= PREVIEW_VISIBLE_COUNT,
    }))
  );
} else {
  setIdeas([]);
}

setIsLoaded(true);




  // 4️⃣ Restore selected idea
  const storedIdea = sessionStorage.getItem("nicheroot_selected_idea");
  if (storedIdea) {
    const parsedIdea = JSON.parse(storedIdea) as Idea;
    setSelectedIdea(parsedIdea);
    setDrawerOpen(true);
    setAssistantThinking(false);
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

// We render all ideas, but visually lock anything after PREVIEW_VISIBLE_COUNT
const previewIdeas = filteredIdeas;




const assistantIntro = onboardingText
  ? `These ideas are ranked based on your time, budget, and goals. You can refine or compare them below.`
  : `These ideas are ranked to help you explore options. You can refine or compare them at any time.`;


const visibleIdeasCount = Math.min(
  ideas.filter((i) => !i.locked).length,
  PREVIEW_VISIBLE_COUNT
);


const totalIdeasCount = ideas.length;

const showLockedPreview = true;
if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Explore business ideas
          </h1>
         <p className="mt-1 text-sm text-gray-600">
  Ranked ideas based on your situation, demand, and execution reality.
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



{assistantMessage && !assistantThinking && (
  <div className="rounded-lg bg-white p-3 text-xs text-gray-700">
    <div className="mb-1 font-semibold text-gray-900">
      Explanation
    </div>
    <p>{assistantMessage}</p>
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

<p className="mt-3 text-xs text-gray-500">
  Use the assistant to refine or explain these ideas.
  <br />
  To explore a completely different direction, use{" "}
  <span className="font-medium text-gray-700">Regenerate ideas</span>.
</p>



            </div>


<input
  value={chatInput}
  onChange={(e) => {
    if (!isProUser) return;
    setChatInput(e.target.value);
  }}
  onKeyDown={(e) => {
    if (!isProUser) {
      if (e.key === "Enter") {
        setUpgradeOpen(true);
      }
      return;
    }

    if (e.key === "Enter") {
      handleChatSubmit();
    }
  }}
  disabled={!isProUser}
  placeholder={
    isProUser
      ? "e.g. only SaaS · lower effort · explain top idea"
      : "Upgrade to refine rankings with the assistant"
  }
  className={`mt-4 w-full rounded-xl border px-3 py-2 text-sm ${
    isProUser
      ? "border-gray-200 bg-white text-gray-700"
      : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
  }`}
/>
{!isProUser && (
  <p className="mt-2 text-xs text-gray-500">
    🔒 Assistant refinement is a Pro feature.
    <button
      onClick={() => setUpgradeOpen(true)}
      className="ml-1 font-medium text-indigo-600 hover:underline"
    >
      Upgrade to unlock
    </button>
  </p>
)}



          </aside>

          {/* RIGHT: Table */}
          <section
  className={`rounded-2xl border border-gray-200 bg-white shadow-sm transition-opacity ${
    assistantThinking ? "opacity-60" : "opacity-100"
  }`}
>


<div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
  <div className="text-xs text-gray-500">
    🧠 Generated for you this session
  </div>

<button
  disabled={assistantThinking || !canRegenerate}
  onClick={async () => {
    if (!isProUser) {
      setUpgradeOpen(true);
      return;
    }

    if (regenRemaining <= 0) {
      setUpgradeOpen(true);
      return;
    }

    setAssistantThinking(true);

    const raw = localStorage.getItem("nicheroot_v2_onboarding");
    if (!raw) {
      setAssistantThinking(false);
      alert("Missing onboarding context. Please restart.");
      return;
    }

    const { onboardingText } = JSON.parse(raw);
    if (!onboardingText?.trim()) {
      setAssistantThinking(false);
      alert("Please provide your context first.");
      return;
    }

    try {
      const res = await fetch("/api/generate-ideas-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: onboardingText }),
      });

      const data = await res.json();

      sessionStorage.setItem(
        "nicheroot_ideas_v2",
        JSON.stringify(data)
      );

    const normalized = normalizeIdeas(data.ideas);
setIdeas(normalized);
setAssistantMessage(null);
setSelectedIdea(null);
setDrawerOpen(false);


      // ✅ INCREMENT USAGE
      setRegenUsed((prev) => {
  const next = prev + 1;
  saveRegenUsed(next);
  return next;
});

    } catch {
      alert("Failed to regenerate ideas");
    } finally {
      setAssistantThinking(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }}
  className={`text-xs font-medium ${
    assistantThinking || !canRegenerate
      ? "text-gray-400 cursor-not-allowed"
      : "text-indigo-600 hover:underline"
  }`}
>
  {assistantThinking
    ? "Regenerating ideas…"
    : !isProUser
    ? "Upgrade to regenerate"
    : regenRemaining <= 0
    ? "Regeneration limit reached"
    : "Regenerate ideas"}
</button>

{isProUser && (
  <div className="mt-1 text-[11px] text-gray-500">
    Uses {regenUsed} of {REGEN_LIMIT} regenerations this month
  </div>
)}

{isProUser && regenRemaining <= 0 && (
  <div className="mt-1 text-[11px] text-red-500">
    You’ve reached your monthly limit. Upgrade to increase it.
  </div>
)}


</div>


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

<div className="flex flex-wrap gap-2 px-4 py-3 text-xs text-gray-600">
  <span className="flex items-center gap-1">
    <span className="h-2 w-2 rounded-full bg-amber-400" /> Gold = strongest fit
  </span>
  <span className="flex items-center gap-1">
    <span className="h-2 w-2 rounded-full bg-gray-400" /> Silver = solid option
  </span>
  <span className="flex items-center gap-1">
    <span className="h-2 w-2 rounded-full bg-orange-400" /> Bronze = niche / longer-term
  </span>
</div>


{showLockedPreview && (
  <div className="px-4 py-6 text-center text-sm text-gray-400 italic">
    You’re seeing the top matches — unlock to view full details and rankings.

  </div>
)}




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
{previewIdeas.map((idea, index) => {
const isBlurred = idea.locked;




  return (
    <tr
      key={idea.id}
      tabIndex={isBlurred ? -1 : 0}
      onClick={() => {
        if (drawerOpen || isBlurred) {
          if (isBlurred) setUpgradeOpen(true);
          return;
        }

        triggerAssistantThinking();
        setSelectedIdea(idea);
        setDrawerOpen(true);

        sessionStorage.setItem(
          "nicheroot_selected_idea",
          JSON.stringify(idea)
        );
      }}
      onKeyDown={(e) => {
        if (drawerOpen || isBlurred) return;

        if (e.key === "Enter") {
          triggerAssistantThinking();
          setSelectedIdea(idea);
          setDrawerOpen(true);
        }
      }}
      className={`relative group border-t border-gray-100 focus:outline-none ${
isBlurred
  ? "cursor-pointer select-none opacity-40 hover:opacity-50"
  : "cursor-pointer hover:bg-gray-50"



      } ${
        !isBlurred && idea.badge === "gold"
          ? "bg-gradient-to-r from-amber-50 to-white"
          : ""
      } ${
        selectedIdea?.id === idea.id && !isBlurred
          ? "bg-indigo-50 ring-1 ring-indigo-200"
          : ""
      }`}
    >




     <td className="relative px-4 py-3 font-medium text-gray-900">
{isBlurred && (
  <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-sm">
    <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
      🔒 Unlock to view
    </span>
  </div>
)}


  {index === 0 && !isBlurred && (
    <span className="mr-2 inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
      #1 Best match
    </span>
  )}

{/* 1️⃣ Idea name FIRST */}
{!isBlurred && (
  <div className="font-medium text-gray-900">
    {idea.name}
  </div>
)}

{/* 2️⃣ Reason UNDER the idea name (top 3 only) */}
{!isBlurred && index < 3 && idea.reason && (
  <div className="mt-2 text-xs text-gray-600">
    <div className="font-medium text-gray-700">Why this fits you</div>
    <ul className="mt-1 list-disc pl-4 space-y-0.5">
      {idea.reason.split("•").map((r, i) =>
        r.trim() ? <li key={i}>{r.trim()}</li> : null
      )}
    </ul>
  </div>
)}



</td>

<td className="px-4 py-3 text-gray-600">{idea.category}</td>

<td className="px-4 py-3 text-gray-600">{idea.difficulty}</td>

<td className="px-4 py-3 text-gray-600">{idea.demand}</td>

<td className="px-4 py-3 font-medium text-gray-900">
  {isBlurred ? "—" : idea.score}
</td>

<td className="px-4 py-3">
  {!isBlurred && (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyles[idea.badge]}`}
    >
      {idea.badge}
    </span>
  )}

  {index === 0 && !isBlurred && (
    <div className="mt-1 text-[11px] text-gray-500">
      Best balance of demand, risk, and execution speed
    </div>
  )}
</td>


    </tr>
  );
})}

  {/* ✅ EMPTY STATE — ADD THIS */}
  {previewIdeas.length === 0 && (

    <tr>
      <td
        colSpan={6}
        className="px-4 py-6 text-center text-sm text-gray-500"
      >
        No ideas match your filters. Try adjusting them.
      </td>
    </tr>
  )}
</tbody>

              </table>

<div className="text-xs text-gray-500 text-center">
  Showing{" "}
  <span className="font-medium text-gray-700">
    top matches
  </span>{" "}
  · unlock deeper comparisons with Pro
</div>



  <button
    disabled={assistantThinking}
    onClick={() => {
      setAssistantThinking(true);

      setTimeout(() => {
        setUpgradeOpen(true);
        setAssistantThinking(false);
      }, 400);
    }}
    className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
      assistantThinking
        ? "bg-gray-400 cursor-not-allowed text-white"
        : "bg-gray-900 text-white hover:bg-gray-800"
    }`}
  >
    {assistantThinking
      ? "Analyzing more ideas…"
      : "Unlock deeper analysis & full rankings"}
  </button>

  <p className="text-center text-[11px] text-gray-400">
    Includes deeper analysis, rankings, and full idea breakdowns
  </p>
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
        onClose={() => {
  setDrawerOpen(false);
  setSelectedIdea(null);
  sessionStorage.removeItem("nicheroot_selected_idea");
}}

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
