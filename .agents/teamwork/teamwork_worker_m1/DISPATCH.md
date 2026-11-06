## 2026-11-06T18:28:38Z
You are teamwork_worker_m1.
Your working directory is: d:\INDIA\S5\Industrie4.0\Projet\.agents\teamwork\teamwork_worker_m1\

MANDATORY FIRST STEP:
Read the authoritative user request at d:\INDIA\S5\Industrie4.0\Projet\.agents\teamwork\ORIGINAL_REQUEST.md, as well as d:\INDIA\S5\Industrie4.0\Projet\PROJECT.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK & SCOPE:
Implement Milestone 1 (Theme, Shell, Sidebar & KPI Header):
1. Review the detailed specifications and proposals provided by the M1 Explorers:
   - Explorer 1 (Styling & Theme tokens): `.agents/teamwork/teamwork_explorer_m1_1/analysis.md` and `handoff.md`
   - Explorer 2 (Sidebar & Navigation): `.agents/teamwork/teamwork_explorer_m1_2/analysis.md` and `handoff.md`
   - Explorer 3 (TopBar & KpiMetricBar): `.agents/teamwork/teamwork_explorer_m1_3/analysis.md`, `handoff.md`, `proposed_TopBar.tsx`, and `proposed_KpiMetricBar.tsx`

2. WRITE OWNERSHIP: You exclusively own and modify:
   - `dashboard/tailwind.config.ts`
   - `dashboard/src/app/globals.css`
   - `dashboard/src/app/layout.tsx`
   - `dashboard/src/components/layout/Sidebar.tsx`
   - `dashboard/src/components/layout/TopBar.tsx`
   - `dashboard/src/components/scada/KpiMetricBar.tsx`
   - `dashboard/src/app/page.tsx`

3. Implementation Details:
   - Apply the dark matte charcoal/black surfaces (`#070B09`, `#0D1411`) and neon mint green (`#00F59B` / `#10B981`) color tokens and glowing shadow utilities to `tailwind.config.ts`, `globals.css`, and `layout.tsx`.
   - Build `Sidebar.tsx` with the 3 categorical groups ("General", "Fleet & Operations", "SCADA Intelligence"), active solid neon green pill buttons (`bg-[#00F59B] text-[#050B08] font-bold rounded-xl shadow-[0_0_20px_rgba(0,245,155,0.35)]`), alarm counter badge (`#FF4D4D`), and bottom ENSAM SCADA Operations Center card.
   - Build `TopBar.tsx` with search input ("Search equipment, alerts, telemetry..."), operator profile card (avatar with neon mint ring, name "Operator RedNa", role "SCADA Operations Lead", status dot), and live MQTT connection badge.
   - Build `KpiMetricBar.tsx` as a unified horizontal card (`bg-[#0D1411] border border-[#1A2821] rounded-2xl p-4`) with vertical hairline dividers (`border-r border-[#1A2821]`) displaying: Total Ingestion with live trend badge, Active Fleet (5/5 Online), Edge p95 Latency (`8.4 ms` with `"Edge Gateway p95"`), and Unacknowledged Alarms (red badge if >0, neon green check if 0).
   - Update `page.tsx` to transition to the left sidebar + top bar layout, mounting `Sidebar`, `TopBar`, and `KpiMetricBar`.

4. Build & Test Verification:
   - Run `npm run build` in `dashboard/` to verify zero TypeScript, lint, or JSX errors.
   - Run `node scripts/run_e2e_tests.mjs` in `dashboard/` to execute the automated test suite and report passing/failing tests.

5. Document all changes and verification command outputs in `handoff.md` in your working directory.
6. When complete, send a message to your parent orchestrator with a summary of changes, build verification output, and the path to your handoff.md.
