"use client";

import React, { useState } from "react";
import { TelemetryPayload, DeviceStatus, AnomalyEvent, MachineState, ScenarioType } from "@/types/iiot";
import { Activity, ShieldCheck, AlertTriangle, AlertOctagon, Power, Clock, ArrowUpRight, ShieldAlert, Cpu } from "lucide-react";
import { cn, formatTimestamp } from "@/lib/utils";
import { TelemetryAreaChart } from "@/components/scada/TelemetryAreaChart";
import { RadialGauge } from "@/components/scada/RadialGauge";
import { IncidentResponseTable } from "@/components/scada/IncidentResponseTable";
import { TestLabPanel } from "@/components/scada/TestLabPanel";

interface PlantOverviewProps {
  devices: Record<string, TelemetryPayload>;
  statuses: Record<string, DeviceStatus>;
  alerts: AnomalyEvent[];
  msgPerSec: number;
  totalMessages: number;
  avgLatency: number;
  onSelectDevice: (deviceId: string) => void;
  onAcknowledge?: (eventId: string, note: string) => void;
  onInjectFault?: (scenario: ScenarioType, targetDevice: string, durationSec: number) => void;
  onReset?: () => void;
  onPublishCommand?: (
    deviceId: string | "all",
    action: "set_scenario" | "reset",
    scenario?: ScenarioType,
    durationSec?: number
  ) => void;
  history?: Record<
    string,
    Array<{
      time: string;
      temp: number;
      press: number;
      vib: number;
      hum?: number;
    }>
  >;
  selectedDevice?: string;
}

export function PlantOverview({
  devices,
  statuses,
  alerts,
  msgPerSec,
  totalMessages,
  avgLatency,
  onSelectDevice,
  onAcknowledge,
  onInjectFault,
  onReset,
  onPublishCommand,
  history,
  selectedDevice,
}: PlantOverviewProps) {
  // Preset list of expected machines in the fleet
  const fleetIds = ["motor-01", "motor-02", "pump-01", "compressor-01", "conveyor-01"];
  const activeCount = Object.keys(devices).length;
  const unackAlerts = alerts.filter((a) => !a.acknowledged);

  const [activeLeadDevice, setActiveLeadDevice] = useState<string>(
    selectedDevice || "motor-01"
  );

  const currentLeadDevice = selectedDevice || activeLeadDevice;
  const leadHistory = history?.[currentLeadDevice] || [];

  // Compute dynamic Fleet Health Index from alerts & physical telemetry
  const criticalAlerts = unackAlerts.filter((a) => a.severity === "CRITICAL");
  const warningAlerts = unackAlerts.filter((a) => a.severity === "WARNING");

  let fleetHealth = 100.0;
  // Factor in sensor anomalies
  Object.values(devices).forEach((dev) => {
    const t = dev.measurements?.temperature_c ?? 0;
    const v = dev.measurements?.vibration_mm_s ?? 0;
    if (t > 90 || v > 5.5) {
      fleetHealth -= 15;
    } else if (t > 80 || v > 4.0) {
      fleetHealth -= 8;
    }
  });
  fleetHealth -= criticalAlerts.length * 20;
  fleetHealth -= warningAlerts.length * 8;
  fleetHealth = Math.max(0, Math.min(100, fleetHealth));

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
      {/* Reference Design Main Grid: AreaChart (Left) + RadialGauge & Advisory (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Glowing Spline Area Chart */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <TelemetryAreaChart
            history={leadHistory}
            equipmentId={currentLeadDevice}
            equipmentName={statuses[currentLeadDevice]?.device_type || "INDUSTRIAL DRIVE"}
            title="Operational Telemetry Stream"
            height={280}
            className="h-full"
          />
        </div>

        {/* Right Column (4 cols): Radial Gauge & Advisory Card */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Feature 6: Asset Health Circular Radial Gauge */}
          <RadialGauge
            percentage={fleetHealth}
            title="Asset Health Index"
            subtitle="Based on fleet telemetry & SLA"
            size={180}
            strokeWidth={14}
            radius={58}
          />

          {/* Industrial Advisory Card (Matching Reference Design Promo / Webinar Card) */}
          <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-5 shadow-lg flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F59B] font-semibold">
                  SCADA Surveillance
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F59B] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F59B]"></span>
                </span>
              </div>
              <h4 className="text-base font-mono font-bold text-white mt-1">
                ISO 10816 Vibration & Thermal Standards
              </h4>
              <p className="text-xs font-mono text-[#8E9E96] mt-2 leading-relaxed">
                Real-time edge ingestion via MQTT QoS 1. Continuous algorithmic monitoring of bearing temperature and velocity RMS across all 5 production assets.
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-[#1A2821]/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#5C7268]">
                SLA p95: &lt; 100ms
              </span>
              <button
                type="button"
                onClick={() => onSelectDevice(currentLeadDevice)}
                className="text-xs font-mono font-semibold text-[#00F59B] hover:text-white transition-colors flex items-center space-x-1"
              >
                <span>Inspect Asset</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 7 & Feature 8: Incident Response Table (Left 8 cols) + Industrial Test Lab Panel (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col">
          <IncidentResponseTable
            alerts={alerts}
            onAcknowledge={onAcknowledge || (() => {})}
            className="h-full"
          />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <TestLabPanel
            onInjectFault={onInjectFault}
            onReset={onReset}
            onPublishCommand={onPublishCommand}
            className="h-full"
          />
        </div>
      </div>

      {/* Industrial Plant Fleet Synoptic Grid */}
      <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1A2821] gap-2 mb-5">
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              Industrial Plant Fleet Synoptic
            </h2>
            <p className="text-xs font-mono text-[#8E9E96] mt-0.5">
              Continuous multi-sensor telemetry stream via MQTT QoS 1 (5/5 Assets)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-[#8E9E96] bg-[#070B09] border border-[#1A2821] px-2.5 py-1 rounded-full">
              Protocol: OASIS MQTT 5.0 (JSON)
            </span>
          </div>
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
            const isLead = devId === currentLeadDevice;

            return (
              <div
                key={devId}
                className={cn(
                  "bg-[#070B09] border rounded-xl p-4 transition-all duration-200 flex flex-col justify-between",
                  isLead
                    ? "border-[#00F59B]/60 shadow-[0_0_15px_rgba(0,245,155,0.15)]"
                    : "border-[#1A2821] hover:border-[#1F3328]"
                )}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-base text-white">{devId}</span>
                        <span className="text-[10px] font-mono text-[#8E9E96] border border-[#1A2821] px-1.5 py-0.5 rounded uppercase">
                          {status?.device_type || (devId.startsWith("motor") ? "MOTOR" : devId.startsWith("pump") ? "PUMP" : devId.startsWith("compressor") ? "COMPRESSOR" : "CONVEYOR")}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-[#5C7268] mt-0.5">
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
                  <div className="grid grid-cols-2 gap-2.5 mt-4">
                    {/* Temperature */}
                    <div className="bg-[#0D1411] border border-[#1A2821] rounded-lg p-2.5">
                      <div className="flex justify-between items-center text-[10px] font-mono text-[#8E9E96]">
                        <span>Temp</span>
                        <span className="text-[#5C7268]">Max 90°C</span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span
                          className={cn(
                            "font-mono font-bold text-base",
                            temp > 85 ? "text-[#FF4D4D]" : temp > 75 ? "text-amber-400" : "text-white"
                          )}
                        >
                          {temp.toFixed(1)} <span className="text-xs font-normal text-[#8E9E96]">°C</span>
                        </span>
                      </div>
                      <div className="mt-1.5 w-full bg-[#16231D] rounded-full h-1 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            temp > 85 ? "bg-[#FF4D4D]" : temp > 75 ? "bg-amber-400" : "bg-[#00F59B]"
                          )}
                          style={{ width: `${Math.min(100, (temp / 100) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Vibration */}
                    <div className="bg-[#0D1411] border border-[#1A2821] rounded-lg p-2.5">
                      <div className="flex justify-between items-center text-[10px] font-mono text-[#8E9E96]">
                        <span>Vibration</span>
                        <span className="text-[#5C7268]">Max 6.0</span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span
                          className={cn(
                            "font-mono font-bold text-base",
                            vib > 5.0 ? "text-[#FF4D4D]" : vib > 3.8 ? "text-amber-400" : "text-white"
                          )}
                        >
                          {vib.toFixed(2)} <span className="text-xs font-normal text-[#8E9E96]">mm/s</span>
                        </span>
                      </div>
                      <div className="mt-1.5 w-full bg-[#16231D] rounded-full h-1 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            vib > 5.0 ? "bg-[#FF4D4D]" : vib > 3.8 ? "bg-amber-400" : "bg-[#00F59B]"
                          )}
                          style={{ width: `${Math.min(100, (vib / 7.0) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Pressure */}
                    <div className="bg-[#0D1411] border border-[#1A2821] rounded-lg p-2.5">
                      <div className="flex justify-between items-center text-[10px] font-mono text-[#8E9E96]">
                        <span>Pressure</span>
                        <span className="text-[#5C7268]">Hydraulic</span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="font-mono font-bold text-base text-white">
                          {press.toFixed(2)} <span className="text-xs font-normal text-[#8E9E96]">bar</span>
                        </span>
                      </div>
                      <div className="mt-1.5 w-full bg-[#16231D] rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (press / 10.0) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Humidity */}
                    <div className="bg-[#0D1411] border border-[#1A2821] rounded-lg p-2.5">
                      <div className="flex justify-between items-center text-[10px] font-mono text-[#8E9E96]">
                        <span>Humidity</span>
                        <span className="text-[#5C7268]">%RH</span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="font-mono font-bold text-base text-white">
                          {hum.toFixed(1)} <span className="text-xs font-normal text-[#8E9E96]">%</span>
                        </span>
                      </div>
                      <div className="mt-1.5 w-full bg-[#16231D] rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, hum)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-[#1A2821] flex items-center justify-between text-xs font-mono">
                  <div className="text-[#5C7268] text-[10px]">
                    Seq: <span className="text-[#8E9E96]">{telemetry?.sequence ?? 0}</span> |{" "}
                    {formatTimestamp(telemetry?.timestamp)}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveLeadDevice(devId)}
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded transition-all font-semibold",
                        isLead
                          ? "bg-[#00F59B]/20 text-[#00F59B] border border-[#00F59B]/40"
                          : "text-[#8E9E96] hover:text-white"
                      )}
                    >
                      {isLead ? "Streamed" : "Stream"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectDevice(devId)}
                      className="flex items-center space-x-1 text-[#00F59B] hover:text-white transition-colors text-xs font-semibold"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PlantOverview;
