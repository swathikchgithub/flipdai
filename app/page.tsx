"use client";

import { useState } from "react";
import TopicPicker from "@/components/TopicPicker";
import { DEFAULT_MODEL, FLIPDAI_MODELS } from "@/config/flipdai-constants";
import Link from "next/link";
import HelpGuide from "@/components/HelpGuide";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const modelInfo = FLIPDAI_MODELS.find((m) => m.value === selectedModel);

  return (
    <div style={{ minHeight: "100vh", background: "#0e0f13", display: "flex", flexDirection: "column" }}>

      {/* ── Nav ── */}
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
          {/* Logo */}
          <div style={{ fontSize: 17, fontWeight: 600, color: "#fff", letterSpacing: "-0.3px" }}>
            Flip<span style={{ color: "#5b9cf6" }}>DAI</span>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link
              href="/history"
              style={{
                fontSize: 13, color: "#8892a4", textDecoration: "none",
                padding: "5px 10px", borderRadius: 8,
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#e0e2ea")}
              onMouseLeave={e => (e.currentTarget.style.color = "#8892a4")}
            >
              History
            </Link>

            {/* Model selector */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setDropdownOpen((p) => !p)}
                data-testid="model-picker-btn"
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 14px",
                  background: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.11)",
                  borderRadius: 20,
                  fontSize: 13, color: "#aab0be",
                  cursor: "pointer", transition: "background 0.15s",
                }}
              >
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: modelInfo?.color || "#5b9cf6",
                  flexShrink: 0, display: "inline-block",
                }} />
                <span>{modelInfo?.label} · {modelInfo?.provider}</span>
                <span style={{ fontSize: 10, color: "#555", display: "inline-block", transform: dropdownOpen ? "rotate(180deg)" : "none" }}>▾</span>
              </button>

              {dropdownOpen && (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 99 }}
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    minWidth: 220,
                    background: "#1a1d25",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    overflow: "hidden",
                    zIndex: 200,
                  }}>
                    {FLIPDAI_MODELS.map(m => (
                      <div
                        key={m.value}
                        onClick={() => { setSelectedModel(m.value); setDropdownOpen(false); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 9,
                          padding: "10px 14px",
                          fontSize: 13,
                          color: m.value === selectedModel ? "#e8eaf0" : "#b0b4c0",
                          background: m.value === selectedModel ? "rgba(255,255,255,0.05)" : "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.color, flexShrink: 0, display: "inline-block" }} />
                        {m.label}
                        <span style={{ fontSize: 11, color: "#555", marginLeft: "auto" }}>{m.provider}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Page body ── */}
      <div style={{ flex: 1, maxWidth: 920, margin: "0 auto", width: "100%", padding: "0 28px 52px" }}>

        {/* ── Hero ── */}
        <div style={{ textAlign: "center", padding: "48px 0 36px" }}>
          <h1 style={{
            fontSize: 30, fontWeight: 500, color: "#fff",
            letterSpacing: "-0.4px", lineHeight: 1.25, margin: "0 0 8px",
          }}>
            Study Smarter with <span style={{ color: "#5b9cf6" }}>AI Flash Cards</span>
          </h1>
          <p style={{ fontSize: 14, color: "#666" }}>
            Pick a category and start learning in seconds
          </p>
        </div>

        {/* ── Feature pills — appear above CHOOSE A CATEGORY ── */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center",
          marginBottom: 28,
        }}>
          {[
            { label: "8 AI Models", color: "#5b9cf6" },
            { label: "AI Generated", color: "#c85c35" },
            { label: "Voice Enabled", color: "#2ab888" },
            { label: "Keyboard First", color: "#8b6fe0" },
            { label: "Progress Tracking", color: "#d9943a" },
          ].map(p => (
            <span key={p.label} style={{
              fontSize: 12, fontWeight: 500,
              padding: "5px 14px", borderRadius: 100,
              background: `${p.color}14`,
              border: `0.5px solid ${p.color}44`,
              color: p.color,
            }}>
              {p.label}
            </span>
          ))}
        </div>

        {/* ── Help Guide ── */}
        <HelpGuide />

        {/* ── Category grid ── */}
        <TopicPicker selectedModel={selectedModel} />

        {/* ── Feature strip ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8, marginTop: 24,
        }}>
          {[
            {
              title: "AI Powered", sub: "GPT-4o, Claude, Gemini",
              svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="#555" stroke="none"/></svg>,
            },
            {
              title: "Text to Speech", sub: "Hands-free reading",
              svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
            },
            {
              title: "Key Shortcuts", sub: "Space, arrows & shortcuts",
              svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
            },
            {
              title: "Study Stats", sub: "Know what you know",
              svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
            },
          ].map(f => (
            <div key={f.title} style={{
              background: "rgba(255,255,255,0.025)",
              border: "0.5px solid rgba(255,255,255,0.055)",
              borderRadius: 12, padding: "16px 12px", textAlign: "center",
            }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{f.svg}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#9098b0", marginBottom: 2 }}>{f.title}</div>
              <div style={{ fontSize: 11, color: "#565a6a" }}>{f.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <footer style={{
          marginTop: 64, textAlign: "center", borderTop: "0.5px solid rgba(255,255,255,0.06)",
          paddingTop: 32, paddingBottom: 24
        }}>
          <p style={{ fontSize: 13, color: "#606080", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            Powered by 
            <a 
              href="https://antigravity.google/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: "#7c6fff", textDecoration: "none", fontWeight: 600 }}
            >
              Antigravity
            </a> 
            & 
            <a 
              href="https://claude.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: "#d97757", textDecoration: "none", fontWeight: 600 }}
            >
              Claude
            </a>
          </p>
          <div style={{ marginTop: 12, fontSize: 11, color: "#444" }}>
            © {new Date().getFullYear()} FlipDAI • Built with ❤️ by Swathik CH
          </div>
        </footer>
      </div>
    </div>
  );
}
