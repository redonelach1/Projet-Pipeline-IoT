"""Normalization and edge metadata enrichment module."""

from datetime import datetime, timezone
from typing import Tuple
from .models import IngestedTelemetry, NormalizedTelemetry


class Normalizer:
    """Enriches validated telemetry with edge arrival time and computes edge processing latency."""

    @staticmethod
    def normalize(telemetry: IngestedTelemetry) -> NormalizedTelemetry:
        now_dt = datetime.now(timezone.utc)
        edge_received_at = now_dt.isoformat()

        # Compute latency: now - telemetry.timestamp
        try:
            source_dt = datetime.fromisoformat(telemetry.timestamp.replace("Z", "+00:00"))
            latency_sec = (now_dt - source_dt).total_seconds()
            latency_ms = max(0.0, round(latency_sec * 1000.0, 2))
        except Exception:
            latency_ms = 0.0

        return NormalizedTelemetry(
            schema_version=telemetry.schema_version,
            message_id=telemetry.message_id,
            device_id=telemetry.device_id,
            site_id=telemetry.site_id,
            line_id=telemetry.line_id,
            sequence=telemetry.sequence,
            timestamp=telemetry.timestamp,
            measurements=telemetry.measurements,
            machine_state=telemetry.machine_state,
            quality=telemetry.quality,
            edge_received_at=edge_received_at,
            processing_latency_ms=latency_ms,
            validation_status="VALID",
        )

