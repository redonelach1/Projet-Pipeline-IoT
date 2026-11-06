"""Automated benchmarking and experimental validation suite for ENSAM IIoT Pipeline.
Measures latency (p50, p90, p95), sustained throughput, and packet delivery across QoS levels.
"""

import os
import sys
import time
import json
import statistics
from typing import List, Dict, Any
from datetime import datetime, timezone
import paho.mqtt.client as mqtt

BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "localhost")
BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", "1883"))
TOPIC_BASE = "ensam/iiot/benchmark"


def run_latency_benchmark(num_messages: int = 100, qos: int = 1) -> Dict[str, Any]:
    latencies: List[float] = []
    received_count = 0
    echo_topic = f"{TOPIC_BASE}/qos_{qos}/echo"
    pub_topic = f"{TOPIC_BASE}/qos_{qos}/data"

    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=f"bench_client_qos{qos}")

    def on_message(c, userdata, msg):
        nonlocal received_count
        now = time.time()
        try:
            payload = json.loads(msg.payload.decode("utf-8"))
            sent_time = payload["sent_epoch"]
            lat = (now - sent_time) * 1000.0  # ms
            latencies.append(lat)
            received_count += 1
        except Exception as e:
            print(f"Error parsing benchmark packet: {e}")

    client.on_message = on_message
    client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
    client.subscribe(echo_topic, qos=qos)
    client.loop_start()

    # Diagnostic bounce consumer: echoes data back to echo topic
    bounce_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=f"bounce_qos{qos}")

    def on_bounce(c, userdata, msg):
        c.publish(echo_topic, payload=msg.payload, qos=qos)

    bounce_client.on_message = on_bounce
    bounce_client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
    bounce_client.subscribe(pub_topic, qos=qos)
    bounce_client.loop_start()

    time.sleep(0.5)

    start_bench = time.time()
    for seq in range(num_messages):
        payload = {
            "seq": seq,
            "sent_epoch": time.time(),
            "data": "A" * 64,
        }
        client.publish(pub_topic, json.dumps(payload), qos=qos)
        time.sleep(0.01)  # 10ms pacing

    # Wait for completion
    timeout = time.time() + 5.0
    while received_count < num_messages and time.time() < timeout:
        time.sleep(0.05)

    total_duration = time.time() - start_bench

    client.loop_stop()
    client.disconnect()
    bounce_client.loop_stop()
    bounce_client.disconnect()

    if not latencies:
        return {"error": "No messages received back"}

    latencies.sort()
    p50 = statistics.median(latencies)
    p90 = latencies[int(len(latencies) * 0.90)]
    p95 = latencies[int(len(latencies) * 0.95)]
    p99 = latencies[int(len(latencies) * 0.99)]
    mean_lat = statistics.mean(latencies)

    delivery_rate = (received_count / num_messages) * 100.0
    throughput = received_count / total_duration

    return {
        "qos": qos,
        "sent": num_messages,
        "received": received_count,
        "delivery_rate_pct": round(delivery_rate, 2),
        "throughput_msg_sec": round(throughput, 2),
        "latency_mean_ms": round(mean_lat, 2),
        "latency_p50_ms": round(p50, 2),
        "latency_p90_ms": round(p90, 2),
        "latency_p95_ms": round(p95, 2),
        "latency_p99_ms": round(p99, 2),
    }


def main():
    print("=" * 70)
    print("ENSAM RABAT — INDUSTRIE 4.0 — IIOT PIPELINE BENCHMARK")
    print(f"Target Broker: {BROKER_HOST}:{BROKER_PORT}")
    print("=" * 70)

    try:
        print("\n[1/2] Running QoS 0 latency & throughput benchmark (200 packets)...")
        res_qos0 = run_latency_benchmark(num_messages=200, qos=0)

        print("\n[2/2] Running QoS 1 latency & throughput benchmark (200 packets)...")
        res_qos1 = run_latency_benchmark(num_messages=200, qos=1)

        print("\n" + "=" * 70)
        print("EXPERIMENTAL RESULTS TABLE (Section 10 Academic Validation)")
        print("=" * 70)
        print(f"{'Metric':<25} | {'QoS 0':<15} | {'QoS 1':<15}")
        print("-" * 60)
        print(f"{'Delivery Rate (%)':<25} | {res_qos0.get('delivery_rate_pct', 'N/A'):<15} | {res_qos1.get('delivery_rate_pct', 'N/A'):<15}")
        print(f"{'Throughput (msg/s)':<25} | {res_qos0.get('throughput_msg_sec', 'N/A'):<15} | {res_qos1.get('throughput_msg_sec', 'N/A'):<15}")
        print(f"{'Latency Mean (ms)':<25} | {res_qos0.get('latency_mean_ms', 'N/A'):<15} | {res_qos1.get('latency_mean_ms', 'N/A'):<15}")
        print(f"{'Latency p50 (ms)':<25} | {res_qos0.get('latency_p50_ms', 'N/A'):<15} | {res_qos1.get('latency_p50_ms', 'N/A'):<15}")
        print(f"{'Latency p95 (ms)':<25} | {res_qos0.get('latency_p95_ms', 'N/A'):<15} | {res_qos1.get('latency_p95_ms', 'N/A'):<15}")
        print(f"{'Latency p99 (ms)':<25} | {res_qos0.get('latency_p99_ms', 'N/A'):<15} | {res_qos1.get('latency_p99_ms', 'N/A'):<15}")
        print("=" * 70)
    except Exception as e:
        print(f"Benchmark error (ensure Mosquitto broker is running): {e}")


if __name__ == "__main__":
    main()

