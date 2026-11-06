"use client";

import React, { useState } from "react";
import { TelemetryPayload, DeviceStatus } from "@/types/iiot";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { Gauge, ShieldAlert, Cpu, Activity, Clock } from "lucide-react";
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
      <div className="bg-industrial-panel border border-industrial-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-industrial-dark p-3 rounded-lg border border-industrial-border">
            <Cpu className="w-6 h-6 text-industrial-cyan" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold font-mono text-white">{selectedDevice}</h2>
              <span className="text-xs font-mono bg-industrial-dark border border-industrial-border px-2 py-0.5 rounded text-gray-300">
                {currentStatus?.device_type || "INDUSTRIAL ASSET"}
              </span>
              <span
                className={cn(
                  "text-xs font-mono font-semibold px-2 py-0.5 rounded border",
                  currentDevice?.machine_state === "CRITICAL"
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse"
                    : currentDevice?.machine_state === "WARNING"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                )}
              >
                {currentDevice?.machine_state || "ONLINE"}
              </span>
            </div>
            <p className="text-xs font-mono text-gray-400 mt-1">
              Topic: <span className="text-gray-300">ensam/iiot/site-a/line-1/{selectedDevice}/telemetry</span> | Sequence: #{currentDevice?.sequence ?? 0}
            </p>
          </div>
        </div>

        {/* Device Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {fleetIds.map((id) => (
            <button
              key={id}
              onClick={() => onSelectDevice(id)}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-mono transition-all",
                selectedDevice === id
                  ? "bg-industrial-cyan/20 text-industrial-cyan border border-industrial-cyan/40 font-bold"
                  : "bg-industrial-dark text-gray-400 border border-industrial-border hover:text-white"
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
        <div className="bg-industrial-panel border border-industrial-border rounded-lg p-4">
          <div className="flex justify-between items-center text-xs font-mono text-gray-400">
            <span>Operating Temperature</span>
            <span className="text-rose-400 font-semibold">Alarm: &gt; 80°C</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span
              className={cn(
                "text-3xl font-mono font-bold",
                temp > 85 ? "text-rose-400" : temp > 75 ? "text-amber-400" : "text-white"
              )}
            >
              {temp.toFixed(1)} <span className="text-sm font-normal text-gray-400">°C</span>
            </span>
            <span className="text-xs font-mono text-gray-400">Target: 60°C</span>
          </div>
          <div className="mt-3 w-full bg-industrial-dark rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                temp > 85 ? "bg-rose-500" : temp > 75 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${Math.min(100, (temp / 100) * 100)}%` }}
            />
          </div>
        </div>

        {/* Vibration Dial */}
        <div className="bg-industrial-panel border border-industrial-border rounded-lg p-4">
          <div className="flex justify-between items-center text-xs font-mono text-gray-400">
            <span>Vibration RMS Velocity</span>
            <span className="text-rose-400 font-semibold">Alarm: &gt; 4.0</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span
              className={cn(
                "text-3xl font-mono font-bold",
                vib > 5.0 ? "text-rose-400" : vib > 3.8 ? "text-amber-400" : "text-white"
              )}
            >
              {vib.toFixed(2)} <span className="text-sm font-normal text-gray-400">mm/s</span>
            </span>
            <span className="text-xs font-mono text-gray-400">ISO 10816</span>
          </div>
          <div className="mt-3 w-full bg-industrial-dark rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                vib > 5.0 ? "bg-rose-500" : vib > 3.8 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${Math.min(100, (vib / 7.0) * 100)}%` }}
            />
          </div>
        </div>

        {/* Pressure Dial */}
        <div className="bg-industrial-panel border border-industrial-border rounded-lg p-4">
          <div className="flex justify-between items-center text-xs font-mono text-gray-400">
            <span>Line Pressure</span>
            <span className="text-cyan-400 font-semibold">Nominal: ~4.5</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-mono font-bold text-white">
              {press.toFixed(2)} <span className="text-sm font-normal text-gray-400">bar</span>
            </span>
            <span className="text-xs font-mono text-gray-400">Hydraulic</span>
          </div>
          <div className="mt-3 w-full bg-industrial-dark rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (press / 10.0) * 100)}%` }}
            />
          </div>
        </div>

        {/* Humidity Dial */}
        <div className="bg-industrial-panel border border-industrial-border rounded-lg p-4">
          <div className="flex justify-between items-center text-xs font-mono text-gray-400">
            <span>Ambient Humidity</span>
            <span className="text-blue-400 font-semibold">Environment</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-mono font-bold text-white">
              {hum.toFixed(1)} <span className="text-sm font-normal text-gray-400">%</span>
            </span>
            <span className="text-xs font-mono text-gray-400">Atmospheric</span>
          </div>
          <div className="mt-3 w-full bg-industrial-dark rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, hum)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Real-Time Dynamic Multi-Variable Chart */}
      <div className="bg-industrial-panel border border-industrial-border rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-industrial-border gap-3">
          <div>
            <h3 className="text-sm font-bold font-mono uppercase text-white">
              Continuous Telemetry Trend (Last 30 Frames)
            </h3>
            <p className="text-xs text-gray-400">
              Live updates via MQTT over WebSockets sub-100ms
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center space-x-1 bg-industrial-dark p-1 rounded border border-industrial-border text-xs font-mono">
            <button
              onClick={() => setSelectedMetric("all")}
              className={cn(
                "px-2.5 py-1 rounded transition-colors",
                selectedMetric === "all" ? "bg-industrial-panel text-white font-bold" : "text-gray-400 hover:text-white"
              )}
            >
              All Signals
            </button>
            <button
              onClick={() => setSelectedMetric("temp")}
              className={cn(
                "px-2.5 py-1 rounded transition-colors",
                selectedMetric === "temp" ? "bg-industrial-panel text-rose-400 font-bold" : "text-gray-400 hover:text-white"
              )}
            >
              Temperature
            </button>
            <button
              onClick={() => setSelectedMetric("vib")}
              className={cn(
                "px-2.5 py-1 rounded transition-colors",
                selectedMetric === "vib" ? "bg-industrial-panel text-amber-400 font-bold" : "text-gray-400 hover:text-white"
              )}
            >
              Vibration
            </button>
            <button
              onClick={() => setSelectedMetric("press")}
              className={cn(
                "px-2.5 py-1 rounded transition-colors",
                selectedMetric === "press" ? "bg-industrial-panel text-cyan-400 font-bold" : "text-gray-400 hover:text-white"
              )}
            >
              Pressure
            </button>
          </div>
        </div>

        {/* Recharts Chart Area */}
        <div className="mt-4 h-80 w-full">
          {deviceHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-mono text-gray-500">
              Awaiting telemetry streaming from {selectedDevice}...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={deviceHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b0f17",
                    borderColor: "#374151",
                    borderRadius: "0.375rem",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

                {/* Threshold Reference Lines */}
                {(selectedMetric === "all" || selectedMetric === "temp") && (
                  <ReferenceLine
                    y={80}
                    label={{ value: "Temp Warning (80°C)", fill: "#f59e0b", fontSize: 10 }}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                  />
                )}
                {(selectedMetric === "all" || selectedMetric === "vib") && (
                  <ReferenceLine
                    y={4.0}
                    label={{ value: "Vibration Warning (4.0 mm/s)", fill: "#ef4444", fontSize: 10 }}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Data Lines */}
                {(selectedMetric === "all" || selectedMetric === "temp") && (
                  <Line
                    type="monotone"
                    dataKey="temp"
                    name="Temperature (°C)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {(selectedMetric === "all" || selectedMetric === "vib") && (
                  <Line
                    type="monotone"
                    dataKey="vib"
                    name="Vibration (mm/s)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {(selectedMetric === "all" || selectedMetric === "press") && (
                  <Line
                    type="monotone"
                    dataKey="press"
                    name="Pressure (bar)"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {selectedMetric === "all" && (
                  <Line
                    type="monotone"
                    dataKey="hum"
                    name="Humidity (%)"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

