"""Unit tests for the Edge Gateway anomaly detection rule engine and window aggregation."""

import pytest
from edge.src.models import NormalizedTelemetry, Measurements, MachineState, DataQuality, AlertSeverity
from edge.src.anomaly_rules import AnomalyRuleEngine
from edge.src.aggregation import WindowAggregator


def test_temperature_critical_alert():
    engine = AnomalyRuleEngine()
    telemetry = NormalizedTelemetry(
        schema_version="1.0",
        message_id="motor-01-00000010",
        device_id="motor-01",
        site_id="site-a",
        line_id="line-1",
        sequence=10,
        timestamp="2026-11-06T15:00:00.000Z",
        measurements=Measurements(
            temperature_c=92.5,  # Exceeds critical threshold 90.0°C
            pressure_bar=1.0,
            vibration_mm_s=2.0,
            humidity_pct=45.0,
        ),
        machine_state=MachineState.CRITICAL,
        quality=DataQuality.GOOD,
        edge_received_at="2026-11-06T15:00:00.010Z",
        processing_latency_ms=10.0,
    )

    events = engine.evaluate(telemetry)
    assert len(events) >= 1
    crit_evt = next((e for e in events if e.variable == "temperature_c"), None)
    assert crit_evt is not None
    assert crit_evt.severity == AlertSeverity.CRITICAL
    assert crit_evt.threshold == 90.0
    assert crit_evt.observed_value == 92.5


def test_vibration_warning_alert():
    engine = AnomalyRuleEngine()
    telemetry = NormalizedTelemetry(
        schema_version="1.0",
        message_id="pump-01-00000015",
        device_id="pump-01",
        site_id="site-a",
        line_id="line-1",
        sequence=15,
        timestamp="2026-11-06T15:00:00.000Z",
        measurements=Measurements(
            temperature_c=55.0,
            pressure_bar=5.0,
            vibration_mm_s=4.3,  # Exceeds warning threshold 4.0 mm/s
            humidity_pct=50.0,
        ),
        machine_state=MachineState.WARNING,
        quality=DataQuality.GOOD,
        edge_received_at="2026-11-06T15:00:00.015Z",
        processing_latency_ms=15.0,
    )

    events = engine.evaluate(telemetry)
    assert len(events) >= 1
    vib_evt = next((e for e in events if e.variable == "vibration_mm_s"), None)
    assert vib_evt is not None
    assert vib_evt.severity == AlertSeverity.WARNING


def test_window_aggregator_calculation():
    aggregator = WindowAggregator(window_size_sec=1)  # 1 second for fast testing

    # Add 3 samples
    for i in range(3):
        t = NormalizedTelemetry(
            schema_version="1.0",
            message_id=f"motor-01-{i}",
            device_id="motor-01",
            site_id="site-a",
            line_id="line-1",
            sequence=i,
            timestamp="2026-11-06T15:00:00.000Z",
            measurements=Measurements(
                temperature_c=60.0 + i * 2.0,  # 60, 62, 64 -> mean = 62.0
                pressure_bar=1.0,
                vibration_mm_s=2.0,
                humidity_pct=40.0,
            ),
            machine_state=MachineState.RUNNING,
            quality=DataQuality.GOOD,
            edge_received_at="2026-11-06T15:00:00.000Z",
            processing_latency_ms=5.0,
        )
        agg = aggregator.add_telemetry(t)

    # Force time elapse by directly calling with a timestamp diff or waiting
    import time
    time.sleep(1.1)

    # Adding 4th item triggers window commit
    t_flush = NormalizedTelemetry(
        schema_version="1.0",
        message_id="motor-01-99",
        device_id="motor-01",
        site_id="site-a",
        line_id="line-1",
        sequence=99,
        timestamp="2026-11-06T15:00:02.000Z",
        measurements=Measurements(
            temperature_c=66.0,
            pressure_bar=1.0,
            vibration_mm_s=2.0,
            humidity_pct=40.0,
        ),
        machine_state=MachineState.RUNNING,
        quality=DataQuality.GOOD,
        edge_received_at="2026-11-06T15:00:02.000Z",
        processing_latency_ms=5.0,
    )
    result = aggregator.add_telemetry(t_flush)
    assert result is not None
    assert result.sample_count == 4
    assert result.temperature.min == 60.0
    assert result.temperature.max == 66.0
    assert result.temperature.mean == 63.0
