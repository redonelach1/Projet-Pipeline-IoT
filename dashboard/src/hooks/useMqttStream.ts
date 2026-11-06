"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import mqtt, { MqttClient } from "mqtt";
import { TelemetryPayload, AnomalyEvent, ScenarioType, DeviceStatus } from "@/types/iiot";

interface StreamStats {
  totalMessages: number;
  messagesPerSecond: number;
  averageLatencyMs: number;
  connectedAt: string | null;
}

export function useMqttStream() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [devices, setDevices] = useState<Record<string, TelemetryPayload>>({});
  const [statuses, setStatuses] = useState<Record<string, DeviceStatus>>({});
  const [history, setHistory] = useState<
    Record<
      string,
      Array<{
        time: string;
        temp: number;
        press: number;
        vib: number;
        hum: number;
      }>
    >
  >({});
  const [alerts, setAlerts] = useState<AnomalyEvent[]>([]);
  const [stats, setStats] = useState<StreamStats>({
    totalMessages: 0,
    messagesPerSecond: 0,
    averageLatencyMs: 0,
    connectedAt: null,
  });

  const clientRef = useRef<MqttClient | null>(null);
  const msgCountWindowRef = useRef<number>(0);
  const latencySumRef = useRef<number>(0);
  const latencyCountRef = useRef<number>(0);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_MQTT_WS_URL || "ws://localhost:9001";
    console.log(`[IIoT SCADA] Connecting to Mosquitto WebSocket stream: ${wsUrl}`);

    const client = mqtt.connect(wsUrl, {
      clientId: `nextjs_scada_${Math.random().toString(16).substring(2, 8)}`,
      clean: true,
      reconnectPeriod: 2000,
      connectTimeout: 5000,
    });

    clientRef.current = client;

    client.on("connect", () => {
      console.log("[IIoT SCADA] WebSocket connection established.");
      setIsConnected(true);
      setStats((prev) => ({
        ...prev,
        connectedAt: new Date().toISOString(),
      }));

      // Subscribe to all topics in the ENSAM IIoT hierarchy
      client.subscribe("ensam/iiot/+/+/+/telemetry", { qos: 1 });
      client.subscribe("ensam/iiot/+/+/+/status", { qos: 1 });
      client.subscribe("ensam/iiot/+/+/+/event", { qos: 1 });
    });

    client.on("disconnect", () => {
      setIsConnected(false);
    });

    client.on("error", (err) => {
      console.warn("[IIoT SCADA] MQTT Client error:", err);
    });

    client.on("message", (topic: string, message: Buffer) => {
      try {
        const payloadStr = message.toString();
        const data = JSON.parse(payloadStr);

        msgCountWindowRef.current += 1;

        if (topic.endsWith("/telemetry")) {
          const telemetry = data as TelemetryPayload;
          const devId = telemetry.device_id;

          // Latency computation
          let latency = 0;
          try {
            const sendTime = new Date(telemetry.timestamp).getTime();
            latency = Math.max(0, Date.now() - sendTime);
          } catch {
            latency = 0;
          }
          telemetry.latency_ms = latency;
          latencySumRef.current += latency;
          latencyCountRef.current += 1;

          setDevices((prev) => ({
            ...prev,
            [devId]: telemetry,
          }));

          // Append to rolling chart history (max 30 points per device)
          const timeLabel = new Date(telemetry.timestamp).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          setHistory((prev) => {
            const currentList = prev[devId] || [];
            const nextList = [
              ...currentList,
              {
                time: timeLabel,
                temp: telemetry.measurements.temperature_c,
                press: telemetry.measurements.pressure_bar,
                vib: telemetry.measurements.vibration_mm_s,
                hum: telemetry.measurements.humidity_pct,
              },
            ].slice(-30);
            return { ...prev, [devId]: nextList };
          });
        } else if (topic.endsWith("/status")) {
          const status = data as DeviceStatus;
          status.last_seen = new Date().toISOString();
          setStatuses((prev) => ({
            ...prev,
            [status.device_id]: status,
          }));
        } else if (topic.endsWith("/event")) {
          const event = data as AnomalyEvent;
          setAlerts((prev) => {
            // Avoid duplicate events
            if (prev.some((a) => a.event_id === event.event_id)) return prev;
            return [event, ...prev].slice(0, 100);
          });
        }
      } catch (err) {
        console.error("[IIoT SCADA] Message handling error:", err);
      }
    });

    // 1-second interval to compute throughput rate and average latency
    const intervalId = setInterval(() => {
      const throughput = msgCountWindowRef.current;
      msgCountWindowRef.current = 0;

      const avgLat =
        latencyCountRef.current > 0
          ? Math.round((latencySumRef.current / latencyCountRef.current) * 10) / 10
          : 0;

      latencySumRef.current = 0;
      latencyCountRef.current = 0;

      setStats((prev) => ({
        ...prev,
        totalMessages: prev.totalMessages + throughput,
        messagesPerSecond: throughput,
        averageLatencyMs: avgLat,
      }));
    }, 1000);

    return () => {
      clearInterval(intervalId);
      client.end(true);
    };
  }, []);

  // Publish fault injection command to simulator
  const publishCommand = useCallback(
    (
      deviceId: string | "all",
      action: "set_scenario" | "reset",
      scenario?: ScenarioType,
      durationSec: number = 30
    ) => {
      if (!clientRef.current || !clientRef.current.connected) {
        console.warn("[IIoT SCADA] Cannot publish command: MQTT client disconnected.");
        return;
      }

      const targetTopic =
        deviceId === "all"
          ? "ensam/iiot/command"
          : `ensam/iiot/site-a/line-1/${deviceId}/command`;

      const cmd = {
        action,
        device_id: deviceId === "all" ? undefined : deviceId,
        scenario: action === "set_scenario" ? scenario : undefined,
        duration_sec: durationSec,
      };

      clientRef.current.publish(targetTopic, JSON.stringify(cmd), { qos: 1 });
      console.log(`[IIoT SCADA] Published simulation command to ${targetTopic}:`, cmd);
    },
    []
  );

  // Acknowledge an alarm
  const acknowledgeAlert = useCallback((eventId: string, note: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.event_id === eventId
          ? {
              ...a,
              acknowledged: true,
              ack_note: note,
              ack_timestamp: new Date().toISOString(),
            }
          : a
      )
    );

    if (clientRef.current && clientRef.current.connected) {
      const ackPayload = {
        event_id: eventId,
        note,
        timestamp: new Date().toISOString(),
      };
      clientRef.current.publish(
        "ensam/iiot/site-a/line-1/system/event/ack",
        JSON.stringify(ackPayload),
        { qos: 1 }
      );
    }
  }, []);

  return {
    isConnected,
    devices,
    statuses,
    history,
    alerts,
    stats,
    publishCommand,
    acknowledgeAlert,
  };
}

