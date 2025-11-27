"use client";

import React from "react";
import { OptionType } from "@/types/question-types";

interface OptionCardProps {
  option: OptionType;
  onSelect: (key: "A" | "B") => void;
}

export default function OptionCard({ option, onSelect }: OptionCardProps) {
  return (
    <div
      className="border p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition"
      onClick={() => onSelect(option.key)}
    >
      <h3 className="text-xl font-semibold">{option.label}</h3>
      <p className="text-sm mt-1">{option.description}</p>

      <div className="mt-3">
        <h4 className="font-medium">Pros:</h4>
        <ul className="text-sm list-disc ml-5">
          {option.pros.map((pro, idx) => (
            <li key={idx}>{pro}</li>
          ))}
        </ul>
      </div>

      <div className="mt-3">
        <h4 className="font-medium">Cons:</h4>
        <ul className="text-sm list-disc ml-5">
          {option.cons.map((con, idx) => (
            <li key={idx}>{con}</li>
          ))}
        </ul>
      </div>

      <p className="mt-3 text-xs italic">Example: {option.example}</p>
    </div>
  );
}
