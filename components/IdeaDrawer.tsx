"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlueprintIdea } from "@/types/idea";

type Props = {
  idea: BlueprintIdea | null;
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
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md rounded-l-2xl bg-white shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="px-6 pt-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {idea.name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {idea.category} • {idea.difficulty}
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="rounded-full px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                    aria-label="Close"
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
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-6 scroll-smooth">
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

                {/* Confidence explanation */}
                <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                    Why this idea ranks high for you
                  </div>

                  <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                    <li>Matches your available time and energy level</li>
                    <li>Requires skills you can realistically develop</li>
                    <li>Shows demand without extreme competition</li>
                    <li>Allows fast validation before committing fully</li>
                  </ul>
                </div>

                {/* Personal fit */}
                {userContext && (
                  <div className="mt-5 rounded-xl bg-indigo-50 p-4 text-sm text-gray-800">
                    <div className="mb-2 font-semibold text-indigo-700">
                      Why this fits your situation
                    </div>

                    <div className="rounded-lg bg-white/70 p-3 text-xs text-gray-700">
                      <div className="mb-1 font-semibold text-gray-900">
                        Your context
                      </div>

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

                {/* Blueprint value preview */}
                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-900">
                    What you’ll get in the full blueprint
                  </h4>

                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• Clear execution roadmap (step by step)</li>
                    <li>• Monetization & pricing strategy</li>
                    <li>• Validation plan to avoid wasted effort</li>
                    <li>• Tools, stack, and first actions</li>
                  </ul>

                  <p className="mt-3 text-xs text-gray-500">
                    Generated specifically for this idea and your situation.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t bg-white p-6 space-y-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.08)]">
                {idea.locked ? (
                  <button
                    onClick={() => {
                      // Explore page listens & opens UpgradeModal
                      window.dispatchEvent(new Event("nicheroot:open-upgrade"));
                    }}
                    className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition"
                  >
                    Unlock full blueprint
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        sessionStorage.setItem(
                          "nicheroot_active_idea",
                          JSON.stringify(idea)
                        );

                        if (userContext) {
                          sessionStorage.setItem(
                            "nicheroot_user_context",
                            userContext
                          );
                        }

                        window.location.href = "/blueprint-v2";
                      }}
                      className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition"
                    >
                      Generate full blueprint
                    </button>

                    <button className="w-full rounded-xl border px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
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
