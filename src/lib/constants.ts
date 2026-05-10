import type { NodeCategory, StrategyNode, StrategyTemplate } from "./types";

export const NODE_PALETTE: {
  category: NodeCategory;
  label: string;
  items: Omit<StrategyNode, "id">[];
}[] = [
  {
    category: "data",
    label: "Data",
    items: [
      { type: "data", label: "Price Data", params: { source: "close" } },
      { type: "data", label: "Volume Data", params: {} },
    ],
  },
  {
    category: "indicator",
    label: "Indicators",
    items: [
      { type: "indicator", label: "SMA", params: { period: 20 } },
      { type: "indicator", label: "EMA", params: { period: 20 } },
      { type: "indicator", label: "RSI", params: { period: 14 } },
      { type: "indicator", label: "MACD", params: { fast: 12, slow: 26, signal: 9 } },
      { type: "indicator", label: "Bollinger", params: { period: 20, stddev: 2 } },
    ],
  },
  {
    category: "signal",
    label: "Signals",
    items: [
      { type: "signal", label: "Cross Above", params: {} },
      { type: "signal", label: "Cross Below", params: {} },
      { type: "signal", label: "Greater Than", params: { threshold: 0 } },
      { type: "signal", label: "Less Than", params: { threshold: 0 } },
    ],
  },
  {
    category: "logic",
    label: "Logic",
    items: [
      { type: "logic", label: "AND", params: {} },
      { type: "logic", label: "OR", params: {} },
      { type: "logic", label: "NOT", params: {} },
    ],
  },
  {
    category: "action",
    label: "Actions",
    items: [
      { type: "action", label: "Buy", params: { allocation: 1.0 } },
      { type: "action", label: "Sell", params: { allocation: 1.0 } },
      { type: "action", label: "Position Size", params: { pct: 0.25 } },
    ],
  },
  {
    category: "output",
    label: "Output",
    items: [
      { type: "output", label: "Strategy Output", params: {} },
    ],
  },
];

export const CATEGORY_COLORS: Record<NodeCategory, string> = {
  data: "#6366f1",
  indicator: "#3b82f6",
  signal: "#f59e0b",
  logic: "#8b5cf6",
  action: "#10b981",
  output: "#ec4899",
};

export const CATEGORY_BG: Record<NodeCategory, string> = {
  data: "rgba(99,102,241,0.15)",
  indicator: "rgba(59,130,246,0.15)",
  signal: "rgba(245,158,11,0.15)",
  logic: "rgba(139,92,246,0.15)",
  action: "rgba(16,185,129,0.15)",
  output: "rgba(236,72,153,0.15)",
};

export const SAMPLE_TEMPLATES: StrategyTemplate[] = [
  {
    id: "tpl-1",
    name: "Golden Cross",
    description: "Classic SMA 50/200 crossover strategy. Buy when short-term SMA crosses above long-term SMA.",
    category: "trend",
    difficulty: "beginner",
    config: {
      name: "Golden Cross",
      description: "SMA 50/200 crossover",
      symbol: "SPY",
      timeframe: "1d",
      startDate: "2020-01-01",
      endDate: "2024-12-31",
      nodes: [],
      edges: [],
    },
    author: "QuantBot",
    stars: 128,
    usageCount: 2300,
    createdAt: "2025-01-15",
  },
  {
    id: "tpl-2",
    name: "RSI Mean Reversion",
    description: "Buy when RSI(14) drops below 30 (oversold), sell when it crosses above 70 (overbought).",
    category: "mean-reversion",
    difficulty: "beginner",
    config: {
      name: "RSI Mean Reversion",
      description: "RSI oversold/overbought strategy",
      symbol: "AAPL",
      timeframe: "1d",
      startDate: "2020-01-01",
      endDate: "2024-12-31",
      nodes: [],
      edges: [],
    },
    author: "QuantBot",
    stars: 96,
    usageCount: 1500,
    createdAt: "2025-02-20",
  },
  {
    id: "tpl-3",
    name: "MACD + Volume Confirmation",
    description: "MACD crossover with volume confirmation filter for stronger signals.",
    category: "momentum",
    difficulty: "intermediate",
    config: {
      name: "MACD + Volume Confirmation",
      description: "MACD signals confirmed by above-average volume",
      symbol: "QQQ",
      timeframe: "1d",
      startDate: "2020-01-01",
      endDate: "2024-12-31",
      nodes: [],
      edges: [],
    },
    author: "StrategyLab",
    stars: 67,
    usageCount: 890,
    createdAt: "2025-03-10",
  },
];
