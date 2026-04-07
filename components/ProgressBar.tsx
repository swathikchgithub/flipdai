"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  known: number;
  review: number;
  skipped: number;
}

export default function ProgressBar({ current, total, known, review, skipped }: ProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-[var(--text-secondary)]">
        <span>Card {current} of {total}</span>
        <div className="flex gap-4">
          <span className="text-[var(--green)]">✅ {known}</span>
          <span className="text-[var(--red)]">❌ {review}</span>
          <span className="text-[var(--text-secondary)]">⏭ {skipped}</span>
        </div>
      </div>
      <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
