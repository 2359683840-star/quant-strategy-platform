"use client";

import { useState } from "react";
import Link from "next/link";
import { SAMPLE_TEMPLATES } from "@/lib/constants";
import type { StrategyTemplate } from "@/lib/types";

const CATEGORIES = ["all", "trend", "mean-reversion", "momentum", "arbitrage"];
const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"];

export default function TemplatesPage() {
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const filtered = SAMPLE_TEMPLATES.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (difficulty !== "all" && t.difficulty !== difficulty) return false;
    return true;
  });

  return (
    <div className="min-h-full">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Template Marketplace</h1>
          <p className="text-sm text-[var(--muted)]">
            Start from proven strategies or share your own. Every template can be forked and customized.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  category === c
                    ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] border border-transparent"
                }`}
              >
                {c === "all" ? "All" : c.replace("-", " ")}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-[var(--border)]" />
          <div className="flex items-center gap-1.5">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  difficulty === d
                    ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] border border-transparent"
                }`}
              >
                {d === "all" ? "All Levels" : d}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 py-20 text-center text-[var(--muted)] text-sm">
              No templates match the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template: tpl }: { template: StrategyTemplate }) {
  return (
    <Link
      href={`/editor?template=${tpl.id}`}
      className="block p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/30
        hover:border-[var(--accent)]/40 hover:bg-[var(--surface)] transition-all no-underline group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] capitalize">
              {tpl.category.replace("-", " ")}
            </span>
            <span className="text-[10px] text-[var(--muted)] capitalize">{tpl.difficulty}</span>
          </div>
          <h3 className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
            {tpl.name}
          </h3>
        </div>
        <span className="text-xs text-[var(--muted)] flex items-center gap-1">
          ★ {tpl.stars}
        </span>
      </div>
      <p className="text-xs text-[var(--muted)] leading-relaxed mb-3 line-clamp-2">
        {tpl.description}
      </p>
      <div className="flex items-center gap-4 text-[10px] text-[var(--muted)]">
        <span>{tpl.author}</span>
        <span>{tpl.usageCount.toLocaleString()} runs</span>
      </div>
    </Link>
  );
}
