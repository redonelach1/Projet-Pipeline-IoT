"""Unit tests for the industrial equipment simulator."""

import pytest
from simulator.src.devices import (
    ElectricMotor,
    CentrifugalPump,
    AirCompressor,
    IndustrialConveyor,
)
from simulator.src.sim_models import ScenarioType, MachineState


def test_device_initialization_and_reproducibility():
    """Verify deterministic physical variables when initialized with a fixed seed."""
    motor1 = ElectricMotor("motor-01", seed=42)
    motor2 = ElectricMotor("motor-01", seed=42)

    p1 = motor1.produce_payload()
    p2 = motor2.produce_payload()

    assert p1 is not None
    assert p2 is not None
    assert p1["measurements"]["temperature_c"] == p2["measurements"]["temperature_c"]
    assert p1["measurements"]["vibration_mm_s"] == p2["measurements"]["vibration_mm_s"]
    assert p1["sequence"] == 1
    assert p2["sequence"] == 1


def test_thermal_overheat_scenario():
    """Verify that thermal overheat scenario raises temperature progressively."""
    motor = ElectricMotor("motor-01", seed=10)
    baseline_payload = motor.produce_payload()
    base_temp = baseline_payload["measurements"]["temperature_c"]

    motor.set_scenario(ScenarioType.THERMAL_OVERHEAT, duration_sec=10)
    overheat_payload = motor.produce_payload()
    overheat_temp = overheat_payload["measurements"]["temperature_c"]

    assert overheat_temp > base_temp
    assert overheat_payload["machine_state"] in [MachineState.WARNING.value, MachineState.CRITICAL.value]


def test_vibration_spike_scenario():
    """Verify mechanical bearing fault spike."""
    pump = CentrifugalPump("pump-01", seed=20)
    pump.set_scenario(ScenarioType.VIBRATION_SPIKE, duration_sec=15)
    payload = pump.produce_payload()

    assert payload is not None
    assert payload["measurements"]["vibration_mm_s"] > 4.5
    assert payload["machine_state"] in [MachineState.WARNING.value, MachineState.CRITICAL.value]


def test_corrupted_payload_scenario():
    """Verify corrupted payload produces invalid structure for Edge testing."""
    comp = AirCompressor("compressor-01", seed=30)
    comp.set_scenario(ScenarioType.CORRUPTED_PAYLOAD, duration_sec=5)
    payload = comp.produce_payload()

    assert payload is not None
    assert payload["sequence"] == "not-an-integer"
    assert "site_id" not in payload

