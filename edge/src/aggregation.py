"""Time-window aggregation engine for reducing time-series storage footprint."""

import sys
import math
import logging
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime, timezone

# Ensure local module directory is in sys.path
_current_dir = str(Path(__file__).resolve().parent)
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from edge_models import NormalizedTelemetry, WindowAggregate, MetricSummary

logger = logging.getLogger("EdgeAggregation")


def calc_stats(values: List[float]) -> MetricSummary:
    if not values:
        return MetricSummary(mean=0.0, min=0.0, max=0.0, stddev=0.0)
    n = len(values)
    mean_val = sum(values) / n
    min_val = min(values)
    max_val = max(values)
    if n > 1:
        variance = sum((x - mean_val) ** 2 for x in values) / (n - 1)
        stddev_val = math.sqrt(variance)
    else:
        stddev_val = 0.0

    return MetricSummary(
        mean=round(mean_val, 2),
        min=round(min_val, 2),
        max=round(max_val, 2),
        stddev=round(stddev_val, 2),
    )


class WindowAggregator:
    """Aggregates telemetry frames over time windows (default: 10 seconds)."""

    def __init__(self, window_size_sec: int = 10) -> None:
        self.window_size_sec = window_size_sec
        # device_id -> list of NormalizedTelemetry
        self.buffers: Dict[str, List[NormalizedTelemetry]] = {}
        # device_id -> window start epoch
        self.window_starts: Dict[str, float] = {}

    def add_telemetry(self, telemetry: NormalizedTelemetry) -> Optional[WindowAggregate]:
        dev_id = telemetry.device_id
        now_utc = datetime.now(timezone.utc)
        now_epoch = now_utc.timestamp()

        if dev_id not in self.window_starts:
            self.window_starts[dev_id] = now_epoch
            self.buffers[dev_id] = []

        self.buffers[dev_id].append(telemetry)

        # Check if window expired
        elapsed = now_epoch - self.window_starts[dev_id]
        if elapsed >= self.window_size_sec:
            items = self.buffers[dev_id]
            window_start_iso = datetime.fromtimestamp(self.window_starts[dev_id], tz=timezone.utc).isoformat()
            window_end_iso = now_utc.isoformat()

            # Reset window
            self.window_starts[dev_id] = now_epoch
            self.buffers[dev_id] = []

            temps = [t.measurements.temperature_c for t in items]
            press = [t.measurements.pressure_bar for t in items]
            vibs = [t.measurements.vibration_mm_s for t in items]
            hums = [t.measurements.humidity_pct for t in items]

            agg = WindowAggregate(
                device_id=dev_id,
                site_id=telemetry.site_id,
                line_id=telemetry.line_id,
                window_start=window_start_iso,
                window_end=window_end_iso,
                sample_count=len(items),
                temperature=calc_stats(temps),
                pressure=calc_stats(press),
                vibration=calc_stats(vibs),
                humidity=calc_stats(hums),
            )
            logger.debug("Computed 10s aggregate for %s (samples: %d)", dev_id, len(items))
            return agg

        return None
