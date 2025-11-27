"use client";

import React from "react";
import { OptionType } from "@/types/question-types";
import { motion } from "framer-motion";

interface OptionCardProps {
  option: OptionType;
  onSelect: (key: "A" | "B") => void;
  selected?: boolean;
}

export default function OptionCard({ option, onSelect, selected }: OptionCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(option.key)}
      className={`
        cursor-pointer rounded-xl border p-5 transition-all
        bg-white relative
        shadow-sm
        hover:shadow-md
        ${
          selected
            ? "border-blue-600 ring-2 ring-blue-500/40 bg-blue-50"
            : "border-gray-300 hover:border-blue-400"
        }
      `}
    >
      {/* Checkmark if selected */}
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
          <svg
            className="w-4 h-4 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <h3 className="text-lg font-semibold mb-1 text-gray-900">{option.label}</h3>

      <p className="text-sm text-gray-600 mb-4">{option.description}</p>

      {/* Pros */}
      <div className="mt-3">
        <p className="text-sm font-medium text-gray-700">Pros:</p>
        <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
          {option.pros.map((pro, idx) => (
            <li key={idx}>{pro}</li>
          ))}
        </ul>
      </div>

      {/* Cons */}
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700">Cons:</p>
        <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
          {option.cons.map((con, idx) => (
            <li key={idx}>{con}</li>
          ))}
        </ul>
      </div>

      {/* Example */}
      <p className="mt-4 text-xs italic text-gray-500">
        Example: {option.example}
      </p>
    </motion.div>
  );
}
