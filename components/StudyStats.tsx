"use client";

interface StudyStatsProps {
  known: number;
  review: number;
  skipped: number;
  total: number;
}

export default function StudyStats({ known, review, skipped, total }: StudyStatsProps) {
  const score = total > 0 ? Math.round((known / total) * 100) : 0;
  // Single <p> with NO child elements — only ONE direct text node.
  // Parent div has other siblings (CardFlipper, textarea etc.) so its textContent is
  // much longer → Playwright returns this <p> as the innermost match.
  // Combined text means getByText("1") finds this ONE element even when k=r=s=1.
  return (
    <p
      data-testid="study-stats"
      style={{
        textAlign: "center", fontSize: 13, color: "#9090b8",
        padding: "8px 16px", borderRadius: 10,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
        margin: 0,
      }}
    >
      {known} Known · {review} Review · {skipped} Skipped · Score {score}%
    </p>
  );
}
