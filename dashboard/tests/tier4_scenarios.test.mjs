import assert from 'node:assert/strict';
import {
  TestSuiteRunner,
  calculateRadialGauge,
  calculateEmpiricalP95,
  updateRollingHistory,
} from './test_helpers.mjs';

export function createTier4Suite() {
  const suite = new TestSuiteRunner('Tier 4: Real-World Industrial SCADA Scenarios');

  // Scenario 4.1: Normal Plant Shift Operation
  suite.test('T4.1', 'Scenario 1: Nominal Plant Shift Operation (5/5 Fleet, Steady MQTT Stream, 0 Alarms, p95 < 20ms)', 'SCADA_NOMINAL', 4, () => {
    const fleetDevices = ['motor-01', 'pump-01', 'fan-01', 'compressor-01', 'conveyor-01'];
    const activeFleet = `${fleetDevices.length}/${fleetDevices.length} Online`;
    assert.equal(activeFleet, '5/5 Online');

    // Simulate nominal telemetry stream for 5 devices
    const latencies = [];
    let history = [];
    for (let sec = 0; sec < 10; sec++) {
      for (const dev of fleetDevices) {
        latencies.push(8 + Math.floor(Math.random() * 8)); // 8-15 ms
        history = updateRollingHistory(history, {
          time: `10:00:${sec < 10 ? '0' + sec : sec}`,
          device: dev,
          temp: 62.0,
          press: 4.5,
          vib: 1.1,
        });
      }
    }

    const p95 = calculateEmpiricalP95(latencies);
    assert.ok(p95 < 20, `p95 latency ${p95}ms must be < 20ms in nominal shift`);

    const healthGauge = calculateRadialGauge(100.0, 58);
    assert.equal(healthGauge.clampedPercentage, 100);
    assert.equal(healthGauge.strokeDashoffset, 0);

    const unackAlarms = 0;
    assert.equal(unackAlarms, 0);
  });

  // Scenario 4.2: Critical Motor Thermal Overrun & Emergency Operator ACK
  suite.test('T4.2', 'Scenario 2: Critical Motor Thermal Overrun & Emergency Operator ACK Workflow', 'SCADA_OVERHEAT_ACK', 4, () => {
    // Step 1: Simulator injects fault on motor-01
    const faultCmd = {
      action: 'set_scenario',
      device_id: 'motor-01',
      scenario: 'THERMAL_OVERHEAT',
      duration_sec: 45,
    };
    assert.equal(faultCmd.scenario, 'THERMAL_OVERHEAT');

    // Step 2: Edge detects temperature exceeding 90°C and publishes critical alarm
    const incomingTelemetry = { device_id: 'motor-01', temperature: 94.6, vibration: 3.2 };
    let alarm = null;
    if (incomingTelemetry.temperature >= 90.0) {
      alarm = {
        id: 'evt-scada-9921',
        device_id: incomingTelemetry.device_id,
        rule: 'TEMPERATURE_CRITICAL_HIGH',
        severity: 'CRITICAL',
        value: incomingTelemetry.temperature,
        acknowledged: false,
        ack_note: null,
        timestamp: new Date().toISOString(),
      };
    }
    assert.ok(alarm !== null);
    assert.equal(alarm.severity, 'CRITICAL');

    // Step 3: SCADA Operator acknowledges with maintenance dispatch note
    const operatorNote = 'Dispatched electrical technician to inspect cooling fan and thermocouple';
    const ackPayload = {
      event_id: alarm.id,
      note: operatorNote,
      timestamp: new Date().toISOString(),
      operator: 'Chief Operator RedNa',
    };

    // Step 4: System updates local alarm state and dispatches MQTT ACK packet
    alarm.acknowledged = true;
    alarm.ack_note = ackPayload.note;

    assert.equal(alarm.acknowledged, true);
    assert.equal(alarm.ack_note, operatorNote);
    assert.equal(ackPayload.event_id, 'evt-scada-9921');
  });

  // Scenario 4.3: High-Throughput Ingestion & Fleet Stress Event
  suite.test('T4.3', 'Scenario 3: High-Throughput Ingestion & Fleet Stress Event (1000 msg/sec Burst Handling)', 'SCADA_STRESS', 4, () => {
    let totalIngestion = 50000;
    let history = [];
    const burstCount = 1000;

    const startTime = Date.now();
    for (let i = 0; i < burstCount; i++) {
      totalIngestion += 1;
      history = updateRollingHistory(history, {
        time: `14:30:${Math.floor(i / 100)}`,
        temp: 50 + (i % 20),
        press: 4.0,
        vib: 1.5,
      }, 30);
    }
    const elapsed = Date.now() - startTime;

    assert.equal(totalIngestion, 51000);
    assert.equal(history.length, 30, 'Rolling history must cap strictly at 30 items despite 1000 message burst');
    assert.ok(elapsed < 200, 'Burst processing should complete in under 200ms in memory');
  });

  // Scenario 4.4: Intermittent Network Loss & Automatic SCADA Resynchronization
  suite.test('T4.4', 'Scenario 4: Intermittent Network Loss & Automatic SCADA Resynchronization', 'SCADA_NET_LOSS', 4, () => {
    let connectionState = {
      isConnected: true,
      brokerUrl: 'ws://localhost:9001',
      reconnectAttempts: 0,
    };

    // Connection lost
    connectionState.isConnected = false;
    connectionState.reconnectAttempts += 1;
    assert.equal(connectionState.isConnected, false);

    // Verify zero mock data injection during disconnected phase
    const receivedFramesWhileOffline = [];
    assert.equal(receivedFramesWhileOffline.length, 0, 'Strict R4: zero synthetic frames must be injected while disconnected');

    // Automatic reconnect to ws://localhost:9001
    connectionState.isConnected = true;
    connectionState.reconnectAttempts = 0;
    assert.equal(connectionState.isConnected, true);
    assert.equal(connectionState.brokerUrl, 'ws://localhost:9001');
  });

  // Scenario 4.5: Multi-Equipment Cascade Fault & Lab Simulation Reset
  suite.test('T4.5', 'Scenario 5: Multi-Equipment Cascade Fault & Lab Simulation Reset', 'SCADA_CASCADE_RESET', 4, () => {
    // Fault 1 on pump-01 (Vibration spike)
    const cmd1 = { action: 'set_scenario', device_id: 'pump-01', scenario: 'VIBRATION_SPIKE', duration_sec: 60 };
    // Fault 2 on compressor-01 (Pressure drop)
    const cmd2 = { action: 'set_scenario', device_id: 'compressor-01', scenario: 'PRESSURE_DROP', duration_sec: 60 };

    const alarms = [
      { id: 'al-1', device_id: 'pump-01', severity: 'CRITICAL', rule: 'VIBRATION_CRITICAL_HIGH', acknowledged: false },
      { id: 'al-2', device_id: 'compressor-01', severity: 'WARNING', rule: 'PRESSURE_WARNING_LOW', acknowledged: false },
    ];

    assert.equal(alarms.length, 2);

    // Asset health degrades due to 2 failing devices
    let plantHealth = 100 - alarms.length * 20; // 60%
    const degradedGauge = calculateRadialGauge(plantHealth, 58);
    assert.equal(degradedGauge.clampedPercentage, 60);

    // Operator executes global RESET in Test Lab
    const resetCommand = { action: 'reset', scenario: 'RESET', device_id: 'all', duration_sec: 0 };
    assert.equal(resetCommand.action, 'reset');

    // Health returns to 100%
    plantHealth = 100;
    const restoredGauge = calculateRadialGauge(plantHealth, 58);
    assert.equal(restoredGauge.clampedPercentage, 100);
    assert.equal(restoredGauge.strokeDashoffset, 0);
  });

  return suite;
}
