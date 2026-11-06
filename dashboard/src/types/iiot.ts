export type MachineState = "RUNNING" | "IDLE" | "WARNING" | "CRITICAL" | "STOPPED";
export type DataQuality = "GOOD" | "UNCERTAIN" | "BAD";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface Measurements {
  temperature_c: number;
  pressure_bar: number;
  vibration_mm_s: number;
  humidity_pct: number;
}

export interface TelemetryPayload {
  schema_version: string;
  message_id: string;
  device_id: string;
  site_id: string;
  line_id: string;
  sequence: number;
  timestamp: string;
  measurements: Measurements;
  machine_state: MachineState;
  quality: DataQuality;
  latency_ms?: number;
}

export interface DeviceStatus {
  device_id: string;
  site_id: string;
  line_id: string;
  device_type: string;
  connection_status: "ONLINE" | "OFFLINE";
  machine_state: MachineState;
  active_scenario: string;
  last_seen: string;
}

export interface AnomalyEvent {
  event_id: string;
  device_id: string;
  site_id: string;
  line_id: string;
  timestamp: string;
  severity: AlertSeverity;
  variable: string;
  observed_value: number;
  threshold: number;
  reason: string;
  acknowledged: boolean;
  ack_note?: string;
  ack_timestamp?: string;
}

export type ScenarioType =
  | "NOMINAL"
  | "THERMAL_OVERHEAT"
  | "VIBRATION_SPIKE"
  | "PRESSURE_DROP"
  | "MACHINE_STOP"
  | "CORRUPTED_PAYLOAD"
  | "SILENCE";

