import type { StrategyConfig, BacktestResult } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function runBacktest(config: StrategyConfig): Promise<BacktestResult> {
  const res = await fetch(`${API_BASE}/api/backtest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: config.name,
      description: config.description,
      symbol: config.symbol,
      timeframe: config.timeframe,
      start_date: config.startDate,
      end_date: config.endDate,
      data_source: config.dataSource ?? "yfinance",
      nodes: config.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        label: n.label,
        params: n.params,
      })),
      edges: config.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        source_handle: e.sourceHandle,
        target_handle: e.targetHandle,
      })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Backtest failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  const data = await res.json();

  // Map Python snake_case to TypeScript camelCase
  return {
    id: data.id,
    strategyId: data.strategy_id,
    equityCurve: data.equity_curve?.map((p: { date: string; value: number }) => ({
      date: p.date,
      value: p.value,
    })) ?? [],
    drawdownCurve: data.drawdown_curve?.map((p: { date: string; value: number }) => ({
      date: p.date,
      value: p.value,
    })) ?? [],
    trades: data.trades?.map((t: Record<string, unknown>) => ({
      entryDate: t.entry_date as string,
      exitDate: t.exit_date as string,
      side: t.side as string,
      entryPrice: t.entry_price as number,
      exitPrice: t.exit_price as number,
      pnl: t.pnl as number,
      pnlPct: t.pnl_pct as number,
      holdingDays: t.holding_days as number,
    })) ?? [],
    metrics: {
      totalReturn: data.metrics?.total_return ?? 0,
      annualReturn: data.metrics?.annual_return ?? 0,
      sharpeRatio: data.metrics?.sharpe_ratio ?? 0,
      maxDrawdown: data.metrics?.max_drawdown ?? 0,
      calmarRatio: data.metrics?.calmar_ratio ?? 0,
      winRate: data.metrics?.win_rate ?? 0,
      avgWin: data.metrics?.avg_win ?? 0,
      avgLoss: data.metrics?.avg_loss ?? 0,
      profitFactor: data.metrics?.profit_factor ?? 0,
    },
    yearlyReturns: data.yearly_returns?.map((y: Record<string, unknown>) => ({
      year: y.year as number,
      return: y.return_value as number,
      benchmark: (y as { benchmark?: number }).benchmark ?? 0,
    })) ?? [],
    monthlyReturns: data.monthly_returns?.map((m: Record<string, unknown>) => ({
      year: m.year as number,
      month: m.month as number,
      return: m.return_value as number,
    })) ?? [],
    insights: data.insights?.map((i: Record<string, unknown>) => ({
      type: i.type as string,
      title: i.title as string,
      description: i.description as string,
    })) ?? [],
  };
}

export async function getSampleResult(): Promise<BacktestResult> {
  const res = await fetch(`${API_BASE}/api/backtest/sample`);
  if (!res.ok) throw new Error("Failed to fetch sample");
  const data = await res.json();
  return {
    id: data.id,
    strategyId: data.strategy_id,
    equityCurve: data.equity_curve?.map((p: { date: string; value: number }) => ({
      date: p.date,
      value: p.value,
    })) ?? [],
    drawdownCurve: data.drawdown_curve?.map((p: { date: string; value: number }) => ({
      date: p.date,
      value: p.value,
    })) ?? [],
    trades: data.trades?.map((t: Record<string, unknown>) => ({
      entryDate: t.entry_date as string,
      exitDate: t.exit_date as string,
      side: t.side as string,
      entryPrice: t.entry_price as number,
      exitPrice: t.exit_price as number,
      pnl: t.pnl as number,
      pnlPct: t.pnl_pct as number,
      holdingDays: t.holding_days as number,
    })) ?? [],
    metrics: {
      totalReturn: data.metrics?.total_return ?? 0,
      annualReturn: data.metrics?.annual_return ?? 0,
      sharpeRatio: data.metrics?.sharpe_ratio ?? 0,
      maxDrawdown: data.metrics?.max_drawdown ?? 0,
      calmarRatio: data.metrics?.calmar_ratio ?? 0,
      winRate: data.metrics?.win_rate ?? 0,
      avgWin: data.metrics?.avg_win ?? 0,
      avgLoss: data.metrics?.avg_loss ?? 0,
      profitFactor: data.metrics?.profit_factor ?? 0,
    },
    yearlyReturns: data.yearly_returns?.map((y: Record<string, unknown>) => ({
      year: y.year as number,
      return: y.return_value as number,
      benchmark: (y as { benchmark?: number }).benchmark ?? 0,
    })) ?? [],
    monthlyReturns: data.monthly_returns?.map((m: Record<string, unknown>) => ({
      year: m.year as number,
      month: m.month as number,
      return: m.return_value as number,
    })) ?? [],
    insights: data.insights?.map((i: Record<string, unknown>) => ({
      type: i.type as string,
      title: i.title as string,
      description: i.description as string,
    })) ?? [],
  };
}

// Save/load templates from localStorage (demo-level persistence)
export function saveTemplateToLocal(key: string, config: StrategyConfig): void {
  const existing = JSON.parse(localStorage.getItem("qf_templates") || "{}");
  existing[key] = config;
  localStorage.setItem("qf_templates", JSON.stringify(existing));
}

export function loadTemplatesFromLocal(): Record<string, StrategyConfig> {
  return JSON.parse(localStorage.getItem("qf_templates") || "{}");
}
