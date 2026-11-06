"""Time-series persistence with InfluxDB and local SQLite store-and-forward resilience buffer."""

import sys
import time
import sqlite3
import logging
from pathlib import Path
from typing import Optional, List
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

# Ensure local module directory is in sys.path
_current_dir = str(Path(__file__).resolve().parent)
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from edge_models import NormalizedTelemetry, WindowAggregate, AnomalyEvent

logger = logging.getLogger("EdgeStorage")


class StorageManager:
    """Manages InfluxDB writes with automatic offline SQLite buffering for network fault tolerance."""

    def __init__(
        self,
        url: str,
        token: str,
        org: str,
        bucket_raw: str = "iiot_telemetry",
        bucket_agg: str = "iiot_aggregates",
        sqlite_db_path: str = "/tmp/edge_buffer.db",
    ) -> None:
        self.url = url
        self.token = token
        self.org = org
        self.bucket_raw = bucket_raw
        self.bucket_agg = bucket_agg
        self.sqlite_db_path = sqlite_db_path

        self._init_sqlite()
        self.client: Optional[InfluxDBClient] = None
        self.write_api = None
        self.is_connected = False
        self._connect_influx()

    def _init_sqlite() -> None:
        pass

    def _init_sqlite(self) -> None:
        try:
            with sqlite3.connect(self.sqlite_db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS offline_buffer (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        bucket TEXT NOT NULL,
                        line_protocol TEXT NOT NULL,
                        created_at REAL NOT NULL
                    )
                    """
                )
                conn.commit()
            logger.info("Initialized local SQLite resilience buffer at %s", self.sqlite_db_path)
        except Exception as e:
            logger.error("Failed to initialize SQLite buffer: %s", e)

    def _connect_influx(self) -> None:
        try:
            self.client = InfluxDBClient(url=self.url, token=self.token, org=self.org, timeout=3000)
            self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
            # Ping health
            health = self.client.health()
            if health.status == "pass":
                self.is_connected = True
                logger.info("Connected successfully to InfluxDB at %s", self.url)
                self._flush_sqlite_buffer()
            else:
                self.is_connected = False
                logger.warning("InfluxDB healthcheck failed: %s", health.message)
        except Exception as e:
            self.is_connected = False
            logger.warning("Unable to connect to InfluxDB (%s). Offline buffering active.", e)

    def write_raw_telemetry(self, t: NormalizedTelemetry) -> None:
        point = (
            Point("machine_telemetry")
            .tag("device_id", t.device_id)
            .tag("site_id", t.site_id)
            .tag("line_id", t.line_id)
            .tag("machine_state", t.machine_state.value)
            .tag("quality", t.quality.value)
            .field("temperature_c", float(t.measurements.temperature_c))
            .field("pressure_bar", float(t.measurements.pressure_bar))
            .field("vibration_mm_s", float(t.measurements.vibration_mm_s))
            .field("humidity_pct", float(t.measurements.humidity_pct))
            .field("latency_ms", float(t.processing_latency_ms))
            .field("sequence", int(t.sequence))
            .time(t.timestamp, WritePrecision.NS)
        )
        self._write_point(self.bucket_raw, point)

    def write_aggregate(self, agg: WindowAggregate) -> None:
        point = (
            Point("machine_aggregates_10s")
            .tag("device_id", agg.device_id)
            .tag("site_id", agg.site_id)
            .tag("line_id", agg.line_id)
            .field("sample_count", agg.sample_count)
            .field("temp_mean", agg.temperature.mean)
            .field("temp_min", agg.temperature.min)
            .field("temp_max", agg.temperature.max)
            .field("temp_stddev", agg.temperature.stddev)
            .field("press_mean", agg.pressure.mean)
            .field("press_min", agg.pressure.min)
            .field("press_max", agg.pressure.max)
            .field("vib_mean", agg.vibration.mean)
            .field("vib_max", agg.vibration.max)
            .field("hum_mean", agg.humidity.mean)
            .time(agg.window_end, WritePrecision.NS)
        )
        self._write_point(self.bucket_agg, point)

    def _write_point(self, bucket: str, point: Point) -> None:
        line_protocol = point.to_line_protocol()
        if self.is_connected and self.write_api:
            try:
                self.write_api.write(bucket=bucket, org=self.org, record=point)
                return
            except Exception as e:
                self.is_connected = False
                logger.warning("InfluxDB write failed (%s). Buffering to SQLite.", e)

        # Buffer to SQLite
        self._buffer_to_sqlite(bucket, line_protocol)

    def _buffer_to_sqlite(self, bucket: str, line_protocol: str) -> None:
        try:
            with sqlite3.connect(self.sqlite_db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO offline_buffer (bucket, line_protocol, created_at) VALUES (?, ?, ?)",
                    (bucket, line_protocol, time.time()),
                )
                conn.commit()
        except Exception as e:
            logger.critical("Critical storage error: could not write to SQLite buffer: %s", e)

    def _flush_sqlite_buffer(self) -> None:
        """Drain buffered lines to InfluxDB upon network recovery."""
        try:
            with sqlite3.connect(self.sqlite_db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT id, bucket, line_protocol FROM offline_buffer ORDER BY id ASC LIMIT 500")
                rows = cursor.fetchall()
                if not rows:
                    return

                logger.info("Replaying %d buffered points from SQLite to InfluxDB...", len(rows))
                ids_to_delete = []
                for row_id, bucket, lp in rows:
                    try:
                        self.write_api.write(bucket=bucket, org=self.org, record=lp)
                        ids_to_delete.append(row_id)
                    except Exception as e:
                        logger.warning("Replay interrupted: %s", e)
                        break

                if ids_to_delete:
                    cursor.execute(
                        f"DELETE FROM offline_buffer WHERE id IN ({','.join(['?'] * len(ids_to_delete))})",
                        ids_to_delete,
                    )
                    conn.commit()
                    logger.info("Successfully flushed and cleared %d points from buffer.", len(ids_to_delete))
        except Exception as e:
            logger.error("Failed to flush SQLite buffer: %s", e)

    def check_health(self) -> bool:
        """Periodic connection retry."""
        if not self.is_connected:
            self._connect_influx()
        else:
            self._flush_sqlite_buffer()
        return self.is_connected
