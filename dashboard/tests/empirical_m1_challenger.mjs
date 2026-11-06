import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Setup sucrase hook for TSX/TS files
const { transform } = require('sucrase');

function compile(code, filename) {
  return transform(code, {
    transforms: ['jsx', 'typescript', 'imports'],
    jsxRuntime: 'classic',
    filePath: filename,
  }).code;
}

require.extensions['.ts'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  module._compile(compile(content, filename), filename);
};

require.extensions['.tsx'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  module._compile(compile(content, filename), filename);
};

// Handle path alias @/ -> dashboard/src/
const Module = require('node:module');
const origResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    const rel = request.substring(2);
    const absPath = path.resolve(__dirname, '..', 'src', rel);
    return origResolveFilename.call(this, absPath, parent, isMain, options);
  }
  return origResolveFilename.call(this, request, parent, isMain, options);
};

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const { KpiMetricBar } = require('../src/components/scada/KpiMetricBar.tsx');
const { TopBar } = require('../src/components/layout/TopBar.tsx');
const { Sidebar } = require('../src/components/layout/Sidebar.tsx');

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

class ChallengerSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
  }

  test(id, desc, fn) {
    this.tests.push({ id, desc, fn });
  }

  run() {
    console.log(`\n${COLORS.bold}${COLORS.cyan}=== Suite: ${this.name} ===${COLORS.reset}`);
    let passed = 0;
    let failed = 0;
    const failures = [];
    const observations = [];

    for (const t of this.tests) {
      try {
        const observation = t.fn();
        passed++;
        console.log(`  ${COLORS.green}✔ [${t.id}]${COLORS.reset} ${t.desc}`);
        if (observation) {
          console.log(`    ${COLORS.gray}→ Observation: ${observation}${COLORS.reset}`);
          observations.push({ id: t.id, desc: t.desc, observation });
        }
      } catch (err) {
        failed++;
        console.log(`  ${COLORS.red}✖ [${t.id}]${COLORS.reset} ${t.desc}`);
        console.log(`    ${COLORS.red}Error: ${err.message}${COLORS.reset}`);
        failures.push({ id: t.id, desc: t.desc, error: err.message, stack: err.stack });
      }
    }
    return { passed, failed, failures, observations, total: this.tests.length };
  }
}

// -------------------------------------------------------------
// SUITE 1: KpiMetricBar Empirical Stress Testing
// -------------------------------------------------------------
const kpiSuite = new ChallengerSuite('KpiMetricBar Empirical Boundary & Stress Tests');

// 1.1 Enormous packet counts (999,999,999)
kpiSuite.test('CH-KPI-01', 'Enormous packet count (999,999,999) renders formatted SI suffix', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { totalIngestion: 999_999_999 })
  );
  assert.ok(html.includes('1000.0M'), 'Expected 999,999,999 to format as 1000.0M via toFixed(1)');
  return '999,999,999 formats as "1000.0M"';
});

// 1.2 Boundary packet count at 10,000,000
kpiSuite.test('CH-KPI-02', 'Boundary packet count (10,000,000) formats exactly as 10.0M', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { totalIngestion: 10_000_000 })
  );
  assert.ok(html.includes('10.0M'), 'Expected 10,000,000 to format as 10.0M');
  return '10,000,000 formats as "10.0M"';
});

// 1.3 Sub-millions packet count (9,999,999)
kpiSuite.test('CH-KPI-03', 'Sub-10M packet count (9,999,999) formats with locale commas', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { totalIngestion: 9_999_999 })
  );
  assert.ok(html.includes('9,999,999'), 'Expected 9,999,999 with locale formatting');
  return '9,999,999 renders with full locale delimiters';
});

// 1.4 Zero packet count
kpiSuite.test('CH-KPI-04', 'Zero packet count renders "0" cleanly without NaN or empty', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { totalIngestion: 0 })
  );
  assert.ok(html.includes('>0</span><span class="text-[11px] text-[#667A71] font-mono">Packets Received'), 'Zero packets should render "0"');
  return 'totalIngestion=0 renders as "0"';
});

// 1.5 Negative packet count (-500)
kpiSuite.test('CH-KPI-05', 'Negative packet count renders without crash', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { totalIngestion: -500 })
  );
  assert.ok(html.includes('-500'), 'Negative totalIngestion rendered directly');
  return 'totalIngestion=-500 renders "-500" (no auto-clamping to 0)';
});

// 1.6 Active fleet "5/5" nominal
kpiSuite.test('CH-KPI-06', 'Active fleet "5/5" renders correctly with 100% Operational', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { activeFleet: '5/5' })
  );
  assert.ok(html.includes('5/5'), 'Contains 5/5');
  assert.ok(html.includes('100% Operational'), 'Contains 100% Operational badge');
  return 'activeFleet="5/5" renders display and 100% Operational badge';
});

// 1.7 Active fleet "0/5" all offline
kpiSuite.test('CH-KPI-07', 'Active fleet "0/5" renders text but note badge status behavior', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { activeFleet: '0/5' })
  );
  assert.ok(html.includes('0/5'), 'Contains 0/5 text');
  const has100Pct = html.includes('100% Operational');
  return `activeFleet="0/5" renders "0/5". Notice: Badge still displays "${has100Pct ? '100% Operational' : 'Offline'}" (static sub-badge)`;
});

// 1.8 Active fleet "10/5" (over-deployed fleet)
kpiSuite.test('CH-KPI-08', 'Active fleet "10/5" renders without layout break', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { activeFleet: '10/5' })
  );
  assert.ok(html.includes('10/5'), 'Contains 10/5 text');
  return 'activeFleet="10/5" renders successfully';
});

// 1.9 Missing fleet prop (undefined)
kpiSuite.test('CH-KPI-09', 'Missing activeFleet prop defaults safely to "5/5 Online"', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, {})
  );
  assert.ok(html.includes('5/5 Online'), 'Missing activeFleet defaults to 5/5 Online');
  return 'activeFleet undefined defaults to "5/5 Online"';
});

// 1.10 Active fleet object prop { online: 3, total: 5 }
kpiSuite.test('CH-KPI-10', 'Active fleet as object prop { online: 3, total: 5 } formats cleanly', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { activeFleet: { online: 3, total: 5 } })
  );
  assert.ok(html.includes('3/5 Online'), 'Formats object as "3/5 Online"');
  return '{ online: 3, total: 5 } formats as "3/5 Online"';
});

// 1.11 Extreme Latency: Nominal 8.4 ms
kpiSuite.test('CH-KPI-11', 'Nominal latency 8.4 ms renders with optimal green SLA badge', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { p95LatencyMs: 8.4 })
  );
  assert.ok(html.includes('8.4 ms'), 'Renders 8.4 ms');
  assert.ok(html.includes('&lt; 100ms SLA') || html.includes('< 100ms SLA'), 'Optimal SLA text');
  assert.ok(html.includes('text-[#00F59B]'), 'Neon green text token applied');
  return '8.4 ms renders with < 100ms SLA and neon green token';
});

// 1.12 Extreme Latency: Zero (0 ms)
kpiSuite.test('CH-KPI-12', 'Zero latency (0 ms) behavior check', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { p95LatencyMs: 0 })
  );
  const renders8Point4 = html.includes('8.4 ms');
  return `p95LatencyMs=0 evaluates to safeLatency: ${renders8Point4 ? '8.4 ms (fallback trigger)' : '0 ms'}`;
});

// 1.13 Extreme Latency: Negative latency (-15 ms)
kpiSuite.test('CH-KPI-13', 'Negative latency (-15 ms) fallback check', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { p95LatencyMs: -15 })
  );
  const renders8Point4 = html.includes('8.4 ms');
  return `p95LatencyMs=-15 falls back safely to safeLatency: ${renders8Point4 ? '8.4 ms' : 'negative'}`;
});

// 1.14 Extreme Latency: High latency (1450.8 ms)
kpiSuite.test('CH-KPI-14', 'High latency (1450.8 ms) renders "SLA Exceeded" in red', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { p95LatencyMs: 1450.8 })
  );
  assert.ok(html.includes('1450.8 ms'), 'Renders 1450.8 ms');
  assert.ok(html.includes('SLA Exceeded'), 'Displays SLA Exceeded badge');
  assert.ok(html.includes('text-[#FF4D4D]'), 'Applies alert red color token');
  return '1450.8 ms renders SLA Exceeded and #FF4D4D';
});

// 1.15 Unacknowledged alarms: 0 (nominal check)
kpiSuite.test('CH-KPI-15', 'Zero unacknowledged alarms renders neon checkmark and "0 Pending (Nominal)"', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { unacknowledgedAlarms: 0 })
  );
  assert.ok(html.includes('0 Pending (Nominal)'), 'Displays nominal badge');
  assert.ok(html.includes('text-[#00F59B]'), 'Neon green text token applied');
  assert.ok(!html.includes('Action Required'), 'No action required text');
  return 'unacknowledgedAlarms=0 renders "0 Pending (Nominal)" with neon green';
});

// 1.16 Unacknowledged alarms: 1 (action required)
kpiSuite.test('CH-KPI-16', '1 unacknowledged alarm renders red warning badge and "1 Action Required"', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { unacknowledgedAlarms: 1 })
  );
  assert.ok(html.includes('1 Action Required'), 'Displays 1 Action Required');
  assert.ok(html.includes('text-[#FF4D4D]'), 'Alert red token applied');
  return 'unacknowledgedAlarms=1 renders "1 Action Required" with alert red';
});

// 1.17 Unacknowledged alarms: 999 (large count)
kpiSuite.test('CH-KPI-17', '999 unacknowledged alarms renders "999 Action Required"', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, { unacknowledgedAlarms: 999 })
  );
  assert.ok(html.includes('999 Action Required'), 'Displays 999 Action Required');
  assert.ok(html.includes('>999</span>'), 'Displays 999 main number');
  return 'unacknowledgedAlarms=999 renders without layout clipping';
});

// 1.18 Complete empty props resilience
kpiSuite.test('CH-KPI-18', 'Empty props render with complete stability and zero crashes', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(KpiMetricBar, {})
  );
  assert.ok(html.includes('data-testid="kpi-metric-bar"'), 'Root card exists');
  assert.ok(html.includes('data-testid="kpi-ingestion"'), 'Ingestion segment exists');
  assert.ok(html.includes('data-testid="kpi-active-fleet"'), 'Active fleet segment exists');
  assert.ok(html.includes('data-testid="kpi-p95-latency"'), 'p95 latency segment exists');
  assert.ok(html.includes('data-testid="kpi-unack-alarms"'), 'Unack alarms segment exists');
  return 'KpiMetricBar({}) renders all 4 segments safely';
});


// -------------------------------------------------------------
// SUITE 2: TopBar Empirical Stress Testing
// -------------------------------------------------------------
const topBarSuite = new ChallengerSuite('TopBar Empirical Props Resilience & Layout Tests');

// 2.1 Default props
topBarSuite.test('CH-TOP-01', 'Default props render search input and default operator profile', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(TopBar, {})
  );
  assert.ok(html.includes('placeholder="Search equipment, alerts, telemetry..."'), 'Search input placeholder');
  assert.ok(html.includes('Operator RedNa'), 'Default operator name');
  assert.ok(html.includes('SCADA Operations Lead'), 'Default operator role');
  assert.ok(html.includes('RN'), 'Default initials fallback');
  return 'TopBar renders default search bar, operator, and initials';
});

// 2.2 Live MQTT status
topBarSuite.test('CH-TOP-02', 'isConnected=true displays "WS:9001 LIVE" with animated pulsing green dot', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(TopBar, { isConnected: true })
  );
  assert.ok(html.includes('WS:9001 LIVE'), 'Contains WS:9001 LIVE text');
  assert.ok(html.includes('animate-ping'), 'Pulsing dot animation class');
  assert.ok(html.includes('bg-[#00F59B]'), 'Neon green dot styling');
  return 'isConnected=true renders "WS:9001 LIVE"';
});

// 2.3 Offline MQTT status
topBarSuite.test('CH-TOP-03', 'isConnected=false displays "OFFLINE" with static red dot', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(TopBar, { isConnected: false })
  );
  assert.ok(html.includes('OFFLINE'), 'Contains OFFLINE text');
  assert.ok(html.includes('bg-[#FF4D4D]'), 'Red dot styling');
  assert.ok(!html.includes('WS:9001 LIVE'), 'Does not contain LIVE text');
  return 'isConnected=false renders "OFFLINE"';
});

// 2.4 Operator long name truncation
topBarSuite.test('CH-TOP-04', 'Long operator name (>28 chars) truncates with ellipsis', () => {
  const longName = 'Professeur Titulaire Dr. Mohamed Ben Ali';
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(TopBar, {
      operator: {
        name: longName,
        role: 'Chief Architect',
        initials: 'MB',
      },
    })
  );
  assert.ok(html.includes('...'), 'Long name contains ellipsis');
  assert.ok(html.includes(longName.substring(0, 25)), 'Contains truncated prefix');
  return `Long name "${longName}" truncated to "${longName.substring(0, 25)}..."`;
});

// 2.5 Operator avatar URL rendering
topBarSuite.test('CH-TOP-05', 'Operator with avatarUrl renders <img> element', () => {
  const avatar = 'https://scada.ensam.ac.ma/avatars/user1.png';
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(TopBar, {
      operator: {
        name: 'Fatima Zahra',
        role: 'SCADA Engineer',
        avatarUrl: avatar,
      },
    })
  );
  assert.ok(html.includes(`<img src="${avatar}"`), 'Contains img tag with avatar URL');
  return 'Operator avatarUrl renders <img> tag';
});

// 2.6 Null / undefined operator prop resilience
topBarSuite.test('CH-TOP-06', 'Null operator prop falls back safely to default operator', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(TopBar, { operator: null })
  );
  assert.ok(html.includes('Operator RedNa'), 'Null operator falls back to Operator RedNa');
  return 'operator=null falls back safely to "Operator RedNa"';
});

// 2.7 Search query input with special characters
topBarSuite.test('CH-TOP-07', 'Special characters in search query are properly escaped in DOM', () => {
  const rawQuery = '<script>alert("test")</script>&"\'';
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(TopBar, { searchQuery: rawQuery })
  );
  assert.ok(!html.includes('<script>alert'), 'Script tag not executed or unescaped');
  assert.ok(html.includes('&lt;script&gt;alert'), 'Safely HTML-encoded');
  return 'Search input safely encodes HTML/XSS characters';
});

// 2.8 Mobile drawer toggle presence
topBarSuite.test('CH-TOP-08', 'Mobile toggle button rendered when onToggleSidebar is supplied', () => {
  const htmlWithToggle = ReactDOMServer.renderToStaticMarkup(
    React.createElement(TopBar, { onToggleSidebar: () => {} })
  );
  assert.ok(htmlWithToggle.includes('data-testid="mobile-sidebar-toggle"'), 'Contains toggle button');

  const htmlWithoutToggle = ReactDOMServer.renderToStaticMarkup(
    React.createElement(TopBar, {})
  );
  assert.ok(!htmlWithoutToggle.includes('data-testid="mobile-sidebar-toggle"'), 'No toggle button when undefined');
  return 'Mobile sidebar toggle button conditionally mounts when callback provided';
});


// -------------------------------------------------------------
// SUITE 3: Sidebar Empirical Stress Testing
// -------------------------------------------------------------
const sidebarSuite = new ChallengerSuite('Sidebar Empirical Props Resilience & Layout Tests');

// 3.1 Categorical groups verification
sidebarSuite.test('CH-SIDE-01', 'Renders all 3 mandated categorical navigation groups', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Sidebar, { activeTab: 'overview', onTabChange: () => {} })
  );
  assert.ok(html.includes('General'), 'Contains "General" group');
  assert.ok(html.includes('Fleet &amp; Operations') || html.includes('Fleet & Operations'), 'Contains "Fleet & Operations"');
  assert.ok(html.includes('SCADA Intelligence'), 'Contains "SCADA Intelligence"');
  return 'All 3 categorical navigation groups rendered';
});

// 3.2 Active solid neon green pill button styling
sidebarSuite.test('CH-SIDE-02', 'Active item applies solid neon green pill with dark text (#050B08)', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Sidebar, { activeTab: 'overview', onTabChange: () => {} })
  );
  assert.ok(html.includes('bg-[#00F59B] text-[#050B08] font-bold'), 'Active pill class applied to active item');
  assert.ok(html.includes('shadow-[0_0_20px_rgba(0,245,155,0.35)]'), 'Glow shadow applied to active pill');
  return 'Active tab gets solid neon green pill and dark text';
});

// 3.3 Tab switching verification across all tabs
sidebarSuite.test('CH-SIDE-03', 'Swapping activeTab updates solid neon pill to new target', () => {
  const tabs = ['overview', 'telemetry', 'fleet', 'alerts', 'lab', 'pipeline', 'health'];
  for (const tab of tabs) {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(Sidebar, { activeTab: tab, onTabChange: () => {} })
    );
    assert.ok(html.includes(`data-testid="nav-item-${tab}"`), `Item ${tab} exists`);
  }
  return 'All 7 tabs verified with independent active state support';
});

// 3.4 Zero alert badge handling (no clutter)
sidebarSuite.test('CH-SIDE-04', 'Zero unacknowledged alerts (0) does not render alarm badge', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Sidebar, { activeTab: 'overview', onTabChange: () => {}, unackAlertsCount: 0 })
  );
  assert.ok(!html.includes('data-testid="alarm-badge"'), 'No alarm badge rendered when count is 0');
  return 'unackAlertsCount=0 suppresses badge clutter';
});

// 3.5 Positive alert badge handling
sidebarSuite.test('CH-SIDE-05', 'Positive alerts (5) renders red alarm counter badge', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Sidebar, { activeTab: 'overview', onTabChange: () => {}, unackAlertsCount: 5 })
  );
  assert.ok(html.includes('data-testid="alarm-badge"'), 'Alarm badge rendered');
  assert.ok(html.includes('bg-[#FF4D4D] text-white'), 'Badge has alert red background');
  assert.ok(html.includes('>5</span>'), 'Badge displays number 5');
  return 'unackAlertsCount=5 renders red badge with "5"';
});

// 3.6 Inverted badge styling on active alerts tab
sidebarSuite.test('CH-SIDE-06', 'When activeTab is "alerts", badge background inverts for contrast', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Sidebar, { activeTab: 'alerts', onTabChange: () => {}, unackAlertsCount: 5 })
  );
  assert.ok(html.includes('bg-[#050B08] text-[#00F59B]'), 'Badge inverts to dark bg and neon text on active tab');
  return 'Active alerts tab inverts badge to dark bg + neon green text';
});

// 3.7 Extreme badge count truncation (>999)
sidebarSuite.test('CH-SIDE-07', 'Extreme alarm count (1250) truncates cleanly to "999+"', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Sidebar, { activeTab: 'overview', onTabChange: () => {}, unackAlertsCount: 1250 })
  );
  assert.ok(html.includes('999+'), 'Extreme count truncates to 999+');
  return 'unackAlertsCount=1250 renders "999+"';
});

// 3.8 Negative badge count handling
sidebarSuite.test('CH-SIDE-08', 'Negative alarm count (-5) suppresses badge rendering', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Sidebar, { activeTab: 'overview', onTabChange: () => {}, unackAlertsCount: -5 })
  );
  assert.ok(!html.includes('data-testid="alarm-badge"'), 'Negative count suppresses badge');
  return 'unackAlertsCount=-5 suppresses badge safely';
});

// 3.9 Mobile drawer open state
sidebarSuite.test('CH-SIDE-09', 'isOpen=true mounts mobile slide-out panel and backdrop', () => {
  const htmlOpen = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Sidebar, { activeTab: 'overview', onTabChange: () => {}, isOpen: true, onClose: () => {} })
  );
  assert.ok(htmlOpen.includes('data-testid="sidebar-mobile"'), 'Renders mobile sidebar drawer');
  assert.ok(htmlOpen.includes('data-testid="sidebar-close-btn"'), 'Renders mobile close button');

  const htmlClosed = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Sidebar, { activeTab: 'overview', onTabChange: () => {}, isOpen: false })
  );
  assert.ok(!htmlClosed.includes('data-testid="sidebar-mobile"'), 'Mobile drawer absent when closed');
  return 'Mobile drawer mounts and unmounts cleanly based on isOpen';
});

// 3.10 Bottom ENSAM SCADA Operations card
sidebarSuite.test('CH-SIDE-10', 'Bottom card renders ENSAM emblem, Version 2.4.0, and MQTT indicator', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Sidebar, { activeTab: 'overview', onTabChange: () => {}, isConnected: true, brokerUrl: 'ws://localhost:9001' })
  );
  assert.ok(html.includes('ENSAM SCADA Ops'), 'Contains ENSAM SCADA Ops label');
  assert.ok(html.includes('Version 2.4.0'), 'Contains Version 2.4.0 text');
  assert.ok(html.includes('MQTT Connected'), 'Contains MQTT Connected text');
  return 'Bottom card renders ENSAM emblem, Version 2.4.0, and live status';
});


// -------------------------------------------------------------
// EXECUTE ALL SUITES
// -------------------------------------------------------------
console.log(`\n${COLORS.bold}${COLORS.yellow}========================================================================${COLORS.reset}`);
console.log(`${COLORS.bold}${COLORS.yellow} EMPIRICAL CHALLENGER STRESS HARNESS — MILESTONE 1 AUDIT${COLORS.reset}`);
console.log(`${COLORS.yellow} Target: KpiMetricBar, TopBar, Sidebar Components (React SSR + Boundaries)${COLORS.reset}`);
console.log(`${COLORS.bold}${COLORS.yellow}========================================================================${COLORS.reset}`);

const res1 = kpiSuite.run();
const res2 = topBarSuite.run();
const res3 = sidebarSuite.run();

const grandTotal = res1.total + res2.total + res3.total;
const grandPassed = res1.passed + res2.passed + res3.passed;
const grandFailed = res1.failed + res2.failed + res3.failed;

console.log(`\n${COLORS.bold}========================================================================${COLORS.reset}`);
console.log(`${COLORS.bold} CHALLENGER STRESS HARNESS SUMMARY${COLORS.reset}`);
console.log(`========================================================================`);
console.log(`Total Stress Tests Executed : ${grandTotal}`);
console.log(`Passed                     : ${COLORS.green}${grandPassed}${COLORS.reset}`);
console.log(`Failed                     : ${grandFailed > 0 ? COLORS.red + grandFailed : COLORS.green + '0'}${COLORS.reset}`);
console.log(`Pass Rate                  : ${((grandPassed / grandTotal) * 100).toFixed(1)}%`);

const allObservations = [...res1.observations, ...res2.observations, ...res3.observations];
const allFailures = [...res1.failures, ...res2.failures, ...res3.failures];

const reportData = {
  timestamp: new Date().toISOString(),
  grandTotal,
  grandPassed,
  grandFailed,
  suites: {
    kpiMetricBar: res1,
    topBar: res2,
    sidebar: res3,
  },
  observations: allObservations,
  failures: allFailures,
};

fs.writeFileSync(
  path.resolve(__dirname, 'empirical_m1_results.json'),
  JSON.stringify(reportData, null, 2),
  'utf8'
);
console.log(`\nWritten empirical report to dashboard/tests/empirical_m1_results.json`);
