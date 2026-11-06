"""Industrial equipment simulation models with realistic physics and state machines."""

import sys
import time
import random
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime, timezone

# Ensure local module directory is in sys.path
_current_dir = str(Path(__file__).resolve().parent)
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from sim_models import (
    MachineState,
    DataQuality,
    ScenarioType,
    Measurements,
    TelemetryPayload,
    SimulationCommand,
)


class IndustrialDevice:
    """Base class for simulated industrial assets."""

    def __init__(
        self,
        device_id: str,
        device_type: str,
        site_id: str = "site-a",
        line_id: str = "line-1",
        seed: Optional[int] = None,
    ) -> None:
        self.device_id = device_id
        self.device_type = device_type
        self.site_id = site_id
        self.line_id = line_id
        self.sequence = 0
        self.rng = random.Random(seed if seed is not None else 42)

        # Baseline physical setpoints
        self.base_temperature = 60.0
        self.base_pressure = 4.0
        self.base_vibration = 1.5
        self.base_humidity = 45.0

        # Noise standard deviations
        self.sigma_temp = 0.5
        self.sigma_press = 0.1
        self.sigma_vib = 0.15
        self.sigma_hum = 0.3

        # State tracking
        self.machine_state = MachineState.RUNNING
        self.active_scenario = ScenarioType.NOMINAL
        self.scenario_start_time: Optional[float] = None
        self.scenario_duration: int = 30

    def set_scenario(self, scenario: ScenarioType, duration_sec: int = 30) -> None:
        """Inject a scenario or fault condition."""
        self.active_scenario = scenario
        self.scenario_duration = duration_sec
        self.scenario_start_time = time.time()

    def reset_scenario(self) -> None:
        """Reset machine back to nominal operating condition."""
        self.active_scenario = ScenarioType.NOMINAL
        self.scenario_start_time = None
        self.machine_state = MachineState.RUNNING

    def _check_scenario_expiry(self) -> None:
        """Check if transient scenario duration has completed."""
        if (
            self.active_scenario != ScenarioType.NOMINAL
            and self.scenario_start_time is not None
        ):
            elapsed = time.time() - self.scenario_start_time
            if elapsed >= self.scenario_duration:
                self.reset_scenario()

    def generate_measurements(self) -> Optional[Measurements]:
        """Calculate physical variables based on active scenario and noise."""
        self._check_scenario_expiry()

        if self.active_scenario == ScenarioType.SILENCE:
            return None

        if self.active_scenario == ScenarioType.MACHINE_STOP:
            self.machine_state = MachineState.STOPPED
            # Cooling down and idling
            temp = self.base_temperature * 0.6 + self.rng.gauss(0, 0.2)
            press = 1.0 + self.rng.gauss(0, 0.05)
            vib = 0.1 + abs(self.rng.gauss(0, 0.05))
            hum = self.base_humidity + self.rng.gauss(0, 0.2)
            return Measurements(
                temperature_c=temp,
                pressure_bar=press,
                vibration_mm_s=vib,
                humidity_pct=hum,
            )

        # Baseline with gaussian noise
        temp = self.base_temperature + self.rng.gauss(0, self.sigma_temp)
        press = self.base_pressure + self.rng.gauss(0, self.sigma_press)
        vib = self.base_vibration + abs(self.rng.gauss(0, self.sigma_vib))
        hum = self.base_humidity + self.rng.gauss(0, self.sigma_hum)

        # Apply specific scenario modifiers
        if self.active_scenario == ScenarioType.THERMAL_OVERHEAT:
            # Progressive thermal rise above 88 °C
            elapsed = time.time() - (self.scenario_start_time or time.time())
            ramp = min(elapsed * 2.0, 32.0)
            temp += ramp
            self.machine_state = (
                MachineState.CRITICAL if temp > 88.0 else MachineState.WARNING
            )

        elif self.active_scenario == ScenarioType.VIBRATION_SPIKE:
            # Mechanical bearing fault spike > 5.5 mm/s
            vib += 4.2 + abs(self.rng.gauss(0, 0.4))
            self.machine_state = (
                MachineState.CRITICAL if vib > 6.0 else MachineState.WARNING
            )

        elif self.active_scenario == ScenarioType.PRESSURE_DROP:
            # Line leak: pressure collapse
            press = max(0.5, press - 2.8 + self.rng.gauss(0, 0.1))
            self.machine_state = MachineState.WARNING

        else:
            self.machine_state = MachineState.RUNNING

        return Measurements(
            temperature_c=temp,
            pressure_bar=press,
            vibration_mm_s=vib,
            humidity_pct=hum,
        )

    def produce_payload(self) -> Optional[Dict[str, Any]]:
        """Generate a validated telemetry payload or test anomaly."""
        measurements = self.generate_measurements()
        if measurements is None:
            return None

        self.sequence += 1
        now_utc = datetime.now(timezone.utc).isoformat()
        msg_id = f"{self.device_id}-{self.sequence:08d}"

        # Test case: Deliberately malformed payload for Edge schema verification
        if self.active_scenario == ScenarioType.CORRUPTED_PAYLOAD:
            return {
                "schema_version": "1.0",
                "message_id": msg_id,
                "device_id": self.device_id,
                # Missing site_id and line_id
                "sequence": "not-an-integer",  # Invalid type
                "timestamp": "invalid-timestamp-string",
                "measurements": {
                    "temperature_c": "corrupted_string_value",
                },
                "machine_state": "INVALID_STATE",
            }

        payload = TelemetryPayload(
            schema_version="1.0",
            message_id=msg_id,
            device_id=self.device_id,
            site_id=self.site_id,
            line_id=self.line_id,
            sequence=self.sequence,
            timestamp=now_utc,
            measurements=measurements,
            machine_state=self.machine_state,
            quality=DataQuality.GOOD,
        )
        return payload.model_dump()


class ElectricMotor(IndustrialDevice):
    """Heavy induction motor: high mechanical vibration and thermal dissipation."""

    def __init__(self, device_id: str, site_id: str = "site-a", line_id: str = "line-1", seed: Optional[int] = None):
        super().__init__(device_id, "MOTOR", site_id, line_id, seed)
        self.base_temperature = 65.0
        self.base_pressure = 1.0  # Atmospheric
        self.base_vibration = 2.2
        self.base_humidity = 42.0


class CentrifugalPump(IndustrialDevice):
    """High-pressure fluid pump: sensitive to cavitation and pressure shifts."""

    def __init__(self, device_id: str, site_id: str = "site-a", line_id: str = "line-1", seed: Optional[int] = None):
        super().__init__(device_id, "PUMP", site_id, line_id, seed)
        self.base_temperature = 52.0
        self.base_pressure = 5.8
        self.base_vibration = 1.9
        self.base_humidity = 55.0


class AirCompressor(IndustrialDevice):
    """Pneumatic screw compressor: high pressure and operational heat."""

    def __init__(self, device_id: str, site_id: str = "site-a", line_id: str = "line-1", seed: Optional[int] = None):
        super().__init__(device_id, "COMPRESSOR", site_id, line_id, seed)
        self.base_temperature = 74.0
        self.base_pressure = 8.2
        self.base_vibration = 3.0
        self.base_humidity = 35.0


class IndustrialConveyor(IndustrialDevice):
    """Bulk material conveyor belt: roller vibrations and environmental metrics."""

    def __init__(self, device_id: str, site_id: str = "site-a", line_id: str = "line-1", seed: Optional[int] = None):
        super().__init__(device_id, "CONVEYOR", site_id, line_id, seed)
        self.base_temperature = 44.0
        self.base_pressure = 1.0
        self.base_vibration = 1.2
        self.base_humidity = 48.0
