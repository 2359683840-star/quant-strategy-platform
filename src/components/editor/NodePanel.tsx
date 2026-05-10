"use client";

import { useCallback, useRef } from "react";
import { NODE_PALETTE, CATEGORY_COLORS, CATEGORY_BG } from "@/lib/constants";
import { useEditorStore } from "@/lib/store";
import type { NodeCategory } from "@/lib/types";

export function NodePanel() {
  const addNode = useEditorStore((s) => s.addNode);
  const dragRef = useRef<{ type: NodeCategory; label: string; params: Record<string, number | string | boolean> } | null>(null);

  const onDragStart = useCallback(
    (e: React.DragEvent, type: NodeCategory, label: string, params: Record<string, number | string | boolean>) => {
      dragRef.current = { type, label, params };
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/reactflow-type", type);
      e.dataTransfer.setData("application/reactflow-label", label);
      e.dataTransfer.setData("application/reactflow-params", JSON.stringify(params));
    },
    []
  );

  return (
    <div className="w-52 bg-[var(--sidebar)] border-r border-[var(--border)] overflow-y-auto flex-shrink-0">
      <div className="p-3 border-b border-[var(--border)]">
        <h3 className="text-xs font-semibold text-[var(--foreground)]">Node Palette</h3>
        <p className="text-[10px] text-[var(--muted)] mt-0.5">Drag nodes to canvas</p>
      </div>
      <div className="p-2 space-y-0.5">
        {NODE_PALETTE.map((group) => (
          <div key={group.category} className="mb-3">
            <div className="flex items-center gap-1.5 px-2 mb-1">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[group.category] }}
              />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                {group.label}
              </span>
            </div>
            {group.items.map((item) => (
              <div
                key={item.label}
                draggable
                onDragStart={(e) => onDragStart(e, item.type, item.label, item.params)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing
                  hover:bg-[var(--surface)] transition-colors text-sm text-[var(--foreground)] border border-transparent
                  hover:border-[var(--border)]"
                style={{
                  backgroundColor: CATEGORY_BG[item.type] ?? "transparent",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[item.type] }}
                />
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
