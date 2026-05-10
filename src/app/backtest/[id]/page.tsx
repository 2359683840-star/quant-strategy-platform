"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Info } from "lucide-react";
import { EquityCurveChart } from "@/components/backtest/EquityCurveChart";
import { RiskMetricsCard } from "@/components/backtest/RiskMetricsCard";
import { YearlyReturns, MonthlyHeatmap } from "@/components/backtest/YearlyReturns";
import { useEditorStore } from "@/lib/store";
import { getSampleResult } from "@/lib/api";
import type { BacktestResult } from "@/lib/types";

const insightIcons = {
  positive: TrendingUp,
  warning: AlertTriangle,
  neutral: Info,
  info: Info,
};
const insightColors = {
  positive: "border-l-[var(--buy)] bg-[var(--buy)]/5",
  warning: "border-l-[var(--sell)] bg-[var(--sell)]/5",
  neutral: "border-l-[var(--muted)] bg-[var(--muted)]/5",
  info: "border-l-[var(--accent)] bg-[var(--accent)]/5",
};

export default function BacktestPage() {
  const { id } = useParams<{ id: string }>();
  const storeResult = useEditorStore((s) => s.backtestResult);
  const [sampleResult, setSampleResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeResult) {
      setLoading(false);
      return;
    }
    getSampleResult().then((r) => {
      setSampleResult(r);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [storeResult]);

  const result = storeResult || sampleResult;

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[var(--muted)]">Loading backtest results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[var(--muted)] mb-4">No backtest results to display.</p>
          <Link href="/editor" className="text-sm text-[var(--accent)] hover:underline no-underline">
            Run a backtest first →
          </Link>
        </div>
      </div>
    );
  }

  const winnerCount = result.trades.filter((t) => t.pnl > 0).length;
  const loserCount = result.trades.length - winnerCount;

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/30">
        <div className="max-w-6xl mx-auto px-8 py-5">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/editor" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors no-underline">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[var(--foreground)]">
                Backtest Results
              </h1>
              <p className="text-xs text-[var(--muted)]">Strategy #{id?.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
            <span>{result.trades.length} trades</span>
            <span className="text-[var(--buy)]">{winnerCount} wins</span>
            <span className="text-[var(--sell)]">{loserCount} losses</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 space-y-8">
        {/* Risk Metrics */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Risk & Performance</h2>
          <RiskMetricsCard metrics={result.metrics} />
        </section>

        {/* Equity Curve */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Equity Curve</h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/20 overflow-hidden">
            <EquityCurveChart data={result.equityCurve} />
          </div>
        </section>

        {/* Drawdown */}
        {result.drawdownCurve.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Drawdown</h2>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/20 overflow-hidden">
              <EquityCurveChart
                data={result.drawdownCurve.map((d) => ({ date: d.date, value: d.value }))}
              />
            </div>
          </section>
        )}

        {/* Yearly + Monthly */}
        <div className="grid grid-cols-2 gap-8">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/20 p-5">
            <YearlyReturns data={result.yearlyReturns} />
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/20 p-5">
            <MonthlyHeatmap data={result.monthlyReturns} />
          </div>
        </div>

        {/* Narrative Insights */}
        {result.insights.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Analysis & Insights</h2>
            <div className="space-y-2">
              {result.insights.map((insight, i) => {
                const Icon = insightIcons[insight.type] || Info;
                const colorClass = insightColors[insight.type] || insightColors.info;
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-4 rounded-lg border border-[var(--border)] border-l-2 ${colorClass}`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--muted)]" />
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--foreground)] mb-0.5">
                        {insight.title}
                      </h4>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Trade List */}
        {result.trades.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">
              Trade History ({result.trades.length})
            </h2>
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[var(--surface)]/50 border-b border-[var(--border)]">
                    <tr>
                      <th className="text-left py-2.5 px-4 text-[var(--muted)] font-medium">Entry</th>
                      <th className="text-left py-2.5 px-4 text-[var(--muted)] font-medium">Exit</th>
                      <th className="text-center py-2.5 px-4 text-[var(--muted)] font-medium">Side</th>
                      <th className="text-right py-2.5 px-4 text-[var(--muted)] font-medium">Entry $</th>
                      <th className="text-right py-2.5 px-4 text-[var(--muted)] font-medium">Exit $</th>
                      <th className="text-right py-2.5 px-4 text-[var(--muted)] font-medium">P&L</th>
                      <th className="text-right py-2.5 px-4 text-[var(--muted)] font-medium">Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.trades.slice(0, 50).map((t, i) => (
                      <tr
                        key={i}
                        className="border-b border-[var(--border)]/50 hover:bg-[var(--surface)]/30 transition-colors"
                      >
                        <td className="py-2 px-4 text-[var(--foreground)] font-mono">{t.entryDate}</td>
                        <td className="py-2 px-4 text-[var(--foreground)] font-mono">{t.exitDate}</td>
                        <td className={`py-2 px-4 text-center font-medium ${t.side === "long" ? "text-[var(--buy)]" : "text-[var(--sell)]"}`}>
                          {t.side}
                        </td>
                        <td className="py-2 px-4 text-right text-[var(--foreground)] font-mono">{t.entryPrice.toFixed(2)}</td>
                        <td className="py-2 px-4 text-right text-[var(--foreground)] font-mono">{t.exitPrice.toFixed(2)}</td>
                        <td className={`py-2 px-4 text-right font-mono font-medium ${t.pnl >= 0 ? "text-[var(--buy)]" : "text-[var(--sell)]"}`}>
                          {t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)}
                          <span className="text-[10px] ml-0.5">({t.pnlPct >= 0 ? "+" : ""}{t.pnlPct.toFixed(2)}%)</span>
                        </td>
                        <td className="py-2 px-4 text-right text-[var(--muted)]">{t.holdingDays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <Link
            href="/editor"
            className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors no-underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Edit Strategy
          </Link>
          <Link
            href="/templates"
            className="text-xs text-[var(--accent)] hover:underline no-underline"
          >
            Browse more templates →
          </Link>
        </div>
      </div>
    </div>
  );
}
