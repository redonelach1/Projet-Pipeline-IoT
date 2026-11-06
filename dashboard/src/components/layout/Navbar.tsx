"use client";

import React from "react";
import { Activity, ShieldAlert, Cpu, Radio, Gauge, FlaskConical, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isConnected: boolean;
  msgPerSec: number;
  avgLatency: number;
  activeAlarmsCount: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  isConnected,
  msgPerSec,
  avgLatency,
  activeAlarmsCount,
}: NavbarProps) {
  const navItems = [
    { id: "overview", label: "Plant Overview", icon: Activity },
    { id: "telemetry", label: "Equipment Telemetry", icon: Gauge },
    { id: "alerts", label: "Alert Console", icon: ShieldAlert, badge: activeAlarmsCount },
    { id: "lab", label: "Test Lab & Fault Injector", icon: FlaskConical },
    { id: "pipeline", label: "Pipeline Health", icon: BarChart3 },
  ];

  return (
    <header className="border-b border-industrial-border bg-industrial-dark/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Academic Header */}
          <div className="flex items-center space-x-3">
            <div className="bg-industrial-panel p-2 rounded-lg border border-industrial-border flex items-center justify-center">
              <Cpu className="w-5 h-5 text-industrial-cyan" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-wider uppercase text-white">
                  ENSAM Rabat
                </span>
                <span className="text-xs bg-industrial-border/60 text-gray-300 px-1.5 py-0.5 rounded font-mono">
                  IIoT 4.0
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                Real-Time Edge SCADA Operations Center
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all relative",
                    isActive
                      ? "bg-industrial-panel text-white border border-industrial-border shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-industrial-panel/50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-industrial-cyan" : "text-gray-400")} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Live Telemetry Health Bar */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3 text-xs font-mono border-l border-industrial-border pl-4">
              <div className="flex items-center space-x-1.5 text-gray-400">
                <span>Throughput:</span>
                <span className="text-emerald-400 font-semibold">{msgPerSec} msg/s</span>
              </div>
              <div className="flex items-center space-x-1.5 text-gray-400">
                <span>Latency:</span>
                <span className="text-cyan-400 font-semibold">{avgLatency} ms</span>
              </div>
            </div>

            {/* MQTT WebSocket Connection Badge */}
            <div
              className={cn(
                "flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-mono font-medium border",
                isConnected
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                )}
              />
              <span className="uppercase text-[11px]">
                {isConnected ? "Live Stream (WS:9001)" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

