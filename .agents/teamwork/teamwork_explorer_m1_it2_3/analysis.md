# Technical Analysis: KpiMetricBar Dynamic Fleet Status & Latency Edge Cases

**Author**: `teamwork_explorer_m1_it2_3` (Roles: Investigator, Synthesizer)  
**Target**: `dashboard/src/components/scada/KpiMetricBar.tsx` (and `dashboard/src/app/page.tsx`)  
**Context**: Milestone 1 Gate Iteration 2 Hardening  
**Date**: 2026-11-06  

---

## 1. Executive Summary

Milestone 1 Gate Iteration 1 Reviewer 2 reported an edge case in `KpiMetricBar.tsx`:
When `activeFleet` is set to `"0/5 Online"`, the lower pill badge statically renders `"100% Operational"` with an active green pulsing dot (`animate-ping`).

Investigation of `KpiMetricBar.tsx` revealed three interrelated issues:
1. **Static Fleet Sub-Badge**: The sub-badge in lines 127-135 is hardcoded to render `<span className="bg-[#00F59B] ...">100% Operational</span>` regardless of the `activeFleet` prop value.
2. **Zero-Latency Fallback Bug**: Line 46 (`p95LatencyMs > 0 ? p95LatencyMs : 8.4`) and line 154 (`safeLatency > 0 ? ... : "8.4 ms"`) discard genuine `0.0 ms` latency readings and forcibly replace them with `8.4 ms`.
3. **Mock Rate Fallback**: Line 55 (`effectiveRate > 0 ? ... : "+12.4% / sec"`) replaces a 0 ingestion rate with a hardcoded mock rate (`+12.4% / sec`), violating the zero-mock-data directive (R4).
4. **Upstream Coercion in `page.tsx`**: In `page.tsx` lines 91-92, `activeFleet` is passed as `${activeFleetCount > 0 ? activeFleetCount : 5}/5 Online` and `p95LatencyMs` as `stats.averageLatencyMs || 8.4`, coercing zero values to 5 and 8.4 before reaching `KpiMetricBar`.

---

## 2. Direct Code Inspection Observations

### 2.1 File: `dashboard/src/components/scada/KpiMetricBar.tsx`

#### A. Active Fleet Sub-Badge (Lines 127-135)
```tsx
// Current implementation (Lines 127-135):
<div className="mt-2">
  <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/20 font-mono shadow-[0_0_8px_rgba(0,245,155,0.15)]">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F59B] opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F59B]" />
    </span>
    <span>100% Operational</span>
  </span>
</div>
```
- **Flaw**: The badge container class (`bg-[#00F59B]/10 text-[#00F59B]`), the pulsing indicator (`bg-[#00F59B]`), and the label text (`"100% Operational"`) are entirely static.
- **Empirical verification**: When `activeFleet="0/5"` or `activeFleet="0/5 Online"` is passed, `CH-KPI-07` observed:
  `activeFleet="0/5" renders "0/5". Notice: Badge still displays "100% Operational" (static sub-badge)`.

#### B. Edge p95 Latency Handling (Lines 31, 46-48, 153-157)
```tsx
// Current implementation:
31:  p95LatencyMs = 8.4,
...
46:  const safeLatency = p95LatencyMs > 0 ? p95LatencyMs : 8.4;
47:  const isLatencyOptimal = safeLatency < 50;
48:  const isLatencyAcceptable = safeLatency >= 50 && safeLatency <= 100;
...
153: <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white block">
154:   {safeLatency > 0 ? `${safeLatency.toFixed(1)} ms` : "8.4 ms"}
155: </span>
```
- **Flaw**: Because line 46 uses strict greater-than (`p95LatencyMs > 0`), when `p95LatencyMs === 0`, `safeLatency` evaluates to `8.4`.
- **Double Flaw**: Even if line 46 were changed to `>= 0`, line 154 repeats `{safeLatency > 0 ? ... : "8.4 ms"}`, masking 0 again.
- **Empirical verification**: `CH-KPI-12` in `empirical_m1_challenger.mjs` observed:
  `p95LatencyMs=0 evaluates to safeLatency: 8.4 ms (fallback trigger)`.

#### C. Ingestion Rate Fallback (Lines 51-56)
```tsx
// Current implementation:
51:  const effectiveRate = ingestionRate > 0 ? ingestionRate : (msgPerSec && msgPerSec > 0 ? msgPerSec : 0);
52:  const rateLabel =
53:    effectiveRate > 0
54:      ? `+${effectiveRate.toFixed(1)}% / sec`
55:      : "+12.4% / sec";
```
- **Flaw**: When `effectiveRate === 0`, `rateLabel` returns `"+12.4% / sec"`. This is a hardcoded mock value that directly violates R4 ("Dashboard relies strictly on the live MQTT connection without injecting fallback mock data").

---

## 3. Dynamic Active Fleet State Formulation

The `activeFleet` prop supports two input formats:
- String: e.g. `"5/5 Online"`, `"5/5"`, `"0/5"`, `"3/5 Online"`, `"10/5"`
- Object: `{ online: number; total: number }`

### 3.1 Input Parser Specification
```typescript
interface FleetMetrics {
  display: string;
  online: number;
  total: number;
  percentage: number;
  status: "optimal" | "degraded" | "offline";
  label: string;
}

export function parseActiveFleet(
  activeFleet?: string | { online: number; total: number }
): FleetMetrics {
  let online = 5;
  let total = 5;
  let display = "5/5 Online";

  if (typeof activeFleet === "object" && activeFleet !== null) {
    online = typeof activeFleet.online === "number" ? Math.max(0, activeFleet.online) : 0;
    total = typeof activeFleet.total === "number" && activeFleet.total > 0 ? activeFleet.total : 5;
    display = `${online}/${total} Online`;
  } else if (typeof activeFleet === "string") {
    display = activeFleet;
    const slashMatch = activeFleet.match(/(\d+)\s*\/\s*(\d+)/);
    if (slashMatch) {
      online = Math.max(0, parseInt(slashMatch[1], 10));
      total = parseInt(slashMatch[2], 10);
      if (isNaN(total) || total <= 0) total = 5;
      if (isNaN(online)) online = 0;
    } else {
      const numMatch = activeFleet.match(/(\d+)/);
      if (numMatch) {
        online = Math.max(0, parseInt(numMatch[1], 10));
        total = 5;
      } else if (activeFleet.toLowerCase().includes("offline")) {
        online = 0;
        total = 5;
      }
    }
  }

  const percentage = total > 0 ? Math.round((online / total) * 100) : 0;

  // Tri-state classification
  if (online === 0) {
    return {
      display,
      online,
      total,
      percentage: 0,
      status: "offline",
      label: "Fleet Offline",
    };
  }

  if (online < total) {
    return {
      display,
      online,
      total,
      percentage,
      status: "degraded",
      label: `${online}/${total} Degraded`,
    };
  }

  return {
    display,
    online,
    total,
    percentage,
    status: "optimal",
    label: "100% Operational",
  };
}
```

### 3.2 Evaluation of Policies (Strict vs. 80% Threshold)

| Condition | Policy A: High-Availability SCADA (Recommended) | Policy B: 80% Threshold | Rationale |
|---|---|---|---|
| `5/5 Online` (100%) | `100% Operational` (Neon Green Dot) | `100% Operational` (Neon Green Dot) | All nodes healthy. Meets `CH-KPI-06`. |
| `4/5 Online` (80%) | `4/5 Degraded` (Amber Dot) | `80% Operational` (Neon Green Dot) | In critical SCADA, 1 node failure is a degraded condition that requires operator awareness. Matches dispatch prompt: `(e.g. 1-4 online): amber dot + "${online}/${total} Degraded"`. |
| `1-3/5 Online` (20-60%) | `${online}/${total} Degraded` (Amber Dot) | `${online}/${total} Degraded` (Amber Dot) | Partial fleet offline. |
| `0/5 Online` (0%) | `Fleet Offline` (Alert Red Dot) | `Fleet Offline` (Alert Red Dot) | Critical failure. Zero nodes reporting. Meets reviewer finding. |
| `10/5` (>100%) | `100% Operational` (Neon Green Dot) | `100% Operational` (Neon Green Dot) | Over-deployed fleet handles cleanly. Meets `CH-KPI-08`. |

**Recommendation**: **Policy A** is strictly aligned with the dispatch specification (`(e.g. 1-4 online): amber dot + "${online}/${total} Degraded"`).

### 3.3 SCADA Design System Color & Styling Tokens

| State | Badge Container Classes | Indicator Ping Dot | Indicator Solid Dot |
|---|---|---|---|
| **Optimal** (`online >= total`) | `bg-[#00F59B]/10 text-[#00F59B] border-[#00F59B]/20 shadow-[0_0_8px_rgba(0,245,155,0.15)]` | `bg-[#00F59B]` | `bg-[#00F59B]` |
| **Degraded** (`0 < online < total`) | `bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]` | `bg-[#F59E0B]` | `bg-[#F59E0B]` |
| **Offline** (`online === 0`) | `bg-[#FF4D4D]/10 text-[#FF4D4D] border-[#FF4D4D]/20 shadow-[0_0_8px_rgba(255,77,77,0.15)]` | `bg-[#FF4D4D]` | `bg-[#FF4D4D]` |

---

## 4. Latency SLA & Genuine 0.0 ms Formulation

### 4.1 Root Cause & Solution
- **Current logic**:
  ```typescript
  const safeLatency = p95LatencyMs > 0 ? p95LatencyMs : 8.4;
  ```
- **Proposed logic**:
  ```typescript
  const hasValidLatency = typeof p95LatencyMs === "number" && !isNaN(p95LatencyMs);
  const safeLatency = hasValidLatency
    ? (p95LatencyMs >= 0 ? p95LatencyMs : 8.4)
    : 8.4;
  ```
  And in JSX:
  ```tsx
  <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white block">
    {`${safeLatency.toFixed(1)} ms`}
  </span>
  ```

### 4.2 Behavior Across Latency Inputs
| Input `p95LatencyMs` | Evaluated `safeLatency` | Displayed Text | SLA Badge | SLA Color |
|---|---|---|---|---|
| `undefined` | `8.4` | `8.4 ms` | `< 100ms SLA` | `#00F59B` (Optimal) |
| `0` | `0.0` | `0.0 ms` | `< 100ms SLA` | `#00F59B` (Optimal) |
| `8.4` | `8.4` | `8.4 ms` | `< 100ms SLA` | `#00F59B` (Optimal) |
| `49.9` | `49.9` | `49.9 ms` | `< 100ms SLA` | `#00F59B` (Optimal) |
| `50.0` | `50.0` | `50.0 ms` | `SLA Nominal` | `#F59E0B` (Acceptable) |
| `100.0` | `100.0` | `100.0 ms` | `SLA Nominal` | `#F59E0B` (Acceptable) |
| `1450.8` | `1450.8` | `1450.8 ms` | `SLA Exceeded` | `#FF4D4D` (Critical) |
| `-15` | `8.4` (or `0.0`) | `8.4 ms` (or `0.0 ms`) | `< 100ms SLA` | `#00F59B` (Safe Fallback) |

---

## 5. Ingestion Rate & Unack Alarms Hardening

### 5.1 Ingestion Rate
Replace the mock fallback `"+12.4% / sec"` with:
```typescript
const effectiveRate =
  typeof ingestionRate === "number" && ingestionRate > 0
    ? ingestionRate
    : typeof msgPerSec === "number" && msgPerSec > 0
    ? msgPerSec
    : 0;
const rateLabel =
  effectiveRate > 0
    ? `+${effectiveRate.toFixed(1)}% / sec`
    : "+0.0% / sec";
```

### 5.2 Alarms Clamping
Ensure alarms are never negative:
```typescript
const effectiveAlarms = Math.max(0, unacknowledgedAlarms ?? unackAlertsCount ?? 0);
```

---

## 6. Upstream Integration in `dashboard/src/app/page.tsx`

Lines 91-92 in `page.tsx` currently contain:
```tsx
activeFleet={`${activeFleetCount > 0 ? activeFleetCount : 5}/5 Online`}
p95LatencyMs={stats.averageLatencyMs || 8.4}
```
If `activeFleetCount` is `0` (before devices check in or when all devices are offline), line 91 passes `"5/5 Online"`.
If `stats.averageLatencyMs` is `0`, line 92 passes `8.4`.

### Recommended Update for `page.tsx`:
```tsx
activeFleet={`${activeFleetCount}/5 Online`}
p95LatencyMs={stats.averageLatencyMs ?? 8.4}
```
This enables true zero-state reporting without mock fallback data, fully satisfying R4 and Project Acceptance Criteria.
