"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function StartPage() {
  const router = useRouter();

  const placeholders = [
    "Tell us about your background, skills, and goals...",
    "How much time can you commit each week?",
    "What do you want your business to support?",
    "Tell us where you are in life right now...",
    "What kind of lifestyle do you want your business to support?",
  ];

  const [placeholder, setPlaceholder] = useState(placeholders[0]);
  const [userInput, setUserInput] = useState("");

  // Rotate placeholder
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % placeholders.length;
      setPlaceholder(placeholders[i]);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const startFlow = () => {
    if (typeof window !== "undefined")
      localStorage.setItem("nicheroot_userInput", userInput.trim());

    router.push("/questions"); // goes to homepage where the modal flow starts
  };

  return (
    <main className="start-page">
      <div className="start-container">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="start-badge"
        >
          <span className="start-badge-text">NicheRoot</span>
        </motion.div>

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="start-left"
        >
          <h1 className="start-title">
            Tell us about your <span>situation</span>
          </h1>

          <p className="start-sub">
            This helps our AI understand your strengths, constraints,
            and where you want to go — so it can match you with a
            business direction that truly fits <b>your</b> life.
          </p>

          <textarea
            className="start-textarea"
            placeholder={placeholder}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          ></textarea>

          <p className="start-hint">
            A paragraph is enough — the AI does the rest.
          </p>

          <button className="start-btn" onClick={startFlow}>
            Start the 6 questions
          </button>
        </motion.div>

        {/* RIGHT SIDE IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="start-image-card"
        >
          <Image
            src="/flowchart2.png"
            alt="Flowchart Illustration"
            width={520}
            height={520}
            className="start-illustration"
            priority
          />
        </motion.div>
      </div>
    </main>
  );
}
