"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TOPICS } from "@/config/topics";
import { v4 as uuidv4 } from "uuid";

export default function TopicPicker() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedSub, setSelectedSub] = useState<string>("");
  const [customTopic, setCustomTopic] = useState<string>("");
  const [cardCount, setCardCount] = useState<number>(10);

  const topic = TOPICS.find((t) => t.id === selectedTopic);

  const handleStart = () => {
    if (!selectedTopic || !selectedSub) return;
    const sub = selectedTopic === "custom" ? customTopic || "Custom Topic" : selectedSub;
    const sessionId = uuidv4();
    router.push(
      `/study/${sessionId}?topic=${encodeURIComponent(selectedTopic)}&sub=${encodeURIComponent(sub)}&count=${cardCount}`
    );
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Topic Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setSelectedTopic(t.id); setSelectedSub(""); }}
            className={`p-4 rounded-2xl border transition-all duration-200 text-left group relative overflow-hidden ${
              selectedTopic === t.id
                ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-lg shadow-[var(--accent)]/15"
                : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-bright)] hover:bg-[var(--bg-card-hover)]"
            }`}
          >
            {selectedTopic === t.id && (
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent-2)]/5 pointer-events-none" />
            )}
            <div className="text-2xl mb-2">{t.icon}</div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">{t.label}</div>
          </button>
        ))}
      </div>

      {/* Subcategory + Config */}
      {topic && (
        <div className="space-y-5 fade-in bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
          <div>
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest mb-3">
              Subcategory
            </h3>

            {topic.id === "custom" ? (
              <input
                type="text"
                placeholder="Enter any topic (e.g., French Revolution, Quantum Computing...)"
                value={customTopic}
                onChange={(e) => { setCustomTopic(e.target.value); setSelectedSub("Custom"); }}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {topic.subcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSub(sub)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                      selectedSub === sub
                        ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white shadow-md"
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)]"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Card Count */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest mb-3">
              Number of Cards
            </h3>
            <div className="flex gap-3">
              {[10, 25, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => setCardCount(n)}
                  className={`px-7 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                    cardCount === n
                      ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white shadow-md"
                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-bright)]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!selectedSub && !(topic.id === "custom" && customTopic)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white font-bold text-base transition-all btn-glow disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
          >
            Generate {cardCount} Flash Cards →
          </button>
        </div>
      )}
    </div>
  );
}
