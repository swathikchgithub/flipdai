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
          body: JSON.stringify({ topicId, subcategory, count }),
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
    <div className="min-h-screen bg-[var(--bg-primary)] bg-grid">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 text-sm font-medium transition-colors">
            ← Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-lg">{topic.icon}</span>
            <span className="font-bold text-[var(--text-primary)]">{topic.label}</span>
            <span className="text-[var(--accent)] text-sm font-medium">· {subcategory}</span>
          </div>
          <button
            onClick={() => setAutoSpeak((a) => !a)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${autoSpeak ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"}`}
            title="Auto-read cards"
          >
            🔊
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Generating Phase */}
        {phase === "generating" && (
          <div className="text-center space-y-6 fade-in py-20">
            <div className="text-5xl float">🃏</div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Generating your flash cards...
              </h2>
              <p className="text-[var(--text-secondary)]">
                Claude is crafting <span className="text-[var(--accent)] font-semibold">{count} cards</span> for <span className="text-[var(--text-primary)] font-medium">{subcategory}</span>
              </p>
            </div>
            <div className="w-full max-w-sm mx-auto space-y-2">
              <div className="bg-[var(--bg-secondary)] rounded-full h-2.5 overflow-hidden border border-[var(--border)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(progress / count) * 100}%`,
                    background: "linear-gradient(90deg, var(--gradient-start), var(--gradient-end))",
                  }}
                />
              </div>
              <p className="text-xs text-[var(--text-secondary)]">{progress} / {count} cards</p>
            </div>
            {error && <p className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">{error}</p>}
          </div>
        )}

        {/* Studying Phase */}
        {phase === "studying" && cards.length > 0 && (
          <div className="space-y-6 fade-in">
            {/* Mode Selector */}
            <div className="flex gap-2 flex-wrap">
              {(["flash", "quiz"] as StudyMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setCurrentIndex(0); setEvaluation(null); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    mode === m
                      ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white shadow-md"
                      : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-bright)]"
                  }`}
                >
                  {m === "flash" ? "🃏 Flash Cards" : "❓ Quiz Mode"}
                </button>
              ))}
            </div>

            <ProgressBar
              current={currentIndex + 1}
              total={cards.length}
              known={known.size}
              review={review.size}
              skipped={skipped.size}
            />

            {mode === "flash" && (
              <>
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

                {/* AI Evaluation Result */}
                {(evaluating || evaluation) && (
                  <div className={`rounded-xl p-4 border fade-in ${
                    evaluating ? "border-[var(--border)] bg-[var(--bg-secondary)]" :
                    evaluation?.correct ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"
                  }`}>
                    {evaluating ? (
                      <p className="text-[var(--text-secondary)] text-sm">Evaluating your answer...</p>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span>{evaluation?.correct ? "✅" : "❌"}</span>
                          <span className="font-medium text-sm">{evaluation?.feedback}</span>
                          <span className="ml-auto text-sm text-[var(--accent)]">{evaluation?.score}/100</span>
                        </div>
                        {evaluation?.missing && (
                          <p className="text-xs text-[var(--text-secondary)]">Missing: {evaluation.missing}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {mode === "quiz" && (
              <QuizMode
                card={cards[currentIndex]}
                choices={generateChoices(cards[currentIndex], cards)}
                onAnswer={(correct) => {
                  const card = cards[currentIndex];
                  if (correct) {
                    setKnown((s) => new Set([...s, card.id]));
                  } else {
                    setReview((s) => new Set([...s, card.id]));
                  }
                  setTimeout(() => {
                    if (currentIndex < cards.length - 1) {
                      setCurrentIndex((i) => i + 1);
                    } else {
                      handleComplete();
                    }
                  }, 1200);
                }}
              />
            )}

            <StudyStats
              known={known.size}
              review={review.size}
              skipped={skipped.size}
              total={cards.length}
            />
          </div>
        )}

        {/* Complete Phase */}
        {phase === "complete" && (
          <div className="text-center space-y-8 fade-up py-8">
            <div className="text-6xl float">🎉</div>
            <div>
              <h2 className="text-3xl font-bold gradient-text">Session Complete!</h2>
              <p className="text-[var(--text-secondary)] mt-2">Great work — here's how you did</p>
            </div>

            <StudyStats
              known={known.size}
              review={review.size}
              skipped={skipped.size}
              total={cards.length}
            />

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => { setCurrentIndex(0); setKnown(new Set()); setReview(new Set()); setSkipped(new Set()); setPhase("studying"); setEvaluation(null); }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white font-bold transition-all btn-glow"
              >
                🔄 Study Again
              </button>

              {review.size > 0 && (
                <button
                  onClick={() => {
                    const reviewCards = cards.filter((c) => review.has(c.id));
                    setCards(reviewCards);
                    setCurrentIndex(0);
                    setKnown(new Set());
                    setReview(new Set());
                    setSkipped(new Set());
                    setPhase("studying");
                    setEvaluation(null);
                  }}
                  className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-bold transition-all"
                >
                  ❌ Review Cards ({review.size})
                </button>
              )}

              <Link
                href="/"
                className="px-6 py-3 rounded-xl bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] font-bold transition-all"
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
