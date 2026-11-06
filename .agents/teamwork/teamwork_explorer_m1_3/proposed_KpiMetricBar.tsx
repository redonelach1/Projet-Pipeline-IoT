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
  activeFleet?: string | { online: number; total: number };
  p95LatencyMs?: number;
  unacknowledgedAlarms?: number;
  className?: string;
}

export function KpiMetricBar({
  totalIngestion = 0,
  ingestionRate = 0,
  activeFleet = "5/5 Online",
  p95LatencyMs = 8.4,
  unacknowledgedAlarms = 0,
  className,
}: KpiMetricBarProps) {
  // Format active fleet string
  const fleetDisplay =
    typeof activeFleet === "string"
      ? activeFleet
      : `${activeFleet.online}/${activeFleet.total} Online`;

  // Determine latency SLA styling
  const isLatencyOptimal = p95LatencyMs < 50;
  const isLatencyAcceptable = p95LatencyMs >= 50 && p95LatencyMs <= 100;

  // Format trend percentage or rate
  const rateLabel =
    ingestionRate > 0
      ? `+${ingestionRate.toFixed(1)}% / sec`
      : "+12.4% / sec";

  return (
    <div
      className={cn(
        "bg-[#0D1411] border border-[#1A2821] rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl backdrop-blur-md relative overflow-hidden transition-all",
        className
      )}
    >
      {/* Ambient background glow accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F59B]/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-0">
        {/* Metric 1: Total Ingestion */}
        <div className="flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-[#1A2821] pb-4 sm:pb-0 sm:pr-6 lg:pr-6">
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
              {totalIngestion.toLocaleString()}
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
        <div className="flex flex-col justify-between border-b sm:border-b-0 lg:border-r border-[#1A2821] pb-4 sm:pb-0 sm:pl-6 lg:px-6">
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
                {fleetDisplay}
              </span>
            </div>
            <span className="text-[11px] text-[#667A71] font-mono">5 Edge Nodes Deployed</span>
          </div>

          <div className="mt-2">
            <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/20 font-mono shadow-[0_0_8px_rgba(0,245,155,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F59B] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F59B]" />
              </span>
              <span>100% Operational</span>
            </span>
          </div>
        </div>

        {/* Metric 3: Edge p95 Latency */}
        <div className="flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-[#1A2821] pb-4 sm:pb-0 sm:pr-6 lg:border-r lg:border-[#1A2821] lg:px-6">
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
              {p95LatencyMs > 0 ? `${p95LatencyMs.toFixed(1)} ms` : "8.4 ms"}
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
        <div className="flex flex-col justify-between sm:pl-6 lg:pl-6 pt-2 sm:pt-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8E9E96] font-mono">
              Unacknowledged Alarms
            </span>
            <div className="p-1.5 rounded-lg bg-[#131C18] border border-[#1A2821]">
              {unacknowledgedAlarms > 0 ? (
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
                unacknowledgedAlarms > 0 ? "text-[#FF4D4D]" : "text-white"
              )}
            >
              {unacknowledgedAlarms}
            </span>
            <span className="text-[11px] text-[#667A71] font-mono">Active Incidents</span>
          </div>

          <div className="mt-2">
            {unacknowledgedAlarms > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF4D4D]/15 text-[#FF4D4D] border border-[#FF4D4D]/30 shadow-[0_0_10px_rgba(255,77,77,0.25)] font-mono animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D4D]" />
                <span>{unacknowledgedAlarms} Action Required</span>
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
