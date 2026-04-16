"use client";

import React from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative"
        style={{ 
          background: "#16171d", 
          border: "1px solid rgba(255,255,255,0.1)",
          animation: "scaleIn 0.3s ease-out"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold gradient-text">How to Use FlipDAI</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full transition-all hover:bg-white/10"
              style={{ color: "#8892a4" }}
            >
              ✕
            </button>
          </div>

          <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--accent)] mb-3">🃏 Flashcard Mode</h3>
              <ul className="space-y-2 text-sm text-[#a0a8be]">
                <li className="flex gap-3">
                  <span className="text-white">●</span>
                  <span>Click the card or press <kbd className="help-kbd">Space</kbd> to flip and reveal the answer.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-white">●</span>
                  <span>Type your answer in the box and hit <kbd className="help-kbd">⌘</kbd> + <kbd className="help-kbd">Enter</kbd> for AI evaluation.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-white">●</span>
                  <span>Rate your mastery: <kbd className="help-kbd">1</kbd> (Still learning), <kbd className="help-kbd">2</kbd> (Almost), <kbd className="help-kbd">3</kbd> (Got it!).</span>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--accent)] mb-3">❓ Quiz Mode</h3>
              <ul className="space-y-2 text-sm text-[#a0a8be]">
                <li className="flex gap-3">
                  <span className="text-white">●</span>
                  <span>Select the correct option from the list.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-white">●</span>
                  <span>The app will automatically show the correct answer and advance.</span>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--accent)] mb-3">🎙️ Voice & Accessibility</h3>
              <ul className="space-y-2 text-sm text-[#a0a8be]">
                <li className="flex gap-3">
                  <span className="text-white">●</span>
                  <span>Toggle <span className="text-white">Voice ON</span> to have AI read questions and answers aloud.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-white">●</span>
                  <span>Click the microphone <span className="text-white">🎤</span> in the text area to speak your answer instead of typing.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-white">●</span>
                  <span>Use the dropdown to choose from different browser voices and accents.</span>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--accent)] mb-3">⌨️ Keyboard Shortcuts</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center text-xs p-2 rounded bg-white/5">
                  <span className="text-[#a0a8be]">Flip Card</span>
                  <kbd className="help-kbd">Space</kbd>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded bg-white/5">
                  <span className="text-[#a0a8be]">Next Card</span>
                  <kbd className="help-kbd">→</kbd>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded bg-white/5">
                  <span className="text-[#a0a8be]">Prev Card</span>
                  <kbd className="help-kbd">←</kbd>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded bg-white/5">
                  <span className="text-[#a0a8be]">Check Answer</span>
                  <kbd className="help-kbd">⌘+Enter</kbd>
                </div>
              </div>
            </section>
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-8 py-3 rounded-xl font-bold transition-all btn-glow"
            style={{ background: "linear-gradient(135deg, #7c6fff, #38bdf8)", color: "#fff" }}
          >
            Got it!
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .help-kbd {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 4px;
          padding: 1px 4px;
          font-family: monospace;
          color: #e0e2ea;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
