"use client";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function UpgradeModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900">
                Unlock all business ideas
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Get full access to all 100 curated ideas, advanced filters, and
                personalized blueprints.
              </p>

              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li>• View all hidden ideas</li>
                <li>• See full scores & signals</li>
                <li>• Generate unlimited blueprints</li>
              </ul>

              <div className="mt-6 space-y-3">
                <button className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
                  Upgrade to Pro
                </button>

                <button
                  onClick={onClose}
                  className="w-full text-sm text-gray-500 hover:underline"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
