"use client";

import React from "react";
import { motion } from "framer-motion";

interface ContentProps {
  section: string;
  text: string;
}

export default function BlueprintContent({ section, text }: ContentProps) {
  return (
    <motion.div
      key={section}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-10"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{section}</h1>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
        {text}
      </p>
    </motion.div>
  );
}
