"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import type { YearlyReturn } from "@/lib/types";

export function YearlyReturns({ data }: { data: YearlyReturn[] }) {
  if (data.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold text-[var(--foreground)] mb-3">Annual Returns vs Benchmark</h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
            <XAxis dataKey="year" tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={{ stroke: "#30363d" }} tickLine={false} />
            <YAxis tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={{ stroke: "#30363d" }} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ background: "#131720", border: "1px solid #21262d", borderRadius: "8px", fontSize: "12px" }}
              labelStyle={{ color: "#e6edf3" }}
              formatter={(value: number) => [`${value > 0 ? "+" : ""}${value}%`, ""]}
            />
            <ReferenceLine y={0} stroke="#30363d" />
            <Bar dataKey="return" radius={[3, 3, 0, 0]} barSize={32}>
              {data.map((entry) => (
                <Cell key={entry.year} fill={entry.return >= 0 ? "#10b981" : "#ef4444"} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MonthlyHeatmap({ data }: { data: { year: number; month: number; return: number }[] }) {
  if (data.length === 0) return null;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = [...new Set(data.map((d) => d.year))].sort();
  const lookup = new Map(data.map((d) => [`${d.year}-${d.month}`, d.return]));

  const getColor = (v: number | undefined) => {
    if (v === undefined) return "rgba(19,23,32,0.5)";
    const intensity = Math.min(Math.abs(v) / 15, 1);
    if (v >= 0) return `rgba(16,185,129,${0.1 + intensity * 0.7})`;
    return `rgba(239,68,68,${0.1 + intensity * 0.7})`;
  };

  return (
    <div>
      <h3 className="text-xs font-semibold text-[var(--foreground)] mb-3">Monthly Returns Heatmap</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr>
              <th className="text-left text-[var(--muted)] font-medium py-1 pr-2">Year</th>
              {months.map((m) => (
                <th key={m} className="text-center text-[var(--muted)] font-medium py-1 px-0.5">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((year) => (
              <tr key={year}>
                <td className="text-[var(--foreground)] font-medium py-1 pr-2">{year}</td>
                {Array.from({ length: 12 }, (_, i) => {
                  const v = lookup.get(`${year}-${i + 1}`);
                  return (
                    <td
                      key={i}
                      className="text-center py-1 px-0.5 rounded font-mono"
                      style={{ backgroundColor: getColor(v) }}
                    >
                      {v !== undefined ? `${v > 0 ? "+" : ""}${v.toFixed(1)}%` : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
