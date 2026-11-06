"use client";

import React, { useState } from "react";
import { useMqttStream } from "@/hooks/useMqttStream";
import { Navbar } from "@/components/layout/Navbar";
import { PlantOverview } from "@/components/views/PlantOverview";
import { DeviceDetail } from "@/components/views/DeviceDetail";
import { AlertConsole } from "@/components/views/AlertConsole";
import { TestLab } from "@/components/views/TestLab";
import { PipelineMetrics } from "@/components/views/PipelineMetrics";

export default function SCADADashboard() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedDevice, setSelectedDevice] = useState<string>("motor-01");

  const {
    isConnected,
    devices,
    statuses,
    history,
    alerts,
    stats,
    publishCommand,
    acknowledgeAlert,
  } = useMqttStream();

  const handleInspectDevice = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setActiveTab("telemetry");
  };

  const unackAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen flex flex-col bg-industrial-dark">
      {/* Top SCADA Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        msgPerSec={stats.messagesPerSecond}
        avgLatency={stats.averageLatencyMs}
        activeAlarmsCount={unackAlertsCount}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && (
          <PlantOverview
            devices={devices}
            statuses={statuses}
            alerts={alerts}
            msgPerSec={stats.messagesPerSecond}
            totalMessages={stats.totalMessages}
            avgLatency={stats.averageLatencyMs}
            onSelectDevice={handleInspectDevice}
          />
        )}

        {activeTab === "telemetry" && (
          <DeviceDetail
            devices={devices}
            statuses={statuses}
            history={history}
            selectedDevice={selectedDevice}
            onSelectDevice={setSelectedDevice}
          />
        )}

        {activeTab === "alerts" && (
          <AlertConsole alerts={alerts} onAcknowledge={acknowledgeAlert} />
        )}

        {activeTab === "lab" && (
          <TestLab onPublishCommand={publishCommand} />
        )}

        {activeTab === "pipeline" && (
          <PipelineMetrics
            msgPerSec={stats.messagesPerSecond}
            totalMessages={stats.totalMessages}
            avgLatency={stats.averageLatencyMs}
            isConnected={isConnected}
          />
        )}
      </main>

      {/* Industrial Footer */}
      <footer className="border-t border-industrial-border py-4 bg-industrial-panel/50 text-xs font-mono text-gray-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ENSAM Rabat — Master & Ingénierie Industrie 4.0 (2026–2027)</span>
          <span>Encadrement : Professeure Maria ZEMZAMI — Pipeline IIoT End-to-End</span>
        </div>
      </footer>
    </div>
  );
}

