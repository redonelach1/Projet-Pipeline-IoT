# Technical Analysis: Next.js 14 Standalone Build Tracing & SCADA 404 Component

**Author**: `teamwork_explorer_m1_it2_1`  
**Milestone**: M1 - Gate Iteration 2  
**Target File**: `dashboard/src/app/not-found.tsx`  
**Date**: 2026-11-06  

---

## 1. Executive Summary

During Milestone 1 Iteration 1 review, `npm run build` failed during `collectBuildTraces` with:
```text
Error: ENOENT: no such file or directory, open 'D:\INDIA\S5\Industrie4.0\Projet\dashboard\.next\server\app\_not-found\page.js.nft.json'
```
This investigation identified the underlying mechanism in Next.js 14 App Router on Windows when `output: "standalone"` is configured. In the absence of an explicit user-defined `src/app/not-found.tsx`, Next.js creates a synthetic `_not-found` fallback whose Node File Trace (`.nft.json`) file fails to emit reliably on Windows before trace aggregation.

By introducing a first-class `dashboard/src/app/not-found.tsx` designed according to the ENSAM SCADA Design System (matte charcoal `#070B09`/`#0D1411`, subtle emerald border `#1A2821`, neon mint `#00F59B`, and alarm red `#FF4D4D`), Next.js generates an explicit route entry whose NFT trace is deterministically produced. Empirical verification proves that this fix yields clean `npm run build` exit code `0`, generates `.next/standalone/server.js`, and preserves 100% passing rates across all Milestone 1 E2E tests.

---

## 2. Standalone Tracing Mechanism & Failure Analysis

### 2.1 The Role of Standalone Tracing in Next.js
In `dashboard/next.config.mjs`:
```javascript
const nextConfig = {
  output: "standalone",
  ...
};
```
When `output: "standalone"` is enabled, Next.js uses `@vercel/nft` (Node File Trace) during the build phase (`collectBuildTraces`) to trace all production node dependencies and server bundles. The goal is to generate `.next/standalone` with a minimal footprint (`server.js`, `node_modules`, and `.next`) for the multi-stage Docker container defined in `dashboard/Dockerfile:35` (`COPY --from=builder ... /app/.next/standalone ./`).

### 2.2 Trace Resolution Call Stack
During `next build`, after static page prerendering completes (`Generating static pages (4/4)`), Next.js invokes `collectBuildTraces` in `node_modules/next/dist/build/collect-build-traces.js`:

```javascript
// collect-build-traces.js lines 428-431
const entryOutputPath = _path.default.join(distDir, "server", `${entryName}.js`);
const traceOutputPath = `${entryOutputPath}.nft.json`;
const existingTrace = JSON.parse(await _promises.default.readFile(traceOutputPath, "utf8"));
```

### 2.3 The Missing Trace File Mechanism
1. When **no** `not-found.tsx` exists in `src/app/`:
   - Next.js injects a virtual fallback entry: `entryName = "app/_not-found/page"`.
   - Webpack builds `server/app/_not-found/page.js`.
   - However, because `_not-found` is a virtual internal page and not an explicit source file route, under Windows path resolution and static optimization filters, `@vercel/nft` fails to write `page.js.nft.json` before `collectBuildTraces` calls `_promises.readFile(traceOutputPath, "utf8")`.
   - This triggers `ENOENT: no such file or directory, open '...\_not-found\page.js.nft.json'`.
2. When a custom `dashboard/src/app/not-found.tsx` **is** present:
   - Next.js registers `not-found` as a genuine App Router leaf component.
   - Webpack produces `.next/server/app/_not-found/page.js` and immediately generates `.next/server/app/_not-found/page.js.nft.json` with the exact import graph of `not-found.tsx`.
   - `_promises.readFile(traceOutputPath)` successfully parses the JSON trace manifest.
   - Build proceeds through `Finalizing page optimization` and standalone asset generation without interruption.

---

## 3. SCADA-Themed 404 Component Architecture

The 404 component has been designed to strictly align with `ORIGINAL_REQUEST.md` R1 and `PROJECT.md § Architecture`:

### 3.1 Design Tokens & Aesthetics
| Element | Token / Class | Hex Color | Aesthetic Purpose |
|---|---|---|---|
| **Canvas Background** | `bg-scada-bg` | `#070B09` | Deep matte charcoal foundation |
| **Main Card Surface** | `bg-scada-surface` | `#0D1411` | Primary container surface |
| **Nested Diagnostics** | `bg-scada-surface-nested` | `#15221C` | Diagnostic terminal panel |
| **Card Borders** | `border-scada-border` | `#1A2821` | Subtle hairline divider border |
| **Error Badge / Icon** | `bg-scada-alarm-bg` / `text-scada-alarm` | `#2A1215` / `#FF4D4D` | SCADA fault indication |
| **Hero 404 Number** | `text-scada-neon` | `#00F59B` | High-visibility neon mint accent |
| **Action Pill Button** | `bg-scada-pill-active` + `shadow-scada-pill` | `#00F59B` on `#050B08` | Primary navigation CTA |
| **Secondary Metadata** | `text-scada-text-muted` | `#6E8277` | Monospace SCADA telemetry tags |

### 3.2 Visual Structure
1. **Status Header**: Displays `Fault Code: 0x404`, an animated alarm dot (`animate-pulse`), and status pill `NODE_UNREACHABLE`.
2. **Hero Typography**: A prominent glowing `404` with drop shadow (`drop-shadow-[0_0_15px_rgba(0,245,155,0.4)]`), paired with the title **"SCADA Node Not Found"**.
3. **Telemetry Diagnostics Panel**: Styled as a SCADA system console with terminal icon, reporting:
   - `Target Route: UNKNOWN_ENDPOINT` (in `#FF4D4D`)
   - `Bus Status: OPERATIONAL` (in `#00F59B`)
   - `Active Gateway: ENSAM-RABAT-GW01`
   - `Telemetry Trace: NFT_STANDALONE_OK`
4. **Action Controls**: Solid neon green pill button linking to `/` ("Return to SCADA Overview") with `ArrowLeft` icon, and live pipeline status indicator.

---

## 4. Empirical Verification Findings

### 4.1 Production Build Execution
Running `npm run build` with `src/app/not-found.tsx`:
```text
> ensam-iiot-scada-dashboard@1.0.0 build
> next build

  ▲ Next.js 14.2.18

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/4) ...
   Generating static pages (1/4) 
   Generating static pages (2/4) 
   Generating static pages (3/4) 
 ✓ Generating static pages (4/4)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ○ /                                    225 kB          313 kB
└ ○ /_not-found                          139 B          87.5 kB
+ First Load JS shared by all            87.4 kB
  ├ chunks/117-1a7197298153bdee.js       31.7 kB
  ├ chunks/fd9d1056-5267b782492e6a64.js  53.6 kB
  └ other shared chunks (total)          2.01 kB

○  (Static)  prerendered as static content
```
**Exit Code**: `0` (Success).

### 4.2 Standalone Directory Verification
Verification of directory `dashboard/.next/standalone` confirmed generation of:
- `server.js` (4,559 bytes — standalone entrypoint)
- `package.json`
- `node_modules/`
- `.next/`

This satisfies the multi-stage Docker build requirement.

### 4.3 E2E Test Suite Regression Verification
Executing `node scripts/run_e2e_tests.mjs`:
- Total Test Cases: 115
- Passed: 112
- Failed: 3 (exclusively M2 features: `T1.5.3`, `T1.6.1`, `T1.6.3`)
- Milestone 1 Features (F1, F2, F3, F4): 40/40 passed (100%)
- Tier 3 Cross-Feature Interactions: 10/10 passed (100%)
- Tier 4 SCADA Scenarios: 5/5 passed (100%)

---

## 5. Artifact Reference & Hand-off Code

The complete proposed component has been authored and verified at:
`d:\INDIA\S5\Industrie4.0\Projet\.agents\teamwork\teamwork_explorer_m1_it2_1\proposed_not-found.tsx`

The worker can deploy this file directly to:
`dashboard/src/app/not-found.tsx`
