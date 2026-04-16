"use client";

import React, { useState } from "react";

export default function HelpGuide() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsVisible(true)}
          className="text-xs font-medium px-4 py-2 rounded-xl transition-all hover:bg-white/10"
          style={{ 
            background: "rgba(255,255,255,0.03)", 
            border: "0.5px solid rgba(255,255,255,0.12)",
            color: "#8892a4"
          }}
        >
          ❓ How to use
        </button>
      </div>
    );
  }

  return (
    <div 
      className="mb-10 rounded-3xl overflow-hidden relative fade-in"
      style={{ 
        background: "rgba(255,255,255,0.02)", 
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)"
      }}
    >
      <div className="p-8">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <span className="text-xl">✨</span>
            <h2 className="text-xl font-bold text-[#e0e2ea] tracking-tight">Mastering the Interface</h2>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{ color: "#606080" }}
          >
            ✕ Got it
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold" 
                    style={{ background: "rgba(124, 111, 255, 0.15)", color: "#7c6fff", border: "1px solid rgba(124, 111, 255, 0.3)" }}>
                1
              </span>
              <span className="text-base font-bold text-white">🎯 Pick a Topic</span>
            </div>
            <p className="text-sm leading-relaxed text-[#8892a4]">
              Select from curated categories or enter a custom topic. AI will craft a personalized deck in seconds.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold" 
                    style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
                2
              </span>
              <span className="text-base font-bold text-white">🎙️ Set Preferences</span>
            </div>
            <p className="text-sm leading-relaxed text-[#8892a4]">
              Choose between Flashcards or Quiz mode. Toggle <span className="text-white">Voice ON</span> to hear cards read aloud.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold" 
                    style={{ background: "rgba(42, 184, 136, 0.15)", color: "#2ab888", border: "1px solid rgba(42, 184, 136, 0.3)" }}>
                3
              </span>
              <span className="text-base font-bold text-white">⌨️ Interaction</span>
            </div>
            <p className="text-sm leading-relaxed text-[#8892a4]">
              Click cards or use <kbd className="guide-kbd">Space</kbd> to flip. Use the <span className="text-white">Mic 🎤</span> to speak your answers for AI feedback.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold" 
                    style={{ background: "rgba(139, 111, 224, 0.15)", color: "#8b6fe0", border: "1px solid rgba(139, 111, 224, 0.3)" }}>
                4
              </span>
              <span className="text-base font-bold text-white">📈 Track Mastery</span>
            </div>
            <p className="text-sm leading-relaxed text-[#8892a4]">
              Rate items you know or need to review. Check your progress in history to see your scores improve over time.
            </p>
          </div>
        </div>

        <div className="mt-12 flex justify-between items-center border-t border-white/5 pt-6">
          <div className="flex items-center gap-2 text-xs text-[#565a6a]">
            <span className="flex w-1.5 h-1.5 rounded-full bg-[#f87171]" />
            💡 Switch to Quiz Mode for multiple choice practice
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="px-6 py-2.5 rounded-xl font-bold transition-all btn-glow"
            style={{ background: "linear-gradient(135deg, #7c6fff, #38bdf8)", color: "#fff", fontSize: 13 }}
          >
            Got it, let's learn! →
          </button>
        </div>
      </div>

      <style jsx>{`
        .guide-kbd {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 4px;
          padding: 0px 4px;
          font-family: monospace;
          font-size: 11px;
          color: #e0e2ea;
        }
      `}</style>
    </div>
  );
}
