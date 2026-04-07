import TopicPicker from "@/components/TopicPicker";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] bg-grid">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center text-sm shadow-lg">
              🃏
            </div>
            <span className="text-xl font-bold gradient-text">FlipDAI</span>
          </div>
          <nav className="flex gap-6 text-sm">
            <Link href="/history" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              History
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-10">
        <div className="text-center mb-14 fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border-bright)] bg-[var(--bg-card)] text-xs text-[var(--text-secondary)] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse"></span>
            Powered by Claude AI
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-[var(--text-primary)] mb-5 leading-tight tracking-tight">
            Study Smarter with{" "}
            <span className="gradient-text">AI Flash Cards</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Pick a topic, generate cards instantly, and study with keyboard shortcuts, voice support, and progress tracking.
          </p>
        </div>

        <TopicPicker />

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-20">
          {[
            { icon: "🤖", label: "AI Generated", desc: "Cards tailored to your topic" },
            { icon: "🔊", label: "Voice Enabled", desc: "Read cards aloud hands-free" },
            { icon: "⌨️", label: "Keyboard First", desc: "Fast study with shortcuts" },
            { icon: "📊", label: "Progress Tracking", desc: "Know what you know" },
          ].map((f, i) => (
            <div
              key={f.label}
              className="glass rounded-2xl p-5 text-center hover:border-[var(--border-bright)] transition-all duration-200 group"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-200">{f.icon}</div>
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">{f.label}</div>
              <div className="text-xs text-[var(--text-secondary)]">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
