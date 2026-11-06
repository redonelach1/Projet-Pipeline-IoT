## 2026-11-06T18:18:27Z
You are teamwork_explorer_m1_2.
Your working directory is: d:\INDIA\S5\Industrie4.0\Projet\.agents\teamwork\teamwork_explorer_m1_2\

MANDATORY FIRST STEP:
Read the authoritative user request at d:\INDIA\S5\Industrie4.0\Projet\.agents\teamwork\ORIGINAL_REQUEST.md, as well as d:\INDIA\S5\Industrie4.0\Projet\PROJECT.md. Also reference the analysis in `.agents/teamwork/teamwork_explorer_survey_1/analysis.md`.

TASK:
You are the Sidebar & Navigation Explorer for Milestone 1 (Theme, Shell, Sidebar & KPI Header).
1. Inspect the navigation requirements in R2:
   - Left sidebar navigation with categorical grouping:
     * Group 1: General (Dashboard / Overview, Telemetry Studio)
     * Group 2: Fleet & Operations (Equipment Fleet, Alert & Incident Console, Test Lab Fault Injector)
     * Group 3: SCADA Intelligence (Pipeline Metrics, System Health)
   - Icon badges (Lucide icons for each item, plus notification badge counter for Unacknowledged Alarms)
   - Active solid neon green pill buttons: `bg-[#00F59B] text-[#050B08]` with bold/semibold typography, rounded-full or rounded-xl pill shape.
   - Inactive items: subtle gray/muted emerald text (`#8E9E96` / `#6B7F76`), hover states with soft green background tint.
   - Bottom sidebar card: ENSAM SCADA Operations Center branding, version (v2.4.0), and MQTT connection indicator.
2. Design the complete component specification for `dashboard/src/components/layout/Sidebar.tsx`.
3. Provide exact TypeScript interfaces, props (`activeTab`, `onTabChange`, badge counts), Lucide icon mappings, responsive drawer/sidebar handling, and integration with `dashboard/src/app/page.tsx`.
4. Write your complete design specification in `analysis.md` and `handoff.md` in your working directory.
5. Send a message to your parent orchestrator with your findings and the path to your handoff.md.
