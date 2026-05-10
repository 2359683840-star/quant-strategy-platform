"use client";

import { useEditorStore } from "@/lib/store";
import { CATEGORY_COLORS } from "@/lib/constants";

export function NodeConfigPanel() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const nodes = useEditorStore((s) => s.nodes);
  const updateNode = useEditorStore((s) => s.updateNode);
  const selectNode = useEditorStore((s) => s.selectNode);

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <div className="w-64 bg-[var(--sidebar)] border-l border-[var(--border)] flex-shrink-0 flex items-center justify-center p-4">
        <p className="text-xs text-[var(--muted)] text-center">
          Click a node to edit its parameters
        </p>
      </div>
    );
  }

  const color = CATEGORY_COLORS[node.type] ?? "#6b7280";

  return (
    <div className="w-64 bg-[var(--sidebar)] border-l border-[var(--border)] overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">{node.label}</h3>
          </div>
          <button
            onClick={() => selectNode(null)}
            className="text-[var(--muted)] hover:text-[var(--foreground)] text-lg leading-none"
          >
            ×
          </button>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{node.type}</span>
      </div>

      <div className="p-4">
        {Object.keys(node.params).length === 0 ? (
          <p className="text-xs text-[var(--muted)]">No parameters to configure</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(node.params).map(([key, value]) => (
              <div key={key}>
                <label className="block text-[11px] font-medium text-[var(--muted)] mb-1 capitalize">
                  {key}
                </label>
                {typeof value === "boolean" ? (
                  <button
                    onClick={() => updateNode(node.id, { [key]: !value })}
                    className={`w-8 h-4 rounded-full transition-colors relative ${
                      value ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                        value ? "left-4.5" : "left-0.5"
                      }`}
                    />
                  </button>
                ) : (
                  <input
                    type={typeof value === "number" ? "number" : "text"}
                    value={value}
                    onChange={(e) =>
                      updateNode(node.id, {
                        [key]:
                          typeof value === "number"
                            ? parseFloat(e.target.value) || 0
                            : e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--border)]
                      text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]
                      font-mono transition-colors"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[var(--border)]">
        <button
          onClick={() => {
            const store = useEditorStore.getState();
            store.removeNode(node.id);
          }}
          className="w-full px-3 py-1.5 rounded-lg border border-red-500/20 text-[11px] text-red-400
            hover:bg-red-500/10 transition-colors"
        >
          Delete Node
        </button>
      </div>
    </div>
  );
}
