# Handoff Report: Sidebar.tsx ↔ page.tsx Interface Contract Alignment

**Agent**: `teamwork_explorer_m1_it2_2` (Explorer / Investigator / Synthesizer)  
**To**: Orchestrator (`5be3f69b-5401-49e3-82a8-6b2497d2c828`)  
**Date**: 2026-11-06  
**Status**: Investigation Complete — Ready for Implementation  
**Handoff Type**: Hard Handoff  

---

## 1. Observation

1. **Mandated Interface Contract (`PROJECT.md:40-42`)**:
   `PROJECT.md § Interface Contracts` specifies:
   ```markdown
   ### `Sidebar.tsx` ↔ `page.tsx`
   - **Props**: `activeTab: string`, `onTabChange: (tab: string) => void`, `counts: { alerts: number, fleet: number }`
   - **Events**: Selection of navigation tab ("overview", "telemetry", "alerts", "lab", "pipeline").
   ```

2. **Current `SidebarProps` Definition (`dashboard/src/components/layout/Sidebar.tsx:41-51`)**:
   ```typescript
   export interface SidebarProps {
     activeTab: string;
     onTabChange: (tab: string) => void;
     unackAlertsCount?: number;
     badgeCounts?: Record<string, number>;
     isConnected?: boolean;
     brokerUrl?: string;
     className?: string;
     isOpen?: boolean;
     onClose?: () => void;
   }
   ```
   Direct observation: `counts` is completely absent from `SidebarProps`.

3. **Current Sidebar Navigation Items (`dashboard/src/components/layout/Sidebar.tsx:87-101`)**:
   ```typescript
   {
     id: "fleet",
     label: "Equipment Fleet",
     icon: Cpu,
     ariaLabel: "Navigate to Equipment Fleet",
   },
   {
     id: "alerts",
     label: "Alert & Incident Console",
     icon: ShieldAlert,
     badge: unackAlertsCount,
     badgeVariant: "alert",
     ariaLabel: `Alert and Incident Console, ${unackAlertsCount} unacknowledged alarms`,
   },
   ```
   Direct observation: `alerts` binds directly to `unackAlertsCount`, whereas `fleet` does not declare a `badge` property.

4. **Caller Instantiation in `page.tsx` (`dashboard/src/app/page.tsx:49-63`)**:
   ```typescript
   const unackAlertsCount = alerts.filter((a) => !a.acknowledged).length;
   const activeFleetCount = Object.keys(devices).length;
   ```
   And JSX invocation:
   ```tsx
   <Sidebar
     activeTab={activeTab}
     onTabChange={setActiveTab}
     unackAlertsCount={unackAlertsCount}
     isConnected={isConnected}
     brokerUrl={process.env.NEXT_PUBLIC_MQTT_WS_URL || "ws://localhost:9001"}
     isOpen={isMobileSidebarOpen}
     onClose={() => setIsMobileSidebarOpen(false)}
   />
   ```
   Direct observation: `activeFleetCount` is calculated but discarded from `Sidebar`. The prop `counts` is not passed.

5. **Existing Empirical Test Expectations (`dashboard/tests/empirical_m1_challenger.mjs:426-471`)**:
   - `CH-SIDE-04`: `Sidebar({ activeTab: 'overview', onTabChange: () => {}, unackAlertsCount: 0 })` asserts `!html.includes('data-testid="alarm-badge"')`.
   - `CH-SIDE-05`: `Sidebar({ activeTab: 'overview', onTabChange: () => {}, unackAlertsCount: 5 })` asserts `html.includes('data-testid="alarm-badge"')`, `html.includes('bg-[#FF4D4D] text-white')`, and `html.includes('>5</span>')`.
   - `CH-SIDE-06`: `Sidebar({ activeTab: 'alerts', onTabChange: () => {}, unackAlertsCount: 5 })` asserts `html.includes('bg-[#050B08] text-[#00F59B]')`.
   - `CH-SIDE-07`: `Sidebar({ activeTab: 'overview', onTabChange: () => {}, unackAlertsCount: 1250 })` asserts `html.includes('999+')`.
   - `CH-SIDE-08`: `Sidebar({ activeTab: 'overview', onTabChange: () => {}, unackAlertsCount: -5 })` asserts `!html.includes('data-testid="alarm-badge"')`.

6. **Current Test Suite and Build Status**:
   - `node tests/empirical_m1_challenger.mjs`: 36/36 tests pass (100%).
   - `node scripts/run_e2e_tests.mjs`: 112/115 tests pass (100% of Milestone 1 tests pass).
   - `npx tsc --noEmit`: Exited with code 0.
   - `npm run build`: Exited with code 0 (`Compiled successfully`, static generation 4/4).

---

## 2. Logic Chain

1. **Step 1 (Interface Compliance Requirement)**:
   Observation 1 establishes that `PROJECT.md` contract mandates `counts: { alerts: number, fleet: number }` for `Sidebar.tsx ↔ page.tsx`. Failure to declare this prop constitutes an architectural defect identified in Milestone 1 Gate Iteration 1.

2. **Step 2 (Non-Breaking Integration Strategy)**:
   Observation 5 establishes that existing unit and empirical tests instantiate `Sidebar` passing `unackAlertsCount` without `counts`. Therefore, `counts` must be optional in `SidebarProps`:
   ```typescript
   export interface SidebarCounts {
     alerts?: number;
     fleet?: number;
     [key: string]: number | undefined;
   }
   ```
   Making `counts?: SidebarCounts` allows both `{ alerts: number; fleet: number }` (from `page.tsx`) and omitted `counts` (from legacy callers) without TypeScript errors or runtime exceptions.

3. **Step 3 (Resolution Priority Chain)**:
   To seamlessly resolve badge counts without breaking any caller:
   - For `alerts`: `counts?.alerts ?? badgeCounts["alerts"] ?? unackAlertsCount ?? 0`.
   - For `fleet`: `counts?.fleet ?? badgeCounts["fleet"] ?? undefined`.
   - For any additional tabs: `badgeCounts[item.id] ?? item.badge`.

4. **Step 4 (Industrial SCADA Badge Presentation)**:
   - **Alerts Badge**: Represents critical anomaly events requiring operator ACK. When inactive: `bg-[#FF4D4D] text-white shadow-[0_0_8px_rgba(255,77,77,0.45)]`. When active: inverts to `bg-[#050B08] text-[#00F59B]` on top of the neon pill. Test ID: `data-testid="alarm-badge"`.
   - **Fleet Badge**: Represents online equipment fleet count. When inactive: `bg-[#112018] text-[#00F59B] border border-[#00F59B]/30`. When active: inverts to `bg-[#050B08] text-[#00F59B]`. Test ID: `data-testid="fleet-badge"`.
   - **Zero / Negative Suppression**: If count is `<= 0` or `undefined`, the badge is not rendered (`rawBadge !== undefined && rawBadge > 0`), satisfying `CH-SIDE-04` and `CH-SIDE-08`.
   - **Extreme Count Clamping**: If count exceeds 999, renders `"999+"`, satisfying `CH-SIDE-07`.

5. **Step 5 (Caller Integration in `page.tsx`)**:
   Observation 4 shows `unackAlertsCount` and `activeFleetCount` are already computed. Passing:
   ```tsx
   <Sidebar
     activeTab={activeTab}
     onTabChange={setActiveTab}
     counts={{ alerts: unackAlertsCount, fleet: activeFleetCount }}
     unackAlertsCount={unackAlertsCount}
     isConnected={isConnected}
     brokerUrl={process.env.NEXT_PUBLIC_MQTT_WS_URL || "ws://localhost:9001"}
     isOpen={isMobileSidebarOpen}
     onClose={() => setIsMobileSidebarOpen(false)}
   />
   ```
   strictly fulfills `PROJECT.md` line 41 while preserving backward compatibility.

---

## 3. Caveats

1. **Explorer Read-Only Constraint**: As an explorer subagent, source code was not modified directly. The code modifications below are ready for `teamwork_worker_m1` to apply.
2. **Initial Offline Fleet State**: In `page.tsx`, `activeFleetCount` is initialized to `0` (before Mosquitto WebSocket streams device data). Because `rawBadge > 0` suppresses 0-value badges, the fleet badge will not appear until active devices stream in (or when explicitly provided in tests). If immediate badge display of 5 online devices is desired prior to connection, `activeFleetCount > 0 ? activeFleetCount : 5` can be used.

---

## 4. Conclusion

The Interface Contract gap between `Sidebar.tsx` and `page.tsx` is completely resolved by:
1. Adding `SidebarCounts` interface and `counts?: SidebarCounts` to `SidebarProps` in `dashboard/src/components/layout/Sidebar.tsx`.
2. Resolving `effectiveBadges` using `counts?.alerts ?? badgeCounts["alerts"] ?? unackAlertsCount` and `counts?.fleet ?? badgeCounts["fleet"]`.
3. Mapping `badge: resolvedFleet` with `badgeVariant: "neutral"` and `data-testid="fleet-badge"` to the `fleet` navigation item.
4. Passing `counts={{ alerts: unackAlertsCount, fleet: activeFleetCount }}` from `dashboard/src/app/page.tsx`.

### Exact Code Proposals

#### File 1: `dashboard/src/components/layout/Sidebar.tsx`

Replace lines 41-63:
```typescript
export interface SidebarCounts {
  alerts?: number;
  fleet?: number;
  [key: string]: number | undefined;
}

export interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: SidebarCounts;
  unackAlertsCount?: number;
  badgeCounts?: Record<string, number>;
  isConnected?: boolean;
  brokerUrl?: string;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  counts,
  unackAlertsCount = 0,
  badgeCounts = {},
  isConnected = false,
  brokerUrl = "ws://localhost:9001",
  className,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const resolvedAlerts = counts?.alerts ?? badgeCounts["alerts"] ?? unackAlertsCount;
  const resolvedFleet = counts?.fleet ?? badgeCounts["fleet"];

  const effectiveBadges: Record<string, number | undefined> = {
    ...badgeCounts,
    alerts: resolvedAlerts,
    fleet: resolvedFleet,
  };
```

Update `fleet` and `alerts` items in `navGroups` (lines 88-100):
```typescript
        {
          id: "fleet",
          label: "Equipment Fleet",
          icon: Cpu,
          badge: resolvedFleet,
          badgeVariant: "neutral",
          ariaLabel:
            resolvedFleet !== undefined && resolvedFleet > 0
              ? `Navigate to Equipment Fleet, ${resolvedFleet} units online`
              : "Navigate to Equipment Fleet",
        },
        {
          id: "alerts",
          label: "Alert & Incident Console",
          icon: ShieldAlert,
          badge: resolvedAlerts,
          badgeVariant: "alert",
          ariaLabel: `Alert and Incident Console, ${resolvedAlerts} unacknowledged alarms`,
        },
```

Update badge retrieval and rendering (lines 186 & 216-228):
```typescript
const rawBadge = effectiveBadges[item.id] ?? item.badge;
const dynamicBadge = rawBadge !== undefined && rawBadge > 999 ? "999+" : rawBadge;
```
And the badge JSX:
```tsx
{/* Notification / Count Badge */}
{rawBadge !== undefined && rawBadge > 0 && (
  <span
    data-testid={item.id === "alerts" ? "alarm-badge" : `${item.id}-badge`}
    className={cn(
      "ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono flex-shrink-0 transition-colors",
      isActive
        ? "bg-[#050B08] text-[#00F59B]"
        : item.id === "alerts" || item.badgeVariant === "alert"
        ? "bg-[#FF4D4D] text-white shadow-[0_0_8px_rgba(255,77,77,0.45)]"
        : "bg-[#112018] text-[#00F59B] border border-[#00F59B]/30"
    )}
  >
    {dynamicBadge}
  </span>
)}
```

#### File 2: `dashboard/src/app/page.tsx`

Update line 55:
```tsx
      {/* 1. Categorized Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{ alerts: unackAlertsCount, fleet: activeFleetCount }}
        unackAlertsCount={unackAlertsCount}
        isConnected={isConnected}
        brokerUrl={process.env.NEXT_PUBLIC_MQTT_WS_URL || "ws://localhost:9001"}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
```

---

## 5. Verification Method

Independent verification steps after implementation:

1. **Verify Interface Support via TypeScript Check**:
   ```powershell
   Set-Location "d:\INDIA\S5\Industrie4.0\Projet\dashboard"
   npx tsc --noEmit
   ```
   *Expected outcome*: Exits with code 0 with zero type errors.

2. **Verify Challenger Stress Suite**:
   ```powershell
   Set-Location "d:\INDIA\S5\Industrie4.0\Projet\dashboard"
   node tests/empirical_m1_challenger.mjs
   ```
   *Expected outcome*: 36/36 tests pass (100%), confirming that zero-suppression, badge inversion, and alarm count formatting retain full compatibility.

3. **Verify Milestone 1 E2E Suite**:
   ```powershell
   Set-Location "d:\INDIA\S5\Industrie4.0\Projet\dashboard"
   node scripts/run_e2e_tests.mjs
   ```
   *Expected outcome*: Milestone 1 suites (F1-F4) pass 40/40 tests; T1.2.4 passes.

4. **Verify Production Build**:
   ```powershell
   Set-Location "d:\INDIA\S5\Industrie4.0\Projet\dashboard"
   npm run build
   ```
   *Expected outcome*: Exits with code 0.

5. **Invalidation Conditions**:
   - `SidebarProps` missing `counts?: SidebarCounts`.
   - `page.tsx` not passing `counts={{ alerts: ..., fleet: ... }}`.
   - Any regression in `CH-SIDE-04` through `CH-SIDE-08`.
