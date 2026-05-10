import type { RiskMetrics } from "@/lib/types";

const METRICS: { key: keyof RiskMetrics; label: string; format: (v: number) => string; color?: (v: number) => string }[] = [
  { key: "totalReturn", label: "Total Return", format: (v) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`, color: (v) => (v >= 0 ? "text-[var(--buy)]" : "text-[var(--sell)]") },
  { key: "annualReturn", label: "Annual Return", format: (v) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`, color: (v) => (v >= 0 ? "text-[var(--buy)]" : "text-[var(--sell)]") },
  { key: "sharpeRatio", label: "Sharpe Ratio", format: (v) => v.toFixed(2), color: (v) => (v >= 1 ? "text-[var(--buy)]" : v >= 0.5 ? "text-[var(--foreground)]" : "text-[var(--sell)]") },
  { key: "maxDrawdown", label: "Max Drawdown", format: (v) => `${v.toFixed(2)}%`, color: (v) => (v > -15 ? "text-[var(--buy)]" : v > -25 ? "text-[var(--foreground)]" : "text-[var(--sell)]") },
  { key: "calmarRatio", label: "Calmar Ratio", format: (v) => v.toFixed(2) },
  { key: "winRate", label: "Win Rate", format: (v) => `${v.toFixed(1)}%`, color: (v) => (v >= 50 ? "text-[var(--buy)]" : "text-[var(--foreground)]") },
  { key: "profitFactor", label: "Profit Factor", format: (v) => v.toFixed(2), color: (v) => (v >= 1.5 ? "text-[var(--buy)]" : v >= 1 ? "text-[var(--foreground)]" : "text-[var(--sell)]") },
];

export function RiskMetricsCard({ metrics }: { metrics: RiskMetrics }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {METRICS.map(({ key, label, format, color }) => {
        const value = metrics[key];
        return (
          <div
            key={key}
            className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/30"
          >
            <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1">
              {label}
            </div>
            <div className={`text-lg font-bold font-mono ${color ? color(value) : "text-[var(--foreground)]"}`}>
              {format(value)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
