"""Idempotent deduplication engine for MQTT QoS 1 duplicate mitigation."""

import sys
import logging
from pathlib import Path
from collections import OrderedDict
from typing import Tuple, Dict, Any

# Ensure local module directory is in sys.path
_current_dir = str(Path(__file__).resolve().parent)
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

logger = logging.getLogger("EdgeDeduplication")


class DeduplicationEngine:
    """Tracks sequence numbers per device using a bounded LRU cache."""

    def __init__(self, capacity: int = 10000) -> None:
        self.capacity = capacity
        self._seen_cache: OrderedDict[Tuple[str, int], float] = OrderedDict()
        self.duplicate_count = 0
        self.unique_count = 0

    def is_duplicate(self, device_id: str, sequence: int, timestamp: float) -> bool:
        key = (device_id, sequence)
        if key in self._seen_cache:
            self.duplicate_count += 1
            # Move to end for LRU refresh
            self._seen_cache.move_to_end(key)
            logger.info("Filtered duplicate message for device %s with sequence %d", device_id, sequence)
            return True

        self.unique_count += 1
        self._seen_cache[key] = timestamp
        if len(self._seen_cache) > self.capacity:
            self._seen_cache.popitem(last=False)
        return False

    def get_metrics(self) -> Dict[str, Any]:
        total = self.unique_count + self.duplicate_count
        return {
            "unique_count": self.unique_count,
            "duplicate_count": self.duplicate_count,
            "duplicate_rate_pct": (
                round((self.duplicate_count / total) * 100, 2) if total > 0 else 0.0
            ),
        }
