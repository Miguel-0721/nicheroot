"use client";

import React from "react";
import { motion } from "framer-motion";

// Recharts (already installed in your project)
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import type {
  BlueprintSection,
  TableBlock,
  ChartBlock,
  DiagramBlock,
  ListBlock,
  ExampleBlock,
} from "@/types/blueprint-types";

export default function BlueprintContent({ section }: { section: BlueprintSection }) {
  const content = section.content || {};
const nextMoves = content.nextMoves ?? [];

  return (
    <motion.div
      key={section.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="px-6 py-10"
    >
      {/* Section Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {section.title}
      </h1>

      {/* ---------------- PARAGRAPHS ---------------- */}
      {content.paragraphs?.map((p, i) => (
        <p key={i} className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
          {p}
        </p>
      ))}

      {/* ---------------- TABLES ---------------- */}
      {content.tables?.map((table: TableBlock, i: number) => (
        <div key={i} className="my-8 rounded-xl border p-4 bg-white shadow-sm">
          <h3 className="font-semibold mb-3">{table.title}</h3>

          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr>
                {table.columns.map((col, idx) => (
                  <th key={idx} className="border-b py-2 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {table.rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2 border-b">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-sm text-gray-600 mt-2">{table.explanation}</p>
        </div>
      ))}

      {/* ---------------- CHARTS ---------------- */}
      {content.charts?.map((chart: ChartBlock, i: number) => (
        <div key={i} className="my-10 p-4 rounded-xl border bg-white shadow-sm">
          <h3 className="font-semibold mb-3">{chart.title}</h3>

          <div className="w-full h-64">
            <ResponsiveContainer>
              {chart.type === "bar" ? (
                <BarChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={chart.xKey} />
                  <YAxis />
                  <Tooltip />
                  {chart.yKeys?.map((key, idx) => (
                    <Bar key={idx} dataKey={key} fill="#6366F1" />
                  ))}
                </BarChart>
              ) : chart.type === "line" ? (
                <LineChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={chart.xKey} />
                  <YAxis />
                  <Tooltip />
                  {chart.yKeys?.map((key, idx) => (
                    <Line key={idx} dataKey={key} stroke="#6366F1" strokeWidth={2} />
                  ))}
                </LineChart>
              ) : chart.type === "pie" ? (
                <PieChart>
                  <Pie data={chart.data} dataKey={chart.yKeys?.[0]} nameKey={chart.xKey} fill="#6366F1" />
                  <Tooltip />
                </PieChart>
              ) : null}
            </ResponsiveContainer>
          </div>

          <p className="text-sm text-gray-600 mt-2">{chart.explanation}</p>
        </div>
      ))}

      {/* ---------------- LISTS ---------------- */}
      {content.lists?.map((block: ListBlock, i: number) => (
        <div key={i} className="my-6">
          <h3 className="font-semibold mb-2">{block.title}</h3>
          <ul className="list-disc ml-6 space-y-1">
            {block.items.map((item, idx) => (
              <li key={idx} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>
      ))}

      {/* ---------------- EXAMPLES ---------------- */}
      {content.examples?.map((ex: ExampleBlock, i) => (
        <div key={i} className="my-6">
          <h3 className="font-semibold mb-2">{ex.title}</h3>
          <ul className="list-disc ml-6 space-y-1">
            {ex.items.map((item, idx) => (
              <li key={idx} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>
      ))}

    {/* ---------------- NEXT MOVES ---------------- */}
{nextMoves.length > 0 && (
  <div className="my-10">
    <h3 className="font-semibold mb-3">Next Moves</h3>
    <ul className="list-disc ml-6 space-y-1">
      {nextMoves.map((item, idx) => (
        <li key={idx} className="text-gray-700">{item}</li>
      ))}
    </ul>
  </div>
)}


    </motion.div>
  );
}
