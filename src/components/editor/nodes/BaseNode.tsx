"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CATEGORY_COLORS, CATEGORY_BG } from "@/lib/constants";
import type { StrategyNode } from "@/lib/types";

const HANDLE_STYLE = "!w-2.5 !h-2.5 !border-2 !border-[var(--surface)]";
const HANDLE_RIGHT = `${HANDLE_STYLE} !bg-[var(--accent)]`;
const HANDLE_LEFT = `${HANDLE_STYLE} !bg-[var(--muted)]`;

export const BaseNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as StrategyNode;
  const color = CATEGORY_COLORS[nodeData.type] ?? "#6b7280";
  const bg = CATEGORY_BG[nodeData.type] ?? "rgba(107,114,128,0.1)";

  const isSignal = nodeData.type === "signal";
  const isLogic = nodeData.type === "logic";

  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 min-w-[170px] cursor-pointer
        transition-all duration-150 select-none
        ${selected ? "shadow-lg scale-[1.02]" : ""}
      `}
      style={{
        backgroundColor: bg,
        borderColor: selected ? color : `${color}40`,
        boxShadow: selected ? `0 0 20px ${color}20` : undefined,
      }}
    >
      {/* Output handle (right, all nodes) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className={HANDLE_RIGHT}
      />

      {/* Input handles (left) */}
      {isSignal && (
        <>
          <div className="absolute left-[-6px] top-3 flex items-center gap-0.5">
            <Handle type="target" position={Position.Left} id="a" className={HANDLE_LEFT} style={{ top: 0, position: "relative", transform: "none" }} />
            <span className="text-[9px] font-bold text-[var(--accent)] leading-none">A</span>
          </div>
          <div className="absolute left-[-6px] bottom-3 flex items-center gap-0.5">
            <Handle type="target" position={Position.Left} id="b" className={HANDLE_LEFT} style={{ top: 0, position: "relative", transform: "none" }} />
            <span className="text-[9px] font-bold text-[var(--muted)] leading-none">B</span>
          </div>
        </>
      )}
      {isLogic && (
        <>
          <Handle type="target" position={Position.Left} id="a" className={HANDLE_LEFT} style={{ top: "30%" }} />
          <Handle type="target" position={Position.Left} id="b" className={HANDLE_LEFT} style={{ top: "70%" }} />
        </>
      )}
      {!isSignal && !isLogic && (
        <Handle type="target" position={Position.Left} id="in" className={HANDLE_LEFT} />
      )}

      {/* Label */}
      <div className="flex items-center gap-2 mb-1 ml-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          {nodeData.type}
        </span>
      </div>
      <div className="text-sm font-semibold text-[var(--foreground)] ml-1">{nodeData.label}</div>
      {nodeData.params && Object.keys(nodeData.params).length > 0 && (
        <div className="mt-2 pt-2 border-t border-[var(--border)] space-y-0.5">
          {Object.entries(nodeData.params).map(([k, v]) => (
            <div key={k} className="flex justify-between text-[11px]">
              <span className="text-[var(--muted)]">{k}</span>
              <span className="text-[var(--foreground)] font-mono">{String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

BaseNode.displayName = "BaseNode";
