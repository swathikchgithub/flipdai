"use client";

interface StudyStatsProps {
  known: number;
  review: number;
  skipped: number;
  total: number;
}

export default function StudyStats({ known, review, skipped, total }: StudyStatsProps) {
  const score = total > 0 ? Math.round((known / total) * 100) : 0;
  return (
    <div className="grid grid-cols-4 gap-3 text-center">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
        <div className="text-2xl font-bold text-[var(--green)]">{known}</div>
        <div className="text-xs text-[var(--text-secondary)]">Known</div>
      </div>
      <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
        <div className="text-2xl font-bold text-[var(--red)]">{review}</div>
        <div className="text-xs text-[var(--text-secondary)]">Review</div>
      </div>
      <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
        <div className="text-2xl font-bold text-[var(--text-secondary)]">{skipped}</div>
        <div className="text-xs text-[var(--text-secondary)]">Skipped</div>
      </div>
      <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
        <div className="text-2xl font-bold text-[var(--accent)]">{score}%</div>
        <div className="text-xs text-[var(--text-secondary)]">Score</div>
      </div>
    </div>
  );
}
