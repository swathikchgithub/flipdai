"use client";

import { useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TOPICS } from "@/config/topics";
import { v4 as uuidv4 } from "uuid";

interface PageProps {
  params: Promise<{ topicId: string }>;
}

const THEME: Record<string, { color: string }> = {
  "job-interviews":  { color: "#5b9cf6" },
  "sat-prep":        { color: "#8b6fe0" },
  "ap-exams":        { color: "#d9943a" },
  "certifications":  { color: "#2ab888" },
  "languages":       { color: "#c44f78" },
  "sciences":        { color: "#58a828" },
  "tech-topics":     { color: "#c85c35" },
  "custom":          { color: "#5b9cf6" },
};

function hexAlpha(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const COUNT_OPTS = [
  { n: 5,  label: "Quick" },
  { n: 10, label: "Standard" },
  { n: 25, label: "Deep dive" },
  { n: 50, label: "Marathon" },
];

export default function TopicPage({ params }: PageProps) {
  const { topicId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const model = searchParams.get("model") || "claude-sonnet-4-5";
  const prefill = searchParams.get("prefill") || "";

  const topic = TOPICS.find((t) => t.id === topicId);
  const color = topic ? (THEME[topicId]?.color || "#5b9cf6") : "#5b9cf6";

  const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set());
  const [customTopic, setCustomTopic] = useState(prefill);
  const [cardCount, setCardCount] = useState(5);
  const [shuffle, setShuffle] = useState(true);

  if (!topic) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0e0f13" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#606080", marginBottom: 16 }}>Topic not found.</p>
          <Link href="/" style={{ color: "#5b9cf6", fontSize: 14 }}>← Back to home</Link>
        </div>
      </div>
    );
  }

  const isCustom = topicId === "custom";
  const canStart = isCustom ? customTopic.trim().length > 0 : selectedSubs.size > 0;

  const toggleSub = (sub: string) => {
    setSelectedSubs(prev => {
      const next = new Set(prev);
      if (next.has(sub)) next.delete(sub); else next.add(sub);
      return next;
    });
  };

  const handleStart = () => {
    if (!canStart) return;
    const sub = isCustom ? customTopic.trim() : [...selectedSubs].join(", ");
    const sessionId = uuidv4();
    router.push(
      `/study/${sessionId}?topic=${encodeURIComponent(topicId)}&sub=${encodeURIComponent(sub)}&count=${cardCount}&model=${encodeURIComponent(model)}`
    );
  };

  // Estimate calc
  const mins = Math.round(cardCount * 0.5);
  const maxMins = Math.round(cardCount * 0.8);
  const activeSubs = [...selectedSubs];
  const subNames = activeSubs.length <= 3
    ? activeSubs.join(", ")
    : activeSubs.slice(0, 2).join(", ") + ` +${activeSubs.length - 2} more`;

  return (
    <div style={{ minHeight: "100vh", background: "#0e0f13" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        background: "rgba(14,15,19,0.92)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth: 920, margin: "0 auto", padding: "0 28px",
          height: 58, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#fff", letterSpacing: "-0.3px" }}>
            Flip<span style={{ color: "#5b9cf6" }}>DAI</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 28px 52px" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0 24px" }}>
          <Link
            href="/"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px",
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              fontSize: 13, color: "#999",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
          >
            ← Back
          </Link>
          <span style={{ fontSize: 13, color: "#444" }}>
            Home <span style={{ color: "#666" }}>›</span> {topic.label}
          </span>
        </div>

        {/* Category header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: 20,
          background: hexAlpha(color, 0.06),
          border: `0.5px solid ${hexAlpha(color, 0.18)}`,
          borderRadius: 16,
          marginBottom: 32,
          position: "relative", overflow: "hidden",
        }}>
          {/* Accent bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, ${hexAlpha(color, 0.6)}, ${color})`,
          }} />
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: hexAlpha(color, 0.15),
            border: `1px solid ${hexAlpha(color, 0.25)}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, flexShrink: 0,
          }}>
            {topic.icon}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 500, color: "#fff", marginBottom: 3 }}>{topic.label}</div>
            <div style={{ fontSize: 13, color: "#888" }}>{topic.desc}</div>
          </div>
        </div>

        {/* Subtopics / Custom input */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 11, fontWeight: 500, letterSpacing: "0.07em",
            color: "#555", textTransform: "uppercase" as const, marginBottom: 12,
          }}>
            {isCustom ? "What do you want to study?" : "Subtopics — pick one or more"}
          </div>

          {isCustom ? (
            <input
              type="text"
              placeholder="Enter any topic — e.g. French Revolution, Quantum Computing…"
              value={customTopic}
              onChange={e => setCustomTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleStart()}
              data-testid="custom-topic-input"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: `1.5px solid ${hexAlpha(color, 0.3)}`,
                borderRadius: 12, padding: "12px 16px",
                fontSize: 15, color: "#e8e8f0",
                fontFamily: "inherit", outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = color)}
              onBlur={e => (e.currentTarget.style.borderColor = hexAlpha(color, 0.3))}
            />
          ) : (
            <>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
                {topic.subcategories.map(sub => {
                  const active = selectedSubs.has(sub);
                  return (
                    <button
                      key={sub}
                      onClick={() => toggleSub(sub)}
                      data-testid={`sub-${sub}`}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "9px 16px",
                        background: active ? hexAlpha(color, 0.14) : "rgba(255,255,255,0.04)",
                        border: `0.5px solid ${active ? hexAlpha(color, 0.45) : "rgba(255,255,255,0.1)"}`,
                        borderRadius: 20,
                        fontSize: 13, color: active ? color : "#888",
                        cursor: "pointer", transition: "all 0.15s",
                        fontFamily: "inherit",
                      }}
                    >
                      <span>{sub}</span>
                      {active && (
                        <span style={{
                          width: 16, height: 16, borderRadius: "50%",
                          background: hexAlpha(color, 0.25),
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, color,
                        }}>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 12, color, marginTop: 8, minHeight: 18 }}>
                {selectedSubs.size === 0
                  ? "No subtopics selected"
                  : `${selectedSubs.size} subtopic${selectedSubs.size > 1 ? "s" : ""} selected`}
              </div>
            </>
          )}
        </div>

        {/* Card count */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 11, fontWeight: 500, letterSpacing: "0.07em",
            color: "#555", textTransform: "uppercase" as const, marginBottom: 12,
          }}>
            Number of cards
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {COUNT_OPTS.map(opt => {
              const active = cardCount === opt.n;
              return (
                <button
                  key={opt.n}
                  onClick={() => setCardCount(opt.n)}
                  data-testid={`count-${opt.n}`}
                  style={{
                    padding: "12px 8px",
                    background: active ? hexAlpha(color, 0.14) : "rgba(255,255,255,0.04)",
                    border: `0.5px solid ${active ? hexAlpha(color, 0.45) : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 12,
                    textAlign: "center", cursor: "pointer",
                    transition: "all 0.15s", fontFamily: "inherit",
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 500, color: active ? color : "#e8eaf0", lineHeight: 1.1, marginBottom: 3 }}>
                    {opt.n}
                  </div>
                  <div style={{ fontSize: 11, color: active ? hexAlpha(color, 0.75) : "#555" }}>
                    {opt.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Estimate */}
          {!isCustom && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 16px",
              background: "rgba(255,255,255,0.03)",
              border: "0.5px solid rgba(255,255,255,0.06)",
              borderRadius: 10, marginTop: 10,
            }}>
              <span style={{ fontSize: 14 }}>⏱</span>
              <span style={{ fontSize: 12, color: "#666" }}>
                About <strong style={{ color: "#888", fontWeight: 500 }}>{mins}–{maxMins} min</strong>
                {" · "}{cardCount} cards
                {activeSubs.length > 0 && ` across ${activeSubs.length} subtopic${activeSubs.length > 1 ? "s" : ""}`}
                {shuffle ? " · shuffled" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: "0.5px", background: "rgba(255,255,255,0.06)", margin: "0 0 28px" }} />

        {/* Generate row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#888", marginBottom: 2 }}>
              {canStart
                ? isCustom
                  ? `Generating for: ${customTopic}`
                  : `${cardCount} cards · ${subNames}`
                : "Select at least one subtopic"}
            </div>
            <div style={{ fontSize: 13, color: "#555" }}>
              Ready to generate with {model.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")}
            </div>
            {/* Shuffle toggle */}
            {!isCustom && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
                <div
                  onClick={() => setShuffle(s => !s)}
                  style={{
                    width: 32, height: 18,
                    background: shuffle ? hexAlpha(color, 0.3) : "rgba(255,255,255,0.1)",
                    border: `0.5px solid ${shuffle ? hexAlpha(color, 0.4) : "rgba(255,255,255,0.15)"}`,
                    borderRadius: 9, position: "relative", cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: shuffle ? color : "#666",
                    position: "absolute", top: 2,
                    left: shuffle ? 16 : 2,
                    transition: "left 0.2s, background 0.2s",
                  }} />
                </div>
                <span style={{ fontSize: 12, color: "#444" }}>Shuffle cards</span>
              </div>
            )}
          </div>

          <button
            onClick={handleStart}
            disabled={!canStart}
            data-testid="generate-btn"
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: canStart ? color : "rgba(255,255,255,0.06)",
              color: canStart ? "#fff" : "#444",
              border: "none", borderRadius: 12,
              padding: "13px 24px",
              fontSize: 14, fontWeight: 500,
              cursor: canStart ? "pointer" : "not-allowed",
              whiteSpace: "nowrap", flexShrink: 0,
              fontFamily: "inherit",
              opacity: canStart ? 1 : 0.6,
              transition: "opacity 0.15s, transform 0.1s",
            }}
          >
            {canStart ? `Generate ${cardCount} cards →` : "Select a subtopic to continue"}
          </button>
        </div>

      </div>
    </div>
  );
}
