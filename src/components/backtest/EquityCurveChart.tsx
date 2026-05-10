"use client";

import { useEffect, useRef } from "react";
import { createChart, type IChartApi, type ISeriesApi, type LineData, ColorType } from "lightweight-charts";

interface Props {
  data: { date: string; value: number }[];
  drawdownData?: { date: string; value: number }[];
}

export function EquityCurveChart({ data, drawdownData }: Props) {
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

    const lineData: LineData[] = data.map((d) => ({
      time: d.date,
      value: d.value,
    }));

    const series = c.addAreaSeries({
      lineColor: "#3dd68c",
      topColor: "rgba(61,214,140,0.25)",
      bottomColor: "rgba(61,214,140,0.02)",
      lineWidth: 2,
    });
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
