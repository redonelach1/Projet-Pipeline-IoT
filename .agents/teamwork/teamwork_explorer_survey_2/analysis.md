# In-Depth Technical Survey: MQTT Data Stream, Data Models, State Management, and Incident Pipeline

**Agent**: `teamwork_explorer_survey_2`  
**Mission**: Comprehensive investigation of MQTT WebSockets, topics, schemas, incident pipeline, fault injector, state management, and mock data verification for ENSAM Rabat Industrie 4.0 SCADA Operations Center.  
**Date**: 2026-11-06  
**Reference Mandates**: R1, R2, R3, R4 from `ORIGINAL_REQUEST.md`

---

## 1. Executive Summary

This exploration provides a thorough technical inventory and architectural assessment of the real-time MQTT streaming pipeline, React state management, alarm event workflows, and interactive fault injection mechanisms in the ENSAM IIoT SCADA Dashboard and broader codebase.

### Key Conclusions:
1. **MQTT WebSocket Stream Architecture**:
   - Web browser connects over WebSockets to Mosquitto at `ws://localhost:9001` via `useMqttStream.ts`.
   - Topics follow the standardized OASIS MQTT 5.0 hierarchical scheme: `ensam/iiot/{site_id}/{line_id}/{device_id}/{channel}`.
   - QoS 1 is enforced across telemetry, status, event, and command channels.
2. **Strict R4 Compliance (No Mock Data)**:
   - **No mock generators or simulated fallback data exist in the client dashboard.**
   - All state initializes to empty objects/arrays (`devices: {}`, `history: {}`, `alerts: []`, `stats: 0`).
   - The dashboard operates **strictly** against live MQTT packets delivered over the WebSocket stream.
3. **Incident & Operator Acknowledgment Workflow**:
   - The Python Edge Gateway detects anomalies (temperature, vibration, pressure) and emits `AnomalyEvent` records on `ensam/iiot/{site}/{line}/{device}/event`.
   - The dashboard receives events, renders them with severity levels (`CRITICAL`, `WARNING`), and allows operators to submit diagnostic notes.
   - Confirming an acknowledgment updates local React state and dispatches an MQTT packet to `ensam/iiot/site-a/line-1/system/event/ack`, which is received and logged by the Edge Gateway.
4. **Interactive Test Lab Fault Injector**:
   - Test Lab UI exposes 6 fault scenarios: `THERMAL_OVERHEAT`, `VIBRATION_SPIKE`, `PRESSURE_DROP`, `MACHINE_STOP`, `CORRUPTED_PAYLOAD`, and `SILENCE`.
   - Dispatches `SimulationCommand` over `ensam/iiot/site-a/{line_id}/{device_id}/command` or `ensam/iiot/command`.
   - Simulator receives commands via MQTT, transitions device state machine, perturbs physical simulations, and logs the action.
5. **Architectural Gaps & Refactoring Blueprint for R1-R3**:
   - Current dashboard uses a top navbar instead of the required **Left Sidebar navigation** with categorical grouping and solid neon green active pills.
   - Current telemetry charts use basic angular `LineChart` instead of glowing spline `AreaChart` with gradient fills underneath.
   - Asset health gauge is currently a flat linear bar instead of a **circular radial progress gauge**.
   - `useMqttStream.ts` currently approximates p95 latency via an arithmetic multiplier; it should be upgraded to compute **empirical empirical p95 latency** from a sliding window of live packet timestamps.

---

## 2. MQTT WebSocket Connection & Configuration

### 2.1 Connection Topology
```
[Simulator (Python)]  -- TCP 1883 (QoS 1) --> [Mosquitto Broker] <-- WebSockets 9001 (QoS 1) -- [Next.js SCADA Dashboard]
                                                    ^
[Edge Gateway (Python)] <-- TCP 1883 (QoS 1) -------+
```

### 2.2 Broker Configuration (`infrastructure/mosquitto/config/mosquitto.conf`)
- **Port 1883**: Standard MQTT TCP listener for backend containers (Simulator, Edge Gateway).
- **Port 9001**: WebSocket listener for Next.js browser clients (`protocol websockets`, `listener 9001 0.0.0.0`).
- **Authentication**: `allow_anonymous true` configured for lab development.
- **Persistence**: Enabled (`/mosquitto/data/`).

### 2.3 Docker Compose Mapping (`docker-compose.yml`)
- `mosquitto`: exposes `"1883:1883"` and `"9001:9001"` on host.
- `dashboard`: injects `NEXT_PUBLIC_MQTT_WS_URL=ws://localhost:9001`.

### 2.4 Hook Configuration (`dashboard/src/hooks/useMqttStream.ts`)
```typescript
const wsUrl = process.env.NEXT_PUBLIC_MQTT_WS_URL || "ws://localhost:9001";
const client = mqtt.connect(wsUrl, {
  clientId: `nextjs_scada_${Math.random().toString(16).substring(2, 8)}`,
  clean: true,
  reconnectPeriod: 2000,
  connectTimeout: 5000,
});
```

---

## 3. Topic Hierarchy, Subscriptions, and Message Schemas

### 3.1 Topic Taxonomy

| Topic Pattern | Direction | QoS | Description |
|---|---|---|---|
| `ensam/iiot/+/+/+/telemetry` | Sub (Dashboard, Edge) | 1 | Real-time multi-variable physical telemetry per asset |
| `ensam/iiot/+/+/+/status` | Sub (Dashboard) | 1 (Retained) | Equipment operational metadata and state machine state |
| `ensam/iiot/+/+/+/event` | Sub (Dashboard) | 1 | Anomaly and threshold violation events emitted by Edge Gateway |
| `ensam/iiot/+/+/+/event/ack` | Pub (Dashboard) / Sub (Edge) | 1 | Operator alarm acknowledgment payload with diagnostic notes |
| `ensam/iiot/+/+/+/command` | Pub (Dashboard) / Sub (Sim) | 1 | Asset-targeted simulation / fault injection command |
| `ensam/iiot/command` | Pub (Dashboard) / Sub (Sim) | 1 | Broadcast simulation command applied to entire fleet |

### 3.2 Industrial Fleet Asset Map
| Device ID | Equipment Type | Site | Line | Base Temp | Base Press | Base Vib | Base Hum |
|---|---|---|---|---|---|---|---|
| `motor-01` | Electric Induction Motor | `site-a` | `line-1` | 65.0°C | 1.0 bar | 2.2 mm/s | 42.0% |
| `motor-02` | Electric Induction Motor | `site-a` | `line-1` | 65.0°C | 1.0 bar | 2.2 mm/s | 42.0% |
| `pump-01` | Centrifugal Water Pump | `site-a` | `line-1` | 52.0°C | 5.8 bar | 1.9 mm/s | 55.0% |
| `compressor-01` | Pneumatic Screw Compressor | `site-a` | `line-2` | 74.0°C | 8.2 bar | 3.0 mm/s | 35.0% |
| `conveyor-01` | Bulk Material Conveyor | `site-a` | `line-2` | 44.0°C | 1.0 bar | 1.2 mm/s | 48.0% |

### 3.3 Data Schemas

#### A. Telemetry Payload (`TelemetryPayload`)
```json
{
  "schema_version": "1.0",
  "message_id": "motor-01-00000042",
  "device_id": "motor-01",
  "site_id": "site-a",
  "line_id": "line-1",
  "sequence": 42,
  "timestamp": "2026-11-06T18:15:30.123456Z",
  "measurements": {
    "temperature_c": 64.8,
    "pressure_bar": 1.05,
    "vibration_mm_s": 2.12,
    "humidity_pct": 44.5
  },
  "machine_state": "RUNNING",
  "quality": "GOOD"
}
```

#### B. Retained Device Status (`DeviceStatus`)
```json
{
  "device_id": "pump-01",
  "site_id": "site-a",
  "line_id": "line-1",
  "device_type": "PUMP",
  "connection_status": "ONLINE",
  "machine_state": "RUNNING",
  "active_scenario": "NOMINAL"
}
```

#### C. Anomaly Event (`AnomalyEvent`)
```json
{
  "event_id": "EVT-4B29A8CF",
  "device_id": "motor-01",
  "site_id": "site-a",
  "line_id": "line-1",
  "timestamp": "2026-11-06T18:15:30.123456Z",
  "severity": "CRITICAL",
  "variable": "temperature_c",
  "observed_value": 92.5,
  "threshold": 90.0,
  "reason": "High temperature critical alarm: 92.5°C exceeds 90.0°C",
  "acknowledged": false,
  "ack_note": null,
  "ack_timestamp": null
}
```

#### D. Operator Acknowledgment Payload (`ackPayload`)
```json
{
  "event_id": "EVT-4B29A8CF",
  "note": "Bearing inspected, cooling lubricant replenished by technician",
  "timestamp": "2026-11-06T18:16:15.000Z"
}
```

#### E. Simulation Command (`SimulationCommand`)
```json
{
  "action": "set_scenario",
  "device_id": "motor-01",
  "scenario": "THERMAL_OVERHEAT",
  "duration_sec": 30
}
```

---

## 4. State Management in `useMqttStream.ts`

### 4.1 State Breakdown
| State Variable | Type | Initial Value | Lifecycle & Update Trigger |
|---|---|---|---|
| `isConnected` | `boolean` | `false` | Sets to `true` on MQTT client `connect`, `false` on `disconnect` |
| `devices` | `Record<string, TelemetryPayload>` | `{}` | Keyed by `device_id`. Updated whenever `/telemetry` message arrives |
| `statuses` | `Record<string, DeviceStatus>` | `{}` | Keyed by `device_id`. Updated on `/status` message arrival |
| `history` | `Record<string, Array<{time, temp, press, vib, hum}>>` | `{}` | Rolling buffer per `device_id`, capped to last 30 frames |
| `alerts` | `AnomalyEvent[]` | `[]` | Deduplicated list of incoming events, capped to 100 items (newest first) |
| `stats` | `StreamStats` | zeros | Ingestion count, msg/s rate, and latency computed every 1000ms |

### 4.2 Latency and Throughput Computation
- Message latency: `Math.max(0, Date.now() - new Date(telemetry.timestamp).getTime())`.
- Aggregation: An active 1-second interval accumulates message count and calculates average latency.
- **Improvement for R2**: Maintain a circular buffer of the last 100 latency measurements to compute exact **empirical p95 latency** instead of relying on an arbitrary multiplier.

---

## 5. Incident & Alarm Pipeline and Operator ACK Workflow

```
[Simulated Equipment]
         │
         ▼ (telemetry)
[Edge Gateway] ─── Anomaly Rule Engine (anomaly_rules.py)
         │           ├── Temp >= 80°C (WARN), >= 90°C (CRIT)
         │           ├── Vib >= 4.0 mm/s (WARN), >= 5.5 mm/s (CRIT)
         │           └── Press <= 2.5 bar (WARN), >= 9.5 bar (CRIT)
         │
         ▼ (QoS 1 alert on ensam/iiot/.../event)
[Mosquitto Broker]
         │
         ▼ (WebSockets)
[Dashboard: useMqttStream] ───> State: alerts[] ───> AlertConsole Table
                                                            │
                                              Operator clicks "Acknowledge"
                                                            │
                                                            ▼
                                                Modal opens, note entered
                                                            │
                                                            ▼
                                                acknowledgeAlert(id, note)
                                               ┌────────────┴────────────┐
                                               ▼                         ▼
                                    Local State Updated         MQTT Publish:
                                    (acknowledged = true,       ensam/iiot/site-a/line-1/system/event/ack
                                     ack_note = note)                    │
                                                                         ▼
                                                                  [Edge Gateway]
                                                           Logs: "Operator ACKNOWLEDGED..."
```

---

## 6. Test Lab Fault Injector Mechanics

The fault injector provides oral defense evaluators with direct interactive control to demonstrate end-to-end resilience:

| Scenario Key | Action | Physical / Payload Effect | Pipeline Reaction |
|---|---|---|---|
| `THERMAL_OVERHEAT` | Progressive thermal ramp (+2°C/s up to +32°C) | Temp exceeds 80°C then 90°C | Edge Gateway triggers WARNING then CRITICAL alarm |
| `VIBRATION_SPIKE` | Sudden mechanical bearing spike (+4.2 mm/s) | Vibration exceeds 5.5 mm/s | Edge Gateway triggers CRITICAL ISO 10816 alarm |
| `PRESSURE_DROP` | Severe fluid pressure drop (-2.8 bar) | Pressure drops to 0.5-2.5 bar | Edge Gateway triggers hydraulic line leak warning |
| `MACHINE_STOP` | Transitions machine state to `STOPPED` | Mechanical dynamics collapse to zero | Fleet synoptic shows gray STOPPED status badge |
| `CORRUPTED_PAYLOAD` | Emits malformed JSON schema (string seq, invalid timestamp) | Schema mismatch | Edge `PayloadValidator` quarantines/rejects packet |
| `SILENCE` | Suspends MQTT transmissions | Zero messages emitted | Equipment timeout / offline detection verified |
| `RESET` | Restores nominal parameters | Returns to baseline Gaussian noise | Device recovers to `RUNNING` nominal state |

---

## 7. Verification of R4: Zero Mock Fallbacks

### Audit Procedure & Findings:
1. Grep search across `dashboard/src/` for `mock`, `fake`, `dummy`, `Math.random` telemetry generators:
   - Found only random client ID generation in `useMqttStream.ts:48`: `clientId: nextjs_scada_${Math.random()}`.
   - Found ZERO mock data arrays, ZERO simulated intervals generating random temperatures.
2. Initial State Verification:
   - Dials render 0.0 before any live packet arrives.
   - Status displays "AWAITING" until live retained `/status` or `/telemetry` is ingested.
   - History charts display "Awaiting telemetry streaming..." until live packets are received.
3. **Mandate for UI Redesign**:
   - Strictly preserve this zero-mock purity.
   - When Mosquitto is offline or before backend is started, show a clean, high-tech waiting skeleton or connection status banner (`ws://localhost:9001 - Disconnected / Connecting`), ensuring no fake data is ever injected into charts or KPI counters.

---

## 8. Gap Analysis & Visual Blueprint for Redesign

| Design Aspect | Current Implementation | Target Reference Design (ORIGINAL_REQUEST.md) |
|---|---|---|
| **Navigation** | Top horizontal navbar with 5 tabs | **Left vertical sidebar** with categorical grouping, icon badges, and **solid neon green pill button** with dark foreground text on active item |
| **Top Bar** | Basic top bar inside header | Dedicated top bar with global search input and **Operator Profile Card** ("Operator: Shift Lead") |
| **KPI Metric Header** | Four rectangular cards in overview tab | **Top horizontal metric bar** displaying Total Ingestion, Active Fleet (5/5), Edge p95 Latency, and Unacknowledged Alarms separated by **vertical hairline dividers** |
| **Telemetry Chart** | Harsh angular `LineChart` without fills | Smooth glowing **spline `AreaChart` with linearGradient underneath** via Recharts |
| **Asset Health Display** | Flat horizontal progress bar (0-100%) | **Circular radial progress gauge** with glowing neon mint green ring |
| **Theme / Accents** | Cyan `#06b6d4` & blue accents | Deep matte charcoal/black surfaces (`#0B0F17`) with **neon mint / emerald green accents (`#00F59B` / `#10B981`)** |
| **Build Stability** | Tested and passed (`next build` succeeds with 0 errors) | Must continue building cleanly with 0 TypeScript/JSX errors |
