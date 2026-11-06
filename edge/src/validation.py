"""Payload schema and physical bounds validation module."""

import sys
import json
import logging
from pathlib import Path
from typing import Tuple, Optional, Dict, Any
from pydantic import ValidationError

# Ensure local module directory is in sys.path
_current_dir = str(Path(__file__).resolve().parent)
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from edge_models import IngestedTelemetry

logger = logging.getLogger("EdgeValidation")

# Physical plausibility boundaries (NIST / Industrial sensor range limits)
BOUNDS = {
    "temperature_c": (-30.0, 180.0),
    "pressure_bar": (0.0, 50.0),
    "vibration_mm_s": (0.0, 50.0),
    "humidity_pct": (0.0, 100.0),
}


class PayloadValidator:
    """Validates structure, types and physical sanity of incoming telemetry frames."""

    def __init__(self) -> None:
        self.total_processed = 0
        self.valid_count = 0
        self.rejected_count = 0

    def validate_raw_message(self, raw_bytes: bytes) -> Tuple[bool, Optional[IngestedTelemetry], Optional[str]]:
        self.total_processed += 1
        try:
            raw_str = raw_bytes.decode("utf-8")
            data = json.loads(raw_str)
        except Exception as e:
            self.rejected_count += 1
            reason = f"JSON decode failure: {e}"
            logger.warning("Rejected payload: %s", reason)
            return False, None, reason

        try:
            telemetry = IngestedTelemetry.model_validate(data)
        except ValidationError as ve:
            self.rejected_count += 1
            reason = f"Pydantic schema validation error: {ve.errors()}"
            logger.warning("Rejected payload from %s: %s", data.get("device_id", "unknown"), reason)
            return False, None, reason

        # Physical sanity checks
        m = telemetry.measurements
        for var_name, (min_val, max_val) in BOUNDS.items():
            val = getattr(m, var_name)
            if not (min_val <= val <= max_val):
                self.rejected_count += 1
                reason = f"Physical bounds violation for {var_name}: {val} not in [{min_val}, {max_val}]"
                logger.warning("Rejected payload from %s: %s", telemetry.device_id, reason)
                return False, None, reason

        self.valid_count += 1
        return True, telemetry, None

    def get_metrics(self) -> Dict[str, Any]:
        return {
            "total_processed": self.total_processed,
            "valid_count": self.valid_count,
            "rejected_count": self.rejected_count,
            "rejection_rate_pct": (
                round((self.rejected_count / self.total_processed) * 100, 2)
                if self.total_processed > 0
                else 0.0
            ),
        }
