"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Option } from "@/types/question-types";

interface Props {
  option: Option;
  selected: boolean;
  onSelect: () => void;
}

export default function OptionCard({ option, selected, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className={`
        relative cursor-pointer rounded-2xl border transition-all p-6
        bg-white shadow-sm hover:shadow-md
        ${selected ? "border-indigo-500 shadow-lg shadow-indigo-100" : "border-gray-200"}
      `}
      whileHover={{ y: -2 }}
      onClick={onSelect}
    >
      {/* Header Row */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs font-semibold text-gray-500 tracking-wide">
          OPTION {option.key}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="text-indigo-500 text-xs hover:underline font-medium"
        >
          {expanded ? "Hide" : "Details"}
        </button>
      </div>

      {/* Title */}
      <h3 className="text-[17px] font-semibold text-gray-900 leading-snug mb-1">
        {option.label}
      </h3>

      {/* Summary */}
      <p className="text-gray-600 text-sm">
        {option.summary}
      </p>

      {/* EXPANDED DETAILS */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-5 rounded-xl bg-gray-50 p-4"
          >
            {/* Pros */}
            <div className="mb-4">
              <span className="text-green-600 text-xs font-semibold mb-2 block">Pros</span>

              <ul className="space-y-1">
                {option.details.pros.map((p: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 mt-[3px]">✔</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="mb-3">
              <span className="text-red-600 text-xs font-semibold mb-2 block">Cons</span>

              <ul className="space-y-1">
                {option.details.cons.map((c: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-500 mt-[3px]">✖</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Example */}
            <p className="italic text-xs text-gray-500">
              Example: {option.details.example}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
