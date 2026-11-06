"""Unit tests for the Edge Gateway validation and deduplication engines."""

import json
import pytest
from edge.src.validation import PayloadValidator
from edge.src.deduplication import DeduplicationEngine


def test_valid_payload_ingestion():
    validator = PayloadValidator()
    raw_payload = json.dumps({
        "schema_version": "1.0",
        "message_id": "motor-01-00000001",
        "device_id": "motor-01",
        "site_id": "site-a",
        "line_id": "line-1",
        "sequence": 1,
        "timestamp": "2026-11-06T15:00:00.000Z",
        "measurements": {
            "temperature_c": 64.5,
            "pressure_bar": 1.02,
            "vibration_mm_s": 2.15,
            "humidity_pct": 45.0,
        },
        "machine_state": "RUNNING",
        "quality": "GOOD",
    }).encode("utf-8")

    valid, telemetry, err = validator.validate_raw_message(raw_payload)
    assert valid is True
    assert telemetry is not None
    assert telemetry.device_id == "motor-01"
    assert err is None


def test_malformed_json_rejected():
    validator = PayloadValidator()
    valid, telemetry, err = validator.validate_raw_message(b"NOT_A_VALID_JSON{")
    assert valid is False
    assert telemetry is None
    assert "JSON decode failure" in err


def test_physical_bounds_violation_rejected():
    validator = PayloadValidator()
    # Aberrant temperature of 250 °C (sensor failure)
    raw_payload = json.dumps({
        "schema_version": "1.0",
        "message_id": "motor-01-00000002",
        "device_id": "motor-01",
        "site_id": "site-a",
        "line_id": "line-1",
        "sequence": 2,
        "timestamp": "2026-11-06T15:00:01.000Z",
        "measurements": {
            "temperature_c": 250.0,
            "pressure_bar": 1.0,
            "vibration_mm_s": 1.5,
            "humidity_pct": 40.0,
        },
        "machine_state": "RUNNING",
        "quality": "GOOD",
    }).encode("utf-8")

    valid, telemetry, err = validator.validate_raw_message(raw_payload)
    assert valid is False
    assert telemetry is None
    assert "Physical bounds violation" in err


def test_idempotent_deduplication():
    engine = DeduplicationEngine(capacity=100)
    device_id = "motor-01"
    seq = 42
    now = 1700000000.0

    # First arrival
    is_dup1 = engine.is_duplicate(device_id, seq, now)
    assert is_dup1 is False

    # Second arrival of identical sequence (MQTT QoS 1 redelivery)
    is_dup2 = engine.is_duplicate(device_id, seq, now + 0.1)
    assert is_dup2 is True

    # Next sequence
    is_dup3 = engine.is_duplicate(device_id, seq + 1, now + 1.0)
    assert is_dup3 is False

