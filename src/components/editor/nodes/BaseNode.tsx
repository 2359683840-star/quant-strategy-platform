import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CATEGORY_COLORS, CATEGORY_BG } from "@/lib/constants";
import type { NodeCategory, StrategyNode } from "@/lib/types";

export const BaseNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as StrategyNode & { onSelect?: () => void };
  const color = CATEGORY_COLORS[nodeData.type] ?? "#6b7280";
  const bg = CATEGORY_BG[nodeData.type] ?? "rgba(107,114,128,0.1)";

  return (
    <div
      onClick={nodeData.onSelect}
      className={`
        relative px-4 py-3 rounded-xl border-2 min-w-[160px] cursor-pointer
        transition-all duration-150 select-none
        ${selected ? "shadow-lg scale-[1.02]" : ""}
      `}
      style={{
        backgroundColor: bg,
        borderColor: selected ? color : `${color}40`,
        boxShadow: selected ? `0 0 20px ${color}20` : undefined,
      }}
    >
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-[var(--muted)] !border-2 !border-[var(--surface)]" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-[var(--accent)] !border-2 !border-[var(--surface)]" />

      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          {nodeData.type}
        </span>
      </div>
      <div className="text-sm font-semibold text-[var(--foreground)]">{nodeData.label}</div>
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
