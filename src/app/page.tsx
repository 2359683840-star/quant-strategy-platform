import Link from "next/link";
import { SAMPLE_TEMPLATES } from "@/lib/constants";

export default function Home() {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="border-b border-[var(--border)] bg-[var(--surface)]/50">
        <div className="max-w-5xl mx-auto px-8 py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs font-medium text-[var(--accent)] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            No-code quantitative strategy platform
          </div>
          <h1 className="text-5xl font-bold text-[var(--foreground)] leading-tight mb-4 tracking-tight">
            Build & backtest
            <br />
            <span className="text-[var(--accent)]">quantitative strategies</span>
            <br />
            without writing code
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-xl mb-8 leading-relaxed">
            Drag, connect, and backtest. Visual strategy editor for traders who
            think in logic, not in code. From idea to equity curve in minutes.
          </p>
          <div className="flex gap-3">
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent)] text-black font-semibold text-sm hover:brightness-110 transition-all no-underline"
            >
              Create Strategy
              <span className="text-xs opacity-60">→</span>
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--border)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--surface)] transition-all no-underline"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="max-w-5xl mx-auto px-8 py-16">
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              title: "Visual Strategy Editor",
              desc: "Node-based editor inspired by Alteryx & Node-RED. Drag indicators, signals, and actions onto a canvas to compose your strategy.",
            },
            {
              title: "Narrative Backtest Results",
              desc: "Understand why your strategy succeeds or fails. Market regime analysis, drawdown stories, and actionable insights beyond charts.",
            },
            {
              title: "Template Marketplace",
              desc: "Start from proven strategies. Explore community templates, fork and adapt them, or publish your own for others to build upon.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 hover:border-[var(--accent)]/30 transition-colors"
            >
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">{f.title}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample templates */}
      <section className="max-w-5xl mx-auto px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Popular Templates</h2>
          <Link href="/templates" className="text-xs text-[var(--accent)] hover:underline no-underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {SAMPLE_TEMPLATES.map((tpl) => (
            <Link
              key={tpl.id}
              href={`/editor?template=${tpl.id}`}
              className="block p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/30 hover:border-[var(--accent)]/40 hover:bg-[var(--surface)] transition-all no-underline group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">
                  {tpl.category}
                </span>
                <span className="text-[10px] text-[var(--muted)]">{tpl.difficulty}</span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1 group-hover:text-[var(--accent)] transition-colors">
                {tpl.name}
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed mb-3 line-clamp-2">
                {tpl.description}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-[var(--muted)]">
                <span>★ {tpl.stars}</span>
                <span>{tpl.usageCount.toLocaleString()} runs</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
