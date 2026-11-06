"use client";

import React from "react";
import { TelemetryPayload, DeviceStatus, AnomalyEvent, MachineState } from "@/types/iiot";
import { Activity, ShieldCheck, AlertTriangle, AlertOctagon, Power, Clock, ArrowUpRight } from "lucide-react";
import { cn, formatTimestamp } from "@/lib/utils";

interface PlantOverviewProps {
  devices: Record<string, TelemetryPayload>;
  statuses: Record<string, DeviceStatus>;
  alerts: AnomalyEvent[];
  msgPerSec: number;
  totalMessages: number;
  avgLatency: number;
  onSelectDevice: (deviceId: string) => void;
}

export function PlantOverview({
  devices,
  statuses,
  alerts,
  msgPerSec,
  totalMessages,
  avgLatency,
  onSelectDevice,
}: PlantOverviewProps) {
  // Preset list of expected machines in the fleet
  const fleetIds = ["motor-01", "motor-02", "pump-01", "compressor-01", "conveyor-01"];
  const activeCount = Object.keys(devices).length;
  const unackAlerts = alerts.filter((a) => !a.acknowledged);

  const getStatusBadge = (state?: MachineState) => {
    switch (state) {
      case "RUNNING":
        return {
          label: "RUNNING",
          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: ShieldCheck,
        };
      case "WARNING":
        return {
          label: "WARNING",
          className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: AlertTriangle,
        };
      case "CRITICAL":
        return {
          label: "CRITICAL",
          className: "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse",
          icon: AlertOctagon,
        };
      case "STOPPED":
        return {
          label: "STOPPED",
          className: "bg-gray-500/10 text-gray-400 border-gray-500/30",
          icon: Power,
        };
      default:
        return {
          label: "AWAITING",
          className: "bg-slate-500/10 text-slate-400 border-slate-500/30",
          icon: Clock,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top SCADA Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-industrial-panel border border-industrial-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Connected Assets</span>
            <Activity className="w-4 h-4 text-industrial-cyan" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">{activeCount} / 5</span>
            <span className="text-xs text-emerald-400 font-mono">100% Target</span>
          </div>
          <div className="mt-2 w-full bg-industrial-dark rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-industrial-cyan h-full rounded-full transition-all duration-500"
              style={{ width: `${(activeCount / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-industrial-panel border border-industrial-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Stream Throughput</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">{msgPerSec}</span>
            <span className="text-xs text-gray-400 font-mono">msg/sec</span>
          </div>
          <p className="mt-2 text-[11px] text-gray-400 font-mono">
            Total ingested: <span className="text-gray-200">{totalMessages.toLocaleString()}</span>
          </p>
        </div>

        <div className="bg-industrial-panel border border-industrial-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Edge Processing Latency</span>
            <span className="text-xs font-mono text-cyan-400">Sub-100ms</span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">{avgLatency}</span>
            <span className="text-xs text-gray-400 font-mono">ms</span>
          </div>
          <p className="mt-2 text-[11px] text-gray-400 font-mono">
            Target p95 requirement: &lt; 100 ms
          </p>
        </div>

        <div className="bg-industrial-panel border border-industrial-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Unacknowledged Alarms</span>
            <ShieldCheck className={cn("w-4 h-4", unackAlerts.length > 0 ? "text-rose-400" : "text-emerald-400")} />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={cn("text-2xl font-bold font-mono", unackAlerts.length > 0 ? "text-rose-400" : "text-emerald-400")}>
              {unackAlerts.length}
            </span>
            <span className="text-xs text-gray-400 font-mono">pending review</span>
          </div>
          <p className="mt-2 text-[11px] text-gray-400 font-mono">
            {unackAlerts.length === 0 ? "Normal operational state" : "Action required in Console"}
          </p>
        </div>
      </div>

      {/* Equipment Fleet Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Industrial Plant Fleet Synoptic
            </h2>
            <p className="text-xs text-gray-400">
              Continuous multi-sensor telemetry stream via MQTT QoS 1
            </p>
          </div>
          <span className="text-xs font-mono text-gray-400 bg-industrial-panel border border-industrial-border px-2.5 py-1 rounded">
            Protocol: OASIS MQTT 5.0 (JSON)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {fleetIds.map((devId) => {
            const telemetry = devices[devId];
            const status = statuses[devId];
            const badge = getStatusBadge(telemetry?.machine_state || status?.machine_state);
            const StatusIcon = badge.icon;

            const temp = telemetry?.measurements.temperature_c ?? 0;
            const press = telemetry?.measurements.pressure_bar ?? 0;
            const vib = telemetry?.measurements.vibration_mm_s ?? 0;
            const hum = telemetry?.measurements.humidity_pct ?? 0;

            return (
              <div
                key={devId}
                className="bg-industrial-panel border border-industrial-border rounded-lg p-5 hover:border-industrial-cyan/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-base text-white">{devId}</span>
                        <span className="text-[10px] font-mono text-gray-400 border border-industrial-border px-1.5 py-0.5 rounded uppercase">
                          {status?.device_type || (devId.startsWith("motor") ? "MOTOR" : devId.startsWith("pump") ? "PUMP" : devId.startsWith("compressor") ? "COMPRESSOR" : "CONVEYOR")}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                        Site A / Line {devId.includes("01") && !devId.includes("compressor") && !devId.includes("conveyor") ? "1" : "2"}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold border",
                        badge.className
                      )}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  {/* Physical Variables Gauges */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {/* Temperature */}
                    <div className="bg-industrial-dark border border-industrial-border/60 rounded p-2.5">
                      <div className="flex justify-between items-center text-[11px] font-mono text-gray-400">
                        <span>Temperature</span>
                        <span className="text-gray-500">Max 90°C</span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span
                          className={cn(
                            "font-mono font-bold text-lg",
                            temp > 85 ? "text-rose-400" : temp > 75 ? "text-amber-400" : "text-white"
                          )}
                        >
                          {temp.toFixed(1)} <span className="text-xs font-normal text-gray-400">°C</span>
                        </span>
                      </div>
                      <div className="mt-1.5 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            temp > 85 ? "bg-rose-500" : temp > 75 ? "bg-amber-500" : "bg-emerald-500"
                          )}
                          style={{ width: `${Math.min(100, (temp / 100) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Vibration */}
                    <div className="bg-industrial-dark border border-industrial-border/60 rounded p-2.5">
                      <div className="flex justify-between items-center text-[11px] font-mono text-gray-400">
                        <span>Vibration RMS</span>
                        <span className="text-gray-500">Max 6.0</span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span
                          className={cn(
                            "font-mono font-bold text-lg",
                            vib > 5.0 ? "text-rose-400" : vib > 3.8 ? "text-amber-400" : "text-white"
                          )}
                        >
                          {vib.toFixed(2)} <span className="text-xs font-normal text-gray-400">mm/s</span>
                        </span>
                      </div>
                      <div className="mt-1.5 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            vib > 5.0 ? "bg-rose-500" : vib > 3.8 ? "bg-amber-500" : "bg-emerald-500"
                          )}
                          style={{ width: `${Math.min(100, (vib / 7.0) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Pressure */}
                    <div className="bg-industrial-dark border border-industrial-border/60 rounded p-2.5">
                      <div className="flex justify-between items-center text-[11px] font-mono text-gray-400">
                        <span>Pressure</span>
                        <span className="text-gray-500">Bar</span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="font-mono font-bold text-lg text-white">
                          {press.toFixed(2)} <span className="text-xs font-normal text-gray-400">bar</span>
                        </span>
                      </div>
                      <div className="mt-1.5 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (press / 10.0) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Humidity */}
                    <div className="bg-industrial-dark border border-industrial-border/60 rounded p-2.5">
                      <div className="flex justify-between items-center text-[11px] font-mono text-gray-400">
                        <span>Humidity</span>
                        <span className="text-gray-500">%RH</span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="font-mono font-bold text-lg text-white">
                          {hum.toFixed(1)} <span className="text-xs font-normal text-gray-400">%</span>
                        </span>
                      </div>
                      <div className="mt-1.5 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, hum)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-industrial-border/60 flex items-center justify-between text-xs font-mono">
                  <div className="text-gray-400 text-[11px]">
                    Seq: <span className="text-gray-200">{telemetry?.sequence ?? 0}</span> |{" "}
                    {formatTimestamp(telemetry?.timestamp)}
                  </div>

                  <button
                    onClick={() => onSelectDevice(devId)}
                    className="flex items-center space-x-1 text-industrial-cyan hover:text-white transition-colors text-xs font-semibold"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

