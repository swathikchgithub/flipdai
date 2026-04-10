"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FlashCard } from "@/lib/flashcard-types";
import { speakText, stopSpeaking } from "@/lib/voice-utils";

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

interface Evaluation {
  correct: boolean;
  score: number;
  feedback: string;
}

export default function CardFlipper({
  cards, onKnown, onReview, onSkip, onComplete,
  currentIndex, onNext, onPrev,
  autoSpeak = false,
}: CardFlipperProps) {
  const card = cards[currentIndex];
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset on card change
  useEffect(() => {
    setFlipped(false);
    setShowHint(false);
    setTypedAnswer("");
    setEvaluation(null);
    setEvaluating(false);
    stopSpeaking();
    if (autoSpeak && card) {
      const t = setTimeout(() => speakText(card.front, 1), 300);
      return () => clearTimeout(t);
    }
  }, [currentIndex, autoSpeak]);

  const goNext = useCallback(() => {
    if (currentIndex < cards.length - 1) onNext(); else onComplete();
  }, [currentIndex, cards.length, onNext, onComplete]);

  const checkAnswer = useCallback(async () => {
    setFlipped(true);
    if (!typedAnswer.trim()) return;
    setEvaluating(true);
    setEvaluation(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: card.front, back: card.back, studentAnswer: typedAnswer }),
      });
      const result = await res.json();
      setEvaluation(result);
    } catch {
      // silently ignore — user can still self-rate
    } finally {
      setEvaluating(false);
    }
  }, [typedAnswer, card]);

  // Keyboard shortcuts — skip Space flip when textarea is focused
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card) return;
      const inTextarea = document.activeElement === textareaRef.current;
      switch (e.key) {
        case " ":
          if (!inTextarea) { e.preventDefault(); setFlipped(f => !f); }
          break;
        case "Enter":
          if (inTextarea && (e.metaKey || e.ctrlKey)) { e.preventDefault(); checkAnswer(); }
          break;
        case "ArrowRight": if (!inTextarea) { e.preventDefault(); goNext(); } break;
        case "ArrowLeft":  if (!inTextarea) { e.preventDefault(); if (currentIndex > 0) onPrev(); } break;
        case "1": if (!inTextarea) { onKnown(card.id); goNext(); } break;
        case "2": if (!inTextarea) { onSkip(card.id); goNext(); } break;
        case "3": if (!inTextarea) { onReview(card.id); goNext(); } break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, currentIndex, goNext, onPrev, onKnown, onReview, onSkip, checkAnswer]);

  if (!card) return null;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-5">

      {/* ── Flash card ── */}
      <div className="card-flip-container w-full">
        <div className={`card-flip-inner ${flipped ? "flipped" : ""}`}>

          {/* ── FRONT ── */}
          <div
            className="card-face flex flex-col items-center justify-start text-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "0.5px solid rgba(255,255,255,0.14)",
              borderRadius: "1rem",
              padding: "1.75rem 1.5rem",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              pointerEvents: flipped ? "none" : "auto",
              cursor: "default",
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] mb-4" style={{ color: "#7a8499" }}>
              Question
            </div>
            <div
              className="font-medium leading-relaxed w-full"
              style={{ fontSize: "clamp(16px, 2.8vw, 21px)", color: "#e8eaf0" }}
            >
              {card.front}
            </div>

            {card.hint && (
              <div className="mt-4 w-full text-left" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setShowHint(h => !h)}
                  className="text-xs transition-colors"
                  style={{ color: showHint ? "#7c6fff" : "#404058" }}
                >
                  💡 {showHint ? "Hide hint" : "Show hint"}
                </button>
                {showHint && (
                  <div
                    className="mt-2 text-sm rounded-xl px-4 py-3 text-left"
                    style={{ background: "rgba(124,111,255,0.07)", border: "1px solid rgba(124,111,255,0.18)", color: "#9090b8" }}
                  >
                    {card.hint}
                  </div>
                )}
              </div>
            )}

            {/* Answer input */}
            <div className="mt-5 w-full" onClick={e => e.stopPropagation()}>
              <textarea
                ref={textareaRef}
                value={typedAnswer}
                onChange={e => setTypedAnswer(e.target.value)}
                placeholder="Type your answer here… (optional)"
                rows={3}
                className="w-full rounded-xl text-sm resize-none focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                  color: "#c8cad8",
                  padding: "10px 14px",
                  lineHeight: 1.6,
                  caretColor: "#7c6fff",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(124,111,255,0.4)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={checkAnswer}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #7c6fff, #38bdf8)",
                    color: "#fff",
                  }}
                >
                  {typedAnswer.trim() ? "Check Answer →" : "Reveal Answer →"}
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-center" style={{ color: "#6a7285" }}>
                {typedAnswer.trim() ? "⌘↵ to check · click card to just reveal" : "👆 click the card to reveal without typing"}
              </p>
            </div>
          </div>

          {/* ── BACK ── */}
          <div
            className="card-back card-face flex flex-col items-center justify-start text-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "0.5px solid rgba(255,255,255,0.14)",
              borderRadius: "1rem",
              padding: "1.75rem 1.5rem",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              pointerEvents: flipped ? "auto" : "none",
            }}
            onClick={() => setFlipped(false)}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] mb-4" style={{ color: "#2cc48a" }}>
              Answer
            </div>
            <div
              className="font-medium leading-relaxed w-full"
              style={{ fontSize: "clamp(14px, 2.4vw, 18px)", color: "#d8dce8", lineHeight: 1.6 }}
            >
              {card.back}
            </div>

            {/* AI evaluation result */}
            {(evaluating || evaluation) && (
              <div
                className="w-full mt-4 rounded-xl px-4 py-3 text-left"
                onClick={e => e.stopPropagation()}
                style={{
                  background: evaluating ? "rgba(255,255,255,0.03)"
                    : evaluation?.correct ? "rgba(44,196,138,0.08)" : "rgba(248,113,113,0.08)",
                  border: evaluating ? "0.5px solid rgba(255,255,255,0.08)"
                    : evaluation?.correct ? "0.5px solid rgba(44,196,138,0.3)" : "0.5px solid rgba(248,113,113,0.3)",
                }}
              >
                {evaluating ? (
                  <p className="text-xs" style={{ color: "#606080" }}>Evaluating your answer…</p>
                ) : (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0">{evaluation?.correct ? "✅" : "❌"}</span>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: "#c8cad8" }}>{evaluation?.feedback}</p>
                      {typedAnswer && (
                        <p className="mt-1 text-xs italic" style={{ color: "#555568" }}>
                          Your answer: "{typedAnswer}"
                        </p>
                      )}
                    </div>
                    <span className="flex-shrink-0 font-bold text-xs" style={{ color: "#7c6fff" }}>
                      {evaluation?.score}/100
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Rating buttons */}
            <div
              className="flex gap-2 mt-5 flex-wrap justify-center"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => { onReview(card.id); goNext(); }}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-85 active:scale-95"
                style={{ background: "rgba(216,99,58,0.15)", color: "#e89070" }}
                data-testid="rating-still"
              >
                😕 Still learning
              </button>
              <button
                onClick={() => { onSkip(card.id); goNext(); }}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-85 active:scale-95"
                style={{ background: "rgba(232,162,71,0.15)", color: "#e8b870" }}
                data-testid="rating-almost"
              >
                🤔 Almost got it
              </button>
              <button
                onClick={() => { onKnown(card.id); goNext(); }}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-85 active:scale-95"
                style={{ background: "rgba(44,196,138,0.15)", color: "#4dd4a0" }}
                data-testid="rating-got"
              >
                ✓ Got it!
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-center gap-3">
        <button
          disabled={currentIndex === 0}
          onClick={() => { if (currentIndex > 0) onPrev(); }}
          className="px-5 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ border: "0.5px solid rgba(255,255,255,0.1)", color: "#888898", background: "transparent" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          data-testid="prev-btn"
        >
          ← Prev
        </button>

        <button
          onClick={() => setFlipped(f => !f)}
          className="px-3 py-2 rounded-xl text-base transition-all"
          style={{ border: "0.5px solid rgba(255,255,255,0.1)", color: "#666678", background: "transparent" }}
          title="Flip card (Space)"
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          🔀
        </button>

        <button
          onClick={goNext}
          className="px-5 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ border: "0.5px solid rgba(255,255,255,0.1)", color: "#888898", background: "transparent" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          data-testid="next-btn"
        >
          Next →
        </button>
      </div>

      {/* ── Keyboard hints ── */}
      <div className="hidden sm:block text-center" style={{ fontSize: 11, color: "#333348" }}>
        <span className="px-1.5 py-0.5 rounded mr-0.5" style={{ border: "0.5px solid rgba(255,255,255,0.1)", fontSize: 10, color: "#555568" }}>Space</span> flip
        &nbsp;·&nbsp;
        <span className="px-1.5 py-0.5 rounded mr-0.5" style={{ border: "0.5px solid rgba(255,255,255,0.1)", fontSize: 10, color: "#555568" }}>→</span> next
        &nbsp;·&nbsp;
        <span className="px-1.5 py-0.5 rounded mr-0.5" style={{ border: "0.5px solid rgba(255,255,255,0.1)", fontSize: 10, color: "#555568" }}>←</span> prev
        &nbsp;·&nbsp;
        <span className="px-1.5 py-0.5 rounded mr-0.5" style={{ border: "0.5px solid rgba(255,255,255,0.1)", fontSize: 10, color: "#555568" }}>⌘↵</span> check
      </div>
    </div>
  );
}
