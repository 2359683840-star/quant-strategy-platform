import { create } from "zustand";
import type { StrategyNode, StrategyEdge, StrategyConfig, BacktestResult } from "./types";

interface EditorState {
  nodes: StrategyNode[];
  edges: StrategyEdge[];
  selectedNodeId: string | null;
  strategyName: string;
  strategyDescription: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  isBacktesting: boolean;
  backtestResult: BacktestResult | null;

  addNode: (node: StrategyNode) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, params: Record<string, number | string | boolean>) => void;
  addEdge: (edge: StrategyEdge) => void;
  removeEdge: (id: string) => void;
  selectNode: (id: string | null) => void;
  setStrategyMeta: (meta: Partial<Pick<EditorState, "strategyName" | "strategyDescription" | "symbol" | "timeframe" | "startDate" | "endDate">>) => void;
  setBacktesting: (v: boolean) => void;
  setBacktestResult: (r: BacktestResult | null) => void;
  getStrategyConfig: () => StrategyConfig;
  loadStrategy: (config: StrategyConfig) => void;
  reset: () => void;
}

let nodeCounter = 0;
const nextId = () => `node_${++nodeCounter}`;
let edgeCounter = 0;
const nextEdgeId = () => `edge_${++edgeCounter}`;

export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  strategyName: "",
  strategyDescription: "",
  symbol: "AAPL",
  timeframe: "1d",
  startDate: "2020-01-01",
  endDate: "2024-12-31",
  isBacktesting: false,
  backtestResult: null,

  addNode: (node) =>
    set((s) => ({ nodes: [...s.nodes, { ...node, id: node.id || nextId() }] })),

  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    })),

  updateNode: (id, params) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, params: { ...n.params, ...params } } : n)),
    })),

  addEdge: (edge) =>
    set((s) => {
      const exists = s.edges.some(
        (e) => e.source === edge.source && e.target === edge.target
      );
      if (exists) return s;
      return { edges: [...s.edges, { ...edge, id: edge.id || nextEdgeId() }] };
    }),

  removeEdge: (id) =>
    set((s) => ({ edges: s.edges.filter((e) => e.id !== id) })),

  selectNode: (id) => set({ selectedNodeId: id }),

  setStrategyMeta: (meta) => set(meta),

  setBacktesting: (v) => set({ isBacktesting: v }),
  setBacktestResult: (r) => set({ backtestResult: r }),

  getStrategyConfig: () => {
    const s = get();
    return {
      name: s.strategyName,
      description: s.strategyDescription,
      symbol: s.symbol,
      timeframe: s.timeframe,
      startDate: s.startDate,
      endDate: s.endDate,
      nodes: s.nodes,
      edges: s.edges,
    };
  },

  loadStrategy: (config) =>
    set({
      strategyName: config.name,
      strategyDescription: config.description,
      symbol: config.symbol,
      timeframe: config.timeframe,
      startDate: config.startDate,
      endDate: config.endDate,
      nodes: config.nodes,
      edges: config.edges,
      selectedNodeId: null,
      backtestResult: null,
    }),

  reset: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      strategyName: "",
      strategyDescription: "",
      isBacktesting: false,
      backtestResult: null,
    }),
}));
