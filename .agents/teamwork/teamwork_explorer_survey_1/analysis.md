# Visual & Component Architecture Exploration: SCADA Dashboard

**Author**: `teamwork_explorer_survey_1`  
**Date**: 2026-11-06  
**Status**: Comprehensive Survey & Architectural Specification  
**Target Codebase**: `d:\INDIA\S5\Industrie4.0\Projet\dashboard\`  
**Reference Design**: `C:\Users\RedNa\.gemini\antigravity\brain\3127a420-d341-49d7-b265-6f62c0da6874\.user_uploaded\media_1793984033843_2147cf5e.jpg`

---

## 1. Visual & Aesthetic Token Analysis (Reference Image Deconstruction)

From direct visual examination of the reference image (`media_1793984033843_2147cf5e.jpg`), the design establishes an ultra-premium, dark-mode technical operations interface. Below are the extracted design tokens:

### 1.1 Color Palette & Atmospheric Lighting
| Token Name | Hex Code | HSL / RGBA | Visual Role in Reference |
|---|---|---|---|
| **App Canvas / Frame** | `#070B09` | `hsl(150, 31%, 4%)` | Deepest background surrounding inner app card; ambient neon diagonal streaks |
| **Card Surface (Matte Charcoal)** | `#0D1411` | `hsl(154, 25%, 7%)` | Primary surface for all container cards, sidebar, and chart backdrops |
| **Elevated Surface / Inputs** | `#131C18` | `hsl(153, 20%, 9%)` | Search bar, inactive pills, table header rows, metric pill holders |
| **Hairline Card Borders** | `#1A2821` | `rgba(26, 40, 33, 0.8)` | Hairline dividers between KPI metrics and subtle card borders (`border-emerald-950/40`) |
| **Primary Neon Mint Highlight** | `#00F59B` | `hsl(158, 100%, 48%)` | Active navigation pill, gauge progress stroke, chart spline, "Dashboard" logo |
| **Emerald Accent** | `#10B981` | `hsl(160, 84%, 39%)` | Secondary green highlights, secondary charts, sub-trends |
| **Active Text on Neon Pill** | `#050B08` | `hsl(150, 38%, 3%)` | High-contrast dark foreground text on solid neon green active pills |
| **Alert / Anomaly Coral Red** | `#FF4D4D` | `hsl(0, 100%, 65%)` | Notification badges (`2`), critical anomaly spline in chart, negative trend arrows |
| **Warning Amber** | `#F59E0B` | `hsl(38, 92%, 50%)` | Warning severity tags, mid-threshold indicators |
| **Muted Text / Secondary Labels** | `#667A71` | `hsl(153, 9%, 44%)` | Category titles ("Podcasts", "Analytics"), subtitle specs, metric labels |
| **Body Foreground Text** | `#C5D4CC` | `hsl(149, 13%, 80%)` | Table body text, descriptions, secondary values |
| **Crisp White** | `#FFFFFF` | `#FFFFFF` | Large KPI numbers (`4,095`, `405,654`, `75.5%`), Operator name |
| **Neon Glow Bloom** | `rgba(0,245,155,0.3)` | `box-shadow: 0 0 20px ...` | Ambient glow around active pill buttons and peak chart dots |

### 1.2 Layout Geometry & Radii
- **Main App Frame**: Outer rounded container (`rounded-3xl` / 24px) floating within an atmospheric ambient space with diagonal green gradient streaks (`#00F59B` glow lines).
- **Cards**: Soft matte rounded cards (`rounded-2xl` / 16px) with 1px border (`#1A2821`).
- **Pills & Buttons**: Fully rounded pill shapes (`rounded-xl` or `rounded-full`) for navigation items, search bars, action buttons, and status badges.
- **Hairline Dividers**: Crisp 1px vertical borders (`border-r border-[#1A2821]`) separating metric segments within the horizontal KPI bar.

---

## 2. Codebase Delta Matrix: Existing UI vs. Reference Design

| Component Area | Reference Design Specification | Current Implementation in `dashboard/src/` | Delta & Architectural Gap |
|---|---|---|---|
| **1. Primary Navigation** | Fixed Left Sidebar (240–260px wide). Categorical groups ("Fleet & Operations", "Analytics"), notification badges (coral red `2`), active state = **solid neon mint green pill (`#00F59B`) with dark charcoal text (`#050B08`)**, bottom operator/version card. | `Navbar.tsx` (lines 33–121): Horizontal top bar header. Blueish slate (`#111827`), no sidebar, no categorical grouping. Active state is slate background with cyan icon. | **Major architectural mismatch**. Must transform from a top horizontal navbar into a left categorical sidebar with solid neon mint active pills. |
| **2. Top Header Bar** | Top bar above main canvas featuring a pill-shaped search input field (`#131C18`) on the left, and an Operator Profile Card (avatar, operator name, email, dropdown chevron) on the right. | No dedicated top bar. Search only exists inside `AlertConsole.tsx`. No operator profile card anywhere in the application. | **Missing entirely**. Need a `TopBar` component with search input and operator profile card. |
| **3. Top KPI Metric Bar** | Single horizontal card (`rounded-2xl`) with 4 KPI items separated by **vertical hairline dividers**: Total Ingestion, Active Fleet (5/5), Edge p95 Latency, Unacknowledged Alarms. Large white numbers with green/red trend badges (`↗ +33.45%`). | `PlantOverview.tsx` (lines 70–134): 4 disconnected cards in a CSS grid (`grid-cols-4 gap-4`) using blue slate surfaces (`#111827`). Absent on other tabs. | **Visual mismatch**. Must unify into a single horizontal container card with vertical hairline borders, dark matte surface (`#0D1411`), and exact KPI formatting. |
| **4. Spline Area Charts** | Prominent Recharts AreaChart with smooth bezier spline (`type="monotone"`), bright neon mint stroke (`#00F59B`, 2.5px), underneath gradient glow fill (`rgba(0,245,155,0.25)` to `0.0`), secondary coral red anomaly spline, glowing peak dot, large summary number (`405,654`). | `DeviceDetail.tsx` (lines 266–346): Standard `LineChart` (not `AreaChart`), no gradient fill, harsh grid lines, standard blue/amber/cyan strokes (`#06b6d4`, `#ef4444`). In `PlantOverview.tsx`: No chart at all. | **Major visual gap**. Must implement an `AreaChart` with neon mint glowing gradient fill, smooth bezier splines, and live MQTT telemetry data feeding. |
| **5. Radial Circular Progress Gauge** | Circular SVG progress ring in top-right card ("Audience satisfaction" -> "Asset Health & Fleet Reliability"). Dark track (`#13221A`), glowing neon mint arc (`#00F59B`), rounded caps, center percentage ("75.5%" or dynamic fleet health), bottom scale (0% – 100%). | Completely absent in entire codebase. Only tiny linear progress bars (`h-1.5 bg-industrial-cyan`) exist in `PlantOverview.tsx`. | **Missing entirely**. Need a dedicated `AssetHealthGauge` component with SVG circular stroke, glow filters, and dynamic calculation. |
| **6. Incident Response Table** | Bottom-center card corresponding to "Popular Episodes". Features circular neon/coral icon badges, incident titles, threshold & diagnostic reason, time elapsed, and operator "ACK" button / "See All" trigger. | `AlertConsole.tsx` (lines 141–216): Full-page traditional 8-column HTML `<table>` with harsh borders, blueish styling, accessible only by tab switching. Not visible in the main overview. | **Layout & visual gap**. Must adapt into the bottom-center card structure matching the reference design, with circular badges and operator ACK pill buttons. |
| **7. Test Lab Fault Injector** | Bottom-right card corresponding to the callout/promo card ("Webinars") or accessible interactive drawer. 6 scenario buttons (Thermal Overheat, Vibration Spike, Pressure Drop, etc.) with neon green accents, duration selector, and reset button. | `TestLab.tsx`: Standalone full-page view, slate theme (`#111827`), cyan buttons, separated from the main operational overview. | **Layout gap**. Integrate as the interactive bottom-right control card or accessible modal/drawer with reference design aesthetic. |
| **8. Theme Tokens & CSS** | Matte dark charcoal (`#0B0F0E`, `#0D1411`), subtle borders (`#1A2821`), neon mint green (`#00F59B`), glowing box shadows. | `tailwind.config.ts` & `globals.css`: Blueish dark slate (`#0b0f17`, `#111827`, `#1f2937`, primary cyan `199 89% 48%`). | **Token mismatch**. Must update Tailwind palette and CSS variables to matte dark charcoal and neon mint green. |

---

## 3. Detailed Component Architecture Specifications

### 3.1 App Layout Structure (`src/app/page.tsx` & `src/app/layout.tsx`)
The reference layout is a **fixed-sidebar, flexible-canvas 2-column layout** enclosed in a rounded dark container:

```
+--------------------------------------------------------------------------------------------------------------------+
|  [Sidebar (240px)]      |  [Main Operations Canvas (flex-1)]                                                      |
|                         |                                                                                          |
|  - Dashboard Logo       |  +------------------------------------------------------------------------------------+  |
|    (Neon Mint #00F59B)  |  | [TopBar]: Search Input ("Search here...")      [Operator Profile & MQTT Status]   |  |
|                         |  +------------------------------------------------------------------------------------+  |
|  - General:             |                                                                                          |
|    * Inbox [Badge: 2]   |  +------------------------------------------------------------------------------------+  |
|    * Alerts             |  | [Top KPI Metric Bar (Single card with vertical hairline dividers)]:                   |  |
|    * [OVERVIEW] (ACTIVE)|  | Total Ingestion  |  Active Fleet (5/5)  |  Edge p95 Latency  | Unack Alarms       |  |
|      Solid Neon Pill    |  | 1,428,095 msg    |  5 / 5 (100% Online) |  12.4 ms (<100ms)  | 2 Pending [Alert]  |  |
|                         |  +------------------------------------------------------------------------------------+  |
|  - Fleet & Operations:  |                                                                                          |
|    * Asset Fleet        |  +--------------------------------------------------+ +-------------------------------+  |
|    * Telemetry Streams  |  | [Telemetry Spline Area Chart (2/3 width)]:       | | [Asset Health Gauge (1/3)]:   |  |
|    * Topology Map       |  | Title: Ingestion & Telemetry Trends              | | Title: Fleet Health Score   |  |
|                         |  | Large Stat: 405,654 msg (↗ +43.46%)              | | (O) 96.8% [Circular Gauge]  |  |
|  - SCADA Intelligence:  |  | [Recharts AreaChart: Smooth Neon Mint Spline]    | | 0% -- Reliability -- 100%   |  |
|    * Incident Console   |  | Gradient Fill Glow + Red Anomaly Spline          | |                             |  |
|    * Fault Injector Lab |  +--------------------------------------------------+ +-------------------------------+  |
|    * Pipeline Health    |                                                                                          |
|                         |  +--------------------------------------------------+ +-------------------------------+  |
|  - Bottom Widget:       |  | [Incident Response Card (Popular Episodes map)]: | | [Interactive Test Lab]:     |  |
|    * Circular Badge     |  | Title: Active Operational Incidents    [See All] | | Title: Fault Injector [:::] |  |
|    * "SCADA Operator"   |  | Row 1: (Icon) motor-01 Overheat (>85°C)   [ACK]  | | "Simulate OT Anomaly Events"|  |
|    * "Ver. 2.4.0 ENSAM" |  | Row 2: (Icon) pump-01 Vibration Spike     [ACK]  | | [Overheat] [Vib] [Pressure] |  |
|                         |  | Row 3: (Icon) comp-01 Nominal             [OK]   | | [Reset Nominal]             |  |
|                         |  +--------------------------------------------------+ +-------------------------------+  |
+--------------------------------------------------------------------------------------------------------------------+
```

### 3.2 Component Breakdown & Interfaces

#### Component 1: `Sidebar.tsx` (`src/components/layout/Sidebar.tsx`)
- **Props**:
  - `activeView: string`
  - `onSelectView: (view: string) => void`
  - `unackAlertsCount: number`
  - `isConnected: boolean`
- **Elements**:
  - Header: `<h1 className="text-xl font-bold text-[#00F59B] tracking-tight">Dashboard</h1>`
  - Navigation Sections:
    1. **General**:
       - `Inbox`: Icon `Mail`, coral badge `{unackAlertsCount}`.
       - `Alerts`: Icon `Bell` / `ShieldAlert`.
       - `Overview`: **Active state**. Solid neon pill button:
         `className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-[#00F59B] text-[#050B08] font-semibold shadow-[0_0_20px_rgba(0,245,155,0.35)] transition-all"`
    2. **Fleet & Operations** (Category title in `#667A71`, uppercase, text-[11px]):
       - `Assets`: Icon `Cpu`, label "Episodes" / "Asset Fleet".
       - `Telemetry`: Icon `Activity`, label "Media" / "Live Signals".
       - `Topology`: Icon `Network`, label "Materials" / "Topology".
       - `Nodes`: Icon `Radio`, label "Contacts" / "Edge Nodes".
    3. **SCADA Intelligence** (Category title in `#667A71`):
       - `Subscribers / Alarms`: Icon `ShieldAlert`, red badge `{unackAlertsCount}`.
       - `Channels / MQTT`: Icon `Layers`, label "Channels".
       - `Integrations / Lab`: Icon `FlaskConical`, label "Test Lab".
       - `Reports`: Icon `FileText`, label "Audit Logs".
  - Bottom Version Card:
    - Circular badge (`w-9 h-9 rounded-full bg-[#00F59B] text-black flex items-center justify-center`).
    - Title: "SCADA Core" (or "Podcaster").
    - Subtitle: "Ver. 2.4.0 ENSAM" (or "Ver. 0.458").

#### Component 2: `TopBar.tsx` (`src/components/layout/TopBar.tsx`)
- **Props**:
  - `searchQuery: string`
  - `onSearchChange: (q: string) => void`
  - `isConnected: boolean`
  - `operatorName?: string`
  - `operatorRole?: string`
- **Elements**:
  - Search Input:
    - Container: `relative w-72 sm:w-80`
    - Input: `w-full bg-[#131C18] border border-[#1A2821] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#667A71] focus:border-[#00F59B]`
    - Icon: `Search` in `#667A71` at `left-3.5 top-2.5`.
  - Right Actions:
    - Live MQTT status pill: `bg-emerald-950/40 text-[#00F59B] border border-emerald-800/40 px-3 py-1 rounded-full text-xs font-mono` with pulsing green dot.
    - Operator Profile Card:
      - Chevron `ChevronDown` (`w-4 h-4 text-[#667A71]`).
      - Text block: Name "Daniel james potter" (or "Ing. SCADA ENSAM"), Email "daniel.james@gmail.com".
      - Avatar: Circular image/avatar with subtle neon ring border (`w-9 h-9 rounded-full border border-[#1A2821]`).

#### Component 3: `KpiMetricBar.tsx` (`src/components/views/KpiMetricBar.tsx`)
- **Props**:
  - `totalIngestion: number`
  - `activeFleet: number`
  - `totalFleet: number`
  - `edgeP95Latency: number`
  - `unackAlertsCount: number`
- **Layout**:
  - Single outer card: `bg-[#0D1411] border border-[#1A2821] rounded-2xl p-5 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#1A2821]`
  - Segment 1:
    - Title: `New Subscribers` (Total Ingestion) in `#82958C` text-xs
    - Value: `4,095` (or live formatted string `1,428,095`) in white font-bold text-2xl
    - Trend: `↗ +33.45%` in `#00F59B` text-xs font-semibold
  - Segment 2:
    - Title: `Streams` (Active Fleet) in `#82958C` text-xs
    - Value: `47,457` (or `5 / 5`) in white font-bold text-2xl
    - Trend: `● 100% Online` (or `↘ -158.65%`) in `#00F59B` (or `#FF4D4D`)
  - Segment 3:
    - Title: `Engagement Rate` (Edge p95 Latency) in `#82958C` text-xs
    - Value: `20.58` (or `${edgeP95Latency} ms`) in white font-bold text-2xl
    - Trend: `↗ +65.55%` (or `< 100ms Target`) in `#00F59B`
  - Segment 4:
    - Title: `Avg. watch time` (Unacknowledged Alarms) in `#82958C` text-xs
    - Value: `85,4 min` (or `${unackAlertsCount}`) in white font-bold text-2xl
    - Trend: `↗ +6.55%` in `#00F59B` (or warning red if `> 0`)

#### Component 4: `TelemetryAreaChart.tsx` (`src/components/views/TelemetryAreaChart.tsx`)
- **Props**:
  - `historyData: Array<{ time: string; valueA: number; valueB: number }>`
  - `totalCount: number`
  - `trendPct: string`
  - `activeSignal: string`
  - `onSelectSignal: (sig: string) => void`
- **Recharts Structure**:
  - Uses `<ResponsiveContainer width="100%" height={260}>`
  - `<AreaChart data={historyData}>`
  - SVG Gradients:
    ```tsx
    <defs>
      <linearGradient id="neonMintGlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#00F59B" stopOpacity={0.3} />
        <stop offset="95%" stopColor="#00F59B" stopOpacity={0.0} />
      </linearGradient>
      <linearGradient id="coralGlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#FF4D4D" stopOpacity={0.2} />
        <stop offset="95%" stopColor="#FF4D4D" stopOpacity={0.0} />
      </linearGradient>
    </defs>
    ```
  - Primary Area: `type="monotone"`, `dataKey="valueA"`, `stroke="#00F59B"`, `strokeWidth={2.5}`, `fillOpacity={1}`, `fill="url(#neonMintGlow)"`
  - Secondary Area: `type="monotone"`, `dataKey="valueB"`, `stroke="#FF4D4D"`, `strokeWidth={1.8}`, `fill="url(#coralGlow)"`
  - Dot highlight at peak: custom glowing circle SVG.
  - Coordinate axes:
    - `<XAxis dataKey="time" stroke="#52655D" tickLine={false} axisLine={{ stroke: '#1A2821' }} fontSize={11} />`
    - `<YAxis stroke="#52655D" tickLine={false} axisLine={false} fontSize={11} />`
    - `<CartesianGrid stroke="#15201B" vertical={false} strokeDasharray="0" />`

#### Component 5: `AssetHealthGauge.tsx` (`src/components/views/AssetHealthGauge.tsx`)
- **Props**:
  - `healthPercentage: number` (defaults to 75.5 or dynamic calculated e.g. based on alert severity)
  - `title?: string` (defaults to "Audience satisfaction" or "Asset Fleet Reliability")
  - `subtitle?: string` (defaults to "Based on likes / dislikes" or "Based on ISO 10816 standards")
- **SVG Circular Donut Specs**:
  - Center: `(cx=100, cy=100)`, radius: `r=70`, viewBox: `"0 0 200 200"`.
  - Circumference: `C = 2 * PI * 70 ≈ 439.82`.
  - Arc length (e.g. 75.5%): `offset = C - (healthPercentage / 100) * C`.
  - Track Ring: `<circle cx="100" cy="100" r="70" stroke="#13221A" strokeWidth="16" fill="transparent" />`
  - Indicator Ring:
    ```tsx
    <circle
      cx="100"
      cy="100"
      r="70"
      stroke="#00F59B"
      strokeWidth="16"
      strokeDasharray={439.82}
      strokeDashoffset={439.82 - (healthPercentage / 100) * 439.82}
      strokeLinecap="round"
      fill="transparent"
      transform="rotate(-90 100 100)"
      className="transition-all duration-700 ease-out"
      style={{ filter: "drop-shadow(0 0 8px rgba(0,245,155,0.4))" }}
    />
    ```
  - Center Text: `<span className="text-3xl font-bold text-white tracking-tight">{healthPercentage.toFixed(1)}%</span>`
  - Bottom Scale Bar: Flex row: `0%` (left), subtitle (center), `100%` (right).

#### Component 6: `IncidentResponseTable.tsx` (`src/components/views/IncidentResponseTable.tsx`)
- Maps to "Popular Episodes" in reference:
  - Header: "Popular Episodes" (or "Active Incidents & Alerts") on left, "See All" button on right.
  - Rows:
    - Left: Circular icon badge (`w-8 h-8 rounded-full bg-[#00F59B]/20 border border-[#00F59B]/40 text-[#00F59B]` or `#FF4D4D/20 text-[#FF4D4D]` for critical).
    - Middle: Title ("motor-01: Bearing Overheat" or "Kuji Podcast 33: Live"), Subtitle ("Observed: 88.4°C > Limit: 80.0°C | Rule: NF-02").
    - Right: Timestamp ("12s ago" or "1.58m") + Status / Action Pill ("Live" or "ACK").
    - Operator ACK button: If not acknowledged, clicking button dispatches MQTT ACK and turns into solid green badge with `Check` icon.

#### Component 7: `TestLabPanel.tsx` (`src/components/views/TestLabPanel.tsx`)
- Maps to "Webinars" card in reference:
  - Header: "Test Lab & Fault Injection" with 3-dot menu `⋮`.
  - Highlight headline in `#00F59B`:
    `"Simulate OT Anomaly Scenarios & Verify Edge Resilience"`
  - Description:
    `"Inject real-time faults into industrial equipment to trigger ISO 10816 thresholds and edge quarantine."`
  - Action Scenarios:
    - Quick-trigger pills: `[Thermal Overheat]` `[Vibration Spike]` `[Pressure Drop]` `[Machine Stop]`
    - Duration slider/selector: `[10s]` `[30s]` `[60s]`
    - Reset button: `"Reset Nominal"` in solid neon green or subtle outline.
  - Interactive status banner showing the currently active scenario and confirmation toast.

---

## 4. Design Tokens & Styling Implementation Plan

### 4.1 `tailwind.config.ts` Upgrades
Extend theme colors with exact reference hex tokens:

```ts
// In tailwind.config.ts extend.colors:
colors: {
  scada: {
    canvas: "#070B09",
    surface: "#0D1411",
    elevated: "#131C18",
    border: "#1A2821",
    borderSubtle: "#14201A",
    neon: "#00F59B",
    emerald: "#10B981",
    coral: "#FF4D4D",
    amber: "#F59E0B",
    muted: "#667A71",
    text: "#C5D4CC",
    white: "#FFFFFF",
  },
},
boxShadow: {
  'neon-glow': '0 0 20px rgba(0, 245, 155, 0.35)',
  'coral-glow': '0 0 20px rgba(255, 77, 77, 0.35)',
}
```

### 4.2 `globals.css` Styling
Add background styling, diagonal ambient streaks, and scrollbars:

```css
@layer base {
  body {
    background-color: #070B09;
    color: #C5D4CC;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
}

/* Ambient neon diagonal light streaks as seen in reference image outer background */
.ambient-neon-glow {
  position: fixed;
  pointer-events: none;
  z-index: 0;
  inset: 0;
  background: 
    radial-gradient(circle at 10% 90%, rgba(0, 245, 155, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 90% 10%, rgba(0, 245, 155, 0.12) 0%, transparent 40%);
}
```

---

## 5. Live MQTT Stream Integration Architecture

1. **Protocol**: OASIS MQTT 5.0 over WebSockets at `ws://localhost:9001`.
2. **Hook**: `useMqttStream.ts` already handles:
   - Real-time connection management with auto-reconnect (`2000ms`).
   - Subscription to `ensam/iiot/+/+/+/telemetry`, `ensam/iiot/+/+/+/status`, and `ensam/iiot/+/+/+/event`.
   - Continuous latency computation (`telemetry.latency_ms`) and 1-second rolling message-per-second computation.
   - Fault scenario publishing via `publishCommand(deviceId, "set_scenario", scenario, durationSec)`.
   - Operator alarm acknowledgment via `acknowledgeAlert(eventId, note)` publishing to `ensam/iiot/site-a/line-1/system/event/ack`.
3. **No Mock Fallback**: As required by R4, all telemetry graphs, circular gauges, KPI metrics, and incident rows will consume data directly from `useMqttStream()`. When waiting for stream packets, sleek loading pulses or empty state indicators in the reference aesthetic will be displayed.

---

## 6. Build and Verification Strategy

- **Build Check Command**:
  Run from `dashboard/`:
  `.\node_modules\.bin\tsc.cmd --noEmit`
  and
  `.\node_modules\.bin\next.cmd build` (or `npm run build` after fixing the working directory path).
- **TypeScript strictness**: All props, handlers, and SVG attributes must have full TypeScript typing conforming to `src/types/iiot.ts`.
