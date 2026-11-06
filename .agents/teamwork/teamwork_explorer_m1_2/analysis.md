# Sidebar & Navigation Component Specification (Milestone 1)

**Component Target**: `dashboard/src/components/layout/Sidebar.tsx`  
**Explorer**: `teamwork_explorer_m1_2`  
**Date**: 2026-11-06  
**Status**: Completed Architectural & Visual Specification  
**Reference Design**: `C:\Users\RedNa\.gemini\antigravity\brain\3127a420-d341-49d7-b265-6f62c0da6874\.user_uploaded\media_1793984033843_2147cf5e.jpg`  
**Authoritative Requirements**: R1 (Theme & Visual Language), R2 (Navigation & Metric Header)

---

## 1. Executive Summary & Design Rationale

In the existing codebase (`dashboard/src/components/layout/Navbar.tsx`), navigation is implemented as a horizontal blue-slate header navbar (`bg-industrial-dark/95`, `#111827`), which conflicts with both the reference design and Requirement R2.

Requirement R2 mandates:
> "Implement a left sidebar navigation with categorical grouping, icon badges, and active solid neon green pill buttons featuring dark text on neon green... Bottom sidebar card: ENSAM SCADA Operations Center branding, version (v2.4.0), and MQTT connection indicator."

This specification provides the comprehensive, production-ready blueprint for `dashboard/src/components/layout/Sidebar.tsx`. It incorporates:
1. **Three Categorical Groups**:
   - **General**: Dashboard / Overview, Telemetry Studio
   - **Fleet & Operations**: Equipment Fleet, Alert & Incident Console, Test Lab Fault Injector
   - **SCADA Intelligence**: Pipeline Metrics, System Health
2. **Active Solid Neon Green Pill Buttons**:
   - Exact color tokens: `bg-[#00F59B] text-[#050B08]` with `font-semibold` / `font-bold` typography.
   - Geometry: `rounded-xl` pill container with ambient neon bloom `shadow-[0_0_20px_rgba(0,245,155,0.35)]`.
   - The active icon adopts the high-contrast dark color (`#050B08`), matching the reference design.
3. **Inactive & Hover States**:
   - Inactive text: Muted emerald-gray (`#8E9E96` / `#6B7F76`).
   - Hover state: Soft green-tinted background (`hover:bg-[#112018]`), elevated contrast text (`hover:text-[#E2ECE7]`), and glowing green icon hover tint (`group-hover:text-[#00F59B]`).
4. **Notification Badges**:
   - High-contrast coral-red badge (`bg-[#FF4D4D] text-white`) for unacknowledged alarms.
   - Ambient red glow `shadow-[0_0_8px_rgba(255,77,77,0.45)]`.
   - Flexible generic badge support for other navigation items.
5. **Bottom ENSAM SCADA Card**:
   - Deep matte container (`bg-[#0B1511] border border-[#1A2A21] rounded-xl p-3`).
   - Circular neon green emblem with dark typography (`bg-[#00F59B] text-[#050B08] font-bold`).
   - Version label `v2.4.0 ENSAM`.
   - Live MQTT WebSocket connection status indicator with pulsing dot (`#00F59B` online, `#FF4D4D` offline).
6. **Responsive Drawer & Desktop Persistence**:
   - Fixed desktop left sidebar (`w-64` or `w-72`, `h-screen`, `sticky top-0`).
   - Mobile slide-out drawer with backdrop overlay (`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden`), slide animation, and close button.

---

## 2. Categorical Navigation Hierarchy & Icon Mappings

### 2.1 Group & Item Matrix

| Group | Item ID | Display Label | Lucide Icon | Badges | Description & Target View |
|---|---|---|---|---|---|
| **General** | `overview` | **Overview** | `LayoutDashboard` | — | Unified SCADA Operations Center overview (KPIs, Spline Area Chart, Health Gauge, Incident Response, Test Lab) |
| **General** | `telemetry` | **Telemetry Studio** | `Activity` | — | Deep-dive telemetry inspection, multi-sensor waveforms, physical variables |
| **Fleet & Operations** | `fleet` | **Equipment Fleet** | `Cpu` | — | Industrial plant fleet synoptic (motor-01, motor-02, pump-01, compressor-01, conveyor-01) |
| **Fleet & Operations** | `alerts` | **Alert & Incident Console** | `ShieldAlert` | `{unackAlertsCount}` | Real-time threshold violations, severity pills, operator ACK actions |
| **Fleet & Operations** | `lab` | **Test Lab Fault Injector** | `FlaskConical` | — | Interactive simulation testbed for thermal overheat, vibration spikes, pressure drops |
| **SCADA Intelligence** | `pipeline` | **Pipeline Metrics** | `BarChart3` | — | Edge ingestion throughput (msg/s), latency p95, MQTT QoS metrics |
| **SCADA Intelligence** | `health` | **System Health** | `HeartPulse` | — | Broker connection, edge gateway heartbeat, compute & memory topology |

### 2.2 Icon Validation
All specified Lucide icons have been verified against `dashboard/node_modules/lucide-react`:
- `LayoutDashboard`, `Activity`, `Cpu`, `ShieldAlert`, `FlaskConical`, `BarChart3`, `HeartPulse`, `Menu`, `X`, `ChevronRight`, `Wifi`, `WifiOff`.

---

## 3. Visual Styling Tokens & CSS Classes

### 3.1 Color Specifications

| Element | Color Token | Tailwind Class / Style |
|---|---|---|
| **Sidebar Canvas** | `#0D1411` | `bg-[#0D1411]` (Matte Charcoal with Emerald base) |
| **Right Border** | `#1A2821` | `border-r border-[#1A2821]` |
| **Header Logo Text** | `#00F59B` | `text-[#00F59B] font-bold tracking-tight text-xl` |
| **Header Subtitle** | `#6B7F76` | `text-[#6B7F76] text-xs font-mono` |
| **Category Header** | `#6B7F76` | `text-[#6B7F76] text-[11px] font-semibold uppercase tracking-wider px-3 mb-2` |
| **Active Nav Pill** | `bg-[#00F59B]` `text-[#050B08]` | `bg-[#00F59B] text-[#050B08] font-bold rounded-xl shadow-[0_0_20px_rgba(0,245,155,0.35)]` |
| **Active Nav Icon** | `#050B08` | `text-[#050B08]` |
| **Inactive Nav Item** | `#8E9E96` | `text-[#8E9E96] hover:text-[#E2ECE7] hover:bg-[#112018] rounded-xl transition-all` |
| **Inactive Nav Icon** | `#6B7F76` | `text-[#6B7F76] group-hover:text-[#00F59B] transition-colors` |
| **Alarm Badge (Count > 0)** | `#FF4D4D` | `bg-[#FF4D4D] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(255,77,77,0.45)]` |
| **Active Alarm Badge** | Inverted | `bg-[#050B08] text-[#00F59B] text-[11px] font-bold px-2 py-0.5 rounded-full` or `#FF4D4D` |
| **Bottom Card Background**| `#08110D` | `bg-[#08110D] border border-[#1A2821] rounded-xl p-3.5` |
| **Bottom Badge Emblem** | `#00F59B` | `w-9 h-9 rounded-full bg-[#00F59B] text-[#050B08] font-black flex items-center justify-center` |
| **Bottom Online Dot** | `#00F59B` | `w-2 h-2 rounded-full bg-[#00F59B] shadow-[0_0_8px_#00F59B] animate-pulse` |
| **Bottom Offline Dot**| `#FF4D4D` | `w-2 h-2 rounded-full bg-[#FF4D4D] shadow-[0_0_8px_#FF4D4D]` |

---

## 4. TypeScript Architecture & Props Contract

### 4.1 Interface Definitions

```typescript
import React from "react";

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

export interface SidebarProps {
  /** Currently selected tab identifier */
  activeTab: string;
  /** Callback fired when user clicks a navigation item */
  onTabChange: (tab: string) => void;
  /** Total count of active, unacknowledged alarms */
  unackAlertsCount?: number;
  /** Optional dictionary for arbitrary item badges */
  badgeCounts?: Record<string, number>;
  /** MQTT WebSocket connectivity state */
  isConnected?: boolean;
  /** Optional custom broker URL for display */
  brokerUrl?: string;
  /** Additional custom classes for sidebar wrapper */
  className?: string;
  /** Mobile drawer open/closed state */
  isOpen?: boolean;
  /** Callback when user closes mobile drawer */
  onClose?: () => void;
}
```

---

## 5. Complete Component Implementation Blueprint

Below is the complete, self-contained reference code for `dashboard/src/components/layout/Sidebar.tsx`:

```tsx
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
  Radio,
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

export interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
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
  unackAlertsCount = 0,
  badgeCounts = {},
  isConnected = false,
  brokerUrl = "ws://localhost:9001",
  className,
  isOpen = false,
  onClose,
}: SidebarProps) {
  // Navigation structure adhering strictly to R2
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
          ariaLabel: "Navigate to Equipment Fleet",
        },
        {
          id: "alerts",
          label: "Alert & Incident Console",
          icon: ShieldAlert,
          badge: unackAlertsCount,
          badgeVariant: "alert",
          ariaLabel: `Alert and Incident Console, ${unackAlertsCount} unacknowledged alarms`,
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
              <span className="text-[10px] font-mono font-semibold bg-[#00F59B]/15 text-[#00F59B] px-1.5 py-0.2 rounded border border-[#00F59B]/30">
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
                const dynamicBadge = badgeCounts[item.id] ?? item.badge;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    aria-label={item.ariaLabel || item.label}
                    aria-current={isActive ? "page" : undefined}
                    data-testid={`nav-item-${item.id}`}
                    className={cn(
                      "group w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 outline-none select-none",
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
                    {dynamicBadge !== undefined && dynamicBadge > 0 && (
                      <span
                        data-testid="alarm-badge"
                        className={cn(
                          "ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono flex-shrink-0 transition-colors",
                          isActive
                            ? "bg-[#050B08] text-[#00F59B]"
                            : "bg-[#FF4D4D] text-white shadow-[0_0_8px_rgba(255,77,77,0.45)]"
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
            <span className="text-[#6B7F76] text-[9px] uppercase">ws:9001</span>
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
```

---

## 6. Page Integration Contract (`dashboard/src/app/page.tsx`)

### 6.1 Layout Transformation

In `page.tsx`, the layout changes from a vertical single-column structure with `Navbar` to a modern 2-column flex container:

```tsx
export default function SCADADashboard() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedDevice, setSelectedDevice] = useState<string>("motor-01");
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

  const unackAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-[#070B09] text-gray-100 flex flex-col lg:flex-row antialiased">
      {/* 1. Categorized Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unackAlertsCount={unackAlertsCount}
        isConnected={isConnected}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main SCADA Operations Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <TopBar
          isConnected={isConnected}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          operator={{
            name: "Ing. SCADA ENSAM",
            role: "Master 4.0 Lead",
            email: "ops.scada@ensam.ac.ma",
          }}
        />

        {/* Dynamic Operations Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          {/* Top KPI Metric Bar (unified horizontal card with vertical dividers) */}
          <KpiMetricBar
            totalIngestion={stats.totalMessages}
            msgPerSec={stats.messagesPerSecond}
            activeFleetCount={Object.keys(devices).length}
            totalFleetCount={5}
            p95LatencyMs={stats.averageLatencyMs}
            unackAlertsCount={unackAlertsCount}
          />

          {/* Active Tab View Rendering */}
          {activeTab === "overview" && (
            <OverviewDashboard
              devices={devices}
              statuses={statuses}
              alerts={alerts}
              history={history}
              stats={stats}
              onInspectDevice={(id) => {
                setSelectedDevice(id);
                setActiveTab("telemetry");
              }}
              onAcknowledgeAlert={acknowledgeAlert}
              onInjectFault={publishCommand}
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
              onSelectDevice={(id) => {
                setSelectedDevice(id);
                setActiveTab("telemetry");
              }}
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
      </div>
    </div>
  );
}
```

---

## 7. Quality & Testability Checklist

| Checkpoint | Requirement | Verification Strategy |
|---|---|---|
| **Pill Background** | Active tab must have `bg-[#00F59B]` | DOM class assertion: `expect(activeEl).toHaveClass('bg-[#00F59B]')` |
| **Pill Text Color** | Dark foreground `text-[#050B08]` | DOM class assertion: `expect(activeEl).toHaveClass('text-[#050B08]')` |
| **Categorical Groups** | 3 groups ("General", "Fleet & Operations", "SCADA Intelligence") | Check group titles exist in DOM |
| **Alarm Counter** | Badge displays unack alerts count in coral-red | When `unackAlertsCount > 0`, badge renders with `bg-[#FF4D4D]` |
| **Bottom Card** | Shows ENSAM branding, v2.4.0, MQTT status | Verify text "ENSAM SCADA", "Version 2.4.0", and MQTT dot |
| **Tab Switching** | Clicking item invokes `onTabChange(id)` | Unit / E2E test triggers click on nav item |
| **Mobile Drawer** | Renders backdrop and closes on overlay click | Trigger mobile menu button, assert drawer exists, click overlay |
| **Next.js Build** | Zero TypeScript or JSX compilation errors | `npm run build` succeeds |
