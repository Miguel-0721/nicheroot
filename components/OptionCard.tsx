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
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={onSelect}
      className={`w-full border rounded-2xl p-5 cursor-pointer transition-all bg-white 
        ${
          selected
            ? "border-indigo-500 shadow-xl"
            : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
        }
      `}
    >
      {/* Title Row */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{option.label}</h3>

        <button
          type="button"
          className="text-indigo-600 text-sm font-medium hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
        >
          {showDetails ? "Hide" : "Details"}
        </button>
      </div>

      {/* Summary */}
      <p className="text-gray-600 text-sm mb-1">{option.summary}</p>

      {/* Details dropdown */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-indigo-50 rounded-xl p-4 text-sm text-gray-800"
          >
            <div className="mb-3">
              <p className="font-semibold mb-1">Pros</p>
              <ul className="list-disc ml-4 space-y-1">
                {option.pros.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="mb-3">
              <p className="font-semibold mb-1">Cons</p>
              <ul className="list-disc ml-4 space-y-1">
                {option.cons.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <p className="italic text-xs text-gray-600">
              Example: {option.example}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
