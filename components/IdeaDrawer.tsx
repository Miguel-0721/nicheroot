"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Idea = {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  demand: string;
  score?: number;
  signal?: "Gold" | "Silver" | "Bronze";
  locked?: boolean;
};

type Props = {
  idea: Idea | null;
  open: boolean;
  onClose: () => void;
  userContext?: string | null;
};


export default function IdeaDrawer({ idea, open, onClose, userContext }: Props) {
  const [showFullContext, setShowFullContext] = useState(false);

  if (!idea) return null;


  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
          >
            <div className="flex h-full flex-col p-6">
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{idea.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {idea.category} • {idea.difficulty}
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-full px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              {/* Signal */}
              {idea.signal && (
                <div className="mb-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      idea.signal === "Gold"
                        ? "bg-yellow-100 text-yellow-700"
                        : idea.signal === "Silver"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {idea.signal} potential
                  </span>
                </div>
              )}

              {/* Overview */}
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  This idea aligns with your time and budget constraints and
                  offers a realistic path to validation.
                </p>

                <ul className="list-disc pl-5">
                  <li>Clear demand in a defined niche</li>
                  <li>Monetizable without large upfront costs</li>
                  <li>Can be started part-time</li>
                </ul>
              </div>

{/* Personal fit */}
{userContext && (
  <div className="mt-5 rounded-xl bg-indigo-50 p-4 text-sm text-gray-800">
    <div className="mb-2 font-semibold text-indigo-700">
      Why this fits your situation
    </div>

    <div className="rounded-lg bg-white/70 p-3 text-xs text-gray-700">
      <div className="mb-1 font-semibold text-gray-900">Your context</div>
      <div
  className={`text-xs text-gray-700 ${
    showFullContext ? "" : "line-clamp-4"
  }`}
>
  {userContext}
</div>

<button
  onClick={() => setShowFullContext((v) => !v)}
  className="mt-2 text-xs font-medium text-indigo-600 hover:underline"
>
  {showFullContext ? "Hide full context" : "View full context"}
</button>

    </div>

    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
      <li>Works well if you’re starting part-time and want low overhead.</li>
      <li>Lets you validate demand before committing serious money.</li>
      <li>Gives you a clear first week plan (offer + outreach).</li>
    </ul>
  </div>
)}


              {/* Spacer */}
              <div className="flex-1" />

              {/* Actions */}
              <div className="space-y-3">
                {idea.locked ? (
                  <button className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white">
                    Unlock to view full blueprint
                  </button>
                ) : (
                  <>
                    <button className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
                      Generate full blueprint
                    </button>
                    <button className="w-full rounded-xl border px-4 py-3 text-sm font-medium">
                      Save idea
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
