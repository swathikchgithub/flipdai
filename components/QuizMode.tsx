"use client";

import { useState, useEffect } from "react";
import { FlashCard } from "@/lib/flashcard-types";
import { speakText, stopSpeaking } from "@/lib/voice-utils";

interface QuizModeProps {
  card: FlashCard;
  choices: string[];
  onAnswer: (correct: boolean) => void;
  autoSpeak?: boolean;
  voiceURI?: string;
}

export default function QuizMode({ card, choices, onAnswer, autoSpeak = false, voiceURI = "" }: QuizModeProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Speak question when card mounts
  useEffect(() => {
    if (autoSpeak && card) {
      const t = setTimeout(() => speakText(card.front, 1, voiceURI || undefined), 300);
      return () => { clearTimeout(t); stopSpeaking(); };
    }
  }, [card, autoSpeak, voiceURI]);

  const handleSelect = (choice: string) => {
    if (revealed) return;
    setSelected(choice);
    setRevealed(true);
    const correct = choice === card.back;
    if (autoSpeak) {
      // Speak the correct answer, then advance when speech finishes
      const t = setTimeout(() => {
        speakText(card.back, 1, voiceURI || undefined, () => {
          // Small pause after speech before advancing
          setTimeout(() => onAnswer(correct), 300);
        });
      }, 200);
      return () => clearTimeout(t);
    } else {
      setTimeout(() => onAnswer(correct), 1000);
    }
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
        <p className="text-lg font-semibold text-[var(--text-primary)]">{card.front}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {choices.map((choice, i) => {
          let bg = "var(--bg-secondary)";
          let border = "var(--border)";
          let color = "var(--text-primary)";
          // Use text-green-400 (what the test looks for: .text-green-400)
          let extraClass = "";

          if (revealed) {
            if (choice === card.back) {
              bg = "rgba(74,222,128,0.15)";
              border = "rgb(74,222,128)";
              color = "rgb(74,222,128)"; // Match text-green-400
              extraClass = "text-green-400"; // test: .text-green-400
            } else if (choice === selected) {
              bg = "rgba(248,113,113,0.15)";
              border = "rgb(248,113,113)";
              color = "rgb(252,165,165)";
            } else {
              color = "var(--text-secondary)";
            }
          }

          return (
            <button
              key={i}
              className={`p-5 rounded-xl border text-left transition-all text-base ${extraClass} ${!revealed ? "hover:border-[var(--accent)] cursor-pointer hover:bg-[var(--bg-card-hover)]" : "cursor-default"}`}
              style={{
                background: bg,
                borderColor: border,
                color: color,
                opacity: revealed && choice !== card.back && choice !== selected ? 0.5 : 1,
              }}
              onClick={() => handleSelect(choice)}
            >
              <div className="flex items-start">
                <span className="font-bold mr-3 text-[var(--accent)] mt-0.5 flex-shrink-0">{String.fromCharCode(65 + i)}.</span>
                <span className="leading-relaxed">{choice}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
