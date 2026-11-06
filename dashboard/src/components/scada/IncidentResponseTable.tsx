"use client";

import React, { useState } from "react";
import { AnomalyEvent, AlertSeverity } from "@/types/iiot";
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Cpu,
  Check,
  X,
  Filter,
  MessageSquare,
  Activity,
  Layers,
} from "lucide-react";
import { cn, formatTimestamp } from "@/lib/utils";

export interface IncidentItem extends Partial<AnomalyEvent> {
  id?: string;
  event_id?: string;
  device_id: string;
  timestamp: string;
  severity: AlertSeverity;
  variable?: string;
  rule?: string;
  observed_value?: number;
  value?: number;
  threshold?: number;
  reason?: string;
  acknowledged?: boolean;
  ack_note?: string;
  ack_timestamp?: string;
}

interface IncidentResponseTableProps {
  alerts: (AnomalyEvent | IncidentItem)[];
  onAcknowledge: (eventId: string, note: string) => void;
  className?: string;
  maxDisplay?: number;
}

export function IncidentResponseTable({
  alerts = [],
  onAcknowledge,
  className,
  maxDisplay = 20,
}: IncidentResponseTableProps) {
  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "WARNING" | "ACK">("ALL");
  const [selectedIncidentForAck, setSelectedIncidentForAck] = useState<IncidentItem | null>(null);
  const [ackNote, setAckNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Normalize alerts to ensure consistent property access
  const normalizedAlerts: IncidentItem[] = (alerts || []).map((a) => {
    const eventId = a.event_id || (a as any).id || `evt-${Math.random().toString(36).substr(2, 9)}`;
    return {
      ...a,
      event_id: eventId,
      id: eventId,
      rule: (a as any).rule || a.variable || "ANOMALY_DETECTED",
      variable: a.variable || (a as any).rule || "telemetry",
      observed_value: a.observed_value !== undefined ? a.observed_value : (a as any).value ?? 0,
      value: (a as any).value !== undefined ? (a as any).value : a.observed_value ?? 0,
      threshold: a.threshold ?? 0,
      reason: a.reason || `Operational anomaly exceeding safety threshold (${(a as any).rule || a.variable})`,
      acknowledged: Boolean(a.acknowledged),
    };
  });

  const unackCount = normalizedAlerts.filter((a) => !a.acknowledged).length;
  const criticalCount = normalizedAlerts.filter((a) => a.severity === "CRITICAL" && !a.acknowledged).length;
  const warningCount = normalizedAlerts.filter((a) => a.severity === "WARNING" && !a.acknowledged).length;

  const filteredAlerts = normalizedAlerts.filter((a) => {
    if (filter === "CRITICAL") return a.severity === "CRITICAL";
    if (filter === "WARNING") return a.severity === "WARNING";
    if (filter === "ACK") return a.acknowledged === true;
    return true;
  });

  const displayList = filteredAlerts.slice(0, maxDisplay);

  const handleOpenAckModal = (incident: IncidentItem) => {
    if (incident.acknowledged) return; // Idempotent no-op
    setSelectedIncidentForAck(incident);
    setAckNote("");
  };

  const handleConfirmAck = () => {
    if (!selectedIncidentForAck) return;
    const targetId = selectedIncidentForAck.event_id || selectedIncidentForAck.id;
    if (!targetId) return;

    // Apply safety sanitization and max 500-char length clamping
    const rawTrimmed = ackNote.trim();
    const finalNote = rawTrimmed.length > 0 ? rawTrimmed.substring(0, 500) : "Operator acknowledged";

    setSubmitting(true);
    try {
      onAcknowledge(targetId, finalNote);
      setSelectedIncidentForAck(null);
      setAckNote("");
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center space-x-1 bg-[#FF4D4D]/15 text-[#FF4D4D] border border-[#FF4D4D]/30 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow-[0_0_8px_rgba(255,77,77,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D] animate-ping" />
            <span>CRITICAL</span>
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center space-x-1 bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            <span>WARNING</span>
          </span>
        );
      case "INFO":
      default:
        return (
          <span className="inline-flex items-center space-x-1 bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>INFO</span>
          </span>
        );
    }
  };

  return (
    <div
      className={cn(
        "bg-[#0D1411] border border-[#1A2821] rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between",
        className
      )}
    >
      {/* 1. Header with Title, Badge, and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1A2821]/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#131C18] border border-[#1A2821] flex items-center justify-center text-[#00F59B] shadow-[0_0_12px_rgba(0,245,155,0.15)]">
            <ShieldAlert className="w-5 h-5 text-[#FF4D4D]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-mono font-bold text-white tracking-wide">
                Live Incident Response Log
              </h3>
              {unackCount > 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#FF4D4D]/20 text-[#FF4D4D] border border-[#FF4D4D]/40 rounded-full animate-pulse">
                  {unackCount} Action Required
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#00F59B]/15 text-[#00F59B] border border-[#00F59B]/30 rounded-full">
                  All Nominal
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-[#8E9E96] mt-0.5">
              Edge event detection stream & operator dispatch workflow (MQTT QoS 1)
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-[#070B09] border border-[#1A2821] p-1 rounded-xl text-xs font-mono">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={cn(
              "px-3 py-1 rounded-lg transition-all text-[11px]",
              filter === "ALL"
                ? "bg-[#00F59B] text-[#050B08] font-bold shadow-[0_0_10px_rgba(0,245,155,0.25)]"
                : "text-[#8E9E96] hover:text-white"
            )}
          >
            All ({normalizedAlerts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("CRITICAL")}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-all text-[11px]",
              filter === "CRITICAL"
                ? "bg-[#FF4D4D] text-white font-bold"
                : "text-[#8E9E96] hover:text-[#FF4D4D]"
            )}
          >
            Critical {criticalCount > 0 && `(${criticalCount})`}
          </button>
          <button
            type="button"
            onClick={() => setFilter("WARNING")}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-all text-[11px]",
              filter === "WARNING"
                ? "bg-[#F59E0B] text-black font-bold"
                : "text-[#8E9E96] hover:text-[#F59E0B]"
            )}
          >
            Warning {warningCount > 0 && `(${warningCount})`}
          </button>
          <button
            type="button"
            onClick={() => setFilter("ACK")}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-all text-[11px]",
              filter === "ACK"
                ? "bg-[#16231D] text-[#00F59B] font-bold border border-[#00F59B]/40"
                : "text-[#8E9E96] hover:text-white"
            )}
          >
            Acknowledged
          </button>
        </div>
      </div>

      {/* 2. List of Incidents (Matching "Popular Episodes" Table Format) */}
      <div className="mt-4 flex-1 space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
        {displayList.length === 0 ? (
          <div className="bg-[#070B09] border border-[#1A2821] rounded-xl p-8 text-center flex flex-col items-center justify-center my-4">
            <div className="w-12 h-12 rounded-full bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(0,245,155,0.2)]">
              <CheckCircle2 className="w-6 h-6 text-[#00F59B]" />
            </div>
            <h4 className="text-sm font-mono font-bold text-white">
              0 Active Incidents — All SCADA telemetry operating within nominal thresholds
            </h4>
            <p className="text-xs font-mono text-[#5C7268] mt-1 max-w-md">
              No alarms require operator acknowledgment. Machine health indices and ISO 10816 vibration baselines are optimal.
            </p>
          </div>
        ) : (
          displayList.map((alert) => {
            const isCritical = alert.severity === "CRITICAL";
            const isWarning = alert.severity === "WARNING";
            const eventId = alert.event_id || alert.id || "";

            return (
              <div
                key={eventId}
                className={cn(
                  "bg-[#070B09] border rounded-xl p-3 sm:p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                  alert.acknowledged
                    ? "border-[#1A2821]/60 opacity-70 hover:opacity-100"
                    : isCritical
                    ? "border-[#FF4D4D]/50 bg-[#FF4D4D]/5 shadow-[0_0_12px_rgba(255,77,77,0.1)]"
                    : isWarning
                    ? "border-[#F59E0B]/40 hover:border-[#F59E0B]/70"
                    : "border-[#1A2821] hover:border-[#1F3328]"
                )}
              >
                {/* Left Block: Equipment Icon Badge + Info */}
                <div className="flex items-start space-x-3 min-w-0">
                  {/* Equipment icon badge with status ring */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border mt-0.5",
                      alert.acknowledged
                        ? "bg-[#131C18] border-[#1A2821] text-[#8E9E96]"
                        : isCritical
                        ? "bg-[#FF4D4D]/15 border-[#FF4D4D]/40 text-[#FF4D4D] shadow-[0_0_10px_rgba(255,77,77,0.3)]"
                        : "bg-[#F59E0B]/15 border-[#F59E0B]/40 text-[#F59E0B]"
                    )}
                  >
                    {isCritical ? (
                      <AlertOctagon className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>

                  {/* Metadata and Description */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-white uppercase bg-[#131C18] border border-[#1A2821] px-2 py-0.5 rounded">
                        {alert.device_id}
                      </span>
                      <span className="font-mono text-xs text-[#00F59B] font-semibold">
                        {alert.rule || alert.variable}
                      </span>
                      <span className="text-[11px] font-mono text-[#5C7268] flex items-center space-x-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        <span>{formatTimestamp(alert.timestamp)}</span>
                      </span>
                    </div>

                    <p className="text-xs font-mono text-[#8E9E96] truncate max-w-xl">
                      {alert.reason}
                    </p>

                    <div className="text-[11px] font-mono text-[#5C7268] flex items-center space-x-3">
                      <span>
                        Value:{" "}
                        <span className={cn("font-bold", isCritical ? "text-[#FF4D4D]" : "text-amber-400")}>
                          {alert.observed_value ?? alert.value}
                        </span>
                      </span>
                      <span>
                        Limit: <span className="text-[#8E9E96]">{alert.threshold}</span>
                      </span>
                      {alert.acknowledged && alert.ack_note && (
                        <span className="text-[#00F59B] truncate max-w-xs">
                          Note: &ldquo;{alert.ack_note}&rdquo;
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Block: Severity Pill + Operator ACK Button */}
                <div className="flex items-center space-x-3 self-end sm:self-center flex-shrink-0">
                  {getSeverityBadge(alert.severity)}

                  {alert.acknowledged ? (
                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/30 text-[#00F59B] text-xs font-mono font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ACK</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenAckModal(alert)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#16231D] hover:bg-[#00F59B] text-[#8E9E96] hover:text-[#050B08] border border-[#1A2821] hover:border-[#00F59B] text-xs font-mono font-bold transition-all shadow-sm flex items-center space-x-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>ACK</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Operator Note Modal Dialog (Dialog / Modal) */}
      {selectedIncidentForAck && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1A2821] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FF4D4D]/15 border border-[#FF4D4D]/30 flex items-center justify-center text-[#FF4D4D]">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono font-bold text-white text-sm">
                    Operator Alarm Acknowledgment (ACK)
                  </h3>
                  <p className="text-[11px] font-mono text-[#5C7268]">
                    Event ID: {selectedIncidentForAck.event_id || selectedIncidentForAck.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedIncidentForAck(null)}
                className="text-[#8E9E96] hover:text-white p-1 rounded-lg hover:bg-[#16231D] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Incident Summary Card */}
            <div className="bg-[#070B09] border border-[#1A2821] rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#8E9E96]">Target Equipment:</span>
                <span className="text-white font-bold bg-[#131C18] border border-[#1A2821] px-2 py-0.5 rounded">
                  {selectedIncidentForAck.device_id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8E9E96]">Alarm Rule / Variable:</span>
                <span className="text-[#00F59B] font-semibold">
                  {selectedIncidentForAck.rule || selectedIncidentForAck.variable}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8E9E96]">Severity Level:</span>
                {getSeverityBadge(selectedIncidentForAck.severity)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8E9E96]">Value vs Threshold:</span>
                <span className="text-white font-semibold">
                  <span className="text-[#FF4D4D]">
                    {selectedIncidentForAck.observed_value ?? selectedIncidentForAck.value}
                  </span>{" "}
                  / Limit: {selectedIncidentForAck.threshold}
                </span>
              </div>
              <div className="pt-2 border-t border-[#1A2821]/80 text-[#8E9E96] text-[11px] leading-relaxed">
                {selectedIncidentForAck.reason}
              </div>
            </div>

            {/* Operator Maintenance Note Input */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#8E9E96] flex items-center justify-between">
                <span>Operator Maintenance &amp; Action Note:</span>
                <span className="text-[10px] text-[#5C7268]">{ackNote.length}/500</span>
              </label>
              <textarea
                value={ackNote}
                maxLength={500}
                onChange={(e) => setAckNote(e.target.value)}
                placeholder="Enter corrective action or shift observation (e.g. Technician notified, speed reduced, bearing inspected)..."
                rows={3}
                className="w-full bg-[#070B09] border border-[#1A2821] focus:border-[#00F59B] rounded-xl p-3 text-xs font-mono text-white placeholder-[#5C7268] focus:outline-none transition-colors"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-[#1A2821]">
              <button
                type="button"
                onClick={() => setSelectedIncidentForAck(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-[#8E9E96] hover:text-white bg-[#070B09] border border-[#1A2821] hover:bg-[#16231D] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAck}
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-[#00F59B] text-[#050B08] hover:bg-[#00F59B]/90 shadow-[0_0_15px_rgba(0,245,155,0.35)] flex items-center space-x-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Acknowledgment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncidentResponseTable;
