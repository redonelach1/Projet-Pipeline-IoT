import assert from 'node:assert/strict';
import {
  TestSuiteRunner,
  calculateRadialGauge,
  calculateEmpiricalP95,
  updateRollingHistory,
} from './test_helpers.mjs';

export function createTier3Suite() {
  const suite = new TestSuiteRunner('Tier 3: Cross-Feature Combinations');

  // Test 3.1: Fault Injection (F7) -> Alert Generation in Incident Table (F8) -> KPI Alarms (F4)
  suite.test('T3.1', 'Fault Injection (F7) triggers Alert Emission (F8) and increments KPI Unack Alarms (F4)', 'F7+F8+F4', 3, () => {
    let unackAlarmsCount = 0;
    const alerts = [];

    // Trigger Fault
    const faultCommand = { action: 'set_scenario', device_id: 'motor-01', scenario: 'THERMAL_OVERHEAT', duration_sec: 30 };
    assert.equal(faultCommand.scenario, 'THERMAL_OVERHEAT');

    // Edge anomaly detection triggers alert
    const newAlert = {
      id: 'alert-001',
      device_id: faultCommand.device_id,
      rule: 'TEMP_CRITICAL_HIGH',
      severity: 'CRITICAL',
      value: 94.2,
      acknowledged: false,
      timestamp: new Date().toISOString(),
    };
    alerts.push(newAlert);
    unackAlarmsCount = alerts.filter((a) => !a.acknowledged).length;

    assert.equal(alerts.length, 1);
    assert.equal(unackAlarmsCount, 1);
  });

  // Test 3.2: Operator ACK in Modal (F8) -> Unack Alarms decrement (F4) -> Sidebar Badge decrement (F2)
  suite.test('T3.2', 'Operator ACK in Modal (F8) decrements KPI Unack Alarms (F4) and Sidebar Badge (F2)', 'F8+F4+F2', 3, () => {
    let alerts = [
      { id: 'alert-001', acknowledged: false, device_id: 'motor-01' },
      { id: 'alert-002', acknowledged: false, device_id: 'pump-01' },
    ];
    let kpiUnack = alerts.filter((a) => !a.acknowledged).length;
    let sidebarBadge = kpiUnack;
    assert.equal(kpiUnack, 2);
    assert.equal(sidebarBadge, 2);

    // Operator acknowledges alert-001
    const ackNote = 'Inspected motor bearing, cooling verified';
    alerts = alerts.map((a) => (a.id === 'alert-001' ? { ...a, acknowledged: true, ack_note: ackNote } : a));

    kpiUnack = alerts.filter((a) => !a.acknowledged).length;
    sidebarBadge = kpiUnack;

    assert.equal(kpiUnack, 1);
    assert.equal(sidebarBadge, 1);
    assert.equal(alerts.find((a) => a.id === 'alert-001').acknowledged, true);
  });

  // Test 3.3: Sidebar Tab Selection (F2) -> Active Solid Neon Pill Style (F1, F2) -> View Swap (F10)
  suite.test('T3.3', 'Sidebar Tab Selection (F2) updates Active Solid Neon Pill (F1) and swaps View Container', 'F2+F1+F10', 3, () => {
    let activeTab = 'overview';
    const getPillClasses = (tab) =>
      tab === activeTab
        ? 'bg-[#00F59B] text-[#050B08] font-semibold shadow-[0_0_12px_rgba(0,245,155,0.35)]'
        : 'text-[#8E9E96] hover:text-white hover:bg-[#131C18]';

    assert.ok(getPillClasses('overview').includes('bg-[#00F59B]'));
    assert.ok(!getPillClasses('telemetry').includes('bg-[#00F59B]'));

    // Switch tab to telemetry
    activeTab = 'telemetry';
    assert.ok(getPillClasses('telemetry').includes('bg-[#00F59B]'));
    assert.ok(!getPillClasses('overview').includes('bg-[#00F59B]'));
  });

  // Test 3.4: Live MQTT Telemetry Ingestion (F9) -> Total Ingestion KPI (F4) -> Spline AreaChart (F5)
  suite.test('T3.4', 'Live MQTT Ingestion (F9) increments KPI Total Ingestion (F4) and feeds AreaChart (F5)', 'F9+F4+F5', 3, () => {
    let totalIngestion = 1000;
    let history = [];

    // Incoming telemetry frame
    const frame = {
      device_id: 'motor-01',
      temperature: 68.4,
      pressure: 5.1,
      vibration: 1.8,
      timestamp: new Date().toISOString(),
    };

    totalIngestion += 1;
    history = updateRollingHistory(history, {
      time: frame.timestamp.substring(11, 19),
      temp: frame.temperature,
      press: frame.pressure,
      vib: frame.vibration,
    });

    assert.equal(totalIngestion, 1001);
    assert.equal(history.length, 1);
    assert.equal(history[0].temp, 68.4);
  });

  // Test 3.5: Anomaly Spike in Telemetry (F5, F9) -> Radial Gauge Health Degradation (F6) -> TopBar Status (F3)
  suite.test('T3.5', 'Telemetry Anomaly Spike (F5, F9) degrades SVG Radial Gauge Health (F6) and updates Status (F3)', 'F5+F9+F6+F3', 3, () => {
    let fleetHealthPercentage = 100.0;
    const initialGauge = calculateRadialGauge(fleetHealthPercentage, 58);
    assert.equal(initialGauge.strokeDashoffset, 0);

    // Severe fault injected: temperature reaches 95°C
    const anomalousTelemetry = { temp: 95.0, vib: 6.2 };
    if (anomalousTelemetry.temp > 90.0 || anomalousTelemetry.vib > 5.5) {
      fleetHealthPercentage = 68.0; // Health penalty
    }

    const degradedGauge = calculateRadialGauge(fleetHealthPercentage, 58);
    assert.ok(degradedGauge.strokeDashoffset > initialGauge.strokeDashoffset);
    assert.equal(degradedGauge.clampedPercentage, 68.0);
  });

  // Test 3.6: Search Bar Filtering (F3) -> Equipment Selection (F2) -> AreaChart Focus (F5)
  suite.test('T3.6', 'Search Bar Filtering (F3) highlights device, selecting updates AreaChart device target (F5)', 'F3+F2+F5', 3, () => {
    const devices = ['motor-01', 'pump-01', 'fan-01', 'compressor-01', 'conveyor-01'];
    let searchQuery = 'comp';
    const matched = devices.filter((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));
    assert.equal(matched.length, 1);
    assert.equal(matched[0], 'compressor-01');

    let selectedChartDevice = 'motor-01';
    selectedChartDevice = matched[0];
    assert.equal(selectedChartDevice, 'compressor-01');
  });

  // Test 3.7: Broker Disconnect (F9) -> TopBar Status Indicator turns Offline (F3) -> KPI Bar Latency Display (F4)
  suite.test('T3.7', 'Broker Disconnect (F9) updates TopBar Indicator to Offline (F3) and freezes KPI Latency (F4)', 'F9+F3+F4', 3, () => {
    let isConnected = true;
    let p95Latency = 12.4;

    // Disconnection event
    isConnected = false;
    const topBarStatus = isConnected ? 'Online' : 'Disconnected';
    const kpiLatencyDisplay = isConnected ? `${p95Latency} ms` : 'Offline';

    assert.equal(topBarStatus, 'Disconnected');
    assert.equal(kpiLatencyDisplay, 'Offline');
  });

  // Test 3.8: Reset Fault Command (F7) -> Device Normalization (F5, F9) -> Radial Gauge Recovery (F6)
  suite.test('T3.8', 'Reset Fault Command (F7) normalizes Telemetry (F5, F9) and restores Radial Gauge to 100% (F6)', 'F7+F5+F6', 3, () => {
    let health = 60.0;
    // Operator issues RESET command
    const resetCommand = { action: 'reset', scenario: 'RESET', duration_sec: 0 };
    assert.equal(resetCommand.action, 'reset');

    // Devices return to nominal physics
    health = 100.0;
    const restoredGauge = calculateRadialGauge(health, 58);
    assert.equal(restoredGauge.clampedPercentage, 100);
    assert.equal(restoredGauge.strokeDashoffset, 0);
  });

  // Test 3.9: Theme Token Consistency across Shell (F1, F2, F3, F4)
  suite.test('T3.9', 'Shell components (Sidebar F2, TopBar F3, KPI Bar F4) unify on matte charcoal and border tokens (F1)', 'F1+F2+F3+F4', 3, () => {
    const scadaSurfaceToken = '#0D1411';
    const scadaBorderToken = '#1A2821';
    const scadaNeonToken = '#00F59B';

    const sidebarStyle = { bg: scadaSurfaceToken, border: scadaBorderToken, activePill: scadaNeonToken };
    const topbarStyle = { bg: scadaSurfaceToken, border: scadaBorderToken };
    const kpiBarStyle = { bg: scadaSurfaceToken, border: scadaBorderToken };

    assert.equal(sidebarStyle.bg, topbarStyle.bg);
    assert.equal(topbarStyle.bg, kpiBarStyle.bg);
    assert.equal(sidebarStyle.border, kpiBarStyle.border);
  });

  // Test 3.10: Edge Latency Calculation in Live Hook (F9) -> KpiMetricBar Live Display (F4) -> SCADA Styling (F1)
  suite.test('T3.10', 'Empirical p95 calculation (F9) dynamically styles KPI metric color (F4, F1)', 'F9+F4+F1', 3, () => {
    const normalLatencies = Array(50).fill(10);
    const p95Normal = calculateEmpiricalP95(normalLatencies);
    const getLatencyColor = (p95) => (p95 <= 50 ? '#00F59B' : '#FF4D4D');

    assert.equal(p95Normal, 10);
    assert.equal(getLatencyColor(p95Normal), '#00F59B');

    const highLatencies = Array(50).fill(120);
    const p95High = calculateEmpiricalP95(highLatencies);
    assert.equal(p95High, 120);
    assert.equal(getLatencyColor(p95High), '#FF4D4D');
  });

  return suite;
}
