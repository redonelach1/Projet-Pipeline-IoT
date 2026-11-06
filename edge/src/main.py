"""Main entrypoint for the ENSAM IIoT Python Edge Processing Gateway."""

import os
import sys
import time
import json
import signal
import logging
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
import paho.mqtt.client as mqtt

# Ensure local module directory is in sys.path
_current_dir = str(Path(__file__).resolve().parent)
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from validation import PayloadValidator
from deduplication import DeduplicationEngine
from normalization import Normalizer
from aggregation import WindowAggregator
from anomaly_rules import AnomalyRuleEngine
from storage import StorageManager
from edge_models import AnomalyEvent

# Setup structured logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s [%(levelname)s] [%(name)s]: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("EdgeGateway")

# Load environment configuration
load_dotenv()


class EdgeGateway:
    """Industrial edge processing pipeline implementing filtering, aggregation and fault detection."""

    def __init__(self) -> None:
        self.broker_host = os.getenv("MQTT_BROKER_HOST", "localhost")
        self.broker_port = int(os.getenv("MQTT_BROKER_PORT", "1883"))
        self.client_id = os.getenv("MQTT_CLIENT_ID_EDGE", "ensam_edge_consumer")
        self.topic_prefix = os.getenv("MQTT_TOPIC_PREFIX", "ensam/iiot").rstrip("/")
        window_size = int(os.getenv("EDGE_WINDOW_SIZE_SEC", "10"))

        # Pipeline modules
        self.validator = PayloadValidator()
        self.deduplicator = DeduplicationEngine(capacity=10000)
        self.normalizer = Normalizer()
        self.aggregator = WindowAggregator(window_size_sec=window_size)
        self.anomaly_engine = AnomalyRuleEngine()

        # Time-series storage
        influx_url = os.getenv("INFLUXDB_URL", "http://localhost:8086")
        influx_token = os.getenv("INFLUXDB_ADMIN_TOKEN", "ensam_iiot_super_secret_auth_token_2026_2027")
        influx_org = os.getenv("INFLUXDB_ORG", "ensam")
        raw_bucket = os.getenv("INFLUXDB_BUCKET", "iiot_telemetry")
        agg_bucket = os.getenv("INFLUXDB_BUCKET_AGGREGATES", "iiot_aggregates")
        sqlite_buffer = os.getenv("EDGE_BUFFER_PATH", "/tmp/edge_buffer.db")

        self.storage = StorageManager(
            url=influx_url,
            token=influx_token,
            org=influx_org,
            bucket_raw=raw_bucket,
            bucket_agg=agg_bucket,
            sqlite_db_path=sqlite_buffer,
        )

        # MQTT Client setup
        self.client = mqtt.Client(
            mqtt.CallbackAPIVersion.VERSION2,
            client_id=self.client_id,
            protocol=mqtt.MQTTv5,
        )
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message
        self.client.reconnect_delay_set(min_delay=1, max_delay=30)

        # Performance metric tracking
        self.latencies: list[float] = []
        self.running = False

    def start(self) -> None:
        logger.info("Starting Edge Gateway connecting to %s:%d ...", self.broker_host, self.broker_port)
        self.running = True
        try:
            self.client.connect(self.broker_host, self.broker_port, keepalive=60)
            self.client.loop_start()
        except Exception as e:
            logger.error("Initial connection to MQTT broker failed: %s. Will retry...", e)

    def stop(self) -> None:
        self.running = False
        self.client.loop_stop()
        self.client.disconnect()
        logger.info("Edge Gateway successfully stopped.")

    def _on_connect(self, client, userdata, flags, reason_code, properties) -> None:
        if reason_code == 0:
            logger.info("Edge Gateway connected to Mosquitto broker (code: 0).")
            # Subscribe to all equipment telemetry
            telemetry_topic = f"{self.topic_prefix}/+/+/+/telemetry"
            client.subscribe(telemetry_topic, qos=1)
            logger.info("Subscribed to telemetry topic: %s", telemetry_topic)

            # Subscribe to alert acknowledgments from the dashboard
            ack_topic = f"{self.topic_prefix}/+/+/+/event/ack"
            client.subscribe(ack_topic, qos=1)
        else:
            logger.error("Edge Gateway MQTT connection failed with code: %s", reason_code)

    def _on_disconnect(self, client, userdata, disconnect_flags, reason_code, properties) -> None:
        logger.warning("Edge Gateway disconnected from MQTT broker: %s", reason_code)

    def _on_message(self, client, userdata, msg) -> None:
        """Core Edge processing pipeline execution."""
        topic = msg.topic

        # Handle Alert Acknowledgments
        if topic.endswith("/event/ack"):
            self._handle_alert_ack(msg.payload)
            return

        # 1. Validation & Schema check
        valid, telemetry, err_reason = self.validator.validate_raw_message(msg.payload)
        if not valid or telemetry is None:
            # Drop invalid payload, already counted in validator
            return

        # 2. Idempotent Deduplication
        if self.deduplicator.is_duplicate(telemetry.device_id, telemetry.sequence, time.time()):
            return

        # 3. Normalization & Enrichment
        normalized = self.normalizer.normalize(telemetry)
        self.latencies.append(normalized.processing_latency_ms)
        if len(self.latencies) > 1000:
            self.latencies.pop(0)

        # 4. Anomaly Detection Rules
        events = self.anomaly_engine.evaluate(normalized)
        for evt in events:
            self._publish_alert(evt)

        # 5. Persist Raw Telemetry
        self.storage.write_raw_telemetry(normalized)

        # 6. Time-Window Aggregation
        agg = self.aggregator.add_telemetry(normalized)
        if agg is not None:
            self.storage.write_aggregate(agg)

    def _publish_alert(self, event: AnomalyEvent) -> None:
        topic = f"{self.topic_prefix}/{event.site_id}/{event.line_id}/{event.device_id}/event"
        payload_str = event.model_dump_json()
        self.client.publish(topic, payload=payload_str, qos=1)
        logger.warning(
            "ALARM TRIGGERED [%s] Device: %s | %s: %s (Threshold: %s)",
            event.severity.value,
            event.device_id,
            event.variable,
            event.observed_value,
            event.threshold,
        )

    def _handle_alert_ack(self, raw_bytes: bytes) -> None:
        try:
            data = json.loads(raw_bytes.decode("utf-8"))
            event_id = data.get("event_id")
            note = data.get("note", "Acknowledged by operator")
            logger.info("Operator ACKNOWLEDGED alarm [%s]: %s", event_id, note)
        except Exception as e:
            logger.error("Failed to parse alert ACK: %s", e)

    def run_health_loop(self) -> None:
        """Periodic maintenance: storage connection verification and metric reporting."""
        last_metric_log = time.time()
        while self.running:
            time.sleep(5)
            self.storage.check_health()

            # Every 30 seconds, report edge performance metrics
            if time.time() - last_metric_log >= 30:
                last_metric_log = time.time()
                val_m = self.validator.get_metrics()
                dedup_m = self.deduplicator.get_metrics()
                p95_lat = sorted(self.latencies)[int(len(self.latencies) * 0.95)] if self.latencies else 0.0
                logger.info(
                    "EDGE METRICS | Processed: %d | Rejections: %d (%.1f%%) | Duplicates: %d | p95 Latency: %.2f ms",
                    val_m["total_processed"],
                    val_m["rejected_count"],
                    val_m["rejection_rate_pct"],
                    dedup_m["duplicate_count"],
                    p95_lat,
                )


def main() -> None:
    gateway = EdgeGateway()
    gateway.start()

    def handle_signal(sig, frame):
        logger.info("Signal %s received. Shutting down Edge Gateway...", sig)
        gateway.stop()
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    try:
        gateway.run_health_loop()
    except KeyboardInterrupt:
        pass
    finally:
        gateway.stop()


if __name__ == "__main__":
    main()
