"""Deterministic and explainable edge anomaly detection rule engine."""

import sys
import uuid
import logging
from pathlib import Path
from typing import List
from datetime import datetime, timezone

# Ensure local module directory is in sys.path
_current_dir = str(Path(__file__).resolve().parent)
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from edge_models import NormalizedTelemetry, AnomalyEvent, AlertSeverity

logger = logging.getLogger("EdgeAnomalyEngine")


class AnomalyRuleEngine:
    """Evaluates telemetry variables against industrial threshold rules."""

    def __init__(self) -> None:
        # Configurable engineering thresholds
        self.temp_warn = 80.0
        self.temp_crit = 90.0

        self.vib_warn = 4.0
        self.vib_crit = 5.5

        self.press_high_crit = 9.5
        self.press_low_warn = 2.5

    def evaluate(self, telemetry: NormalizedTelemetry) -> List[AnomalyEvent]:
        events: List[AnomalyEvent] = []
        m = telemetry.measurements
        dev_id = telemetry.device_id
        now_iso = datetime.now(timezone.utc).isoformat()

        # Rule 1: Thermal Overheat
        if m.temperature_c >= self.temp_crit:
            events.append(
                AnomalyEvent(
                    event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
                    device_id=dev_id,
                    site_id=telemetry.site_id,
                    line_id=telemetry.line_id,
                    timestamp=now_iso,
                    severity=AlertSeverity.CRITICAL,
                    variable="temperature_c",
                    observed_value=m.temperature_c,
                    threshold=self.temp_crit,
                    reason=f"High temperature critical alarm: {m.temperature_c}°C exceeds {self.temp_crit}°C",
                )
            )
        elif m.temperature_c >= self.temp_warn:
            events.append(
                AnomalyEvent(
                    event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
                    device_id=dev_id,
                    site_id=telemetry.site_id,
                    line_id=telemetry.line_id,
                    timestamp=now_iso,
                    severity=AlertSeverity.WARNING,
                    variable="temperature_c",
                    observed_value=m.temperature_c,
                    threshold=self.temp_warn,
                    reason=f"Elevated operating temperature: {m.temperature_c}°C exceeds warning threshold {self.temp_warn}°C",
                )
            )

        # Rule 2: Vibration Anomalies
        if m.vibration_mm_s >= self.vib_crit:
            events.append(
                AnomalyEvent(
                    event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
                    device_id=dev_id,
                    site_id=telemetry.site_id,
                    line_id=telemetry.line_id,
                    timestamp=now_iso,
                    severity=AlertSeverity.CRITICAL,
                    variable="vibration_mm_s",
                    observed_value=m.vibration_mm_s,
                    threshold=self.vib_crit,
                    reason=f"Severe mechanical vibration / bearing failure hazard: {m.vibration_mm_s} mm/s exceeds {self.vib_crit} mm/s",
                )
            )
        elif m.vibration_mm_s >= self.vib_warn:
            events.append(
                AnomalyEvent(
                    event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
                    device_id=dev_id,
                    site_id=telemetry.site_id,
                    line_id=telemetry.line_id,
                    timestamp=now_iso,
                    severity=AlertSeverity.WARNING,
                    variable="vibration_mm_s",
                    observed_value=m.vibration_mm_s,
                    threshold=self.vib_warn,
                    reason=f"Abnormal vibration velocity detected: {m.vibration_mm_s} mm/s exceeds warning limit {self.vib_warn} mm/s",
                )
            )

        # Rule 3: Fluid / Pneumatic Pressure Out of Bounds (Pump & Compressor only)
        if "pump" in dev_id or "compressor" in dev_id:
            if m.pressure_bar >= self.press_high_crit:
                events.append(
                    AnomalyEvent(
                        event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
                        device_id=dev_id,
                        site_id=telemetry.site_id,
                        line_id=telemetry.line_id,
                        timestamp=now_iso,
                        severity=AlertSeverity.CRITICAL,
                        variable="pressure_bar",
                        observed_value=m.pressure_bar,
                        threshold=self.press_high_crit,
                        reason=f"High pressure safety limit breach: {m.pressure_bar} bar exceeds {self.press_high_crit} bar",
                    )
                )
            elif m.pressure_bar <= self.press_low_warn:
                events.append(
                    AnomalyEvent(
                        event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
                        device_id=dev_id,
                        site_id=telemetry.site_id,
                        line_id=telemetry.line_id,
                        timestamp=now_iso,
                        severity=AlertSeverity.WARNING,
                        variable="pressure_bar",
                        observed_value=m.pressure_bar,
                        threshold=self.press_low_warn,
                        reason=f"Hydraulic pressure collapse or line leak: {m.pressure_bar} bar below {self.press_low_warn} bar",
                    )
                )

        if events:
            logger.info("Anomaly detection rule triggered %d event(s) for %s", len(events), dev_id)

        return events
