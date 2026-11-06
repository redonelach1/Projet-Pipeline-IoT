# Orchestration Plan: ENSAM Rabat Industrie 4.0 SCADA Dashboard

## Objective
Build a premium showcase dashboard UI for ENSAM Rabat's Industrie 4.0 End-to-End Industrial IoT Pipeline and SCADA Operations Center, matching the visual aesthetic of the reference design (`media_1793984033843_2147cf5e.jpg`) and satisfying all requirements: theme, layout, navigation, metric header, Recharts area charts, radial progress gauges, interactive fault injection, incident ACK table, and live MQTT stream via `ws://localhost:9001`.

## Plan Steps
- [ ] **Step 0: Survey Phase (Parallel Discovery)**
  - Explorer 1 (Visual & Component Architecture): Inspect reference image, existing React/Tailwind/shadcn setup in `dashboard/`, determine gap between current UI and reference styling.
  - Explorer 2 (MQTT Data Stream & State Model): Inspect `useMqttStream.ts`, topic structures, live payload schemas, incident data model, and ensure no mock data fallback.
  - Explorer 3 (Feature Inventory & Build Pipeline): Inspect `package.json`, build scripts, dependencies (lucide-react, recharts, tailwind, etc.), component file tree.
- [ ] **Step 1: Synthesis & PROJECT.md Formulation**
  - Consolidate explorer findings into `PROJECT.md` at project root with Feature Inventory, Milestone Decomposition, Interface Contracts, and Code Layout.
  - Formulate E2E Testing Plan in `TEST_INFRA.md`.
- [ ] **Step 2: Dual Track Dispatch**
  - Track A (E2E Testing Track): Spawn subagent/orchestrator to build test infra and multi-tier test cases covering all inventoried features.
  - Track B (Implementation Milestones):
    - Milestone 1: Theme, Shell, Sidebar & KPI Header (R1, R2).
    - Milestone 2: Telemetry Spline Area Charts, Radial Health Gauges & Visualizations (R3).
    - Milestone 3: Fault Injector, Incident Response Table with Operator ACK & Controls (R3).
    - Milestone 4: Strict Live MQTT Stream Integration (`ws://localhost:9001`) with Zero Mock Fallbacks (R4).
- [ ] **Step 3: Final Milestone & Hardening**
  - Phase 1: 100% pass on E2E test suite (Tiers 1-4).
  - Phase 2: Adversarial coverage hardening (Tier 5).
- [ ] **Step 4: Forensic Audit & Delivery**
  - Verify forensic audit CLEAN status, clean build `npm run build`, and deliver complete report to user.
