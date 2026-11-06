# Project: ENSAM Rabat Industrie 4.0 SCADA Operations Center Dashboard

## Architecture
- **Framework**: Next.js 14.2.18 (App Router), React 18.3.1, TypeScript 5.6.3, Tailwind CSS 3.4.15.
- **Visual Aesthetic**: Premium dark SCADA theme modeled on reference design (`media_1793984033843_2147cf5e.jpg`), using matte charcoal surfaces (`#070B09`, `#0D1411`), subtle borders (`#1A2821`), active solid neon green pill buttons (`bg-[#00F59B] text-[#050B08]`), glowing accents (`#00F59B` / `#10B981`), and alarm red (`#FF4D4D`).
- **Data Flow**: Strictly live MQTT WebSocket streams (`ws://localhost:9001`) via `useMqttStream.ts` connecting to Mosquitto. Zero client-side mock fallback data.
- **Component Layout**:
  - `Sidebar.tsx`: Fixed left navigation with categorized groups, icon badges, and solid neon green active pills.
  - `TopBar.tsx`: Top header bar with search input and operator profile card.
  - `KpiMetricBar.tsx`: Top horizontal metric card with 4 primary metrics separated by vertical hairline dividers.
  - `TelemetryAreaChart.tsx`: Real-time Recharts smooth spline area chart with glowing gradient fill underneath.
  - `RadialGauge.tsx`: Circular radial progress gauge with neon green accents for asset health/fleet reliability.
  - `IncidentResponseTable.tsx`: Live incident table with severity pills and operator ACK modal triggering MQTT ACK packets.
  - `TestLabPanel.tsx`: Interactive fault injection panel supporting 6 anomaly scenarios dispatching MQTT simulation commands.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Theme & Color Token Architecture | Deep matte charcoal surfaces (`#070B09`, `#0D1411`), subtle borders (`#1A2821`), neon mint accents (`#00F59B` / `#10B981`), card containers, dark mode CSS variables | M1 | R1, Survey |
| 2 | Left Sidebar Navigation | Left sidebar with categorized groupings ("General", "Fleet & Operations", "SCADA Intelligence"), icon badges, and active solid neon green pill buttons (`bg-[#00F59B] text-[#050B08] font-semibold`) | M1 | R2, Survey |
| 3 | Top Header Bar | Top bar featuring search input ("Search here...") and operator profile card (avatar, name, role) | M1 | R2, Survey |
| 4 | Horizontal KPI Metric Bar | Unified horizontal card containing Total Ingestion, Active Fleet (5/5), Edge p95 Latency, and Unacknowledged Alarms separated by vertical hairline dividers | M1 | R2, Survey |
| 5 | Recharts Glowing Spline Area Chart | Smooth spline AreaChart (`type="monotone"`) with underneath glowing SVG `<linearGradient>` fill, live rolling telemetry | M2 | R3, Survey |
| 6 | Asset Health Circular Radial Gauge | Circular SVG radial progress gauge with thick rounded stroke, percentage indicator, and fleet reliability status | M2 | R3, Survey |
| 7 | Interactive Test Lab Fault Injector | Fault injection panel supporting 6 anomaly scenarios, target equipment selector, duration slider, dispatching MQTT commands | M3 | R3, Survey |
| 8 | Incident Response Table with Operator ACK | Incident table with severity pills, timestamp, equipment ID, operator ACK action opening modal note and publishing MQTT ACK packet | M3 | R3, Survey |
| 9 | Strict Live MQTT Integration & Empirical Latency | Subscribes to `ws://localhost:9001` (`telemetry`, `status`, `event`), zero client-side mock fallback data, empty initial state, empirical p95 ring buffer | M4 | R4, Survey |
| 10 | Clean Production Build & E2E Acceptance | Next.js clean production build (`npm run build` exits 0), zero TypeScript/lint errors, 100% passing E2E tests | M5 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Theme, Shell, Sidebar & KPI Header | F1, F2, F3, F4: Colors, Sidebar with neon green pills, TopBar, KpiMetricBar | none | DONE |
| M2 | Telemetry Spline Area Chart & Radial Gauge | F5, F6: Recharts AreaChart with gradient glow, circular SVG RadialGauge | M1 | DONE |
| M3 | Incident Table & Test Lab Panel | F7, F8: Incident table with operator ACK modal, Test Lab fault injector | M1 | DONE |
| M4 | Strict Live MQTT Integration & Latency Polish | F9: Verify live WebSocket stream, empirical p95 ring buffer, zero mock data | M2, M3 | DONE |
| M5 | Final E2E Test Suite Pass & Adversarial Hardening | F10: 100% pass on E2E test suite (Phase 1) + Adversarial hardening (Phase 2) | M4, TEST_READY | PLANNED |

## Interface Contracts
### `Sidebar.tsx` ↔ `page.tsx`
- **Props**: `activeTab: string`, `onTabChange: (tab: string) => void`, `counts: { alerts: number, fleet: number }`
- **Events**: Selection of navigation tab ("overview", "telemetry", "alerts", "lab", "pipeline").

### `TopBar.tsx` ↔ `page.tsx`
- **Props**: `isConnected: boolean`, `brokerUrl: string`, `operator: { name: string, role: string }`

### `KpiMetricBar.tsx` ↔ `page.tsx`
- **Props**: `totalIngestion: number`, `ingestionRate: number`, `activeFleet: string`, `p95LatencyMs: number`, `unacknowledgedAlarms: number`

### `TelemetryAreaChart.tsx` ↔ `useMqttStream.ts`
- **Props**: `history: Array<{ time: string, temp: number, press: number, vib: number }>`, `selectedMetric: 'temp' | 'press' | 'vib'`
- **Visuals**: Recharts `<AreaChart>` with monotone spline, gradient ID `neonGlow`, custom tooltip.

### `RadialGauge.tsx` ↔ `page.tsx`
- **Props**: `percentage: number`, `title: string`, `subtitle: string`, `statusLabel: string`
- **Visuals**: SVG `<circle>` with `strokeDasharray`, `strokeDashoffset`, glowing drop-shadow filter.

### `IncidentResponseTable.tsx` ↔ `useMqttStream.ts`
- **Props**: `alerts: AnomalyEvent[]`, `onAcknowledge: (eventId: string, note: string) => void`
- **Action**: Opens operator note modal, calls `onAcknowledge`, dispatches MQTT ack packet.

### `TestLabPanel.tsx` ↔ `useMqttStream.ts`
- **Props**: `onInjectFault: (scenario: string, targetDevice: string, durationSec: number) => void`, `onReset: () => void`

## Code Layout
- `dashboard/src/app/globals.css`: SCADA color variables and neon glow utilities
- `dashboard/tailwind.config.ts`: Tailwind theme extensions (`scada` palette, glowing shadows)
- `dashboard/src/components/layout/Sidebar.tsx`: Left categorized sidebar with solid neon green pills
- `dashboard/src/components/layout/TopBar.tsx`: Search input and operator profile
- `dashboard/src/components/scada/KpiMetricBar.tsx`: 4-metric horizontal card with hairline dividers
- `dashboard/src/components/scada/TelemetryAreaChart.tsx`: Glowing spline area chart with gradient fill
- `dashboard/src/components/scada/RadialGauge.tsx`: Circular SVG radial progress gauge
- `dashboard/src/components/scada/IncidentResponseTable.tsx`: Incident table with operator ACK action
- `dashboard/src/components/scada/TestLabPanel.tsx`: Interactive fault injection panel
- `dashboard/src/hooks/useMqttStream.ts`: WebSocket client and state store
- `dashboard/src/app/page.tsx`: Unified SCADA Operations Center view assembly
