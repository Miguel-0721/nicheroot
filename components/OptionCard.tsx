"use client";

import React, { useState, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Option } from "@/types/question-types";

interface Props {
  option: Option;
  selected: boolean;
  onSelect: () => void;
}

export default function OptionCard({ option, selected, onSelect }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const handleCardClick = () => {
    onSelect();
  };

  const handleToggleDetails = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent selecting card when pressing Details
    setShowDetails((prev) => !prev);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`
        w-full
        cursor-pointer rounded-2xl border bg-white p-5
        transition-all duration-200 
        shadow-sm flex flex-col

        ${selected
          ? "border-indigo-500 ring-1 ring-indigo-200 bg-indigo-50/30 shadow-md"
          : "border-gray-300 hover:border-indigo-300 hover:shadow-md"}
      `}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
            {option.key === "A" ? "Option A" : "Option B"}
          </p>

          <p className="text-sm font-semibold text-gray-900 leading-snug">
            {option.summary}
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleDetails}
          className="text-xs font-medium text-indigo-500 hover:text-indigo-600"
        >
          {showDetails ? "Hide" : "Details"}
        </button>
      </div>

      {/* DETAILS */}
      <AnimatePresence initial={false}>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="mt-3 overflow-hidden"
          >
            <div className="space-y-4 text-[0.82rem] text-gray-700 leading-relaxed">

              {/* Pros */}
              <div>
                <p className="font-semibold text-gray-900 mb-1">Pros</p>
                <ul className="list-disc pl-4 space-y-1">
                  {option.pros.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <p className="font-semibold text-gray-900 mb-1">Cons</p>
                <ul className="list-disc pl-4 space-y-1">
                  {option.cons.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <p className="italic text-[0.75rem] text-gray-500">
                Example: {option.example}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
