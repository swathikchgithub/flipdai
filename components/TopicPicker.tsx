"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TOPICS } from "@/config/topics";
import { v4 as uuidv4 } from "uuid";

interface TopicPickerProps {
  selectedModel: string;
}

const THEME: Record<string, { color: string }> = {
  "job-interviews": { color: "#5b9cf6" },
  "sat-prep":       { color: "#8b6fe0" },
  "ap-exams":       { color: "#d9943a" },
  "certifications": { color: "#2ab888" },
  "languages":      { color: "#c44f78" },
  "sciences":       { color: "#58a828" },
  "tech-topics":    { color: "#c85c35" },
  "custom":         { color: "#5b9cf6" },
};

const ICONS: Record<string, React.ReactNode> = {
  "job-interviews": (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 12h20"/>
    </svg>
  ),
  "sat-prep": (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  "ap-exams": (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  "certifications": (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  "languages": (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  "sciences": (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
    </svg>
  ),
  "tech-topics": (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  "custom": (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
};

function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const COUNT_OPTIONS = [
  { value: 5,  label: "5",  sub: "Quick" },
  { value: 10, label: "10", sub: "Standard" },
  { value: 25, label: "25", sub: "Deep dive" },
  { value: 50, label: "50", sub: "Marathon" },
];

export default function TopicPicker({ selectedModel }: TopicPickerProps) {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [cardCount, setCardCount] = useState(10);
  const [customText, setCustomText] = useState("");

  const topic = TOPICS.find(t => t.id === selectedTopic);
  const isCustom = selectedTopic === "custom";
  const canGenerate = selectedTopic && (isCustom ? customText.trim().length > 0 : !!selectedSub);

  const handleGenerate = () => {
    if (!canGenerate) return;
    const sid = uuidv4();
    const sub = isCustom ? customText.trim() : selectedSub!;
    router.push(`/study/${sid}?topic=${selectedTopic}&sub=${encodeURIComponent(sub)}&count=${cardCount}&model=${encodeURIComponent(selectedModel)}`);
  };

  const handleTopicClick = (id: string) => {
    if (selectedTopic === id) {
      setSelectedTopic(null);
      setSelectedSub(null);
    } else {
      setSelectedTopic(id);
      setSelectedSub(null);
      setCustomText("");
    }
  };

  return (
    <div>
      {/* Section label */}
      <div style={{
        fontSize: 11, fontWeight: 500, letterSpacing: "0.08em",
        color: "#484848", textTransform: "uppercase",
        marginBottom: 14, paddingLeft: 2,
      }}>
        Choose a Category
      </div>

      {/* Topic grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
        marginBottom: selectedTopic ? 16 : 0,
      }}>
        {TOPICS.map((t) => {
          const th = THEME[t.id] || THEME["custom"];
          const isSelected = selectedTopic === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleTopicClick(t.id)}
              data-testid={`topic-${t.id}`}
              aria-label={t.id === "custom" ? "Custom Topic" : t.label}
              style={{
                position: "relative",
                background: isSelected ? hexAlpha(th.color, 0.08) : "rgba(255,255,255,0.038)",
                border: isSelected
                  ? `0.5px solid ${hexAlpha(th.color, 0.5)}`
                  : "0.5px solid rgba(255,255,255,0.075)",
                borderRadius: 14,
                overflow: "hidden",
                cursor: "pointer",
                display: "flex", flexDirection: "column",
                padding: 18,
                textAlign: "left",
                transition: "background 0.15s, border-color 0.15s, transform 0.12s",
              }}
            >
              {/* Accent bar */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: 2, background: th.color, opacity: isSelected ? 1 : 0.75,
                borderRadius: "14px 14px 0 0",
              }} />

              {/* Icon */}
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: hexAlpha(th.color, 0.13), color: th.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 12, flexShrink: 0,
              }}>
                {ICONS[t.id]}
              </div>

              <div style={{ fontSize: 14, fontWeight: 500, color: "#dde0ea", marginBottom: 3 }}>
                {t.id === "custom" ? "Custom Topic" : t.label}
              </div>
              <div style={{ fontSize: 12, color: "#565a66", lineHeight: 1.45, flex: 1, marginBottom: 14 }}>
                {t.desc}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 6,
                  background: hexAlpha(th.color, 0.12), color: th.color,
                }}>
                  {t.id === "custom" ? "Any topic" : `${t.subcategories.length} subtopics`}
                </span>
                <span style={{ fontSize: 14, color: isSelected ? th.color : "#383c47" }}>
                  {isSelected ? "✓" : "→"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Subcategory + Generate section ── */}
      {selectedTopic && (
        <div style={{
          background: "rgba(255,255,255,0.025)",
          border: "0.5px solid rgba(255,255,255,0.08)",
          borderRadius: 14, padding: "20px 22px",
          marginBottom: 0,
          animation: "fadeIn 0.2s ease-out",
        }}>

          {isCustom ? (
            /* Custom topic input */
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", color: "#484848", textTransform: "uppercase", marginBottom: 12 }}>
                Your Topic
              </div>
              <input
                type="text"
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="Enter any topic — e.g. Byzantine history, React hooks, options trading…"
                onKeyDown={e => { if (e.key === "Enter" && canGenerate) handleGenerate(); }}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                  borderRadius: 9, padding: "10px 14px",
                  fontSize: 13, color: "#c0c4d0",
                  fontFamily: "inherit", outline: "none",
                  marginBottom: 16,
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(91,156,246,0.45)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
              />
            </div>
          ) : (
            /* Subcategory pills */
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", color: "#484848", textTransform: "uppercase", marginBottom: 12 }}>
                Subcategory
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {topic?.subcategories.map(sub => {
                  const th = THEME[selectedTopic] || THEME["custom"];
                  const isActive = selectedSub === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => setSelectedSub(isActive ? null : sub)}
                      aria-label={sub}
                      style={{
                        padding: "7px 16px", borderRadius: 100, fontSize: 13,
                        fontWeight: isActive ? 500 : 400,
                        background: isActive ? hexAlpha(th.color, 0.15) : "rgba(255,255,255,0.05)",
                        border: isActive ? `0.5px solid ${hexAlpha(th.color, 0.45)}` : "0.5px solid rgba(255,255,255,0.1)",
                        color: isActive ? th.color : "#8892a4",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      {isActive ? "✓ " : ""}{sub}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Card count selector */}
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", color: "#484848", textTransform: "uppercase", marginBottom: 10 }}>
            Number of Cards
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 18 }}>
            {COUNT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setCardCount(opt.value)}
                aria-label={String(opt.value)}
                style={{
                  padding: "12px 8px", borderRadius: 10, textAlign: "center",
                  background: cardCount === opt.value ? "rgba(91,156,246,0.12)" : "rgba(255,255,255,0.04)",
                  border: cardCount === opt.value ? "0.5px solid rgba(91,156,246,0.4)" : "0.5px solid rgba(255,255,255,0.08)",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: cardCount === opt.value ? "#5b9cf6" : "#9098a8" }}>
                  {opt.label}
                </div>
                <div aria-hidden="true" style={{ fontSize: 10, color: cardCount === opt.value ? "#5b9cf6" : "#454a56", marginTop: 2 }}>
                  {opt.sub}
                </div>
              </button>
            ))}
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            aria-label={canGenerate ? `Generate ${cardCount} Flash Cards` : "Generate Flash Cards"}
            disabled={!canGenerate}
            style={{
              width: "100%", padding: "13px 24px",
              borderRadius: 11, fontSize: 14, fontWeight: 600,
              background: canGenerate ? "#5b9cf6" : "rgba(255,255,255,0.05)",
              color: canGenerate ? "#fff" : "#454a56",
              border: canGenerate ? "none" : "0.5px solid rgba(255,255,255,0.08)",
              cursor: canGenerate ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (canGenerate) e.currentTarget.style.background = "#4a8ce0"; }}
            onMouseLeave={e => { if (canGenerate) e.currentTarget.style.background = "#5b9cf6"; }}
          >
{canGenerate ? `Generate ${cardCount} Flash Cards →` : "Generate Flash Cards →"}
          </button>
        </div>
      )}
    </div>
  );
}
