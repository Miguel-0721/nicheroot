"use client";

import React, { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

// TYPES
type DetailInfo = {
  pros?: string[];
  cons?: string[];
  example?: string;
  whyThisFits?: string;
};

type CardOption = {
  key: "A" | "B";
  label: string;
  summary: string;
  details?: DetailInfo;
};

interface OptionCardProps {
  option: CardOption;
  selected: boolean;
  onSelect: () => void;
}

export default function OptionCard({
  option,
  selected,
  onSelect,
}: OptionCardProps) {
  const [open, setOpen] = useState(false);

  const { pros = [], cons = [], example, whyThisFits } = option.details || {};

  const toggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className={[
        "relative cursor-pointer rounded-2xl border bg-white transition-all",
        "shadow-[0_10px_30px_rgba(15,23,42,0.04)]",
        selected
          ? "border-indigo-500 shadow-[0_18px_45px_rgba(79,70,229,0.35)] scale-[1.01]"
          : "border-slate-200 hover:border-indigo-200 hover:shadow-[0_14px_35px_rgba(15,23,42,0.06)]",
      ].join(" ")}
    >
      {/* Radio Dot */}
      <div className="absolute right-4 top-4">
        <span
          className={[
            "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
            selected ? "border-indigo-500" : "border-slate-300",
          ].join(" ")}
        >
          <span
            className={[
              "h-3 w-3 rounded-full transition-colors",
              selected
                ? "bg-gradient-to-r from-indigo-500 to-indigo-400"
                : "bg-slate-200",
            ].join(" ")}
          />
        </span>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-5 sm:p-6 pr-14">
        <p className="text-sm font-semibold text-slate-900">
          {option.label}
        </p>
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
          {option.summary}
        </p>
      </div>

      {/* DETAILS TOGGLE */}
      {(pros.length || cons.length || example || whyThisFits) && (
        <button
          onClick={toggleDetails}
          className="group flex w-full items-center justify-between border-t border-slate-100 px-5 sm:px-6 py-3 text-xs text-slate-600"
        >
          <span className="flex items-center gap-2">
            <span
              className={[
                "h-1.5 w-1.5 rounded-full",
                open ? "bg-indigo-500" : "bg-slate-300",
              ].join(" ")}
            />
            <span className="font-medium text-slate-700 group-hover:text-slate-900">
              {open ? "Hide details" : "View details"}
            </span>
          </span>

          <span
            className={[
              "ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
              "border-slate-300 text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-500",
              open ? "rotate-180" : "",
            ].join(" ")}
          >
            ▼
          </span>
        </button>
      )}

      {/* DETAILS PANEL */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="border-t border-slate-100 bg-slate-50/70 px-5 sm:px-6 pb-5 pt-4 rounded-b-2xl space-y-4">
              {/* WHY THIS FITS */}
              {whyThisFits && (
                <VerticalSection title="Why this might fit you" icon={LightbulbIcon}>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                    {whyThisFits}
                  </p>
                </VerticalSection>
              )}

              {/* PROS */}
              {pros.length > 0 && (
                <VerticalSection title="Pros" icon={CheckIcon}>
                  <ul className="mt-1 space-y-1.5 text-xs text-slate-700">
                    {pros.map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-1 h-1 w-1 rounded-full bg-emerald-500" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </VerticalSection>
              )}

              {/* CONS */}
              {cons.length > 0 && (
                <VerticalSection title="Cons" icon={CrossIcon}>
                  <ul className="mt-1 space-y-1.5 text-xs text-slate-700">
                    {cons.map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-1 h-1 w-1 rounded-full bg-rose-500" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </VerticalSection>
              )}

              {/* EXAMPLE */}
              {example && (
                <VerticalSection title="Example scenario" icon={LightbulbIcon}>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                    {example}
                  </p>
                </VerticalSection>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------ */
/* VERTICAL SECTION COMPONENT */
/* ------------------------------------------------------ */

interface VerticalSectionProps {
  title: string;
  icon: (props: { className?: string }) => React.ReactNode;
  children: ReactNode;
}

function VerticalSection({ title, icon: Icon, children }: VerticalSectionProps) {
  return (
    <div className="bg-white/80 rounded-xl border border-slate-200/70 px-3.5 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-900">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span>{title}</span>
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------ */
/* ICONS */
/* ------------------------------------------------------ */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="7" />
      <path d="M4.5 8.5 7 11l4.5-5" />
    </svg>
  );
}

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="7" />
      <path d="m5.2 5.2 5.6 5.6M10.8 5.2 5.2 10.8" />
    </svg>
  );
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 13.5h4" />
      <path d="M6.5 11.5h3" />
      <path d="M8 2.5a4 4 0 0 0-4 4c0 1.5.8 2.5 1.5 3.1.4.3.7.8.9 1.4h4.2c.2-.6.5-1.1.9-1.4C11.2 9 12 8 12 6.5a4 4 0 0 0-4-4Z" />
    </svg>
  );
}
