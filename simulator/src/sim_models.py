"""Data models and telemetry schemas for the industrial simulator."""

from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


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


class ScenarioType(str, Enum):
    NOMINAL = "NOMINAL"
    THERMAL_OVERHEAT = "THERMAL_OVERHEAT"
    VIBRATION_SPIKE = "VIBRATION_SPIKE"
    PRESSURE_DROP = "PRESSURE_DROP"
    MACHINE_STOP = "MACHINE_STOP"
    CORRUPTED_PAYLOAD = "CORRUPTED_PAYLOAD"
    SILENCE = "SILENCE"


class Measurements(BaseModel):
    temperature_c: float = Field(..., description="Operating temperature in Celsius")
    pressure_bar: float = Field(..., description="Fluid/line pressure in bars")
    vibration_mm_s: float = Field(..., description="Vibration RMS velocity in mm/s")
    humidity_pct: float = Field(..., description="Ambient humidity percentage")

    @field_validator("temperature_c", "pressure_bar", "vibration_mm_s", "humidity_pct")
    @classmethod
    def validate_finite(cls, v: float) -> float:
        if v is None or not isinstance(v, (int, float)):
            raise ValueError("Measurement value must be a valid number")
        return round(float(v), 2)


class TelemetryPayload(BaseModel):
    schema_version: str = Field(default="1.0", description="Schema semantic version")
    message_id: str = Field(..., description="Unique deterministic message identifier")
    device_id: str = Field(..., description="Equipment identifier")
    site_id: str = Field(..., description="Industrial site identifier")
    line_id: str = Field(..., description="Production line identifier")
    sequence: int = Field(..., ge=0, description="Strictly monotonic sequence counter")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp")
    measurements: Measurements = Field(..., description="Physical variables")
    machine_state: MachineState = Field(default=MachineState.RUNNING)
    quality: DataQuality = Field(default=DataQuality.GOOD)

    @field_validator("timestamp")
    @classmethod
    def validate_iso_timestamp(cls, v: str) -> str:
        try:
            datetime.fromisoformat(v.replace("Z", "+00:00"))
            return v
        except Exception as e:
            raise ValueError(f"Invalid ISO 8601 timestamp: {v}") from e


class SimulationCommand(BaseModel):
    action: str = Field(..., description="Action to perform: set_scenario, reset, set_rate")
    device_id: Optional[str] = Field(None, description="Target device or None for all")
    scenario: Optional[ScenarioType] = Field(None, description="Scenario to trigger")
    duration_sec: Optional[int] = Field(30, description="Duration in seconds for transient faults")
    frequency_hz: Optional[float] = Field(None, description="Emission frequency override")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

