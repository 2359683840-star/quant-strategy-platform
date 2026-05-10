// ── Node Types ──
export type NodeCategory = "data" | "indicator" | "signal" | "logic" | "action" | "output";

export interface StrategyNode {
  id: string;
  type: NodeCategory;
  label: string;
  params: Record<string, number | string | boolean>;
}

export interface StrategyEdge {
  id?: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface StrategyConfig {
  id?: string;
  name: string;
  description: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  nodes: StrategyNode[];
  edges: StrategyEdge[];
}

// ── Backtest Results ──
export interface Trade {
  entryDate: string;
  exitDate: string;
  side: "long" | "short";
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPct: number;
  holdingDays: number;
}

export interface RiskMetrics {
  totalReturn: number;
  annualReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  calmarRatio: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
}

export interface YearlyReturn {
  year: number;
  return: number;
  benchmark: number;
}

export interface MonthlyReturn {
  year: number;
  month: number;
  return: number;
}

export interface NarrativeInsight {
  type: "warning" | "positive" | "neutral" | "info";
  title: string;
  description: string;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  equityCurve: { date: string; value: number }[];
  drawdownCurve: { date: string; value: number }[];
  trades: Trade[];
  metrics: RiskMetrics;
  yearlyReturns: YearlyReturn[];
  monthlyReturns: MonthlyReturn[];
  insights: NarrativeInsight[];
}

// ── Template ──
export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: "trend" | "mean-reversion" | "momentum" | "arbitrage" | "custom";
  difficulty: "beginner" | "intermediate" | "advanced";
  config: StrategyConfig;
  sampleResult?: BacktestResult;
  author: string;
  stars: number;
  usageCount: number;
  createdAt: string;
}
