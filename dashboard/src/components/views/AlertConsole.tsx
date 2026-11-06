"use client";

import React, { useState } from "react";
import { AnomalyEvent, AlertSeverity } from "@/types/iiot";
import { ShieldAlert, AlertTriangle, AlertOctagon, CheckCircle2, Download, Search, Check } from "lucide-react";
import { cn, formatTimestamp } from "@/lib/utils";

interface AlertConsoleProps {
  alerts: AnomalyEvent[];
  onAcknowledge: (eventId: string, note: string) => void;
}

export function AlertConsole({ alerts, onAcknowledge }: AlertConsoleProps) {
  const [filterSeverity, setFilterSeverity] = useState<"ALL" | AlertSeverity | "UNACK">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlertForAck, setSelectedAlertForAck] = useState<AnomalyEvent | null>(null);
  const [ackNote, setAckNote] = useState("");

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === "UNACK" && a.acknowledged) return false;
    if (filterSeverity !== "ALL" && filterSeverity !== "UNACK" && a.severity !== filterSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.device_id.toLowerCase().includes(q) ||
        a.variable.toLowerCase().includes(q) ||
        a.reason.toLowerCase().includes(q) ||
        a.event_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmAck = () => {
    if (selectedAlertForAck) {
      onAcknowledge(selectedAlertForAck.event_id, ackNote.trim() || "Acknowledged by shift operator");
      setSelectedAlertForAck(null);
      setAckNote("");
    }
  };

  const exportAlertsCSV = () => {
    const headers = "Event_ID,Timestamp,Device_ID,Severity,Variable,Observed_Value,Threshold,Reason,Acknowledged,Ack_Note\n";
    const rows = alerts
      .map(
        (a) =>
          `"${a.event_id}","${a.timestamp}","${a.device_id}","${a.severity}","${a.variable}",${a.observed_value},${a.threshold},"${a.reason.replace(/"/g, '""')}",${a.acknowledged},"${(a.ack_note || "").replace(/"/g, '""')}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ensam_iiot_incidents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="bg-industrial-panel border border-industrial-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold font-mono uppercase text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Industrial Incident & Alarm Management</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time edge event stream with operator acknowledgment workflow
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportAlertsCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono bg-industrial-dark border border-industrial-border text-gray-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-industrial-panel p-1 rounded-lg border border-industrial-border text-xs font-mono">
          <button
            onClick={() => setFilterSeverity("ALL")}
            className={cn(
              "px-3 py-1 rounded transition-colors",
              filterSeverity === "ALL" ? "bg-industrial-dark text-white font-bold" : "text-gray-400 hover:text-white"
            )}
          >
            All Events ({alerts.length})
          </button>
          <button
            onClick={() => setFilterSeverity("UNACK")}
            className={cn(
              "px-3 py-1 rounded transition-colors",
              filterSeverity === "UNACK" ? "bg-rose-500/20 text-rose-400 font-bold" : "text-gray-400 hover:text-white"
            )}
          >
            Unacknowledged ({alerts.filter((a) => !a.acknowledged).length})
          </button>
          <button
            onClick={() => setFilterSeverity("CRITICAL")}
            className={cn(
              "px-3 py-1 rounded transition-colors",
              filterSeverity === "CRITICAL" ? "bg-rose-500/20 text-rose-400 font-bold" : "text-gray-400 hover:text-white"
            )}
          >
            Critical
          </button>
          <button
            onClick={() => setFilterSeverity("WARNING")}
            className={cn(
              "px-3 py-1 rounded transition-colors",
              filterSeverity === "WARNING" ? "bg-amber-500/20 text-amber-400 font-bold" : "text-gray-400 hover:text-white"
            )}
          >
            Warnings
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search device, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-industrial-panel border border-industrial-border rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-industrial-cyan"
          />
        </div>
      </div>

      {/* Alarms Table */}
      <div className="bg-industrial-panel border border-industrial-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-industrial-dark text-gray-400 uppercase text-[11px] border-b border-industrial-border">
              <tr>
                <th className="px-4 py-3">Event ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Variable</th>
                <th className="px-4 py-3">Value / Threshold</th>
                <th className="px-4 py-3">Diagnostic Reason</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-border/60">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No active alarm matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr
                    key={alert.event_id}
                    className={cn(
                      "hover:bg-industrial-dark/50 transition-colors",
                      !alert.acknowledged && alert.severity === "CRITICAL" ? "bg-rose-950/20" : ""
                    )}
                  >
                    <td className="px-4 py-3 font-bold text-gray-300">{alert.event_id}</td>
                    <td className="px-4 py-3 text-gray-400">{formatTimestamp(alert.timestamp)}</td>
                    <td className="px-4 py-3 font-semibold text-white">{alert.device_id}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold border",
                          alert.severity === "CRITICAL"
                            ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        )}
                      >
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{alert.variable}</td>
                    <td className="px-4 py-3 font-semibold">
                      <span className={alert.severity === "CRITICAL" ? "text-rose-400" : "text-amber-400"}>
                        {alert.observed_value}
                      </span>
                      <span className="text-gray-500 text-[10px]"> (Limit: {alert.threshold})</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 max-w-xs truncate">{alert.reason}</td>
                    <td className="px-4 py-3">
                      {alert.acknowledged ? (
                        <div className="flex items-center space-x-1 text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ACK</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedAlertForAck(alert)}
                          className="px-2.5 py-1 bg-industrial-dark border border-industrial-border text-xs rounded text-industrial-cyan hover:text-white hover:border-industrial-cyan transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acknowledgment Modal Dialog */}
      {selectedAlertForAck && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-industrial-panel border border-industrial-border rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-industrial-border pb-3">
              <h3 className="font-mono font-bold text-white text-sm">Operator Alarm Acknowledgment</h3>
              <span className="text-xs font-mono text-gray-400">{selectedAlertForAck.event_id}</span>
            </div>

            <div className="text-xs font-mono space-y-2 bg-industrial-dark p-3 rounded border border-industrial-border/60">
              <div className="flex justify-between">
                <span className="text-gray-400">Target Asset:</span>
                <span className="text-white font-bold">{selectedAlertForAck.device_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Alert Variable:</span>
                <span className="text-white">{selectedAlertForAck.variable}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Observed Value:</span>
                <span className="text-rose-400 font-bold">{selectedAlertForAck.observed_value}</span>
              </div>
              <p className="text-gray-300 pt-1 text-[11px]">{selectedAlertForAck.reason}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400">Operator Maintenance Note:</label>
              <textarea
                value={ackNote}
                onChange={(e) => setAckNote(e.target.value)}
                placeholder="Enter corrective action or shift observation (e.g. Technician notified, speed reduced)..."
                rows={3}
                className="w-full bg-industrial-dark border border-industrial-border rounded p-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-industrial-cyan"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-industrial-border">
              <button
                onClick={() => setSelectedAlertForAck(null)}
                className="px-3 py-1.5 rounded text-xs font-mono text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAck}
                className="px-4 py-1.5 rounded text-xs font-mono bg-industrial-cyan text-black font-bold hover:bg-cyan-300 transition-colors flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Acknowledgment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

