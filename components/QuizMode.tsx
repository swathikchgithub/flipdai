"use client";

import { useState } from "react";
import { FlashCard } from "@/lib/flashcard-types";

interface QuizModeProps {
  card: FlashCard;
  choices: string[];
  onAnswer: (correct: boolean) => void;
}

export default function QuizMode({ card, choices, onAnswer }: QuizModeProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (choice: string) => {
    if (revealed) return;
    setSelected(choice);
    setRevealed(true);
    const correct = choice === card.back;
    setTimeout(() => onAnswer(correct), 1000);
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
        <p className="text-lg font-semibold text-[var(--text-primary)]">{card.front}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {choices.map((choice, i) => {
          let className = "p-4 rounded-xl border text-left transition-all text-sm ";
          if (!revealed) {
            className += "border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-card-hover)] cursor-pointer text-[var(--text-primary)]";
          } else if (choice === card.back) {
            className += "border-green-500 bg-green-500/20 text-green-300 cursor-default";
          } else if (choice === selected) {
            className += "border-red-500 bg-red-500/20 text-red-300 cursor-default";
          } else {
            className += "border-[var(--border)] bg-[var(--bg-secondary)] opacity-50 cursor-default text-[var(--text-secondary)]";
          }

          return (
            <button key={i} className={className} onClick={() => handleSelect(choice)}>
              <span className="font-medium mr-2 text-[var(--accent)]">{String.fromCharCode(65 + i)}.</span>
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
