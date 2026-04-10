"use client";

import { useRouter } from "next/navigation";
import { TOPICS } from "@/config/topics";

interface TopicPickerProps {
  selectedModel: string;
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

const ICONS: Record<string, React.ReactNode> = {
  "job-interviews": (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/><path d="M2 12h20"/>
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
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
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

export default function TopicPicker({ selectedModel }: TopicPickerProps) {
  const router = useRouter();

  // Separate custom from regular topics
  const regularTopics = TOPICS.filter(t => t.id !== "custom");
  const customTopic = TOPICS.find(t => t.id === "custom");

  return (
    <>
      {/* Section label */}
      <div style={{
        fontSize: 11, fontWeight: 500, letterSpacing: "0.08em",
        color: "#484848", textTransform: "uppercase",
        marginBottom: 14, paddingLeft: 2,
      }}>
        Choose a Category
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
        marginBottom: 10,
      }}>
        {regularTopics.map((t) => {
          const th = THEME[t.id] || THEME["custom"];
          const isWide = t.id === "tech-topics";
          return (
            <button
              key={t.id}
              onClick={() => router.push(`/topic/${t.id}?model=${encodeURIComponent(selectedModel)}`)}
              data-testid={`topic-${t.id}`}
              style={{
                gridColumn: isWide ? "span 2" : undefined,
                position: "relative",
                background: "rgba(255,255,255,0.038)",
                border: "0.5px solid rgba(255,255,255,0.075)",
                borderRadius: 14,
                overflow: "hidden",
                cursor: "pointer",
                display: "flex", flexDirection: "column",
                padding: 18,
                textAlign: "left",
                transition: "background 0.15s, border-color 0.15s, transform 0.12s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.065)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)";
                e.currentTarget.style.transform = "translateY(-2px)";
                const arrow = e.currentTarget.querySelector<HTMLElement>(".cat-arrow");
                if (arrow) arrow.style.color = "#6870a0";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.038)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.075)";
                e.currentTarget.style.transform = "none";
                const arrow = e.currentTarget.querySelector<HTMLElement>(".cat-arrow");
                if (arrow) arrow.style.color = "#383c47";
              }}
            >
              {/* Accent bar */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: 2, background: th.color, opacity: 0.75,
                borderRadius: "14px 14px 0 0",
              }} />

              {/* Icon */}
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: hexAlpha(th.color, 0.13),
                color: th.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 12, flexShrink: 0,
              }}>
                {ICONS[t.id]}
              </div>

              {/* Title */}
              <div style={{ fontSize: 14, fontWeight: 500, color: "#dde0ea", marginBottom: 3 }}>
                {t.label}
              </div>

              {/* Desc */}
              <div style={{ fontSize: 12, color: "#565a66", lineHeight: 1.45, flex: 1, marginBottom: 14 }}>
                {t.desc}
              </div>

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 6,
                  background: hexAlpha(th.color, 0.12), color: th.color,
                }}>
                  {t.subcategories.length} subtopics
                </span>
                <span className="cat-arrow" style={{ fontSize: 14, color: "#383c47", transition: "color 0.15s" }}>→</span>
              </div>
            </button>
          );
        })}

        {/* Custom topic card — full width */}
        {customTopic && (
          <div
            data-testid="topic-custom"
            style={{
              gridColumn: "1 / -1",
              position: "relative",
              background: "rgba(255,255,255,0.038)",
              border: "0.5px solid rgba(255,255,255,0.075)",
              borderRadius: 14,
              overflow: "hidden",
              transition: "border-color 0.15s",
            }}
          >
            {/* Accent bar */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: 2, background: "#5b9cf6", opacity: 0.75,
              borderRadius: "14px 14px 0 0",
            }} />

            <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              {/* Icon */}
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: "rgba(91,156,246,0.13)", color: "#5b9cf6",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {ICONS["custom"]}
              </div>

              {/* Input */}
              <input
                type="text"
                placeholder="Any topic — e.g. Byzantine history, React hooks, options trading…"
                data-testid="custom-topic-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) router.push(`/topic/custom?model=${encodeURIComponent(selectedModel)}&prefill=${encodeURIComponent(val)}`);
                  }
                }}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.09)",
                  borderRadius: 9,
                  padding: "9px 14px",
                  fontSize: 13, color: "#c0c4d0",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = "rgba(91,156,246,0.45)";
                  e.currentTarget.style.background = "rgba(91,156,246,0.04)";
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
              />

              {/* Generate button */}
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  const val = input?.value.trim();
                  if (val) router.push(`/topic/custom?model=${encodeURIComponent(selectedModel)}&prefill=${encodeURIComponent(val)}`);
                  else input?.focus();
                }}
                style={{
                  background: "#5b9cf6", color: "#fff",
                  borderRadius: 9, padding: "9px 18px",
                  fontSize: 13, fontWeight: 500,
                  cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                  border: "none", fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#4a8ce0")}
                onMouseLeave={e => (e.currentTarget.style.background = "#5b9cf6")}
              >
                Generate →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
