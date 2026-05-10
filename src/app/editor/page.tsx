"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { BaseNode } from "@/components/editor/nodes/BaseNode";
import { NodePanel } from "@/components/editor/NodePanel";
import { NodeConfigPanel } from "@/components/editor/NodeConfigPanel";
import { useEditorStore } from "@/lib/store";
import { runBacktest } from "@/lib/api";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { StrategyNode } from "@/lib/types";

const nodeTypes = { base: BaseNode };

export default function EditorPage() {
  const store = useEditorStore;
  const nodes = useEditorStore((s) => s.nodes);
  const edgesStore = useEditorStore((s) => s.edges);
  const addNode = useEditorStore((s) => s.addNode);
  const removeNode = useEditorStore((s) => s.removeNode);
  const addEdge = useEditorStore((s) => s.addEdge);
  const removeEdge = useEditorStore((s) => s.removeEdge);
  const selectNode = useEditorStore((s) => s.selectNode);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const strategyName = useEditorStore((s) => s.strategyName);
  const setStrategyMeta = useEditorStore((s) => s.setStrategyMeta);
  const symbol = useEditorStore((s) => s.symbol);
  const timeframe = useEditorStore((s) => s.timeframe);
  const isBacktesting = useEditorStore((s) => s.isBacktesting);
  const setBacktesting = useEditorStore((s) => s.setBacktesting);
  const setBacktestResult = useEditorStore((s) => s.setBacktestResult);

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Sync Zustand → ReactFlow
  useEffect(() => {
    const rfn: Node[] = nodes.map((n) => ({
      id: n.id,
      type: "base",
      position: (n as unknown as { position?: { x: number; y: number } }).position ?? {
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 300,
      },
      data: { ...n, onSelect: () => store.getState().selectNode(n.id) },
    }));
    setRfNodes(rfn);
  }, [nodes, setRfNodes]);

  useEffect(() => {
    const rfe: Edge[] = edgesStore.map((e) => ({
      id: e.id ?? `e_${e.source}_${e.target}`,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? undefined,
      targetHandle: e.targetHandle ?? undefined,
      animated: true,
      style: { stroke: "#3dd68c88", strokeWidth: 2 },
    } as Edge));
    setRfEdges(rfe);
  }, [edgesStore, setRfEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      addEdge({
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || undefined,
        targetHandle: connection.targetHandle || undefined,
      });
    },
    [addEdge]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow-type") as StrategyNode["type"];
      const label = e.dataTransfer.getData("application/reactflow-label") || type;
      const paramsStr = e.dataTransfer.getData("application/reactflow-params");

      if (!type) return;

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      const position = bounds
        ? { x: e.clientX - bounds.left - 80, y: e.clientY - bounds.top - 30 }
        : { x: e.clientX - 400, y: e.clientY - 200 };

      const params = paramsStr ? JSON.parse(paramsStr) : {};
      const node: StrategyNode & { position?: { x: number; y: number } } = {
        id: `node_${Date.now()}`,
        type,
        label,
        params,
        position,
      };
      addNode(node);
    },
    [addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const onEdgesDelete = useCallback(
    (edges: Edge[]) => {
      edges.forEach((e) => removeEdge(e.id));
    },
    [removeEdge]
  );

  const onNodesDelete = useCallback(
    (nodes: Node[]) => {
      nodes.forEach((n) => removeNode(n.id));
    },
    [removeNode]
  );

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleBacktest = async () => {
    setError(null);
    setBacktesting(true);
    try {
      const config = store.getState().getStrategyConfig();
      const result = await runBacktest(config);
      store.getState().setBacktestResult(result);
      router.push(`/backtest/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Backtest failed");
    } finally {
      setBacktesting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-0px)] flex flex-col">
      {/* Top bar */}
      <div className="h-14 bg-[var(--sidebar)] border-b border-[var(--border)] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <input
            value={strategyName}
            onChange={(e) => setStrategyMeta({ strategyName: e.target.value })}
            placeholder="Untitled Strategy"
            className="bg-transparent text-sm font-semibold text-[var(--foreground)] placeholder:text-[var(--muted)]
              focus:outline-none border-b border-transparent focus:border-[var(--accent)] px-1 w-48 transition-colors"
          />
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <input
              value={symbol}
              onChange={(e) => setStrategyMeta({ symbol: e.target.value })}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-md px-2 py-1 w-20
                text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] font-mono"
              placeholder="Symbol"
            />
            <select
              value={timeframe}
              onChange={(e) => setStrategyMeta({ timeframe: e.target.value })}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-md px-2 py-1
                text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="1h">1h</option>
              <option value="1d">1d</option>
              <option value="1wk">1wk</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBacktest}
            disabled={isBacktesting}
            className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-black text-xs font-semibold
              hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2"
          >
            {isBacktesting ? (
              <>
                <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                ▶ Run Backtest
              </>
            )}
          </button>
          {error && (
            <p className="text-[11px] text-red-400 max-w-48 leading-tight">{error}</p>
          )}
        </div>
      </div>

      {/* Editor body */}
      <div className="flex flex-1 overflow-hidden">
        <NodePanel />

        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onEdgesDelete={onEdgesDelete}
            onNodesDelete={onNodesDelete}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode={["Backspace", "Delete"]}
            className="bg-[var(--background)]"
          >
            <Controls className="!bg-[var(--surface)] !border-[var(--border)] !rounded-lg" />
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#21262d" />
            <MiniMap
              className="!bg-[var(--surface)] !border-[var(--border)] !rounded-lg"
              maskColor="rgba(0,0,0,0.8)"
              nodeColor={(node) => {
                const data = node.data as unknown as StrategyNode | undefined;
                return data ? CATEGORY_COLORS[data.type] ?? "#6b7280" : "#6b7280";
              }}
            />
          </ReactFlow>
        </div>

        <NodeConfigPanel />
      </div>
    </div>
  );
}
