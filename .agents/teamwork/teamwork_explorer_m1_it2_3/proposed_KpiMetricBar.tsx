"use client";

import React from "react";
import {
  Radio,
  Cpu,
  Zap,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface KpiMetricBarProps {
  totalIngestion?: number;
  ingestionRate?: number;
  msgPerSec?: number;
  activeFleet?: string | { online: number; total: number };
  p95LatencyMs?: number;
  unacknowledgedAlarms?: number;
  unackAlertsCount?: number;
  className?: string;
}

export interface FleetMetrics {
  display: string;
  online: number;
  total: number;
  percentage: number;
  status: "optimal" | "degraded" | "offline";
  label: string;
}

/**
 * Parses the activeFleet prop (string or object) and derives the operational status,
 * percentage, and human-readable sub-badge label.
 */
export function parseActiveFleet(
  activeFleet?: string | { online: number; total: number }
): FleetMetrics {
  let online = 5;
  let total = 5;
  let display = "5/5 Online";

  if (typeof activeFleet === "object" && activeFleet !== null) {
    online = typeof activeFleet.online === "number" ? Math.max(0, activeFleet.online) : 0;
    total = typeof activeFleet.total === "number" && activeFleet.total > 0 ? activeFleet.total : 5;
    display = `${online}/${total} Online`;
  } else if (typeof activeFleet === "string") {
    display = activeFleet;
    const slashMatch = activeFleet.match(/(\d+)\s*\/\s*(\d+)/);
    if (slashMatch) {
      online = Math.max(0, parseInt(slashMatch[1], 10));
      total = parseInt(slashMatch[2], 10);
      if (isNaN(total) || total <= 0) total = 5;
      if (isNaN(online)) online = 0;
    } else {
      const numMatch = activeFleet.match(/(\d+)/);
      if (numMatch) {
        online = Math.max(0, parseInt(numMatch[1], 10));
        total = 5;
      } else if (activeFleet.toLowerCase().includes("offline")) {
        online = 0;
        total = 5;
      }
    }
  }

  const percentage = total > 0 ? Math.round((online / total) * 100) : 0;

  // Tri-state classification:
  // 1. Offline (0/5 online): red dot + "Fleet Offline"
  // 2. Degraded (1-4 of 5 online): amber dot + "${online}/${total} Degraded"
  // 3. Optimal (5/5 or >= 100%): neon green dot + "100% Operational"
  if (online === 0) {
    return {
      display,
      online,
      total,
      percentage: 0,
      status: "offline",
      label: "Fleet Offline",
    };
  }

  if (online < total) {
    return {
      display,
      online,
      total,
      percentage,
      status: "degraded",
      label: `${online}/${total} Degraded`,
    };
  }

  return {
    display,
    online,
    total,
    percentage,
    status: "optimal",
    label: "100% Operational",
  };
}

export function KpiMetricBar({
  totalIngestion = 0,
  ingestionRate = 0,
  msgPerSec,
  activeFleet = "5/5 Online",
  p95LatencyMs = 8.4,
  unacknowledgedAlarms,
  unackAlertsCount,
  className,
}: KpiMetricBarProps) {
  // Resolve alarms count (clamped to non-negative)
  const effectiveAlarms = Math.max(0, unacknowledgedAlarms ?? unackAlertsCount ?? 0);

  // Parse active fleet dynamically
  const fleetMetrics = parseActiveFleet(activeFleet);

  // Determine latency SLA styling - preserve genuine 0.0 ms without falling back to 8.4 ms
  const hasLatencyValue = typeof p95LatencyMs === "number" && !isNaN(p95LatencyMs);
  const safeLatency = hasLatencyValue
    ? (p95LatencyMs >= 0 ? p95LatencyMs : 8.4)
    : 8.4;
  const isLatencyOptimal = safeLatency < 50;
  const isLatencyAcceptable = safeLatency >= 50 && safeLatency <= 100;

  // Format trend percentage or rate (avoid hardcoded mock "+12.4% / sec" fallback)
  const effectiveRate =
    typeof ingestionRate === "number" && ingestionRate > 0
      ? ingestionRate
      : typeof msgPerSec === "number" && msgPerSec > 0
      ? msgPerSec
      : 0;
  const rateLabel =
    effectiveRate > 0
      ? `+${effectiveRate.toFixed(1)}% / sec`
      : "+0.0% / sec";

  // Total ingestion display with large numbers handling
  const formattedIngestion =
    totalIngestion >= 10_000_000
      ? `${(totalIngestion / 1_000_000).toFixed(1)}M`
      : totalIngestion.toLocaleString();

  return (
    <div
      data-testid="kpi-metric-bar"
      className={cn(
        "bg-[#0D1411] border border-[#1A2821] rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl backdrop-blur-md relative overflow-hidden transition-all",
        className
      )}
    >
      {/* Ambient background glow accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F59B]/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-0">
        {/* Metric 1: Total Ingestion */}
        <div
          data-testid="kpi-ingestion"
          className="flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-[#1A2821] pb-4 sm:pb-0 sm:pr-6 lg:pr-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8E9E96] font-mono">
              Total Ingestion
            </span>
            <div className="p-1.5 rounded-lg bg-[#131C18] border border-[#1A2821]">
              <Radio className="w-4 h-4 text-[#00F59B]" />
            </div>
          </div>

          <div className="my-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white block">
              {formattedIngestion}
            </span>
            <span className="text-[11px] text-[#667A71] font-mono">Packets Received</span>
          </div>

          <div className="mt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/20 shadow-[0_0_8px_rgba(0,245,155,0.15)] font-mono">
              <TrendingUp className="w-3 h-3 text-[#00F59B]" />
              {rateLabel}
            </span>
          </div>
        </div>

        {/* Metric 2: Active Fleet */}
        <div
          data-testid="kpi-active-fleet"
          className="flex flex-col justify-between border-b sm:border-b-0 lg:border-r border-[#1A2821] pb-4 sm:pb-0 sm:pl-6 lg:px-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8E9E96] font-mono">
              Active Fleet
            </span>
            <div className="p-1.5 rounded-lg bg-[#131C18] border border-[#1A2821]">
              <Cpu className="w-4 h-4 text-[#00F59B]" />
            </div>
          </div>

          <div className="my-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
                {fleetMetrics.display}
              </span>
            </div>
            <span className="text-[11px] text-[#667A71] font-mono">
              {fleetMetrics.total} Edge Nodes Deployed
            </span>
          </div>

          <div className="mt-2">
            <span
              className={cn(
                "inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border",
                fleetMetrics.status === "optimal" &&
                  "bg-[#00F59B]/10 text-[#00F59B] border-[#00F59B]/20 shadow-[0_0_8px_rgba(0,245,155,0.15)]",
                fleetMetrics.status === "degraded" &&
                  "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]",
                fleetMetrics.status === "offline" &&
                  "bg-[#FF4D4D]/10 text-[#FF4D4D] border-[#FF4D4D]/20 shadow-[0_0_8px_rgba(255,77,77,0.15)]"
              )}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    fleetMetrics.status === "optimal" && "bg-[#00F59B]",
                    fleetMetrics.status === "degraded" && "bg-[#F59E0B]",
                    fleetMetrics.status === "offline" && "bg-[#FF4D4D]"
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    fleetMetrics.status === "optimal" && "bg-[#00F59B]",
                    fleetMetrics.status === "degraded" && "bg-[#F59E0B]",
                    fleetMetrics.status === "offline" && "bg-[#FF4D4D]"
                  )}
                />
              </span>
              <span>{fleetMetrics.label}</span>
            </span>
          </div>
        </div>

        {/* Metric 3: Edge p95 Latency */}
        <div
          data-testid="kpi-p95-latency"
          className="flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-[#1A2821] pb-4 sm:pb-0 sm:pr-6 lg:border-r lg:border-[#1A2821] lg:px-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8E9E96] font-mono">
              Edge p95 Latency
            </span>
            <div className="p-1.5 rounded-lg bg-[#131C18] border border-[#1A2821]">
              <Zap className="w-4 h-4 text-[#00F59B]" />
            </div>
          </div>

          <div className="my-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white block">
              {`${safeLatency.toFixed(1)} ms`}
            </span>
            <p className="text-[11px] text-[#667A71] font-mono">Edge Gateway p95</p>
          </div>

          <div className="mt-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border",
                isLatencyOptimal
                  ? "bg-[#00F59B]/10 text-[#00F59B] border-[#00F59B]/20 shadow-[0_0_8px_rgba(0,245,155,0.15)]"
                  : isLatencyAcceptable
                  ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                  : "bg-[#FF4D4D]/10 text-[#FF4D4D] border-[#FF4D4D]/20"
              )}
            >
              {isLatencyOptimal ? "< 100ms SLA" : isLatencyAcceptable ? "SLA Nominal" : "SLA Exceeded"}
            </span>
          </div>
        </div>

        {/* Metric 4: Unacknowledged Alarms */}
        <div
          data-testid="kpi-unack-alarms"
          className="flex flex-col justify-between sm:pl-6 lg:pl-6 pt-2 sm:pt-0"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8E9E96] font-mono">
              Unacknowledged Alarms
            </span>
            <div className="p-1.5 rounded-lg bg-[#131C18] border border-[#1A2821]">
              {effectiveAlarms > 0 ? (
                <ShieldAlert className="w-4 h-4 text-[#FF4D4D]" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#00F59B]" />
              )}
            </div>
          </div>

          <div className="my-1">
            <span
              className={cn(
                "text-2xl sm:text-3xl font-bold font-mono tracking-tight block",
                effectiveAlarms > 0 ? "text-[#FF4D4D]" : "text-white"
              )}
            >
              {effectiveAlarms}
            </span>
            <span className="text-[11px] text-[#667A71] font-mono">Active Incidents</span>
          </div>

          <div className="mt-2">
            {effectiveAlarms > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF4D4D]/15 text-[#FF4D4D] border border-[#FF4D4D]/30 shadow-[0_0_10px_rgba(255,77,77,0.25)] font-mono animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D4D]" />
                <span>{effectiveAlarms} Action Required</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/20 shadow-[0_0_8px_rgba(0,245,155,0.15)] font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00F59B]" />
                <span>0 Pending (Nominal)</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KpiMetricBar;
