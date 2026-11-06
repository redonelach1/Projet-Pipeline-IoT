"use client";

import React, { useState } from "react";
import { useMqttStream } from "@/hooks/useMqttStream";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { KpiMetricBar } from "@/components/scada/KpiMetricBar";
import { PlantOverview } from "@/components/views/PlantOverview";
import { DeviceDetail } from "@/components/views/DeviceDetail";
import { AlertConsole } from "@/components/views/AlertConsole";
import { TestLab } from "@/components/views/TestLab";
import { PipelineMetrics } from "@/components/views/PipelineMetrics";

export default function SCADADashboard() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedDevice, setSelectedDevice] = useState<string>("motor-01");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

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

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const q = query.trim().toLowerCase();
    if (q) {
      // Check if query matches any device ID
      const fleetIds = ["motor-01", "motor-02", "pump-01", "compressor-01", "conveyor-01"];
      const matchedDevice = fleetIds.find((id) => id.toLowerCase().includes(q));
      if (matchedDevice) {
        setSelectedDevice(matchedDevice);
      }
    }
  };

  const unackAlertsCount = alerts.filter((a) => !a.acknowledged).length;
  const activeFleetCount = Object.keys(devices).length;

  return (
    <div className="min-h-screen bg-scada-bg text-scada-text flex flex-col lg:flex-row antialiased">
      {/* 1. Categorized Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{ alerts: unackAlertsCount, fleet: activeFleetCount }}
        unackAlertsCount={unackAlertsCount}
        isConnected={isConnected}
        brokerUrl={process.env.NEXT_PUBLIC_MQTT_WS_URL || "ws://localhost:9001"}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main SCADA Operations Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isConnected={isConnected}
          brokerUrl={process.env.NEXT_PUBLIC_MQTT_WS_URL || "ws://localhost:9001"}
          operator={{
            name: "Operator RedNa",
            role: "SCADA Operations Lead",
            initials: "RN",
            status: "ACTIVE",
          }}
          activeAlarmsCount={unackAlertsCount}
          onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Dynamic Operations Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          {/* Top Horizontal KPI Metric Bar */}
          <KpiMetricBar
            totalIngestion={stats.totalMessages}
            ingestionRate={stats.messagesPerSecond}
            msgPerSec={stats.messagesPerSecond}
            activeFleet={`${activeFleetCount}/5 Online`}
            p95LatencyMs={stats.p95LatencyMs}
            unacknowledgedAlarms={unackAlertsCount}
            unackAlertsCount={unackAlertsCount}
          />

          {/* Active Tab View Rendering */}
          {activeTab === "overview" && (
            <PlantOverview
              devices={devices}
              statuses={statuses}
              alerts={alerts}
              msgPerSec={stats.messagesPerSecond}
              totalMessages={stats.totalMessages}
              avgLatency={stats.averageLatencyMs}
              onSelectDevice={handleInspectDevice}
              onAcknowledge={acknowledgeAlert}
              onInjectFault={(scenario, target, duration) =>
                publishCommand(target as any, "set_scenario", scenario, duration)
              }
              onReset={() => publishCommand("all", "reset")}
              onPublishCommand={publishCommand}
              history={history}
              selectedDevice={selectedDevice}
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

          {activeTab === "fleet" && (
            <PlantOverview
              devices={devices}
              statuses={statuses}
              alerts={alerts}
              msgPerSec={stats.messagesPerSecond}
              totalMessages={stats.totalMessages}
              avgLatency={stats.averageLatencyMs}
              onSelectDevice={handleInspectDevice}
              onAcknowledge={acknowledgeAlert}
              onInjectFault={(scenario, target, duration) =>
                publishCommand(target as any, "set_scenario", scenario, duration)
              }
              onReset={() => publishCommand("all", "reset")}
              onPublishCommand={publishCommand}
              history={history}
              selectedDevice={selectedDevice}
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

          {activeTab === "health" && (
            <PipelineMetrics
              msgPerSec={stats.messagesPerSecond}
              totalMessages={stats.totalMessages}
              avgLatency={stats.averageLatencyMs}
              isConnected={isConnected}
            />
          )}
        </main>

        {/* Industrial Footer */}
        <footer className="border-t border-scada-border py-4 bg-scada-surface/50 text-xs font-mono text-scada-text-muted text-center">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>ENSAM Rabat — Master & Ingénierie Industrie 4.0 (2026–2027)</span>
            <span>Encadrement : Professeure Maria ZEMZAMI — Pipeline IIoT End-to-End</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
