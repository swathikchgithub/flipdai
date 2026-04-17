"use client";

import React, { useState } from "react";

export default function HelpGuide() {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setIsVisible(true)}
          className="text-xs font-medium px-5 py-2.5 rounded-2xl transition-all hover:bg-white/10 flex items-center gap-2"
          style={{ 
            background: "rgba(255,255,255,0.03)", 
            border: "0.5px solid rgba(255,255,255,0.12)",
            color: "#8892a4"
          }}
        >
          <span>✨</span>
          <span>How to use FlipDAI</span>
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
            ✕ Close Guide
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {/* Step 1 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold" 
                    style={{ background: "rgba(124, 111, 255, 0.15)", color: "#7c6fff", border: "1px solid rgba(124, 111, 255, 0.3)" }}>
                1
              </span>
              <span className="text-sm font-bold text-white uppercase tracking-wider">Topics</span>
            </div>
            <p className="text-xs leading-relaxed text-[#8892a4]">
              Select a category or enter a custom topic. AI will craft a personalized session in seconds.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold" 
                    style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
                2
              </span>
              <span className="text-sm font-bold text-white uppercase tracking-wider">Modes</span>
            </div>
            <p className="text-xs leading-relaxed text-[#8892a4]">
              Switch between <strong>Flashcards</strong> for memorization or <strong>Mock Interview</strong> for career practice.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold" 
                    style={{ background: "rgba(42, 184, 136, 0.15)", color: "#2ab888", border: "1px solid rgba(42, 184, 136, 0.3)" }}>
                3
              </span>
              <span className="text-sm font-bold text-white uppercase tracking-wider">Audio</span>
            </div>
            <p className="text-xs leading-relaxed text-[#8892a4]">
              Enable <strong>Voice Mode</strong> to talk to the AI. <span className="text-white">Pro-tip:</span> Test your mic and speakers in the setup screen first!
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold" 
                    style={{ background: "rgba(139, 111, 224, 0.15)", color: "#8b6fe0", border: "1px solid rgba(139, 111, 224, 0.3)" }}>
                4
              </span>
              <span className="text-sm font-bold text-white uppercase tracking-wider">Controls</span>
            </div>
            <p className="text-xs leading-relaxed text-[#8892a4]">
              Click cards or use <kbd className="guide-kbd">Space</kbd> to flip. Use the <span className="text-white">Mic 🎤</span> toggle to speak your answers naturally.
            </p>
          </div>

          {/* Step 5 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold" 
                    style={{ background: "rgba(249, 115, 22, 0.15)", color: "#f97316", border: "1px solid rgba(249, 115, 22, 0.3)" }}>
                5
              </span>
              <span className="text-sm font-bold text-white uppercase tracking-wider">History</span>
            </div>
            <p className="text-xs leading-relaxed text-[#8892a4]">
              Track your scores in History. Re-run sessions to master topics you missed before.
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-end items-center border-t border-white/5 pt-6">
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
