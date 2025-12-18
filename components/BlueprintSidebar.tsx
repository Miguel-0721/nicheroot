"use client";

import React from "react";
import { motion } from "framer-motion";

interface SidebarProps {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BlueprintSidebar({ tabs, activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="w-64 border-r border-gray-200 bg-white p-6 sticky top-0 h-screen">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Your Blueprint</h2>

      <div className="flex flex-col gap-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-left px-3 py-2 rounded-md transition-all font-medium
              ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `}
          >
           {tab.replace(/^\d+\.\s*/, "")}

          </button>
        ))}
      </div>
    </div>
  );
}
