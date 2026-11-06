"use client";

import React, { useState } from "react";
import { TelemetryPayload, DeviceStatus } from "@/types/iiot";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { Cpu, ArrowLeft, Activity, Flame, Gauge, Vibrate } from "lucide-react";
import { cn, formatTimestamp } from "@/lib/utils";

interface DeviceDetailProps {
  devices: Record<string, TelemetryPayload>;
  statuses: Record<string, DeviceStatus>;
  history: Record<
    string,
    Array<{
      time: string;
      temp: number;
      press: number;
      vib: number;
      hum: number;
    }>
  >;
  selectedDevice: string;
  onSelectDevice: (id: string) => void;
}

export function DeviceDetail({
  devices,
  statuses,
  history,
  selectedDevice,
  onSelectDevice,
}: DeviceDetailProps) {
  const [selectedMetric, setSelectedMetric] = useState<"all" | "temp" | "vib" | "press">("all");
  const fleetIds = ["motor-01", "motor-02", "pump-01", "compressor-01", "conveyor-01"];

  const currentDevice = devices[selectedDevice];
  const currentStatus = statuses[selectedDevice];
  const deviceHistory = history[selectedDevice] || [];

  const temp = currentDevice?.measurements.temperature_c ?? 0;
  const press = currentDevice?.measurements.pressure_bar ?? 0;
  const vib = currentDevice?.measurements.vibration_mm_s ?? 0;
  const hum = currentDevice?.measurements.humidity_pct ?? 0;

  return (
    <div className="space-y-6">
      {/* Asset Header & Selector Bar */}
      <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-[#070B09] p-3.5 rounded-xl border border-[#1A2821]">
            <Cpu className="w-6 h-6 text-[#00F59B]" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold font-mono text-white tracking-wide">{selectedDevice}</h2>
              <span className="text-xs font-mono bg-[#070B09] border border-[#1A2821] px-2.5 py-0.5 rounded text-[#8E9E96]">
                {currentStatus?.device_type || "INDUSTRIAL ASSET"}
              </span>
              <span
                className={cn(
                  "text-xs font-mono font-semibold px-2.5 py-0.5 rounded border",
                  currentDevice?.machine_state === "CRITICAL"
                    ? "bg-[#FF4D4D]/20 text-[#FF4D4D] border-[#FF4D4D]/30 animate-pulse"
                    : currentDevice?.machine_state === "WARNING"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : "bg-[#00F59B]/20 text-[#00F59B] border-[#00F59B]/30"
                )}
              >
                {currentDevice?.machine_state || "ONLINE"}
              </span>
            </div>
            <p className="text-xs font-mono text-[#5C7268] mt-1">
              Topic: <span className="text-[#8E9E96]">ensam/iiot/site-a/line-1/{selectedDevice}/telemetry</span> | Sequence: #{currentDevice?.sequence ?? 0}
            </p>
          </div>
        </div>

        {/* Device Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#070B09] p-1.5 rounded-xl border border-[#1A2821]">
          {fleetIds.map((id) => (
            <button
              key={id}
              onClick={() => onSelectDevice(id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200",
                selectedDevice === id
                  ? "bg-[#00F59B] text-[#050B08] font-bold shadow-[0_0_12px_rgba(0,245,155,0.4)]"
                  : "text-[#8E9E96] hover:text-white hover:bg-[#131C18]"
              )}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Live Physical Variable Dials */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Temperature Dial */}
        <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-4 shadow-md">
          <div className="flex justify-between items-center text-xs font-mono text-[#8E9E96]">
            <span>Operating Temperature</span>
            <span className="text-[#FF4D4D] font-semibold">Alarm: &gt; 80°C</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span
              className={cn(
                "text-3xl font-mono font-bold",
                temp > 85 ? "text-[#FF4D4D]" : temp > 75 ? "text-amber-400" : "text-white"
              )}
            >
              {temp.toFixed(1)} <span className="text-sm font-normal text-[#8E9E96]">°C</span>
            </span>
            <span className="text-xs font-mono text-[#5C7268]">Target: 60°C</span>
          </div>
          <div className="mt-3 w-full bg-[#16231D] rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                temp > 85 ? "bg-[#FF4D4D]" : temp > 75 ? "bg-amber-500" : "bg-[#00F59B]"
              )}
              style={{ width: `${Math.min(100, (temp / 100) * 100)}%` }}
            />
          </div>
        </div>

        {/* Vibration Dial */}
        <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-4 shadow-md">
          <div className="flex justify-between items-center text-xs font-mono text-[#8E9E96]">
            <span>Vibration RMS Velocity</span>
            <span className="text-[#FF4D4D] font-semibold">Alarm: &gt; 4.0</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span
              className={cn(
                "text-3xl font-mono font-bold",
                vib > 5.0 ? "text-[#FF4D4D]" : vib > 3.8 ? "text-amber-400" : "text-white"
              )}
            >
              {vib.toFixed(2)} <span className="text-sm font-normal text-[#8E9E96]">mm/s</span>
            </span>
            <span className="text-xs font-mono text-[#5C7268]">ISO 10816</span>
          </div>
          <div className="mt-3 w-full bg-[#16231D] rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                vib > 5.0 ? "bg-[#FF4D4D]" : vib > 3.8 ? "bg-amber-500" : "bg-[#00F59B]"
              )}
              style={{ width: `${Math.min(100, (vib / 7.0) * 100)}%` }}
            />
          </div>
        </div>

        {/* Pressure Dial */}
        <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-4 shadow-md">
          <div className="flex justify-between items-center text-xs font-mono text-[#8E9E96]">
            <span>Line Pressure</span>
            <span className="text-[#00F59B] font-semibold">Nominal: ~4.5</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-mono font-bold text-white">
              {press.toFixed(2)} <span className="text-sm font-normal text-[#8E9E96]">bar</span>
            </span>
            <span className="text-xs font-mono text-[#5C7268]">Hydraulic</span>
          </div>
          <div className="mt-3 w-full bg-[#16231D] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (press / 10.0) * 100)}%` }}
            />
          </div>
        </div>

        {/* Humidity Dial */}
        <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-4 shadow-md">
          <div className="flex justify-between items-center text-xs font-mono text-[#8E9E96]">
            <span>Ambient Humidity</span>
            <span className="text-blue-400 font-semibold">Environment</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-mono font-bold text-white">
              {hum.toFixed(1)} <span className="text-sm font-normal text-[#8E9E96]">%</span>
            </span>
            <span className="text-xs font-mono text-[#5C7268]">Atmospheric</span>
          </div>
          <div className="mt-3 w-full bg-[#16231D] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, hum)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Real-Time Glowing Recharts AreaChart Trend */}
      <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#1A2821] gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold font-mono uppercase text-white tracking-wide">
                Continuous Telemetry Trend (Last 30 Frames)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#131F19] text-[#00F59B] border border-[#00F59B]/30 font-semibold">
                SPLINE AREA
              </span>
            </div>
            <p className="text-xs font-mono text-[#8E9E96] mt-0.5">
              Live updates via MQTT over WebSockets sub-100ms
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center space-x-1.5 bg-[#070B09] p-1.5 rounded-full border border-[#1A2821] text-xs font-mono">
            <button
              onClick={() => setSelectedMetric("all")}
              className={cn(
                "px-3 py-1 rounded-full transition-all duration-200 font-semibold",
                selectedMetric === "all"
                  ? "bg-[#00F59B] text-[#050B08] shadow-[0_0_12px_rgba(0,245,155,0.4)]"
                  : "text-[#8E9E96] hover:text-white hover:bg-[#131C18]"
              )}
            >
              All Signals
            </button>
            <button
              onClick={() => setSelectedMetric("temp")}
              className={cn(
                "px-3 py-1 rounded-full transition-all duration-200 font-semibold",
                selectedMetric === "temp"
                  ? "bg-[#00F59B] text-[#050B08] shadow-[0_0_12px_rgba(0,245,155,0.4)]"
                  : "text-[#8E9E96] hover:text-white hover:bg-[#131C18]"
              )}
            >
              Temperature
            </button>
            <button
              onClick={() => setSelectedMetric("vib")}
              className={cn(
                "px-3 py-1 rounded-full transition-all duration-200 font-semibold",
                selectedMetric === "vib"
                  ? "bg-[#00F59B] text-[#050B08] shadow-[0_0_12px_rgba(0,245,155,0.4)]"
                  : "text-[#8E9E96] hover:text-white hover:bg-[#131C18]"
              )}
            >
              Vibration
            </button>
            <button
              onClick={() => setSelectedMetric("press")}
              className={cn(
                "px-3 py-1 rounded-full transition-all duration-200 font-semibold",
                selectedMetric === "press"
                  ? "bg-[#00F59B] text-[#050B08] shadow-[0_0_12px_rgba(0,245,155,0.4)]"
                  : "text-[#8E9E96] hover:text-white hover:bg-[#131C18]"
              )}
            >
              Pressure
            </button>
          </div>
        </div>

        {/* Recharts AreaChart with Glowing Gradient Fills */}
        <div className="mt-4 h-80 w-full">
          {deviceHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-xs font-mono text-[#5C7268] space-y-2">
              <Activity className="w-6 h-6 animate-pulse text-[#00F59B]/50" />
              <span>Awaiting telemetry streaming from {selectedDevice}...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={deviceHistory} margin={{ top: 12, right: 30, left: -10, bottom: 0 }}>
                <defs>
                  {/* Neon Glow Linear Gradients */}
                  <linearGradient id="scadaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F59B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00F59B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="neonGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F59B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00F59B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tempGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4D4D" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#FF4D4D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="vibGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pressGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F59B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00F59B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="humGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#16231D" vertical={false} />
                <XAxis dataKey="time" stroke="#4E6359" fontSize={11} tickLine={false} fontFamily="monospace" />
                <YAxis stroke="#4E6359" fontSize={11} tickLine={false} domain={["auto", "auto"]} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0D1411",
                    borderColor: "#1A2821",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    color: "#E6F4ED",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px", fontFamily: "monospace" }} />

                {/* Threshold Reference Lines */}
                {(selectedMetric === "all" || selectedMetric === "temp") && (
                  <ReferenceLine
                    y={80}
                    label={{ value: "Temp Warning (80°C)", fill: "#f59e0b", fontSize: 10, fontFamily: "monospace" }}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                  />
                )}
                {(selectedMetric === "all" || selectedMetric === "vib") && (
                  <ReferenceLine
                    y={4.0}
                    label={{ value: "Vibration Warning (4.0 mm/s)", fill: "#FF4D4D", fontSize: 10, fontFamily: "monospace" }}
                    stroke="#FF4D4D"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Smooth Spline Areas with Monotone Curve */}
                {(selectedMetric === "all" || selectedMetric === "temp") && (
                  <Area
                    type="monotone"
                    dataKey="temp"
                    name="Temperature (°C)"
                    stroke="#FF4D4D"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#tempGlow)"
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {(selectedMetric === "all" || selectedMetric === "vib") && (
                  <Area
                    type="monotone"
                    dataKey="vib"
                    name="Vibration (mm/s)"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#vibGlow)"
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {(selectedMetric === "all" || selectedMetric === "press") && (
                  <Area
                    type="monotone"
                    dataKey="press"
                    name="Pressure (bar)"
                    stroke="#00F59B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scadaGlow)"
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {selectedMetric === "all" && (
                  <Area
                    type="monotone"
                    dataKey="hum"
                    name="Humidity (%)"
                    stroke="#3B82F6"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#humGlow)"
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeviceDetail;
