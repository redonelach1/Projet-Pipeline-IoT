"""Data models and schemas for the Edge Gateway."""

from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class AlertSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class MachineState(str, Enum):
    RUNNING = "RUNNING"
    IDLE = "IDLE"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"
    STOPPED = "STOPPED"


class DataQuality(str, Enum):
    GOOD = "GOOD"
    UNCERTAIN = "UNCERTAIN"
    BAD = "BAD"


class Measurements(BaseModel):
    temperature_c: float
    pressure_bar: float
    vibration_mm_s: float
    humidity_pct: float


class IngestedTelemetry(BaseModel):
    schema_version: str = "1.0"
    message_id: str
    device_id: str
    site_id: str
    line_id: str
    sequence: int
    timestamp: str
    measurements: Measurements
    machine_state: MachineState = MachineState.RUNNING
    quality: DataQuality = DataQuality.GOOD


class NormalizedTelemetry(BaseModel):
    schema_version: str
    message_id: str
    device_id: str
    site_id: str
    line_id: str
    sequence: int
    timestamp: str
    measurements: Measurements
    machine_state: MachineState
    quality: DataQuality
    edge_received_at: str
    processing_latency_ms: float
    validation_status: str = "VALID"


class MetricSummary(BaseModel):
    mean: float
    min: float
    max: float
    stddev: float


class WindowAggregate(BaseModel):
    device_id: str
    site_id: str
    line_id: str
    window_start: str
    window_end: str
    sample_count: int
    temperature: MetricSummary
    pressure: MetricSummary
    vibration: MetricSummary
    humidity: MetricSummary


class AnomalyEvent(BaseModel):
    event_id: str
    device_id: str
    site_id: str
    line_id: str
    timestamp: str
    severity: AlertSeverity
    variable: str
    observed_value: float
    threshold: float
    reason: str
    acknowledged: bool = False
    ack_note: Optional[str] = None
    ack_timestamp: Optional[str] = None

