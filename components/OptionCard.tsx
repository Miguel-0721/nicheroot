"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Option } from "@/types/question-types";

interface Props {
  option: Option;
  selected: boolean;
  onSelect: () => void;
}

export default function OptionCard({ option, selected, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);

  const toggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
    if (!selected) onSelect();
  };

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -2 }}
      className={`w-full text-left rounded-2xl border bg-white/90 shadow-sm transition
        ${
          selected
            ? "border-[var(--brand-500)] shadow-[0_18px_45px_rgba(88,80,236,0.22)] ring-1 ring-[var(--brand-500)]"
            : "border-gray-200 hover:border-[var(--brand-400)] hover:shadow-md"
        }`}
    >
      <div className="flex flex-col gap-3 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-6 items-center rounded-full bg-indigo-50 px-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--brand-500)]">
            Option {option.key}
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 sm:text-base">
              {option.label}
            </p>
            <p className="mt-1 text-sm text-gray-600">{option.summary}</p>
          </div>
          <div className="ml-3 mt-1 flex h-6 w-6 items-center justify-center">
            <span
              className={`inline-flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                selected ? "border-[var(--brand-500)]" : "border-gray-300"
              }`}
            >
              {selected && (
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-500)]" />
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={toggleDetails}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand-500)] hover:text-[var(--brand-400)]"
          >
            <span>{expanded ? "Hide details" : "View details"}</span>
            <span className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
              ⌄
            </span>
          </button>
          <p className="text-[11px] text-gray-400">
            {selected ? "Selected" : "Tap to select"}
          </p>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100 bg-indigo-50/40 px-5 py-4 sm:px-6 sm:py-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">
                  Why this might fit you
                </div>
                <p className="text-sm text-gray-700">
                  {option.details.whyThisFits}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-500">
                    Pros
                  </p>
                  <ul className="mt-1 space-y-1 text-sm text-gray-700">
                    {option.details.pros.map((p, idx) => (
                      <li key={idx}>• {p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-500">
                    Cons
                  </p>
                  <ul className="mt-1 space-y-1 text-sm text-gray-700">
                    {option.details.cons.map((c, idx) => (
                      <li key={idx}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {option.details.example && (
              <div className="mt-4 rounded-xl bg-white/80 p-3 text-sm text-gray-700">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">
                  Example scenario
                </p>
                <p className="mt-1">{option.details.example}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
