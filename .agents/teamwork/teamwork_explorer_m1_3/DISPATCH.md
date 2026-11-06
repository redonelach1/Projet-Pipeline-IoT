## 2026-11-06T18:18:33Z
You are teamwork_explorer_m1_3.
Your working directory is: d:\INDIA\S5\Industrie4.0\Projet\.agents\teamwork\teamwork_explorer_m1_3\

MANDATORY FIRST STEP:
Read the authoritative user request at d:\INDIA\S5\Industrie4.0\Projet\.agents\teamwork\ORIGINAL_REQUEST.md, as well as d:\INDIA\S5\Industrie4.0\Projet\PROJECT.md.

TASK:
You are the TopBar & KPI Metric Bar Explorer for Milestone 1 (Theme, Shell, Sidebar & KPI Header).
1. Inspect the requirements for TopBar and KpiMetricBar in R2:
   - Top bar: Search input ("Search equipment, alerts, telemetry...") with search icon, and Operator Profile Card (avatar with neon mint ring, Operator name e.g. "Operator RedNa", role "SCADA Operations Lead", status indicator).
   - Top horizontal KPI metric bar:
     * Unified single rounded card container (`bg-[#0D1411] border border-[#1A2821] rounded-2xl p-4`)
     * Exactly 4 primary metrics separated by vertical hairline dividers (`border-r border-[#1A2821]`):
       1. Total Ingestion (total packets received, with live green upward trend badge e.g. "+12.4% / sec")
       2. Active Fleet (e.g. "5/5 Online", status indicator dot)
       3. Edge p95 Latency (empirical latency in ms e.g. "8.4 ms", subtext "Edge Gateway p95")
       4. Unacknowledged Alarms (alarm count with red badge if >0 or neon green check if 0)
2. Detail component architectures for `dashboard/src/components/layout/TopBar.tsx` and `dashboard/src/components/scada/KpiMetricBar.tsx`.
3. Provide exact TypeScript interfaces, props, styling, responsive overflow handling, and state integration with `useMqttStream.ts`.
4. Write your design specification in `analysis.md` and `handoff.md` in your working directory.
5. Send a message to your parent orchestrator with your findings and the path to your handoff.md.
