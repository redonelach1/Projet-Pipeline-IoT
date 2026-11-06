"use client";

import React from "react";
import { MoreVertical, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RadialGaugeProps {
  percentage: number;
  title?: string;
  subtitle?: string;
  statusLabel?: string;
  size?: number;
  strokeWidth?: number;
  radius?: number;
  className?: string;
}

export function RadialGauge({
  percentage,
  title = "Asset Health Index",
  subtitle = "Based on fleet telemetry",
  statusLabel,
  size = 180,
  strokeWidth = 14,
  radius = 58,
  className,
}: RadialGaugeProps) {
  // Defensive mathematical clamping and boundary safety
  const rawNum = typeof percentage === "number" ? percentage : Number(percentage);
  const clampedPercentage = Math.max(0, Math.min(100, isNaN(rawNum) ? 0 : rawNum));

  // Dynamic SVG circle geometry
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  const center = size / 2;

  // Determine dynamic status
  const resolvedStatus =
    statusLabel ||
    (clampedPercentage >= 90
      ? "Optimal Reliability"
      : clampedPercentage >= 70
      ? "Degraded Performance"
      : "Critical Asset Alert");

  const isOptimal = clampedPercentage >= 85;

  return (
    <div
      className={cn(
        "bg-[#0D1411] border border-[#1A2821] rounded-2xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden",
        className
      )}
    >
      {/* Card Header matching Reference Image */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h3 className="text-sm font-mono font-bold text-white tracking-wide">{title}</h3>
          <p className="text-[11px] font-mono text-[#5C7268]">{resolvedStatus}</p>
        </div>
        <button
          type="button"
          aria-label="Options"
          className="text-[#5C7268] hover:text-[#8E9E96] transition-colors p-1"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Radial Gauge Container */}
      <div className="flex flex-col items-center justify-center my-auto py-2 relative">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          {/* Rotated SVG so progress arc begins at top (12 o'clock) */}
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {/* Background Track Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#141F1A"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Glowing Neon Mint Progress Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#00F59B"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              style={{
                filter: "drop-shadow(0 0 8px rgba(0, 245, 155, 0.45))",
              }}
            />
          </svg>

          {/* Central Percentage Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-mono font-extrabold text-white tracking-tight">
              {clampedPercentage.toFixed(1)}%
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00F59B] mt-0.5 font-semibold">
              Fleet Health
            </span>
          </div>
        </div>
      </div>

      {/* Footer Scale & Context Label matching Reference Image */}
      <div className="pt-2 border-t border-[#1A2821]/80 flex items-center justify-between text-[11px] font-mono text-[#5C7268]">
        <span>0%</span>
        <span className="text-center text-[#8E9E96] truncate px-2">{subtitle}</span>
        <span>100%</span>
      </div>
    </div>
  );
}

export default RadialGauge;
