"""MQTT publisher and command subscriber for the industrial simulator."""

import json
import logging
from typing import Dict, List, Optional, Callable
import paho.mqtt.client as mqtt

from .models import SimulationCommand, ScenarioType
from .devices import IndustrialDevice

logger = logging.getLogger("SimulatorMQTT")


class SimulatorMQTTClient:
    """Manages telemetry publishing and incoming simulation command handling."""

    def __init__(
        self,
        broker_host: str,
        broker_port: int,
        client_id: str,
        topic_prefix: str,
        devices: Dict[str, IndustrialDevice],
        on_command_received: Optional[Callable[[SimulationCommand], None]] = None,
    ) -> None:
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.client_id = client_id
        self.topic_prefix = topic_prefix.rstrip("/")
        self.devices = devices
        self.on_command_received = on_command_received

        # Paho MQTT Client setup
        self.client = mqtt.Client(
            mqtt.CallbackAPIVersion.VERSION2,
            client_id=self.client_id,
            protocol=mqtt.MQTTv5,
        )
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message
        self.client.reconnect_delay_set(min_delay=1, max_delay=30)
        self.is_connected = False

    def start(self) -> None:
        """Connect to the MQTT broker asynchronously."""
        logger.info(
            "Connecting simulator MQTT client to %s:%d ...",
            self.broker_host,
            self.broker_port,
        )
        try:
            self.client.connect(self.broker_host, self.broker_port, keepalive=60)
            self.client.loop_start()
        except Exception as e:
            logger.error("Failed to connect to broker: %s. Will retry...", e)

    def stop(self) -> None:
        """Disconnect and stop client loop."""
        self.client.loop_stop()
        self.client.disconnect()
        logger.info("Simulator MQTT client stopped.")

    def _on_connect(self, client, userdata, flags, reason_code, properties) -> None:
        if reason_code == 0:
            self.is_connected = True
            logger.info("Simulator connected successfully to broker (code: 0).")

            # Subscribe to command topics for fault injection from the Dashboard
            command_topic = f"{self.topic_prefix}/+/+/+/command"
            global_command_topic = f"{self.topic_prefix}/command"
            client.subscribe(command_topic, qos=1)
            client.subscribe(global_command_topic, qos=1)
            logger.info("Subscribed to command topics: %s and %s", command_topic, global_command_topic)

            # Publish initial device statuses
            for dev_id, dev in self.devices.items():
                self.publish_status(dev, "ONLINE")
        else:
            logger.error("Simulator connection refused with code %s", reason_code)

    def _on_disconnect(self, client, userdata, disconnect_flags, reason_code, properties) -> None:
        self.is_connected = False
        logger.warning("Simulator disconnected from broker: %s", reason_code)

    def _on_message(self, client, userdata, msg) -> None:
        """Process incoming simulation commands."""
        try:
            payload_str = msg.payload.decode("utf-8")
            data = json.loads(payload_str)
            command = SimulationCommand.model_validate(data)
            logger.info("Received simulation command on %s: %s", msg.topic, command)

            target_device_id = command.device_id
            if not target_device_id and "command" in msg.topic:
                # Extract device_id from topic ensam/iiot/{site}/{line}/{device}/command
                parts = msg.topic.split("/")
                if len(parts) >= 5:
                    target_device_id = parts[4]

            if target_device_id and target_device_id in self.devices:
                self._apply_command_to_device(self.devices[target_device_id], command)
            elif not target_device_id:
                # Apply globally to all devices
                for dev in self.devices.values():
                    self._apply_command_to_device(dev, command)

            if self.on_command_received:
                self.on_command_received(command)

        except Exception as e:
            logger.error("Failed to parse simulation command: %s", e)

    def _apply_command_to_device(self, device: IndustrialDevice, cmd: SimulationCommand) -> None:
        action = cmd.action.lower()
        if action == "set_scenario" and cmd.scenario:
            duration = cmd.duration_sec or 30
            device.set_scenario(cmd.scenario, duration_sec=duration)
            logger.info("Applied scenario %s to %s for %ds", cmd.scenario, device.device_id, duration)
        elif action == "reset":
            device.reset_scenario()
            logger.info("Reset %s to nominal operation", device.device_id)

    def publish_telemetry(self, device: IndustrialDevice, payload: dict, qos: int = 1) -> None:
        """Publish telemetry frame with QoS 1."""
        topic = f"{self.topic_prefix}/{device.site_id}/{device.line_id}/{device.device_id}/telemetry"
        msg_str = json.dumps(payload)
        self.client.publish(topic, payload=msg_str, qos=qos)

    def publish_status(self, device: IndustrialDevice, status_str: str) -> None:
        """Publish retained device state."""
        topic = f"{self.topic_prefix}/{device.site_id}/{device.line_id}/{device.device_id}/status"
        payload = {
            "device_id": device.device_id,
            "site_id": device.site_id,
            "line_id": device.line_id,
            "device_type": device.device_type,
            "connection_status": status_str,
            "machine_state": device.machine_state.value,
            "active_scenario": device.active_scenario.value,
        }
        self.client.publish(topic, payload=json.dumps(payload), qos=1, retain=True)

