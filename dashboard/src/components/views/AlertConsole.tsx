"use client";

import React, { useState } from "react";
import { AnomalyEvent, AlertSeverity } from "@/types/iiot";
import { ShieldAlert, AlertTriangle, AlertOctagon, CheckCircle2, Download, Search, Check, X } from "lucide-react";
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
      const cleanNote = ackNote.trim().length > 0 ? ackNote.trim().substring(0, 500) : "Operator acknowledged";
      onAcknowledge(selectedAlertForAck.event_id, cleanNote);
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
      <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold font-mono uppercase text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-[#FF4D4D]" />
            <span>Industrial Incident &amp; Alarm Management</span>
          </h2>
          <p className="text-xs font-mono text-[#8E9E96] mt-1">
            Real-time edge event stream with operator acknowledgment workflow
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportAlertsCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-[#070B09] border border-[#1A2821] text-[#8E9E96] hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0D1411] p-1.5 rounded-xl border border-[#1A2821] text-xs font-mono">
          <button
            onClick={() => setFilterSeverity("ALL")}
            className={cn(
              "px-3 py-1 rounded-lg transition-colors text-[11px]",
              filterSeverity === "ALL"
                ? "bg-[#00F59B] text-[#050B08] font-bold shadow-[0_0_10px_rgba(0,245,155,0.25)]"
                : "text-[#8E9E96] hover:text-white"
            )}
          >
            All Events ({alerts.length})
          </button>
          <button
            onClick={() => setFilterSeverity("UNACK")}
            className={cn(
              "px-3 py-1 rounded-lg transition-colors text-[11px]",
              filterSeverity === "UNACK"
                ? "bg-[#FF4D4D] text-white font-bold"
                : "text-[#8E9E96] hover:text-[#FF4D4D]"
            )}
          >
            Unacknowledged ({alerts.filter((a) => !a.acknowledged).length})
          </button>
          <button
            onClick={() => setFilterSeverity("CRITICAL")}
            className={cn(
              "px-3 py-1 rounded-lg transition-colors text-[11px]",
              filterSeverity === "CRITICAL"
                ? "bg-[#FF4D4D] text-white font-bold"
                : "text-[#8E9E96] hover:text-white"
            )}
          >
            Critical
          </button>
          <button
            onClick={() => setFilterSeverity("WARNING")}
            className={cn(
              "px-3 py-1 rounded-lg transition-colors text-[11px]",
              filterSeverity === "WARNING"
                ? "bg-[#F59E0B] text-black font-bold"
                : "text-[#8E9E96] hover:text-white"
            )}
          >
            Warnings
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#5C7268] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search device, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D1411] border border-[#1A2821] rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-[#5C7268] focus:outline-none focus:border-[#00F59B]"
          />
        </div>
      </div>

      {/* Alarms Table */}
      <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#070B09] text-[#8E9E96] uppercase text-[11px] border-b border-[#1A2821]">
              <tr>
                <th className="px-4 py-3">Event ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Asset (device_id)</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Variable / Rule</th>
                <th className="px-4 py-3">Value / Threshold</th>
                <th className="px-4 py-3">Diagnostic Reason</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2821]/60">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#5C7268]">
                    No active alarm matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr
                    key={alert.event_id}
                    className={cn(
                      "hover:bg-[#131C18] transition-colors",
                      !alert.acknowledged && alert.severity === "CRITICAL" ? "bg-[#FF4D4D]/10" : ""
                    )}
                  >
                    <td className="px-4 py-3 font-bold text-gray-300">{alert.event_id}</td>
                    <td className="px-4 py-3 text-[#8E9E96]">{formatTimestamp(alert.timestamp)}</td>
                    <td className="px-4 py-3 font-semibold text-white">{alert.device_id}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                          alert.severity === "CRITICAL"
                            ? "bg-[#FF4D4D]/15 text-[#FF4D4D] border-[#FF4D4D]/30"
                            : "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30"
                        )}
                      >
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{alert.variable}</td>
                    <td className="px-4 py-3 font-semibold">
                      <span className={alert.severity === "CRITICAL" ? "text-[#FF4D4D]" : "text-[#F59E0B]"}>
                        {alert.observed_value}
                      </span>
                      <span className="text-[#5C7268] text-[10px]"> (Limit: {alert.threshold})</span>
                    </td>
                    <td className="px-4 py-3 text-[#8E9E96] max-w-xs truncate">{alert.reason}</td>
                    <td className="px-4 py-3">
                      {alert.acknowledged ? (
                        <div className="flex items-center space-x-1 text-[#00F59B] text-[11px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ACK</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedAlertForAck(alert)}
                          className="px-2.5 py-1 bg-[#16231D] border border-[#1A2821] text-xs rounded-xl text-[#00F59B] hover:text-[#050B08] hover:bg-[#00F59B] transition-colors font-semibold"
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
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-[#0D1411] border border-[#1A2821] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1A2821] pb-3">
              <h3 className="font-mono font-bold text-white text-sm">Operator Alarm Acknowledgment (ACK)</h3>
              <button
                type="button"
                onClick={() => setSelectedAlertForAck(null)}
                className="text-[#8E9E96] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs font-mono space-y-2 bg-[#070B09] p-3 rounded-xl border border-[#1A2821]">
              <div className="flex justify-between">
                <span className="text-[#8E9E96]">Target Asset:</span>
                <span className="text-white font-bold">{selectedAlertForAck.device_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E9E96]">Alert Variable / Rule:</span>
                <span className="text-[#00F59B]">{selectedAlertForAck.variable}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E9E96]">Observed Value vs Limit:</span>
                <span className="text-[#FF4D4D] font-bold">
                  {selectedAlertForAck.observed_value} (Threshold: {selectedAlertForAck.threshold})
                </span>
              </div>
              <p className="text-[#8E9E96] pt-1 text-[11px]">{selectedAlertForAck.reason}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#8E9E96]">Operator Maintenance Note:</label>
              <textarea
                value={ackNote}
                maxLength={500}
                onChange={(e) => setAckNote(e.target.value)}
                placeholder="Enter corrective action or shift observation (e.g. Technician notified, speed reduced)..."
                rows={3}
                className="w-full bg-[#070B09] border border-[#1A2821] rounded-xl p-2.5 text-xs font-mono text-white placeholder-[#5C7268] focus:outline-none focus:border-[#00F59B]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#1A2821]">
              <button
                onClick={() => setSelectedAlertForAck(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-mono text-[#8E9E96] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAck}
                className="px-4 py-1.5 rounded-xl text-xs font-mono bg-[#00F59B] text-[#050B08] font-bold hover:bg-[#00F59B]/90 shadow-[0_0_12px_rgba(0,245,155,0.35)] transition-colors flex items-center space-x-1"
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

export default AlertConsole;
