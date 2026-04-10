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
    <div className="grid grid-cols-4 gap-2 text-center">
      {[
        { value: known,   label: "Known",   color: "#34d399" },
        { value: review,  label: "Review",  color: "#f87171" },
        { value: skipped, label: "Skipped", color: "#606080" },
        { value: `${score}%`, label: "Score", color: "#7c6fff" },
      ].map(({ value, label, color }) => (
        <div
          key={label}
          className="rounded-xl py-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="text-lg font-bold" style={{ color }}>{value}</div>
          <div className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "#404058" }}>{label}</div>
        </div>
      ))}
    </div>
  );
}
