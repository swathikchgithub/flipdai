"use client";

import { useState, useEffect, useCallback } from "react";
import { FlashCard } from "@/lib/flashcard-types";
import VoiceControls from "./VoiceControls";

interface CardFlipperProps {
  cards: FlashCard[];
  onKnown: (id: string) => void;
  onReview: (id: string) => void;
  onSkip: (id: string) => void;
  onComplete: () => void;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  autoSpeak?: boolean;
  onTranscript?: (transcript: string, card: FlashCard) => void;
}

const difficultyConfig: Record<number, { color: string; bg: string; label: string; border: string }> = {
  1: { color: "text-[var(--green)]", bg: "bg-[var(--green)]/10", label: "Easy", border: "border-l-[var(--green)]" },
  2: { color: "text-[var(--yellow)]", bg: "bg-[var(--yellow)]/10", label: "Medium", border: "border-l-[var(--yellow)]" },
  3: { color: "text-[var(--red)]", bg: "bg-[var(--red)]/10", label: "Hard", border: "border-l-[var(--red)]" },
};

export default function CardFlipper({
  cards,
  onKnown,
  onReview,
  onSkip,
  onComplete,
  currentIndex,
  onNext,
  onPrev,
  autoSpeak = false,
  onTranscript,
}: CardFlipperProps) {
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const card = cards[currentIndex];
  const diff = difficultyConfig[card?.difficulty] ?? difficultyConfig[2];

  useEffect(() => {
    setFlipped(false);
    setShowHint(false);
  }, [currentIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!card) return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          setFlipped((f) => !f);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (currentIndex < cards.length - 1) onNext();
          else onComplete();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (currentIndex > 0) onPrev();
          break;
        case "1":
          onKnown(card.id);
          if (currentIndex < cards.length - 1) onNext();
          else onComplete();
          break;
        case "2":
          onReview(card.id);
          if (currentIndex < cards.length - 1) onNext();
          else onComplete();
          break;
      }
    },
    [card, currentIndex, cards.length, onNext, onPrev, onKnown, onReview, onComplete]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!card) return null;

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Card */}
      <div
        className="card-flip-container w-full cursor-pointer"
        style={{ height: "340px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={`card-flip-inner ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className={`card-face bg-[var(--bg-card)] border border-[var(--border)] border-l-4 ${diff.border} shadow-2xl`}>
            <div className="text-center space-y-4 w-full">
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${diff.bg} ${diff.color}`}>
                  {diff.label}
                </span>
                <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1 rounded-full">
                  {card.subcategory}
                </span>
              </div>

              <div className="text-xl font-semibold leading-relaxed text-[var(--text-primary)] px-2">
                {card.front}
              </div>

              {card.hint && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowHint((h) => !h); }}
                  className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors flex items-center gap-1 mx-auto"
                >
                  💡 {showHint ? "Hide hint" : "Show hint"}
                </button>
              )}
              {showHint && card.hint && (
                <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-xl p-3 fade-in border border-[var(--border)] text-left">
                  {card.hint}
                </div>
              )}

              <p className="text-xs text-[var(--text-secondary)]/60 flex items-center justify-center gap-2">
                <span className="px-2 py-0.5 rounded border border-[var(--border)] text-[10px]">Space</span>
                to flip
              </p>
            </div>
          </div>

          {/* Back */}
          <div className={`card-back card-face border border-l-4 ${diff.border} shadow-2xl`}
            style={{ background: "linear-gradient(135deg, rgba(124,111,255,0.08) 0%, rgba(56,189,248,0.05) 100%)", borderColor: "var(--border)" }}
          >
            <div className="text-center space-y-4 w-full">
              <div className="text-xs font-bold gradient-text uppercase tracking-widest">
                Answer
              </div>
              <div className="text-lg leading-relaxed text-[var(--text-primary)] font-medium">
                {card.back}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Controls */}
      <div className="w-full">
        <VoiceControls
          text={flipped ? card.back : card.front}
          autoSpeak={autoSpeak && !flipped}
          onTranscript={onTranscript ? (t) => onTranscript(t, card) : undefined}
          showMic={!!onTranscript}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2.5 w-full flex-wrap justify-center">
        <button
          onClick={() => { if (currentIndex > 0) onPrev(); }}
          disabled={currentIndex === 0}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] disabled:opacity-25 transition-all text-sm font-medium"
        >
          ← Prev
        </button>

        <button
          onClick={() => { onReview(card.id); if (currentIndex < cards.length - 1) onNext(); else onComplete(); }}
          className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-semibold text-sm border border-red-500/20 hover:border-red-500/40"
        >
          ❌ Review <span className="opacity-50 text-xs ml-1">(2)</span>
        </button>

        <button
          onClick={() => { onSkip(card.id); if (currentIndex < cards.length - 1) onNext(); else onComplete(); }}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] transition-all text-sm font-medium"
        >
          Skip
        </button>

        <button
          onClick={() => { onKnown(card.id); if (currentIndex < cards.length - 1) onNext(); else onComplete(); }}
          className="px-5 py-2.5 rounded-xl bg-[var(--green)]/10 text-[var(--green)] hover:bg-[var(--green)]/20 transition-all font-semibold text-sm border border-[var(--green)]/20 hover:border-[var(--green)]/40"
        >
          ✅ Know It <span className="opacity-50 text-xs ml-1">(1)</span>
        </button>

        <button
          onClick={() => { if (currentIndex < cards.length - 1) onNext(); else onComplete(); }}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] transition-all text-sm font-medium"
        >
          Next →
        </button>
      </div>

      {/* Keyboard shortcuts */}
      <div className="text-[11px] text-[var(--text-secondary)]/50 flex gap-4 flex-wrap justify-center">
        <span>Space = flip</span>
        <span>· ← → = navigate</span>
        <span>· 1 = know</span>
        <span>· 2 = review</span>
      </div>
    </div>
  );
}
