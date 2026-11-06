"""Main executable for the ENSAM IIoT Industrial Simulator."""

import os
import sys
import time
import signal
import logging
from pathlib import Path
from typing import Dict
from dotenv import load_dotenv

# Ensure local module directory is in sys.path
_current_dir = str(Path(__file__).resolve().parent)
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from devices import (
    IndustrialDevice,
    ElectricMotor,
    CentrifugalPump,
    AirCompressor,
    IndustrialConveyor,
)
from mqtt_publisher import SimulatorMQTTClient

# Setup structured logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s [%(levelname)s] [%(name)s]: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("SimulatorMain")

# Load environment configuration
load_dotenv()


def build_device_fleet(seed: int = 42) -> Dict[str, IndustrialDevice]:
    """Create the 5 baseline industrial assets with deterministic random seeds."""
    devices = {
        "motor-01": ElectricMotor("motor-01", site_id="site-a", line_id="line-1", seed=seed + 1),
        "motor-02": ElectricMotor("motor-02", site_id="site-a", line_id="line-1", seed=seed + 2),
        "pump-01": CentrifugalPump("pump-01", site_id="site-a", line_id="line-1", seed=seed + 3),
        "compressor-01": AirCompressor("compressor-01", site_id="site-a", line_id="line-2", seed=seed + 4),
        "conveyor-01": IndustrialConveyor("conveyor-01", site_id="site-a", line_id="line-2", seed=seed + 5),
    }
    return devices


def main() -> None:
    broker_host = os.getenv("MQTT_BROKER_HOST", "localhost")
    broker_port = int(os.getenv("MQTT_BROKER_PORT", "1883"))
    client_id = os.getenv("MQTT_CLIENT_ID_SIMULATOR", "ensam_sim_producer")
    topic_prefix = os.getenv("MQTT_TOPIC_PREFIX", "ensam/iiot")
    freq_hz = float(os.getenv("SIMULATOR_FREQUENCY_HZ", "1.0"))
    seed = int(os.getenv("SIMULATOR_RANDOM_SEED", "42"))

    logger.info("Initializing ENSAM IIoT Simulator (Fleet of 5 assets, Seed: %d)...", seed)
    devices = build_device_fleet(seed=seed)

    mqtt_client = SimulatorMQTTClient(
        broker_host=broker_host,
        broker_port=broker_port,
        client_id=client_id,
        topic_prefix=topic_prefix,
        devices=devices,
    )
    mqtt_client.start()

    running = True

    def handle_signal(sig, frame):
        nonlocal running
        logger.info("Shutdown signal received (%s). Exiting gracefully...", sig)
        running = False

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    sleep_interval = 1.0 / max(freq_hz, 0.1)
    logger.info("Simulator running at %.2f Hz (interval: %.2fs). Press Ctrl+C to stop.", freq_hz, sleep_interval)

    try:
        while running:
            start_loop = time.time()
            for dev_id, device in devices.items():
                payload = device.produce_payload()
                if payload is not None:
                    mqtt_client.publish_telemetry(device, payload, qos=1)

            elapsed = time.time() - start_loop
            sleep_duration = max(0.0, sleep_interval - elapsed)
            time.sleep(sleep_duration)

    except Exception as e:
        logger.critical("Unexpected error in simulation loop: %s", e, exc_info=True)
    finally:
        mqtt_client.stop()
        logger.info("Simulator process terminated.")


if __name__ == "__main__":
    main()
