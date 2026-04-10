"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FlashCard, StudySession, StudyMode } from "@/lib/flashcard-types";
import { TOPICS } from "@/config/topics";
import { saveSession, saveHistory } from "@/lib/storage";
import { v4 as uuidv4 } from "uuid";
import CardFlipper from "@/components/CardFlipper";
import ProgressBar from "@/components/ProgressBar";
import StudyStats from "@/components/StudyStats";
import QuizMode from "@/components/QuizMode";
import Link from "next/link";
import { FLIPDAI_MODELS } from "@/config/flipdai-constants";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

type Phase = "generating" | "studying" | "complete";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateChoices(card: FlashCard, allCards: FlashCard[]): string[] {
  const wrong = shuffleArray(allCards.filter((c) => c.id !== card.id))
    .slice(0, 3)
    .map((c) => c.back);
  return shuffleArray([card.back, ...wrong]);
}

export default function StudyPage({ params }: PageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topicId = searchParams.get("topic") || "";
  const subcategory = searchParams.get("sub") || "";
  const count = parseInt(searchParams.get("count") || "10");
  const model = searchParams.get("model") || "claude-sonnet-4-5";

  const [sessionId, setSessionId] = useState<string>("");
  const [phase, setPhase] = useState<Phase>("generating");
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [review, setReview] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>("");
  const [mode, setMode] = useState<StudyMode>("flash");
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);

  const topic = TOPICS.find((t) => t.id === topicId);
  const modelInfo = FLIPDAI_MODELS.find((m) => m.value === model);

  useEffect(() => {
    params.then(({ sessionId: sid }) => setSessionId(sid));
  }, [params]);

  // Generate cards
  useEffect(() => {
    if (!topicId || !subcategory) return;

    const generate = async () => {
      setPhase("generating");
      setProgress(0);
      setError("");

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId, subcategory, count, model }),
        });

        if (!res.ok) throw new Error("Generation failed");
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                setError(parsed.error);
                return;
              }
              if (parsed.delta) {
                setProgress((p) => Math.min(p + 1, count - 1));
              }
              if (parsed.cards) {
                setCards(parsed.cards);
                setProgress(parsed.cards.length);
                setPhase("studying");
              }
            } catch {}
          }
        }
      } catch (e: any) {
        setError(e.message || "Generation failed");
      }
    };

    generate();
  }, [topicId, subcategory, count]);

  // Auto-save session
  useEffect(() => {
    if (!sessionId || phase !== "studying" || cards.length === 0) return;
    const session: StudySession = {
      id: sessionId,
      topic: topicId,
      subcategory,
      cards,
      known: [...known],
      review: [...review],
      skipped: [...skipped],
      startTime: new Date().toISOString(),
    };
    saveSession(session);
  }, [sessionId, known, review, skipped, cards, phase, topicId, subcategory]);

  const handleComplete = useCallback(() => {
    setPhase("complete");
    const score = cards.length > 0 ? Math.round((known.size / cards.length) * 100) : 0;
    saveHistory({
      id: uuidv4(),
      topic: topicId,
      subcategory,
      cardCount: cards.length,
      knownCount: known.size,
      reviewCount: review.size,
      date: new Date().toISOString(),
      score,
    });
  }, [cards.length, known.size, review.size, topicId, subcategory]);

  const handleTranscript = async (transcript: string, card: FlashCard) => {
    if (!transcript || evaluating) return;
    setEvaluating(true);
    setEvaluation(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: card.front, back: card.back, studentAnswer: transcript }),
      });
      const result = await res.json();
      setEvaluation(result);
    } catch (e) {
      console.error("Evaluation error:", e);
    } finally {
      setEvaluating(false);
    }
  };

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--text-secondary)]">
        Invalid topic. <Link href="/" className="text-[var(--accent)] ml-2">Go home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0e0f13" }}>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        background: "rgba(14,15,19,0.92)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth: 760, margin: "0 auto", padding: "0 24px",
          height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <Link
            href="/"
            style={{
              fontSize: 14, color: "#8892a4",
              padding: "6px 12px",
              border: "0.5px solid rgba(255,255,255,0.18)",
              borderRadius: 8, flexShrink: 0, textDecoration: "none",
              transition: "color 0.15s",
            }}
          >
            ← Back
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>{topic.icon}</span>
            <span style={{ fontWeight: 500, fontSize: 15, color: "#e0e2ea", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {topic.label}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <button
              onClick={() => setAutoSpeak((a) => !a)}
              style={autoSpeak
                ? { background: "rgba(44,196,138,0.12)", border: "0.5px solid rgba(44,196,138,0.3)", color: "#2cc48a", fontSize: 12, padding: "5px 12px", borderRadius: 100, display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }
                : { border: "0.5px solid rgba(255,255,255,0.18)", color: "#8892a4", fontSize: 12, padding: "5px 12px", borderRadius: 100, display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }
              }
            >
              🔊 Voice {autoSpeak ? "ON" : "OFF"}
            </button>
            {phase === "studying" && cards.length > 0 && (
              <span style={{ fontSize: 13, color: "#8892a4", fontWeight: 500 }}>
                Card {currentIndex + 1} of {cards.length}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 48px" }}>

        {/* ══ Generating Phase ══ */}
        {phase === "generating" && (
          <div className="flex flex-col items-center justify-center gap-6 py-24 fade-in">
            <div className="text-5xl float">🃏</div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#e8e8f0" }}>
                Generating your flash cards...
              </h2>
              <p style={{ color: "#606080" }}>
                Crafting{" "}
                <span className="font-semibold" style={{ color: "#7c6fff" }}>{count} cards</span>
                {" "}for <span className="font-medium" style={{ color: "#e8e8f0" }}>{subcategory}</span>
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <div className="rounded-full overflow-hidden" style={{ height: 4, background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(progress / count) * 100}%`, background: "linear-gradient(90deg, #7c6fff, #38bdf8)" }}
                />
              </div>
              <p className="text-xs text-center" style={{ color: "#505068" }}>{progress} / {count} cards</p>
            </div>
            {error && (
              <p className="text-sm px-4 py-2.5 rounded-xl"
                style={{ color: "#f87171", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}>
                {error}
              </p>
            )}
          </div>
        )}

        {/* ══ Studying Phase ══ */}
        {phase === "studying" && cards.length > 0 && (
          <div className="py-4 fade-in">

            {/* Mode tabs */}
            <div className="flex items-center gap-2 mb-4">
              {(["flash", "quiz"] as StudyMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setCurrentIndex(0); setEvaluation(null); }}
                  className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95"
                  style={
                    mode === m
                      ? { background: "linear-gradient(135deg, #7c6fff, #38bdf8)", color: "#fff" }
                      : { background: "rgba(255,255,255,0.05)", color: "#606080", border: "1.5px solid rgba(255,255,255,0.09)" }
                  }
                >
                  {m === "flash" ? "🃏 Flash Cards" : "❓ Quiz Mode"}
                </button>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <ProgressBar
                current={currentIndex + 1}
                total={cards.length}
                known={known.size}
                review={review.size}
                skipped={skipped.size}
              />
            </div>

            {/* Card */}
            {mode === "flash" && (
              <CardFlipper
                cards={cards}
                currentIndex={currentIndex}
                onNext={() => setCurrentIndex((i) => Math.min(i + 1, cards.length - 1))}
                onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
                onKnown={(id) => { setKnown((s) => new Set([...s, id])); setReview((s) => { const n = new Set(s); n.delete(id); return n; }); }}
                onReview={(id) => { setReview((s) => new Set([...s, id])); setKnown((s) => { const n = new Set(s); n.delete(id); return n; }); }}
                onSkip={(id) => setSkipped((s) => new Set([...s, id]))}
                onComplete={handleComplete}
                autoSpeak={autoSpeak}
                onTranscript={handleTranscript}
              />
            )}

            {mode === "quiz" && (
              <QuizMode
                card={cards[currentIndex]}
                choices={generateChoices(cards[currentIndex], cards)}
                onAnswer={(correct) => {
                  const card = cards[currentIndex];
                  if (correct) setKnown((s) => new Set([...s, card.id]));
                  else setReview((s) => new Set([...s, card.id]));
                  setTimeout(() => {
                    if (currentIndex < cards.length - 1) setCurrentIndex((i) => i + 1);
                    else handleComplete();
                  }, 1200);
                }}
              />
            )}

            {/* Stats */}
            <div className="mt-8">
              <StudyStats
                known={known.size}
                review={review.size}
                skipped={skipped.size}
                total={cards.length}
              />
            </div>
          </div>
        )}

        {/* ══ Complete Phase ══ */}
        {phase === "complete" && (
          <div className="flex flex-col items-center gap-6 text-center py-16 fade-up">
            <div className="text-6xl float">🎉</div>
            <div>
              <h2 className="text-3xl font-bold gradient-text">Session Complete!</h2>
              <p className="mt-2" style={{ color: "#606080" }}>Great work — here's how you did</p>
            </div>

            <div className="w-full max-w-sm">
              <StudyStats
                known={known.size}
                review={review.size}
                skipped={skipped.size}
                total={cards.length}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setCurrentIndex(0); setKnown(new Set()); setReview(new Set());
                  setSkipped(new Set()); setPhase("studying"); setEvaluation(null);
                }}
                className="px-6 py-3 rounded-xl font-bold transition-all btn-glow"
                style={{ background: "linear-gradient(135deg, #7c6fff, #38bdf8)", color: "#fff" }}
              >
                🔄 Study Again
              </button>
              {review.size > 0 && (
                <button
                  onClick={() => {
                    const reviewCards = cards.filter((c) => review.has(c.id));
                    setCards(reviewCards); setCurrentIndex(0);
                    setKnown(new Set()); setReview(new Set());
                    setSkipped(new Set()); setPhase("studying"); setEvaluation(null);
                  }}
                  className="px-6 py-3 rounded-xl font-bold transition-all"
                  style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}
                >
                  ❌ Review Cards ({review.size})
                </button>
              )}
              <Link
                href="/"
                className="px-6 py-3 rounded-xl font-bold transition-all"
                style={{ background: "rgba(255,255,255,0.05)", color: "#808098", border: "1px solid rgba(255,255,255,0.09)" }}
              >
                ← New Topic
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
