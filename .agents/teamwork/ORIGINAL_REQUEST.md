# Original User Request

## Initial Request — 2026-11-06T18:07:38Z

Build a premium showcase dashboard UI for ENSAM Rabat's Industrie 4.0 End-to-End Industrial IoT Pipeline and SCADA Operations Center, iteratively refining `dashboard/` to match the visual aesthetic of the reference design.

Working directory: d:\INDIA\S5\Industrie4.0\Projet\dashboard
Integrity mode: development

Reference Material:
- Reference Image: C:/Users/RedNa/.gemini/antigravity/brain/3127a420-d341-49d7-b265-6f62c0da6874/.user_uploaded/media_1793984033843_2147cf5e.jpg

## Requirements

### R1. Theme & Visual Language
Establish a premium dark aesthetic using shadcn/ui and Tailwind CSS: deep matte black/charcoal surfaces, rounded card containers, subtle border outlines, and neon mint/emerald green accents (`#00F59B` / `#10B981`) applied to active states, glowing pill elements, highlights, and gauges.

### R2. Navigation & Metric Header
Implement a left sidebar navigation with categorical grouping, icon badges, and active solid neon green pill buttons featuring dark text on neon green. Implement a top bar with search input and operator profile card, alongside a top horizontal KPI metric bar displaying Total Ingestion, Active Fleet (5/5), Edge p95 Latency, and Unacknowledged Alarms separated by vertical hairline dividers.

### R3. Telemetry Visualizations & Operational Controls
Render real-time telemetry using smooth glowing spline area charts with underneath gradient fills via Recharts, and display asset health/satisfaction using a circular radial progress gauge. Provide an interactive Test Lab fault injector and an Incident response table featuring operator ACK actions.

### R4. Live MQTT Data Integration
Connect dashboard telemetry and incident components strictly to live MQTT over WebSockets via `ws://localhost:9001` using `useMqttStream.ts`, operating directly against live data streams without mock fallback data.

## Acceptance Criteria

### Visual Styling & Component Hierarchy
- [ ] Dark theme surfaces use matte charcoal/black backgrounds with subtle border outlines and rounded card containers across all dashboard views.
- [ ] Active navigation items display as solid neon green (`#00F59B` / `#10B981`) pill buttons with dark foreground text.
- [ ] Left sidebar contains categorized navigation groups with icon badges.
- [ ] Top bar displays search input and operator profile card.
- [ ] Top KPI metric bar contains Total Ingestion, Active Fleet (5/5), Edge p95 Latency, and Unacknowledged Alarms separated by vertical hairline dividers.
- [ ] Telemetry area chart renders smooth splines with gradient fills underneath using Recharts.
- [ ] Asset health / satisfaction is displayed as a circular radial progress gauge with neon green highlights.
- [ ] Test Lab fault injector panel and Incident response table with operator ACK buttons are present and interactive.

### Data & Connectivity
- [ ] Live telemetry and operational metrics subscribe to MQTT over WebSockets at `ws://localhost:9001` via `useMqttStream.ts`.
- [ ] Dashboard relies strictly on the live MQTT connection without injecting fallback mock data.

### Build & Verification
- [ ] Application builds cleanly via `npm run build` in `dashboard/` without TypeScript, lint, or JSX errors.


## Follow-up — 2026-11-06T18:59:09Z

The user requested to expedite execution ("faster"). Please streamline remaining explorer/gate iterations, prioritize delivery of core visual deliverables (Milestone 2 glowing spline charts & circular radial gauge, Milestone 3 Test Lab & Incident response), and complete remaining milestones as rapidly as possible.
