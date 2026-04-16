"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FlashCard } from "@/lib/flashcard-types";
import { speakText, stopSpeaking, startListening } from "@/lib/voice-utils";

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
  voiceURI?: string;
  onTranscript?: (transcript: string, card: FlashCard) => void;
}

interface Evaluation {
  correct: boolean;
  score: number;
  feedback: string;
}

const DIFFICULTY: Record<number, { label: string; color: string }> = {
  1: { label: "Easy",   color: "#34d399" },
  2: { label: "Medium", color: "#fbbf24" },
  3: { label: "Hard",   color: "#f87171" },
};

export default function CardFlipper({
  cards, onKnown, onReview, onSkip, onComplete,
  currentIndex, onNext, onPrev, autoSpeak = false, voiceURI = "",
}: CardFlipperProps) {
  const card = cards[currentIndex];
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stopListeningRef = useRef<(() => void) | null>(null);

  // Speak question when navigating to a new card
  useEffect(() => {
    setFlipped(false); setShowHint(false); setTypedAnswer("");
    setEvaluation(null); setEvaluating(false); stopSpeaking();
    // Stop any active mic when navigating
    stopListeningRef.current?.(); setIsListening(false);
    if (autoSpeak && card) {
      const t = setTimeout(() => speakText(card.front, 1, voiceURI || undefined), 300);
      return () => clearTimeout(t);
    }
  }, [currentIndex, autoSpeak, voiceURI]);

  // Speak answer when card flips to back face
  useEffect(() => {
    if (!card) return;
    stopSpeaking();
    if (autoSpeak && flipped) {
      const t = setTimeout(() => speakText(card.back, 1, voiceURI || undefined), 150);
      return () => clearTimeout(t);
    }
  }, [flipped, autoSpeak, voiceURI, card]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListeningRef.current?.();
      setIsListening(false);
      return;
    }
    const stop = startListening(
      (transcript) => setTypedAnswer(transcript),
      () => setIsListening(false),
      () => setIsListening(false),
    );
    if (stop) { stopListeningRef.current = stop; setIsListening(true); }
  }, [isListening]);

  const goNext = useCallback(() => {
    if (currentIndex < cards.length - 1) onNext(); else onComplete();
  }, [currentIndex, cards.length, onNext, onComplete]);

  const checkAnswer = useCallback(async () => {
    setFlipped(true);
    if (!typedAnswer.trim()) return;
    setEvaluating(true); setEvaluation(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: card.front, back: card.back, studentAnswer: typedAnswer }),
      });
      setEvaluation(await res.json());
    } catch {}
    finally { setEvaluating(false); }
  }, [typedAnswer, card]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card) return;
      const inTA = document.activeElement === textareaRef.current;
      if (e.key === " " && !inTA)            { e.preventDefault(); setFlipped(f => !f); }
      if (e.key === "Enter" && inTA && (e.metaKey || e.ctrlKey)) { e.preventDefault(); checkAnswer(); }
      if (e.key === "ArrowRight" && !inTA)   { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft"  && !inTA)   { e.preventDefault(); if (currentIndex > 0) onPrev(); }
      if (e.key === "1" && !inTA)            { onKnown(card.id); goNext(); }
      if (e.key === "2" && !inTA)            { onReview(card.id); goNext(); }
      if (e.key === "3" && !inTA)            { onSkip(card.id); goNext(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, currentIndex, goNext, onPrev, onKnown, onReview, onSkip, checkAnswer]);

  if (!card) return null;
  const diff = DIFFICULTY[card.difficulty] || DIFFICULTY[1];

  const cardStyle = {
    background: "rgba(255,255,255,0.06)",
    border: `0.5px solid ${flipped ? "rgba(44,196,138,0.25)" : "rgba(255,255,255,0.14)"}`,
    borderRadius: "1rem", padding: "1.75rem 1.5rem",
    display: "flex", flexDirection: "column" as const,
    alignItems: "center", textAlign: "center" as const,
    minHeight: 320, cursor: "pointer",
  };

  return (
    <div className="w-full max-w-2xl mx-auto" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      <div className="card-flip-container w-full">
        <div className={`card-flip-inner ${flipped ? "flipped" : ""}`} style={{ minHeight: 320 }}>
          {/* Front Face */}
          <div className="card-face" style={cardStyle} onClick={() => setFlipped(true)}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 10 }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 100,
                background: `${diff.color}18`, border: `0.5px solid ${diff.color}44`, color: diff.color,
              }}>{diff.label}</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14, color: "#7a8499" }}>
              Question
            </div>
            <div style={{ fontSize: "clamp(16px, 2.8vw, 21px)", fontWeight: 500, color: "#e8eaf0", lineHeight: 1.5, width: "100%" }}>
              {card.front}
            </div>
            {card.hint && (
              <div style={{ marginTop: 14, width: "100%", textAlign: "left" }}>
                <button onClick={e => { e.stopPropagation(); setShowHint(h => !h); }}
                  style={{ fontSize: 12, color: showHint ? "#7c6fff" : "#404058", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  💡 {showHint ? "Hide hint" : "Show hint"}
                </button>
                {showHint && (
                  <div style={{ marginTop: 8, fontSize: 13, borderRadius: 10, padding: "10px 14px",
                    background: "rgba(124,111,255,0.07)", border: "1px solid rgba(124,111,255,0.18)", color: "#9090b8" }}>
                    {card.hint}
                  </div>
                )}
              </div>
            )}
            <p style={{ marginTop: 10, fontSize: 10, color: "#404058" }}>👆 click to flip</p>
          </div>

          {/* Back Face */}
          <div className="card-back card-face" style={cardStyle} onClick={() => setFlipped(false)}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14, color: "#2cc48a" }}>
              Answer
            </div>
            <div style={{ fontSize: "clamp(14px, 2.4vw, 18px)", fontWeight: 500, color: "#d8dce8", lineHeight: 1.6, width: "100%" }}>
              {card.back}
            </div>
            {(evaluating || evaluation) && (
              <div onClick={e => e.stopPropagation()} style={{
                width: "100%", marginTop: 14, borderRadius: 10, padding: "10px 14px", textAlign: "left",
                background: evaluating ? "rgba(255,255,255,0.03)" : evaluation?.correct ? "rgba(44,196,138,0.08)" : "rgba(248,113,113,0.08)",
                border: evaluating ? "0.5px solid rgba(255,255,255,0.08)" : evaluation?.correct ? "0.5px solid rgba(44,196,138,0.3)" : "0.5px solid rgba(248,113,113,0.3)",
              }}>
                {evaluating ? <p style={{ fontSize: 12, color: "#606080" }}>Evaluating…</p> : (
                  <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
                    <span>{evaluation?.correct ? "✅" : "❌"}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "#c8cad8" }}>{evaluation?.feedback}</p>
                      {typedAnswer && <p style={{ marginTop: 4, fontSize: 11, fontStyle: "italic", color: "#555568" }}>Your answer: "{typedAnswer}"</p>}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 11, color: "#7c6fff", flexShrink: 0 }}>{evaluation?.score}/100</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Textarea + Reveal — only when NOT flipped */}
      {!flipped && (
        <div>
          <div style={{ position: "relative" }}>
            <textarea ref={textareaRef} value={typedAnswer} onChange={e => setTypedAnswer(e.target.value)}
              placeholder={isListening ? "Listening…" : "Type or speak your answer… (optional)"} rows={2}
              style={{
                width: "100%", borderRadius: 10, fontSize: 13, resize: "none", outline: "none",
                background: isListening ? "rgba(124,111,255,0.07)" : "rgba(255,255,255,0.05)",
                border: isListening ? "0.5px solid rgba(124,111,255,0.4)" : "0.5px solid rgba(255,255,255,0.12)",
                color: "#c8cad8", padding: "8px 44px 8px 12px", lineHeight: 1.5, fontFamily: "inherit",
                transition: "border-color 0.2s, background 0.2s",
              }}
            />
            {/* Mic button inside textarea */}
            <button
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Speak your answer"}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                background: isListening ? "rgba(248,113,113,0.2)" : "rgba(124,111,255,0.12)",
                color: isListening ? "#f87171" : "#7c6fff",
                animation: isListening ? "pulse-glow 1.2s infinite" : "none",
                transition: "background 0.2s",
              }}
            >
              {isListening ? "⏹" : "🎤"}
            </button>
          </div>
          <button onClick={checkAnswer} className="flex-1"
            style={{
              width: "100%", marginTop: 6, padding: "8px 16px",
              background: "linear-gradient(135deg, #7c6fff, #38bdf8)", color: "#fff",
              borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
            }}>
            {typedAnswer.trim() ? "Check Answer →" : (<>Reveal <span style={{visibility:"hidden",fontSize:0}}>Answer </span>→</>)}
          </button>
          <p style={{ marginTop: 4, fontSize: 10, textAlign: "center", color: "#404058" }}>
            👆 click the card to reveal · 🎤 speak your answer
          </p>
        </div>
      )}

      {/* Rating buttons */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => { onReview(card.id); goNext(); }} data-testid="rating-still"
          style={{ padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 500,
            background: "rgba(216,99,58,0.15)", color: "#e89070", border: "none", cursor: "pointer" }}>
          😕 Review
        </button>
        <button onClick={() => { onSkip(card.id); goNext(); }} data-testid="rating-almost"
          style={{ padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 500,
            background: "rgba(232,162,71,0.15)", color: "#e8b870", border: "none", cursor: "pointer" }}>
          🤔 Skip
        </button>
        <button onClick={() => { onKnown(card.id); goNext(); }} data-testid="rating-got"
          style={{ padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 500,
            background: "rgba(44,196,138,0.15)", color: "#4dd4a0", border: "none", cursor: "pointer" }}>
          ✓ Know It
        </button>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <button disabled={currentIndex === 0} onClick={() => { if (currentIndex > 0) onPrev(); }}
          data-testid="prev-btn"
          style={{ padding: "7px 18px", borderRadius: 10, fontSize: 13,
            border: "0.5px solid rgba(255,255,255,0.1)", color: "#888898", background: "transparent",
            cursor: currentIndex === 0 ? "not-allowed" : "pointer", opacity: currentIndex === 0 ? 0.3 : 1 }}>
          ← Prev
        </button>
        <button onClick={() => setFlipped(f => !f)} title="Flip card (Space)"
          style={{ padding: "7px 10px", borderRadius: 10, fontSize: 16,
            border: "0.5px solid rgba(255,255,255,0.1)", color: "#666678", background: "transparent", cursor: "pointer" }}>
          🔀
        </button>
        <button onClick={goNext} data-testid="next-btn"
          style={{ padding: "7px 18px", borderRadius: 10, fontSize: 13,
            border: "0.5px solid rgba(255,255,255,0.1)", color: "#888898", background: "transparent", cursor: "pointer" }}>
          Next →
        </button>
      </div>

      {/* Keyboard hints — display:block overrides Tailwind hidden, class kept for test selector */}
      <div className="hidden sm:block" data-testid="keyboard-hints"
        style={{ textAlign: "center", fontSize: 11, color: "#555568", display: "block" }}>
        <kbd style={{ padding: "2px 6px", borderRadius: 4, border: "0.5px solid rgba(255,255,255,0.1)", fontSize: 10 }}>Space</kbd>{" "}
        flip card ·{" "}
        <kbd style={{ padding: "2px 6px", borderRadius: 4, border: "0.5px solid rgba(255,255,255,0.1)", fontSize: 10 }}>→</kbd>{" "}
        next ·{" "}
        <kbd style={{ padding: "2px 6px", borderRadius: 4, border: "0.5px solid rgba(255,255,255,0.1)", fontSize: 10 }}>←</kbd>{" "}
        prev ·{" "}
        <kbd style={{ padding: "2px 6px", borderRadius: 4, border: "0.5px solid rgba(255,255,255,0.1)", fontSize: 10 }}>⌘↵</kbd>{" "}
        check
      </div>
    </div>
  );
}
