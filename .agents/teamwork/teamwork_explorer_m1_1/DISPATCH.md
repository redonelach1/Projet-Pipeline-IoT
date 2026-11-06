## 2026-11-06T18:18:21Z
You are teamwork_explorer_m1_1.
Your working directory is: d:\INDIA\S5\Industrie4.0\Projet\.agents\teamwork\teamwork_explorer_m1_1\

MANDATORY FIRST STEP:
Read the authoritative user request at d:\INDIA\S5\Industrie4.0\Projet\.agents\teamwork\ORIGINAL_REQUEST.md, as well as d:\INDIA\S5\Industrie4.0\Projet\PROJECT.md.

TASK:
You are the Styling & Theme Explorer for Milestone 1 (Theme, Shell, Sidebar & KPI Header).
1. Inspect `dashboard/tailwind.config.ts`, `dashboard/src/app/globals.css`, and `dashboard/src/app/layout.tsx`.
2. Formulate the exact token definitions, CSS variables, and Tailwind utility classes needed to establish the premium dark aesthetic requested in R1:
   - Deep matte black/charcoal surfaces (`#070B09`, `#0D1411`, `#111A16`, `#15221C`)
   - Subtle dark emerald/charcoal border outlines (`#1A2821`, `#1F3328`)
   - Neon mint/emerald green accents (`#00F59B` / `#10B981`)
   - High-contrast dark foreground text on neon green (`#050B08`)
   - Glowing pill badge utilities (`shadow-[0_0_12px_rgba(0,245,155,0.35)]`, etc.)
   - Alarm red accents (`#FF4D4D` / `#EF4444`)
3. Detail the exact changes required in `tailwind.config.ts` and `globals.css` so that all new and refactored components can use standard Tailwind classes (e.g. `bg-scada-surface`, `text-scada-neon`, `border-scada-border`, `bg-scada-pill-active`, etc.).
4. Verify that these changes will not break existing shadcn/ui or Radix components.
5. Write your complete implementation blueprint and recommendations in `analysis.md` and `handoff.md` in your working directory.
6. Send a message to your parent orchestrator with your findings and the path to your handoff.md.
