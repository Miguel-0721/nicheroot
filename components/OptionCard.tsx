"use client";

import React from "react";
import { motion } from "framer-motion";
import { OptionType } from "@/types/question-types";

interface OptionCardProps {
  option: OptionType;
  onSelect: (key: "A" | "B") => void;
  selected?: boolean;
}

export default function OptionCard({ option, onSelect, selected }: OptionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div
        onClick={() => onSelect(option.key)}
        className={`
          cursor-pointer rounded-xl border p-6 md:p-8 shadow-sm transition-all
          ${selected ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 bg-white"}
          hover:shadow-md hover:scale-[1.01]
        `}
      >
        {/* Label + Title */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              selected ? "bg-blue-600" : "bg-gray-400"
            }`}
          />
          <h3 className="text-lg md:text-xl font-semibold">{option.label}</h3>
        </div>

        {/* Description */}
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          {option.description}
        </p>

        {/* Pros */}
        <div className="mt-4">
          <h4 className="text-sm uppercase tracking-wide text-gray-500 font-medium mb-1">
            Pros
          </h4>
          <ul className="list-disc ml-5 text-gray-700 text-sm leading-relaxed">
            {option.pros.map((pro, idx) => (
              <li key={idx}>{pro}</li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="mt-4">
          <h4 className="text-sm uppercase tracking-wide text-gray-500 font-medium mb-1">
            Cons
          </h4>
          <ul className="list-disc ml-5 text-gray-700 text-sm leading-relaxed">
            {option.cons.map((con, idx) => (
              <li key={idx}>{con}</li>
            ))}
          </ul>
        </div>

        {/* Example */}
        <p className="mt-5 text-xs text-gray-500 italic">
          <span className="font-semibold not-italic text-gray-600">Example: </span>
          {option.example}
        </p>
      </div>
    </motion.div>
  );
}
