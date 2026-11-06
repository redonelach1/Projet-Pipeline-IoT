"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Activity, Flame, Gauge, Vibrate, MoreVertical, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TelemetryPoint {
  time: string;
  temp?: number;
  press?: number;
  vib?: number;
  hum?: number;
  [key: string]: any;
}

export interface TelemetryAreaChartProps {
  history: TelemetryPoint[];
  selectedMetric?: "temp" | "press" | "vib";
  onMetricChange?: (metric: "temp" | "press" | "vib") => void;
  equipmentId?: string;
  equipmentName?: string;
  title?: string;
  height?: number | string;
  className?: string;
}

const METRIC_CONFIG = {
  temp: {
    label: "Temperature",
    unit: "°C",
    color: "#00F59B",
    icon: Flame,
    domain: [20, "auto"] as [number | "auto", number | "auto"],
    nominal: "< 80°C Nominal",
  },
  press: {
    label: "Pressure",
    unit: "bar",
    color: "#00F59B",
    icon: Gauge,
    domain: [0, "auto"] as [number | "auto", number | "auto"],
    nominal: "4.0 – 6.0 bar Nominal",
  },
  vib: {
    label: "Vibration",
    unit: "mm/s",
    color: "#00F59B",
    icon: Vibrate,
    domain: [0, "auto"] as [number | "auto", number | "auto"],
    nominal: "< 4.0 mm/s Nominal",
  },
};

export function TelemetryAreaChart({
  history = [],
  selectedMetric: propMetric,
  onMetricChange,
  equipmentId = "motor-01",
  equipmentName = "Drive Motor 01",
  title = "Continuous Telemetry Trend",
  height = 300,
  className,
}: TelemetryAreaChartProps) {
  const [internalMetric, setInternalMetric] = useState<"temp" | "press" | "vib">("temp");
  const activeMetricKey = propMetric ?? internalMetric;
  const config = METRIC_CONFIG[activeMetricKey] || METRIC_CONFIG.temp;
  const MetricIcon = config.icon;

  const handleMetricSelect = (metric: "temp" | "press" | "vib") => {
    setInternalMetric(metric);
    onMetricChange?.(metric);
  };

  // Get current active value from latest history point
  const latestPoint = history.length > 0 ? history[history.length - 1] : null;
  const currentValue = latestPoint ? latestPoint[activeMetricKey] : null;

  const formatDisplayValue = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return "—";
    if (activeMetricKey === "temp") return `${val.toFixed(1)} °C`;
    if (activeMetricKey === "press") return `${val.toFixed(2)} bar`;
    return `${val.toFixed(2)} mm/s`;
  };

  return (
    <div
      className={cn(
        "bg-[#0D1411] border border-[#1A2821] rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between",
        className
      )}
    >
      {/* Top Header Card Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2821]/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E9E96]">
              {title}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#131F19] text-[#00F59B] border border-[#00F59B]/30 font-semibold">
              LIVE STREAM
            </span>
          </div>

          <div className="flex items-baseline space-x-3 mt-1.5">
            <h3 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              {formatDisplayValue(currentValue)}
            </h3>
            <div className="flex items-center space-x-1 text-xs font-mono text-[#00F59B] bg-[#00F59B]/10 px-2 py-0.5 rounded border border-[#00F59B]/20">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{config.nominal}</span>
            </div>
          </div>
          <p className="text-[11px] font-mono text-[#5C7268] mt-0.5">
            Asset: <span className="text-[#8E9E96] font-semibold">{equipmentId}</span> ({equipmentName})
          </p>
        </div>

        {/* Interactive Metric Toggle Pills */}
        <div className="flex items-center space-x-1.5 bg-[#070B09] p-1.5 rounded-full border border-[#1A2821]">
          <button
            type="button"
            onClick={() => handleMetricSelect("temp")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all duration-200",
              activeMetricKey === "temp"
                ? "bg-[#00F59B] text-[#050B08] shadow-[0_0_12px_rgba(0,245,155,0.4)]"
                : "text-[#8E9E96] hover:text-white hover:bg-[#131C18]"
            )}
          >
            Temperature
          </button>
          <button
            type="button"
            onClick={() => handleMetricSelect("press")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all duration-200",
              activeMetricKey === "press"
                ? "bg-[#00F59B] text-[#050B08] shadow-[0_0_12px_rgba(0,245,155,0.4)]"
                : "text-[#8E9E96] hover:text-white hover:bg-[#131C18]"
            )}
          >
            Pressure
          </button>
          <button
            type="button"
            onClick={() => handleMetricSelect("vib")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all duration-200",
              activeMetricKey === "vib"
                ? "bg-[#00F59B] text-[#050B08] shadow-[0_0_12px_rgba(0,245,155,0.4)]"
                : "text-[#8E9E96] hover:text-white hover:bg-[#131C18]"
            )}
          >
            Vibration
          </button>
        </div>
      </div>

      {/* Recharts Glowing Spline Canvas */}
      <div className="w-full mt-4" style={{ height }}>
        {history.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#5C7268] text-xs font-mono space-y-2">
            <Activity className="w-6 h-6 animate-pulse text-[#00F59B]/50" />
            <span>Awaiting rolling telemetry frames from {equipmentId}...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
              <defs>
                {/* Primary Neon Mint Gradient */}
                <linearGradient id="scadaGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F59B" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#00F59B" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#00F59B" stopOpacity={0} />
                </linearGradient>
                {/* Alias ID for neonGlow compatibility */}
                <linearGradient id="neonGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F59B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00F59B" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#16231D" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#4E6359"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
                axisLine={{ stroke: "#1A2821" }}
              />
              <YAxis
                stroke="#4E6359"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
                axisLine={{ stroke: "#1A2821" }}
                domain={config.domain}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as TelemetryPoint;
                    const val = data[activeMetricKey];
                    return (
                      <div className="bg-[#0D1411] border border-[#1A2821] rounded-lg p-2.5 shadow-2xl font-mono text-xs">
                        <div className="text-[#8E9E96] text-[10px] mb-1">Time: {data.time}</div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-[#00F59B]" />
                          <span className="text-white font-bold">
                            {config.label}: {formatDisplayValue(val)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={activeMetricKey}
                stroke="#00F59B"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#scadaGlow)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#00F59B",
                  stroke: "#050B08",
                  strokeWidth: 2,
                  className: "filter drop-shadow-[0_0_8px_rgba(0,245,155,0.8)]",
                }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default TelemetryAreaChart;
