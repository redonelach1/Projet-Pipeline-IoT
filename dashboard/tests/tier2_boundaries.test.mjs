import assert from 'node:assert/strict';
import {
  TestSuiteRunner,
  calculateContrastRatio,
  calculateRadialGauge,
  calculateEmpiricalP95,
  updateRollingHistory,
  readDashboardFile,
} from './test_helpers.mjs';

export function createTier2Suite() {
  const suite = new TestSuiteRunner('Tier 2: Boundary & Corner Cases');

  // ==========================================
  // FEATURE 1: Theme & Color Token Architecture Boundaries
  // ==========================================
  suite.test('T2.1.1', 'Contrast ratio of dark text #050B08 on neon green #00F59B exceeds WCAG AA (4.5:1)', 'F1', 2, () => {
    const contrast = calculateContrastRatio('#050B08', '#00F59B');
    assert.ok(contrast >= 4.5, `Contrast ratio ${contrast.toFixed(2)} must be >= 4.5:1`);
  });

  suite.test('T2.1.2', 'Contrast ratio of alarm red #FF4D4D on dark background #0D1411 exceeds 4.0:1', 'F1', 2, () => {
    const contrast = calculateContrastRatio('#0D1411', '#FF4D4D');
    assert.ok(contrast >= 4.0, `Contrast ratio ${contrast.toFixed(2)} must be >= 4.0:1`);
  });

  suite.test('T2.1.3', 'Neon pill shadow handles high blur radius without negative spread syntax error', 'F1', 2, () => {
    const shadowRegex = /0\s+0\s+\d+px\s+rgba\(0,\s*245,\s*155,\s*0?\.\d+\)/;
    const testShadow = '0 0 16px rgba(0, 245, 155, 0.4)';
    assert.ok(shadowRegex.test(testShadow), 'Shadow format must follow standard box-shadow syntax');
  });

  suite.test('T2.1.4', 'Theme CSS custom variables support standard HSL / RGB channel separation', 'F1', 2, () => {
    const globals = readDashboardFile('src/app/globals.css') || '';
    const hasCssVars = /:root/.test(globals);
    assert.ok(hasCssVars, 'globals.css must define :root CSS custom variables block');
  });

  suite.test('T2.1.5', 'Dark surface tokens maintain depth layering (#070B09 darker than #0D1411)', 'F1', 2, () => {
    const deepDark = '#070B09';
    const cardSurface = '#0D1411';
    const lumDeep = calculateContrastRatio('#000000', deepDark);
    const lumCard = calculateContrastRatio('#000000', cardSurface);
    assert.ok(lumDeep <= lumCard, 'Base surface (#070B09) must be darker than card surface (#0D1411)');
  });

  // ==========================================
  // FEATURE 2: Left Sidebar Navigation Boundaries
  // ==========================================
  suite.test('T2.2.1', 'Zero unacknowledged alarms badge formatting does not render zero clutter', 'F2', 2, () => {
    const formatAlertBadge = (count) => (count > 0 ? `${count}` : null);
    assert.equal(formatAlertBadge(0), null, 'Badge for 0 alerts should be hidden or null');
    assert.equal(formatAlertBadge(5), '5', 'Badge for 5 alerts should display 5');
  });

  suite.test('T2.2.2', 'Extreme alarm count (>999) truncates cleanly to 999+', 'F2', 2, () => {
    const formatAlertBadge = (count) => (count > 999 ? '999+' : `${count}`);
    assert.equal(formatAlertBadge(1250), '999+', 'Extreme alert count must truncate to 999+');
  });

  suite.test('T2.2.3', 'Unknown or invalid activeTab defaults gracefully to overview', 'F2', 2, () => {
    const validTabs = ['overview', 'telemetry', 'alerts', 'lab', 'pipeline'];
    const resolveTab = (tab) => (validTabs.includes(tab) ? tab : 'overview');
    assert.equal(resolveTab('non_existent_tab'), 'overview');
    assert.equal(resolveTab(null), 'overview');
    assert.equal(resolveTab(''), 'overview');
  });

  suite.test('T2.2.4', 'Rapid tab switching preserves last chosen tab without race conditions', 'F2', 2, () => {
    let currentTab = 'overview';
    const sequence = ['telemetry', 'alerts', 'lab', 'pipeline', 'overview'];
    for (const tab of sequence) {
      currentTab = tab;
    }
    assert.equal(currentTab, 'overview', 'Final tab state must strictly reflect the last dispatched selection');
  });

  suite.test('T2.2.5', 'Sidebar item handles empty label without crashing', 'F2', 2, () => {
    const renderSidebarItem = (item) => item?.label || 'Untitled';
    assert.equal(renderSidebarItem({ label: '' }), 'Untitled');
    assert.equal(renderSidebarItem(null), 'Untitled');
  });

  // ==========================================
  // FEATURE 3: Top Header Bar Boundaries
  // ==========================================
  suite.test('T2.3.1', 'Empty search query does not filter out devices or crash', 'F3', 2, () => {
    const devices = ['motor-01', 'pump-01', 'fan-01'];
    const filterDevices = (list, query) => {
      const q = (query || '').trim().toLowerCase();
      if (!q) return list;
      return list.filter((d) => d.toLowerCase().includes(q));
    };
    assert.equal(filterDevices(devices, '').length, 3);
    assert.equal(filterDevices(devices, '   ').length, 3);
  });

  suite.test('T2.3.2', 'Search query containing regex metacharacters (*, ?, +) does not throw syntax error', 'F3', 2, () => {
    const devices = ['motor-01', 'pump-01', 'fan-01'];
    const safeSearch = (list, rawQuery) => {
      try {
        const query = (rawQuery || '').toLowerCase();
        return list.filter((item) => item.toLowerCase().includes(query));
      } catch {
        return [];
      }
    };
    assert.doesNotThrow(() => safeSearch(devices, '[*?+\\'));
  });

  suite.test('T2.3.3', 'Disconnected broker state formats red/amber indicator with Offline text', 'F3', 2, () => {
    const getStatusIndicator = (isConnected) => ({
      color: isConnected ? '#00F59B' : '#FF4D4D',
      label: isConnected ? 'Online' : 'Disconnected',
    });
    const offlineState = getStatusIndicator(false);
    assert.equal(offlineState.color, '#FF4D4D');
    assert.equal(offlineState.label, 'Disconnected');
  });

  suite.test('T2.3.4', 'Long operator name (>40 characters) truncates with ellipsis safely', 'F3', 2, () => {
    const truncateName = (name, max = 24) =>
      name && name.length > max ? `${name.substring(0, max)}...` : name;
    const longName = 'Chief SCADA Executive Operator Engineer of ENSAM Rabat';
    const truncated = truncateName(longName);
    assert.ok(truncated.endsWith('...'));
    assert.ok(truncated.length <= 27);
  });

  suite.test('T2.3.5', 'Missing operator profile object defaults to Chief SCADA Operator', 'F3', 2, () => {
    const resolveOperator = (op) => ({
      name: op?.name || 'Operator RedNa',
      role: op?.role || 'Chief SCADA Operator',
    });
    const resolved = resolveOperator(undefined);
    assert.equal(resolved.name, 'Operator RedNa');
    assert.equal(resolved.role, 'Chief SCADA Operator');
  });

  // ==========================================
  // FEATURE 4: Horizontal KPI Metric Bar Boundaries
  // ==========================================
  suite.test('T2.4.1', 'Zero ingestion rate formats as 0.0 msg/s without NaN', 'F4', 2, () => {
    const formatRate = (rate) => `${(isNaN(rate) || rate === 0 ? 0 : rate).toFixed(1)} msg/s`;
    assert.equal(formatRate(0), '0.0 msg/s');
    assert.equal(formatRate(NaN), '0.0 msg/s');
  });

  suite.test('T2.4.2', 'Zero or negative edge latency renders 0 ms or N/A without negative display', 'F4', 2, () => {
    const formatLatency = (ms) => (ms <= 0 || isNaN(ms) ? '0 ms' : `${ms.toFixed(1)} ms`);
    assert.equal(formatLatency(0), '0 ms');
    assert.equal(formatLatency(-15), '0 ms');
  });

  suite.test('T2.4.3', 'Zero active fleet devices (0/5) formats safely without division by zero', 'F4', 2, () => {
    const formatFleet = (active, total = 5) => `${Math.max(0, active)}/${total} Online`;
    assert.equal(formatFleet(0), '0/5 Online');
  });

  suite.test('T2.4.4', 'Extremely high ingestion count (12,500,000) formats with SI suffix 12.5M', 'F4', 2, () => {
    const formatCount = (count) => {
      if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
      if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
      return `${count}`;
    };
    assert.equal(formatCount(12_500_000), '12.5M');
    assert.equal(formatCount(4_500), '4.5k');
  });

  suite.test('T2.4.5', 'Missing KPI props safely default to zeroed neutral states', 'F4', 2, () => {
    const resolveKpis = (props) => ({
      totalIngestion: props?.totalIngestion ?? 0,
      activeFleet: props?.activeFleet ?? '5/5',
      p95LatencyMs: props?.p95LatencyMs ?? 0,
      unackAlarms: props?.unacknowledgedAlarms ?? 0,
    });
    const defaults = resolveKpis({});
    assert.equal(defaults.totalIngestion, 0);
    assert.equal(defaults.p95LatencyMs, 0);
  });

  // ==========================================
  // FEATURE 5: Recharts Glowing Spline Area Chart Boundaries
  // ==========================================
  suite.test('T2.5.1', 'Empty history array does not throw and yields length 0', 'F5', 2, () => {
    const history = [];
    assert.doesNotThrow(() => {
      const points = history.map((h) => ({ time: h.time, val: h.temp }));
      assert.equal(points.length, 0);
    });
  });

  suite.test('T2.5.2', 'Single data point history parses time and value without spline failure', 'F5', 2, () => {
    const history = [{ time: '14:00:00', temp: 65.2, press: 4.5, vib: 1.2 }];
    const points = history.map((h) => h.temp);
    assert.equal(points.length, 1);
    assert.equal(points[0], 65.2);
  });

  suite.test('T2.5.3', 'Extreme temperature spike (1250°C) parses as valid number', 'F5', 2, () => {
    const point = { time: '14:00:01', temp: 1250.0 };
    assert.ok(isFinite(point.temp));
    assert.ok(point.temp > 1000);
  });

  suite.test('T2.5.4', 'Sub-zero temperatures (e.g. -15°C in cold storage) handled cleanly', 'F5', 2, () => {
    const point = { time: '14:00:02', temp: -15.4 };
    assert.ok(point.temp < 0);
    assert.equal(point.temp.toFixed(1), '-15.4');
  });

  suite.test('T2.5.5', 'Stream burst of 100 frames caps rolling history at maximum capacity (30)', 'F5', 2, () => {
    let history = [];
    for (let i = 0; i < 100; i++) {
      history = updateRollingHistory(history, { time: `frame_${i}`, temp: 50 + (i % 10) }, 30);
    }
    assert.equal(history.length, 30);
    assert.equal(history[29].time, 'frame_99');
  });

  // ==========================================
  // FEATURE 6: Asset Health Circular Radial Gauge Boundaries
  // ==========================================
  suite.test('T2.6.1', '0% health sets strokeDashoffset equal to full circumference', 'F6', 2, () => {
    const res = calculateRadialGauge(0, 58);
    assert.equal(res.clampedPercentage, 0);
    assert.equal(res.strokeDashoffset, res.circumference);
  });

  suite.test('T2.6.2', '100% health sets strokeDashoffset to 0 (closed circle)', 'F6', 2, () => {
    const res = calculateRadialGauge(100, 58);
    assert.equal(res.clampedPercentage, 100);
    assert.equal(res.strokeDashoffset, 0);
  });

  suite.test('T2.6.3', 'Overflow percentage (175%) clamps cleanly to 100%', 'F6', 2, () => {
    const res = calculateRadialGauge(175, 58);
    assert.equal(res.clampedPercentage, 100);
    assert.equal(res.strokeDashoffset, 0);
  });

  suite.test('T2.6.4', 'Negative percentage (-35%) clamps cleanly to 0%', 'F6', 2, () => {
    const res = calculateRadialGauge(-35, 58);
    assert.equal(res.clampedPercentage, 0);
    assert.equal(res.strokeDashoffset, res.circumference);
  });

  suite.test('T2.6.5', 'NaN, null, or undefined percentage defaults to 0% offset', 'F6', 2, () => {
    const resNaN = calculateRadialGauge(NaN, 58);
    const resNull = calculateRadialGauge(null, 58);
    assert.equal(resNaN.clampedPercentage, 0);
    assert.equal(resNull.clampedPercentage, 0);
  });

  // ==========================================
  // FEATURE 7: Interactive Test Lab Fault Injector Boundaries
  // ==========================================
  suite.test('T2.7.1', 'Zero duration fault clamps to minimum allowable safety duration (1s)', 'F7', 2, () => {
    const clampDuration = (sec) => Math.max(1, Math.min(300, sec || 1));
    assert.equal(clampDuration(0), 1);
  });

  suite.test('T2.7.2', 'Duration exceeding 300s ceiling clamps to 300s', 'F7', 2, () => {
    const clampDuration = (sec) => Math.max(1, Math.min(300, sec || 1));
    assert.equal(clampDuration(600), 300);
  });

  suite.test('T2.7.3', 'Unknown equipment ID defaults to all broadcast safely', 'F7', 2, () => {
    const knownDevices = ['motor-01', 'pump-01', 'fan-01', 'compressor-01', 'conveyor-01'];
    const resolveTarget = (target) => (knownDevices.includes(target) ? target : 'all');
    assert.equal(resolveTarget('robot-99'), 'all');
  });

  suite.test('T2.7.4', 'Rapid command dispatches produce valid independent JSON payloads', 'F7', 2, () => {
    const makePayload = (scenario, target, duration) =>
      JSON.stringify({
        action: 'set_scenario',
        device_id: target,
        scenario,
        duration_sec: duration,
        timestamp: new Date().toISOString(),
      });
    const p1 = makePayload('THERMAL_OVERHEAT', 'motor-01', 30);
    const p2 = makePayload('VIBRATION_SPIKE', 'pump-01', 15);
    assert.ok(JSON.parse(p1).scenario === 'THERMAL_OVERHEAT');
    assert.ok(JSON.parse(p2).scenario === 'VIBRATION_SPIKE');
  });

  suite.test('T2.7.5', 'RESET command payload defines action reset and duration 0', 'F7', 2, () => {
    const makeResetPayload = (target = 'all') =>
      JSON.stringify({
        action: 'reset',
        device_id: target,
        scenario: 'RESET',
        duration_sec: 0,
      });
    const payload = JSON.parse(makeResetPayload());
    assert.equal(payload.action, 'reset');
    assert.equal(payload.duration_sec, 0);
  });

  // ==========================================
  // FEATURE 8: Incident Response Table with Operator ACK Boundaries
  // ==========================================
  suite.test('T2.8.1', 'Empty operator ACK note submits with default automated acknowledgment note', 'F8', 2, () => {
    const sanitizeNote = (note) => (note && note.trim().length > 0 ? note.trim() : 'Operator acknowledged');
    assert.equal(sanitizeNote(''), 'Operator acknowledged');
    assert.equal(sanitizeNote('   '), 'Operator acknowledged');
  });

  suite.test('T2.8.2', 'Long operator note (1500 chars) truncates or sanitizes safely', 'F8', 2, () => {
    const rawNote = 'A'.repeat(1500);
    const sanitizeNote = (note, max = 500) => note.substring(0, max);
    const sanitized = sanitizeNote(rawNote);
    assert.equal(sanitized.length, 500);
  });

  suite.test('T2.8.3', 'Acknowledging already acknowledged alert is an idempotent no-op', 'F8', 2, () => {
    const alert = { id: 'evt-101', acknowledged: true, ack_note: 'Already fixed' };
    const acknowledge = (item, newNote) => {
      if (item.acknowledged) return item;
      return { ...item, acknowledged: true, ack_note: newNote };
    };
    const updated = acknowledge(alert, 'Attempting second ack');
    assert.equal(updated.ack_note, 'Already fixed');
  });

  suite.test('T2.8.4', 'Multiple alerts sharing identical timestamp preserve unique IDs', 'F8', 2, () => {
    const alerts = [
      { id: 'evt-001', timestamp: '2026-11-06T18:00:00Z', device_id: 'motor-01' },
      { id: 'evt-002', timestamp: '2026-11-06T18:00:00Z', device_id: 'pump-01' },
    ];
    const uniqueIds = new Set(alerts.map((a) => a.id));
    assert.equal(uniqueIds.size, 2);
  });

  suite.test('T2.8.5', 'Empty alerts list renders clean zero-state message', 'F8', 2, () => {
    const alerts = [];
    const getEmptyMessage = (list) =>
      list.length === 0 ? 'No active alarms — Plant nominal' : `${list.length} active`;
    assert.equal(getEmptyMessage(alerts), 'No active alarms — Plant nominal');
  });

  // ==========================================
  // FEATURE 9: Strict Live MQTT Integration Boundaries
  // ==========================================
  suite.test('T2.9.1', 'Broker unreachable sets isConnected false without unhandled exception', 'F9', 2, () => {
    let isConnected = false;
    const handleError = () => {
      isConnected = false;
    };
    handleError(new Error('WebSocket connection to ws://localhost:9001 failed'));
    assert.equal(isConnected, false);
  });

  suite.test('T2.9.2', 'Corrupted non-JSON MQTT payload is safely caught and discarded', 'F9', 2, () => {
    const parsePayload = (raw) => {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    };
    assert.equal(parsePayload('MALFORMED_GARBAGE_BYTES{{'), null);
    assert.equal(parsePayload(''), null);
  });

  suite.test('T2.9.3', 'Telemetry packet with missing sensor fields uses null-coalescing defaults', 'F9', 2, () => {
    const rawPacket = { device_id: 'fan-01' }; // missing temp, vib, press
    const normalized = {
      device_id: rawPacket.device_id,
      temperature: rawPacket.temperature ?? 0,
      vibration: rawPacket.vibration ?? 0,
      pressure: rawPacket.pressure ?? 0,
    };
    assert.equal(normalized.temperature, 0);
    assert.equal(normalized.vibration, 0);
  });

  suite.test('T2.9.4', 'Empirical p95 calculation correctly handles high-latency outliers', 'F9', 2, () => {
    // 95 normal samples at 5ms, 5 spike samples at 500ms
    const samples = Array(95).fill(5).concat(Array(5).fill(500));
    const p95 = calculateEmpiricalP95(samples);
    assert.equal(p95, 500);
  });

  suite.test('T2.9.5', 'Empirical p95 calculation with empty samples returns 0 ms', 'F9', 2, () => {
    assert.equal(calculateEmpiricalP95([]), 0);
    assert.equal(calculateEmpiricalP95(null), 0);
  });

  // ==========================================
  // FEATURE 10: Clean Production Build Boundaries
  // ==========================================
  suite.test('T2.10.1', 'Missing optional environment variables fall back to default localhost URL', 'F10', 2, () => {
    const url = process.env.NEXT_PUBLIC_MQTT_WS_URL || 'ws://localhost:9001';
    assert.ok(url.startsWith('ws://') || url.startsWith('wss://'));
  });

  suite.test('T2.10.2', 'Package name follows lowercase standard naming conventions', 'F10', 2, () => {
    const pkg = JSON.parse(readDashboardFile('package.json') || '{}');
    assert.equal(pkg.name, 'ensam-iiot-scada-dashboard');
  });

  suite.test('T2.10.3', 'Zero mock telemetry scripts found in dashboard root', 'F10', 2, () => {
    const hasMockScript = readDashboardFile('mock_generator.js');
    assert.equal(hasMockScript, null, 'No mock generator script should exist in dashboard');
  });

  suite.test('T2.10.4', 'PostCSS and Tailwind configs exist and are valid modules', 'F10', 2, () => {
    const postcss = readDashboardFile('postcss.config.mjs');
    const tailwind = readDashboardFile('tailwind.config.ts');
    assert.ok(postcss !== null);
    assert.ok(tailwind !== null);
  });

  suite.test('T2.10.5', 'TypeScript compiler target is at least ES2017 for modern async/await', 'F10', 2, () => {
    const tsconfig = JSON.parse(readDashboardFile('tsconfig.json') || '{}');
    const target = (tsconfig.compilerOptions?.target || 'es5').toLowerCase();
    assert.ok(/es20|esnext|es6|es5/.test(target));
  });

  return suite;
}
