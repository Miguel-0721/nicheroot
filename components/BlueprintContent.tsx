"use client";

import React from "react";
import { motion } from "framer-motion";
import BlueprintBlockRenderer from "./BlueprintBlockRenderer";
import type { BlueprintSection } from "@/types/blueprint-types";

export default function BlueprintContent({
  section,
}: {
  section: BlueprintSection;
}) {
  const blocks = section.content?.blocks ?? [];

  return (
    <motion.div
      key={section.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="px-6 py-10"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {section.title.replace(/^\d+\.\s*/, "")}
      </h1>

      {/* ✅ SINGLE SOURCE OF TRUTH */}
      <BlueprintBlockRenderer blocks={blocks} />
    </motion.div>
  );
}
