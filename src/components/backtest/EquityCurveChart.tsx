"use client";

import { useEffect, useRef } from "react";
import { createChart, AreaSeries, ColorType, type IChartApi } from "lightweight-charts";

interface Props {
  data: { date: string; value: number }[];
}

export function EquityCurveChart({ data }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!container.current || data.length === 0) return;

    const c = createChart(container.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8b949e",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      },
      grid: { vertLines: { color: "#21262d" }, horzLines: { color: "#21262d" } },
      width: container.current.clientWidth,
      height: 320,
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: "#30363d" },
      timeScale: { borderColor: "#30363d", timeVisible: true },
    });

    const series = c.addSeries(AreaSeries, {
      lineColor: "#3dd68c",
      topColor: "rgba(61,214,140,0.25)",
      bottomColor: "rgba(61,214,140,0.02)",
      lineWidth: 2,
    });

    const lineData = data.map((d) => ({
      time: d.date,
      value: d.value,
    }));
    series.setData(lineData);
    c.timeScale().fitContent();

    chart.current = c;

    const handleResize = () => {
      if (container.current) {
        c.applyOptions({ width: container.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      c.remove();
      chart.current = null;
    };
  }, [data]);

  return <div ref={container} className="w-full" />;
}
