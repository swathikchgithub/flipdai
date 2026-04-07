"use client";

import { useState, useEffect } from "react";
import { SessionHistory } from "@/lib/flashcard-types";
import { getHistory, getStreak } from "@/lib/storage";
import { TOPICS } from "@/config/topics";
import Link from "next/link";

export default function HistoryPage() {
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setHistory(getHistory());
    setStreak(getStreak());
  }, []);

  const topicLabel = (id: string) => TOPICS.find((t) => t.id === id)?.label || id;
  const topicIcon = (id: string) => TOPICS.find((t) => t.id === id)?.icon || "🃏";

  const totalCards = history.reduce((s, h) => s + h.cardCount, 0);
  const avgScore = history.length > 0
    ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length)
    : 0;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] bg-grid">
      <header className="border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium">
            ← Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center text-xs">
              🃏
            </div>
            <span className="font-bold text-[var(--text-primary)]">Study History</span>
          </div>
          <div />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 fade-up">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold mb-1">🔥 {streak}</div>
            <div className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide">Day Streak</div>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold gradient-text mb-1">{totalCards}</div>
            <div className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide">Cards Studied</div>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <div className={`text-3xl font-bold mb-1 ${avgScore >= 70 ? "text-[var(--green)]" : avgScore >= 40 ? "text-[var(--yellow)]" : "text-[var(--red)]"}`}>
              {avgScore}%
            </div>
            <div className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide">Avg Score</div>
          </div>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="text-center py-20 space-y-4 fade-in">
            <div className="text-6xl float">📚</div>
            <p className="text-[var(--text-secondary)] text-lg">No study sessions yet.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white text-sm font-semibold btn-glow"
            >
              Start Studying →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest px-1">
              Recent Sessions
            </h2>
            {history.map((h) => (
              <div
                key={h.id}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 flex items-center gap-4 hover:border-[var(--border-bright)] transition-colors group"
              >
                <div className="w-11 h-11 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  {topicIcon(h.topic)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[var(--text-primary)]">{topicLabel(h.topic)}</div>
                  <div className="text-sm text-[var(--accent)] font-medium">{h.subcategory}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    &nbsp;·&nbsp;{h.cardCount} cards
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-xl font-bold ${h.score >= 70 ? "text-[var(--green)]" : h.score >= 40 ? "text-[var(--yellow)]" : "text-[var(--red)]"}`}>
                    {h.score}%
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {h.knownCount}/{h.cardCount} known
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
