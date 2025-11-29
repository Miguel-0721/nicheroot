"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Option } from "@/types/question-types";
import { ChevronDown } from "lucide-react";

interface Props {
  option: Option;
  selected: boolean;
  onSelect: () => void;
}

export default function OptionCard({ option, selected, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      className={`
        cursor-pointer border rounded-xl shadow-sm transition-all bg-white flex flex-col
        ${selected ? "border-indigo-500 shadow-md" : "border-gray-200 hover:border-indigo-300 hover:shadow"}
      `}
      style={{
        minHeight: "100%", // equal height across cards
      }}
    >
      {/* MAIN CONTENT */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between">
          <p className="font-semibold text-gray-900">{option.label}</p>

          {/* Arrow toggle */}
          <motion.div
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </motion.div>
        </div>

        <p className="text-gray-600 text-sm mt-1">{option.summary}</p>

        {/* DETAILS */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              {/* PROS */}
              <div className="mb-4">
                <p className="font-medium text-gray-800 mb-1">Pros</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  {option.details.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CONS */}
              <div className="mb-4">
                <p className="font-medium text-gray-800 mb-1">Cons</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  {option.details.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">✕</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* EXAMPLE */}
              {option.details.example && (
                <div className="mb-4">
                  <p className="font-medium text-gray-800 mb-1">Example</p>
                  <p className="text-gray-700 text-sm">{option.details.example}</p>
                </div>
              )}

              {/* WHY THIS FITS YOU */}
              {option.details.whyThisFits && (
                <div>
                  <p className="font-medium text-gray-800 mb-1">Why this fits you</p>
                  <p className="text-gray-700 text-sm">{option.details.whyThisFits}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
