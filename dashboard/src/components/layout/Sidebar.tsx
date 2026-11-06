"use client";

import React from "react";
import {
  LayoutDashboard,
  Activity,
  Cpu,
  ShieldAlert,
  FlaskConical,
  BarChart3,
  HeartPulse,
  X,
  RadioTower,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TabId =
  | "overview"
  | "telemetry"
  | "fleet"
  | "alerts"
  | "lab"
  | "pipeline"
  | "health";

export interface NavItemConfig {
  id: TabId | string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeVariant?: "alert" | "neutral" | "success";
  ariaLabel?: string;
}

export interface NavGroupConfig {
  id: string;
  title: string;
  items: NavItemConfig[];
}

export interface SidebarCounts {
  alerts?: number;
  fleet?: number;
  [key: string]: number | undefined;
}

export interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: SidebarCounts;
  unackAlertsCount?: number;
  badgeCounts?: Record<string, number>;
  isConnected?: boolean;
  brokerUrl?: string;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  counts,
  unackAlertsCount = 0,
  badgeCounts = {},
  isConnected = false,
  brokerUrl = "ws://localhost:9001",
  className,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const resolvedAlerts = counts?.alerts ?? badgeCounts["alerts"] ?? unackAlertsCount;
  const resolvedFleet = counts?.fleet ?? badgeCounts["fleet"];

  const effectiveBadges: Record<string, number | undefined> = {
    ...badgeCounts,
    alerts: resolvedAlerts,
    fleet: resolvedFleet,
  };

  const navGroups: NavGroupConfig[] = [
    {
      id: "general",
      title: "General",
      items: [
        {
          id: "overview",
          label: "Dashboard / Overview",
          icon: LayoutDashboard,
          ariaLabel: "Navigate to Dashboard Overview",
        },
        {
          id: "telemetry",
          label: "Telemetry Studio",
          icon: Activity,
          ariaLabel: "Navigate to Telemetry Studio",
        },
      ],
    },
    {
      id: "fleet-operations",
      title: "Fleet & Operations",
      items: [
        {
          id: "fleet",
          label: "Equipment Fleet",
          icon: Cpu,
          badge: resolvedFleet,
          badgeVariant: "neutral",
          ariaLabel:
            resolvedFleet !== undefined && resolvedFleet > 0
              ? `Navigate to Equipment Fleet, ${resolvedFleet} units online`
              : "Navigate to Equipment Fleet",
        },
        {
          id: "alerts",
          label: "Alert & Incident Console",
          icon: ShieldAlert,
          badge: resolvedAlerts,
          badgeVariant: "alert",
          ariaLabel: `Alert and Incident Console, ${resolvedAlerts} unacknowledged alarms`,
        },
        {
          id: "lab",
          label: "Test Lab Fault Injector",
          icon: FlaskConical,
          ariaLabel: "Navigate to Test Lab Fault Injector",
        },
      ],
    },
    {
      id: "scada-intelligence",
      title: "SCADA Intelligence",
      items: [
        {
          id: "pipeline",
          label: "Pipeline Metrics",
          icon: BarChart3,
          ariaLabel: "Navigate to Pipeline Metrics",
        },
        {
          id: "health",
          label: "System Health",
          icon: HeartPulse,
          ariaLabel: "Navigate to System Health",
        },
      ],
    },
  ];

  const handleItemClick = (id: string) => {
    onTabChange(id);
    if (onClose) {
      onClose();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0D1411] text-gray-200">
      {/* 1. Header / Branding */}
      <div className="p-5 flex items-center justify-between border-b border-[#1A2821]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center shadow-[0_0_12px_rgba(0,245,155,0.2)]">
            <RadioTower className="w-5 h-5 text-[#00F59B]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base tracking-tight text-white">
                ENSAM
              </span>
              <span className="text-[10px] font-mono font-semibold bg-[#00F59B]/15 text-[#00F59B] px-1.5 py-0.5 rounded border border-[#00F59B]/30">
                SCADA
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#6B7F76] uppercase tracking-wider">
              Operations Center
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#8E9E96] hover:text-white hover:bg-[#112018] transition-colors"
            aria-label="Close sidebar navigation"
            data-testid="sidebar-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-[#1A2821] scrollbar-track-transparent">
        {navGroups.map((group) => (
          <div key={group.id} className="space-y-1" data-testid={`nav-group-${group.id}`}>
            {/* Category Title */}
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7F76] select-none">
              {group.title}
            </h3>

            {/* Navigation Items */}
            <div className="space-y-1 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const rawBadge = effectiveBadges[item.id] ?? item.badge;
                const dynamicBadge = rawBadge !== undefined && rawBadge > 999 ? "999+" : rawBadge;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    aria-label={item.ariaLabel || item.label}
                    aria-current={isActive ? "page" : undefined}
                    data-testid={`nav-item-${item.id}`}
                    className={cn(
                      "group w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 outline-none select-none",
                      isActive
                        ? "bg-[#00F59B] text-[#050B08] font-bold shadow-[0_0_20px_rgba(0,245,155,0.35)]"
                        : "text-[#8E9E96] hover:text-[#E2ECE7] hover:bg-[#112018]"
                    )}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Icon
                        className={cn(
                          "w-4 h-4 flex-shrink-0 transition-colors duration-150",
                          isActive
                            ? "text-[#050B08]"
                            : "text-[#6B7F76] group-hover:text-[#00F59B]"
                        )}
                      />
                      <span className="truncate tracking-tight">{item.label}</span>
                    </div>

                    {/* Notification / Count Badge */}
                    {rawBadge !== undefined && rawBadge > 0 && (
                      <span
                        data-testid={item.id === "alerts" ? "alarm-badge" : `${item.id}-badge`}
                        className={cn(
                          "ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono flex-shrink-0 transition-colors",
                          isActive
                            ? "bg-[#050B08] text-[#00F59B]"
                            : item.id === "alerts" || item.badgeVariant === "alert"
                            ? "bg-[#FF4D4D] text-white shadow-[0_0_8px_rgba(255,77,77,0.45)]"
                            : "bg-[#112018] text-[#00F59B] border border-[#00F59B]/30"
                        )}
                      >
                        {dynamicBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Bottom ENSAM SCADA Operations Card */}
      <div className="p-3 border-t border-[#1A2821] bg-[#0A100D]" data-testid="sidebar-bottom-card">
        <div className="bg-[#0D1813] border border-[#1A2E23] rounded-xl p-3 flex flex-col space-y-2.5">
          <div className="flex items-center space-x-3">
            {/* Circular ENSAM Emblem */}
            <div className="w-8 h-8 rounded-full bg-[#00F59B] text-[#050B08] font-black flex items-center justify-center text-[11px] shadow-[0_0_12px_rgba(0,245,155,0.3)] flex-shrink-0">
              EN
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                ENSAM SCADA Ops
              </p>
              <p className="text-[10px] text-[#8E9E96] font-mono truncate">
                Version 2.4.0
              </p>
            </div>
          </div>

          {/* MQTT Connection Indicator */}
          <div
            data-testid="mqtt-connection-indicator"
            className="flex items-center justify-between pt-2 border-t border-[#1A2E23]/60 text-[10px] font-mono"
          >
            <div className="flex items-center space-x-2">
              <span
                className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  isConnected
                    ? "bg-[#00F59B] shadow-[0_0_8px_#00F59B] animate-pulse"
                    : "bg-[#FF4D4D] shadow-[0_0_8px_#FF4D4D]"
                )}
              />
              <span className={isConnected ? "text-[#00F59B]" : "text-[#FF4D4D]"}>
                {isConnected ? "MQTT Connected" : "MQTT Offline"}
              </span>
            </div>
            <span className="text-[#6B7F76] text-[9px] uppercase">
              {brokerUrl.includes(":") ? brokerUrl.split("//")[1] || "ws:9001" : "ws:9001"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        data-testid="sidebar"
        className={cn(
          "hidden lg:flex flex-col w-64 xl:w-72 h-screen sticky top-0 border-r border-[#1A2821] flex-shrink-0 z-30",
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Slide-out panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <aside
            data-testid="sidebar-mobile"
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl border-r border-[#1A2821] animate-in slide-in-from-left duration-200"
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

export default Sidebar;
