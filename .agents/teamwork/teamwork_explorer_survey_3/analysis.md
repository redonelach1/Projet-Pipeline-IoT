# Technical Survey & Feature Inventory Report

**Agent**: `teamwork_explorer_survey_3`  
**Date**: 2026-11-06  
**Target Workspace**: `d:\INDIA\S5\Industrie4.0\Projet\dashboard`  
**Authoritative Request Reference**: `.agents/teamwork/ORIGINAL_REQUEST.md`  
**Reference Design Image**: `media_1793984033843_2147cf5e.jpg`

---

## 1. Executive Summary

This survey provides a technical baseline and architectural gap analysis for the ENSAM Rabat Industrie 4.0 SCADA Operations Dashboard. The dashboard was analyzed against the four core project requirements (R1: Theme & Visual Language, R2: Navigation & Metric Header, R3: Telemetry Visualizations & Operational Controls, R4: Live MQTT Data Integration) and the reference image.

Key Highlights:
- **Build Pipeline**: Next.js 14.2.18 App Router (not Vite), TypeScript 5.6.3, Tailwind CSS 3.4.15, PostCSS 8.4.49, Autoprefixer 10.4.20. Standalone build configured.
- **Dependency Status**: All critical UI and data streaming packages are already in `package.json` (`@radix-ui/*`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, `recharts`, `mqtt`). Zero missing NPM packages.
- **Initial Build State**: `node_modules` was initially absent. Following `npm install`, Next.js production build (`npm run build`) succeeded with exit code 0 and zero TypeScript/lint errors.
- **Architectural Gaps**: The existing codebase uses a top-header-only layout with cyan/dark-slate styling and basic line charts. To match R1-R3 and the reference image, it requires:
  1. A left sidebar navigation with categorical groupings and neon green active pill buttons.
  2. A top bar with search input and operator profile card.
  3. A top horizontal 4-metric KPI bar with vertical hairline dividers.
  4. Smooth glowing spline area charts with underneath gradient fills via Recharts.
  5. A circular radial progress gauge for fleet asset health.
  6. A deep matte black/charcoal theme overhaul with `#00F59B` / `#10B981` neon mint accents.

---

## 2. Build Pipeline & Tooling Analysis

| Parameter | Configuration / Version | Notes |
| :--- | :--- | :--- |
| **Framework** | Next.js 14.2.18 (App Router) | Note: Task prompt mentioned `vite.config.ts`, but the repository uses Next.js `next.config.mjs`. |
| **Runtime** | Node.js v20.18.0, npm 11.4.2 | Compatible with Next.js 14 and multi-stage Docker build (`node:20-alpine`). |
| **TypeScript** | v5.6.3 (`tsconfig.json`) | Strict mode enabled, `paths` alias configured (`@/* -> ./src/*`). |
| **Styling** | Tailwind CSS v3.4.15 + PostCSS | Dark mode enabled via `class`, custom CSS variables in `src/app/globals.css`. |
| **Packaging / Output** | `output: "standalone"` | Enabled in `next.config.mjs` with externals for `bufferutil` and `utf-8-validate`. |
| **Build Script** | `npm run build` (`next build`) | Successfully compiled: Route `/` (221 kB, First Load JS 308 kB). |

---

## 3. Library & Dependency Inventory

### Installed Dependencies (`dashboard/package.json`):
- `@radix-ui/react-dialog` (`^1.1.2`) — Modal dialogs (ready for ACK operator dialog).
- `@radix-ui/react-select` (`^2.1.2`) — Select dropdowns.
- `@radix-ui/react-slot` (`^1.1.0`) — Slot primitive for shadcn components.
- `@radix-ui/react-tabs` (`^1.1.1`) — Tab navigation primitives.
- `@radix-ui/react-tooltip` (`^1.1.4`) — Hover tooltips.
- `class-variance-authority` (`^0.7.0`) — Variant-driven styling for buttons/badges.
- `clsx` (`^2.1.1`) & `tailwind-merge` (`^2.5.4`) — Dynamic CSS class merging via `cn()` in `src/lib/utils.ts`.
- `lucide-react` (`^0.454.0`) — Icon library (verified functional).
- `mqtt` (`^5.10.1`) — WebSocket MQTT client for real-time edge broker streaming (`ws://localhost:9001`).
- `next` (`14.2.18`), `react` (`^18.3.1`), `react-dom` (`^18.3.1`) — Core UI framework.
- `recharts` (`^2.13.3`) — AreaChart, LineChart, RadialBarChart, ResponsiveContainer, Tooltip, Legend.
- `tailwindcss-animate` (`^1.0.7`) — Tailwind animation utilities.

### Missing Dependencies:
- **None**. All necessary tools are present in `package.json` and resolved in `node_modules`. No extra npm packages need to be installed.

---

## 4. Current Directory & File Structure (`dashboard/src/`)

```
src/
├── app/
│   ├── globals.css          # Tailwind base, CSS variables, scrollbars (Needs palette overhaul)
│   ├── layout.tsx           # RootLayout with dark mode, metadata, html/body
│   └── page.tsx             # SCADADashboard shell: navbar + activeTab view switcher + footer
├── components/
│   ├── layout/
│   │   └── Navbar.tsx       # Top horizontal navigation header (To be replaced/augmented by Sidebar & TopBar)
│   └── views/
│       ├── AlertConsole.tsx # Table of anomaly events, CSV export, severity filters, ack modal
│       ├── DeviceDetail.tsx # Selected machine telemetry dials, Recharts LineChart
│       ├── PipelineMetrics.tsx # Quantitative benchmarking KPIs (NF-01 to NF-08), latency breakdown
│       ├── PlantOverview.tsx # 4 KPI cards, 5-asset fleet synoptic grid with mini gauges
│       └── TestLab.tsx      # Fault injector buttons (6 scenarios) + audit log
├── hooks/
│   └── useMqttStream.ts     # MQTT client hook subscribing to telemetry/status/event, pub command/ack
├── lib/
│   └── utils.ts             # cn() tailwind-merge helper, formatTimestamp()
└── types/
    └── iiot.ts              # Data types (TelemetryPayload, DeviceStatus, AnomalyEvent, MachineState, ScenarioType)
```

---

## 5. Structured Feature Inventory (R1–R4 Mapping)

| Feature # | Feature Name | Description | Source Requirement | Status in Current Codebase | Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **F-01** | Deep Matte Dark Aesthetic | Matte charcoal/black backgrounds (`#06080a`, `#0a0d10`, `#0e141b`), rounded cards (`rounded-2xl`), subtle hairline borders (`border-[#18232c]`). | **R1** | Partial / Generic Dark | Overhaul `globals.css` and `tailwind.config.ts`; replace slate/blue panels with matte charcoal surfaces. |
| **F-02** | Neon Mint / Emerald Accent Language | Neon mint (`#00F59B` / `#10B981`) accents for active states, glowing pill elements, highlights, and gauges. | **R1** | Missing / Cyan-based | Update theme tokens, pill highlights, and glowing shadows to use `#00F59B` / `#10B981`. |
| **F-03** | Left Categorized Sidebar Navigation | Left sidebar with categorized navigation groups (Operations, Machinery, Diagnostics, Analytics), icon badges (e.g. unack alarms count). | **R2** | Missing | Create `src/components/layout/Sidebar.tsx` with categorized groups, icon badges, and gateway version footer badge. |
| **F-04** | Solid Neon Green Active Pill Buttons | Active navigation items display as solid neon green (`#00F59B`) rounded pill buttons with high-contrast dark text (`#050807`). | **R2** | Missing | Implement solid pill active state in `Sidebar.tsx` matching the reference image. |
| **F-05** | Top Header Bar with Search & Profile | Top bar displaying search input ("Search here...") and operator profile card (avatar, "Shift Operator", dropdown). | **R2** | Missing | Create `src/components/layout/TopBar.tsx`. |
| **F-06** | Top Horizontal 4-Segment KPI Metric Bar | Single wide container displaying Total Ingestion, Active Fleet (5/5), Edge p95 Latency, and Unacknowledged Alarms separated by vertical hairline dividers with delta trend badges. | **R2** | Incomplete / Fragmented | Create `src/components/layout/KpiMetricBar.tsx` (unifying metrics currently split in `PlantOverview.tsx`). |
| **F-07** | Smooth Glowing Spline Area Chart | Recharts `AreaChart` with smooth splines (`type="monotone"`), underneath gradient fills (`defs/linearGradient`), contrasting curves (mint green + coral red), and glowing peak dot indicator. | **R3** | Partial / Hard LineChart | Upgrade `DeviceDetail.tsx` (and `PlantOverview.tsx`) to use Recharts `<AreaChart>` with gradient fills. |
| **F-08** | Circular Radial Progress Gauge | Radial arc gauge displaying Asset Health / Fleet Satisfaction percentage (e.g. 75.5% / 98.2%) with neon green highlights and 0%–100% scale. | **R3** | Missing | Create `src/components/ui/RadialGauge.tsx` using SVG or Recharts `RadialBarChart` / `PieChart`. |
| **F-09** | Interactive Test Lab Fault Injector | Fault injector panel with 6 anomaly triggers (Thermal Overheat, Vibration Spike, Pressure Drop, Machine Stop, Corrupted Payload, Silence), duration selector, target asset selector, command audit log. | **R3** | Functional / Needs Reskin | Refactor and style `TestLab.tsx` to integrate seamlessly into the new card and layout structure. |
| **F-10** | Incident Response Table with Operator ACK | Incident response table with severity badges, diagnostic reasons, and operator ACK action modal. | **R3** | Functional / Needs Reskin | Reskin `AlertConsole.tsx` table, modal dialog, and export actions to match reference aesthetic. |
| **F-11** | Live MQTT Data Integration (Zero Mock Fallback) | Subscribes strictly to live MQTT over WebSockets via `ws://localhost:9001` (`useMqttStream.ts`), receiving real-time telemetry, device status, and anomaly events. | **R4** | Functional | Retain strict live MQTT stream; ensure UI components display live connection states gracefully without fallback mock data. |
| **F-12** | Clean Production Build Verification | Zero TypeScript, JSX, or lint errors during `npm run build`. | Acceptance Criteria | Verified Clean | Ensure all new/overhauled components compile cleanly in `next build`. |

---

## 6. Component Modification & Creation Plan

### Components to Create:
1. `src/components/layout/Sidebar.tsx` — Left vertical navigation sidebar with categories, icon badges, and solid neon green active pills.
2. `src/components/layout/TopBar.tsx` — Top search input and operator profile card.
3. `src/components/layout/KpiMetricBar.tsx` — 4-segment unified metric bar with vertical hairline dividers.
4. `src/components/ui/RadialGauge.tsx` — Circular radial progress gauge for asset health.

### Components to Overhaul / Refactor:
1. `src/app/globals.css` — Palette definitions for matte black (`#06080a`, `#0a0d10`, `#0e141b`) and neon mint (`#00F59B` / `#10B981`).
2. `src/tailwind.config.ts` — Theme color extensions for industrial neon and matte surfaces.
3. `src/app/page.tsx` — Overall layout wrapper: Flex container with fixed/sticky `Sidebar` on the left and scrollable main content area (TopBar + KpiMetricBar + Views) on the right.
4. `src/components/views/DeviceDetail.tsx` — Replace LineChart with glowing Spline AreaChart with gradient fills underneath.
5. `src/components/views/PlantOverview.tsx` — Incorporate RadialGauge for overall plant health; connect synoptic fleet cards to neon theme.
6. `src/components/views/AlertConsole.tsx` — Harmonize incident table styling with reference dark card aesthetic.
7. `src/components/views/TestLab.tsx` — Harmonize fault injection cards and dispatch audit log.
