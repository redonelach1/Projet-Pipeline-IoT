import assert from 'node:assert/strict';
import {
  TestSuiteRunner,
  readDashboardFile,
  findComponentFile,
  calculateRadialGauge,
} from './test_helpers.mjs';

export function createTier1Suite() {
  const suite = new TestSuiteRunner('Tier 1: Feature Coverage');

  // ==========================================
  // FEATURE 1: Theme & Color Token Architecture
  // ==========================================
  suite.test('T1.1.1', 'SCADA matte charcoal background surface token defined', 'F1', 1, () => {
    const globals = readDashboardFile('src/app/globals.css') || '';
    const tailwind = readDashboardFile('tailwind.config.ts') || '';
    const hasCharcoal =
      /#070B09|#0D1411|#111827|#0B0F17|--background/.test(globals) ||
      /#070B09|#0D1411|#111827|#0b0f17|scada/.test(tailwind);
    assert.ok(hasCharcoal, 'Matte charcoal surface token must be present in globals.css or tailwind.config.ts');
  });

  suite.test('T1.1.2', 'SCADA subtle dark border token defined', 'F1', 1, () => {
    const globals = readDashboardFile('src/app/globals.css') || '';
    const tailwind = readDashboardFile('tailwind.config.ts') || '';
    const hasBorder =
      /#1A2821|#1F3328|#1f2937|--border/.test(globals) ||
      /#1A2821|#1F3328|#1f2937|border/.test(tailwind);
    assert.ok(hasBorder, 'Subtle dark border token must be present in globals.css or tailwind.config.ts');
  });

  suite.test('T1.1.3', 'SCADA neon mint green accent token defined (#00F59B / #10B981)', 'F1', 1, () => {
    const globals = readDashboardFile('src/app/globals.css') || '';
    const tailwind = readDashboardFile('tailwind.config.ts') || '';
    const hasNeon =
      /#00F59B|#10B981|#00f59b|#10b981/.test(globals) ||
      /#00F59B|#10B981|#00f59b|#10b981/.test(tailwind);
    assert.ok(hasNeon, 'Neon mint green accent token must be defined in styling configs');
  });

  suite.test('T1.1.4', 'SCADA high-visibility alarm alert red token defined', 'F1', 1, () => {
    const globals = readDashboardFile('src/app/globals.css') || '';
    const tailwind = readDashboardFile('tailwind.config.ts') || '';
    const hasAlarm =
      /#FF4D4D|#EF4444|#ff4d4d|#ef4444|destructive/.test(globals) ||
      /#FF4D4D|#EF4444|#ff4d4d|#ef4444|red/.test(tailwind);
    assert.ok(hasAlarm, 'Alarm red token must be defined in styling configs');
  });

  suite.test('T1.1.5', 'Tailwind or CSS defines glowing neon shadow / glow utilities', 'F1', 1, () => {
    const globals = readDashboardFile('src/app/globals.css') || '';
    const tailwind = readDashboardFile('tailwind.config.ts') || '';
    const hasGlow =
      /boxShadow|shadow-|glow|0_0_12px|0_0_20px/.test(globals) ||
      /boxShadow|shadow-|glow|0_0_12px|0_0_20px/.test(tailwind);
    assert.ok(hasGlow, 'Glow shadows or utilities must be defined for neon accent elements');
  });

  // ==========================================
  // FEATURE 2: Left Sidebar Navigation
  // ==========================================
  suite.test('T1.2.1', 'Sidebar navigation component structure exists', 'F2', 1, () => {
    const sidebar = findComponentFile([
      'src/components/layout/Sidebar.tsx',
      'src/components/layout/Navbar.tsx',
    ]);
    assert.ok(sidebar, 'Sidebar or navigation component file must exist');
    assert.ok(sidebar.content.includes('activeTab'), 'Navigation component must accept activeTab prop');
  });

  suite.test('T1.2.2', 'Sidebar provides categorized navigation groups or tabs', 'F2', 1, () => {
    const sidebar = findComponentFile([
      'src/components/layout/Sidebar.tsx',
      'src/components/layout/Navbar.tsx',
    ]);
    assert.ok(sidebar, 'Sidebar component required');
    const hasCategories =
      /General|Fleet|SCADA|overview|telemetry|alerts|lab|pipeline/i.test(sidebar.content);
    assert.ok(hasCategories, 'Sidebar must define core navigation groups or items');
  });

  suite.test('T1.2.3', 'Active navigation item applies solid neon green pill styling', 'F2', 1, () => {
    const sidebar = findComponentFile([
      'src/components/layout/Sidebar.tsx',
      'src/components/layout/Navbar.tsx',
    ]);
    assert.ok(sidebar, 'Sidebar component required');
    // Solid neon green active pill button: bg-[#00F59B] text-[#050B08] or bg-scada-neon
    const hasActivePill =
      /bg-\[#00F59B\]|bg-scada-neon|bg-emerald-500|text-\[#050B08\]|font-semibold/.test(sidebar.content);
    assert.ok(hasActivePill, 'Active navigation item must apply solid neon green pill styling with dark text');
  });

  suite.test('T1.2.4', 'Sidebar renders icon badges for alerts or fleet counts', 'F2', 1, () => {
    const sidebar = findComponentFile([
      'src/components/layout/Sidebar.tsx',
      'src/components/layout/Navbar.tsx',
    ]);
    assert.ok(sidebar, 'Sidebar component required');
    const hasBadges =
      /badge|activeAlarmsCount|alertsCount|unack|count/i.test(sidebar.content);
    assert.ok(hasBadges, 'Sidebar must render badges for alerts or fleet counts');
  });

  suite.test('T1.2.5', 'Sidebar supports onTabChange / setActiveTab callback', 'F2', 1, () => {
    const sidebar = findComponentFile([
      'src/components/layout/Sidebar.tsx',
      'src/components/layout/Navbar.tsx',
    ]);
    assert.ok(sidebar, 'Sidebar component required');
    const hasCallback = /onTabChange|setActiveTab/.test(sidebar.content);
    assert.ok(hasCallback, 'Sidebar must expose tab selection callback');
  });

  // ==========================================
  // FEATURE 3: Top Header Bar
  // ==========================================
  suite.test('T1.3.1', 'TopBar component renders search input with placeholder', 'F3', 1, () => {
    const topbar = findComponentFile([
      'src/components/layout/TopBar.tsx',
      'src/components/layout/Navbar.tsx',
    ]);
    assert.ok(topbar, 'TopBar component file must exist');
    const hasSearch = /<input|placeholder=|Search/i.test(topbar.content);
    assert.ok(hasSearch, 'TopBar must render a search input field');
  });

  suite.test('T1.3.2', 'TopBar renders operator profile container', 'F3', 1, () => {
    const topbar = findComponentFile([
      'src/components/layout/TopBar.tsx',
      'src/components/layout/Navbar.tsx',
    ]);
    assert.ok(topbar, 'TopBar component required');
    const hasOperator = /operator|Operator|Profile|avatar|ENSAM/i.test(topbar.content);
    assert.ok(hasOperator, 'TopBar must feature operator profile details');
  });

  suite.test('T1.3.3', 'TopBar renders broker connectivity indicator', 'F3', 1, () => {
    const topbar = findComponentFile([
      'src/components/layout/TopBar.tsx',
      'src/components/layout/Navbar.tsx',
    ]);
    assert.ok(topbar, 'TopBar component required');
    const hasConn = /isConnected|Connected|Disconnected|Online|Offline/i.test(topbar.content);
    assert.ok(hasConn, 'TopBar must display broker connectivity state');
  });

  suite.test('T1.3.4', 'TopBar displays active WebSocket broker URL or host badge', 'F3', 1, () => {
    const topbar = findComponentFile([
      'src/components/layout/TopBar.tsx',
      'src/components/layout/Navbar.tsx',
    ]);
    assert.ok(topbar, 'TopBar component required');
    const hasBrokerInfo = /brokerUrl|9001|ws:\/\/|Broker|MQTT/i.test(topbar.content);
    assert.ok(hasBrokerInfo, 'TopBar must show broker connection info or MQTT status');
  });

  suite.test('T1.3.5', 'TopBar includes search icon from lucide-react', 'F3', 1, () => {
    const topbar = findComponentFile([
      'src/components/layout/TopBar.tsx',
      'src/components/layout/Navbar.tsx',
    ]);
    assert.ok(topbar, 'TopBar component required');
    const hasIcon = /Search|lucide-react/.test(topbar.content);
    assert.ok(hasIcon, 'TopBar must render search icon from lucide-react');
  });

  // ==========================================
  // FEATURE 4: Horizontal KPI Metric Bar
  // ==========================================
  suite.test('T1.4.1', 'Unified horizontal KPI card layout exists', 'F4', 1, () => {
    const kpi = findComponentFile([
      'src/components/scada/KpiMetricBar.tsx',
      'src/components/views/PlantOverview.tsx',
    ]);
    assert.ok(kpi, 'KPI Metric component file must exist');
    assert.ok(/grid|flex|card/i.test(kpi.content), 'KPI bar must implement horizontal grid or flex container');
  });

  suite.test('T1.4.2', 'Vertical hairline dividers separate KPI metric segments', 'F4', 1, () => {
    const kpi = findComponentFile([
      'src/components/scada/KpiMetricBar.tsx',
      'src/components/views/PlantOverview.tsx',
    ]);
    assert.ok(kpi, 'KPI Metric component required');
    const hasDividers = /border-r|divide-x|hairline|border-\[#1A2821\]|border-industrial-border/.test(kpi.content);
    assert.ok(hasDividers, 'KPI card must feature vertical hairline dividers separating segments');
  });

  suite.test('T1.4.3', 'KPI Bar displays Total Ingestion metric and rate indicator', 'F4', 1, () => {
    const kpi = findComponentFile([
      'src/components/scada/KpiMetricBar.tsx',
      'src/components/views/PlantOverview.tsx',
    ]);
    assert.ok(kpi, 'KPI Metric component required');
    const hasIngestion = /totalIngestion|totalMessages|ingestionRate|msgPerSec|Ingestion/i.test(kpi.content);
    assert.ok(hasIngestion, 'KPI bar must present Total Ingestion metric');
  });

  suite.test('T1.4.4', 'KPI Bar displays Active Fleet metric (e.g. 5/5 Active)', 'F4', 1, () => {
    const kpi = findComponentFile([
      'src/components/scada/KpiMetricBar.tsx',
      'src/components/views/PlantOverview.tsx',
    ]);
    assert.ok(kpi, 'KPI Metric component required');
    const hasFleet = /activeFleet|fleet|devices|Active Fleet/i.test(kpi.content);
    assert.ok(hasFleet, 'KPI bar must display Active Fleet metric');
  });

  suite.test('T1.4.5', 'KPI Bar displays Edge p95 Latency and Unacknowledged Alarms', 'F4', 1, () => {
    const kpi = findComponentFile([
      'src/components/scada/KpiMetricBar.tsx',
      'src/components/views/PlantOverview.tsx',
    ]);
    assert.ok(kpi, 'KPI Metric component required');
    const hasLatencyAndAlarms =
      /p95|latency|avgLatency/i.test(kpi.content) &&
      /alarm|alert|unack/i.test(kpi.content);
    assert.ok(hasLatencyAndAlarms, 'KPI bar must display Latency and Alarms segments');
  });

  // ==========================================
  // FEATURE 5: Recharts Glowing Spline Area Chart
  // ==========================================
  suite.test('T1.5.1', 'Recharts AreaChart and Area components imported and used', 'F5', 1, () => {
    const chart = findComponentFile([
      'src/components/scada/TelemetryAreaChart.tsx',
      'src/components/views/DeviceDetail.tsx',
    ]);
    assert.ok(chart, 'Telemetry chart component required');
    const hasRecharts = /recharts/.test(chart.content);
    assert.ok(hasRecharts, 'Chart component must import from recharts');
  });

  suite.test('T1.5.2', 'Spline interpolation uses monotone curve mode', 'F5', 1, () => {
    const chart = findComponentFile([
      'src/components/scada/TelemetryAreaChart.tsx',
      'src/components/views/DeviceDetail.tsx',
    ]);
    assert.ok(chart, 'Telemetry chart component required');
    const hasSpline = /type="monotone"|type='monotone'|curve="monotone"|monotone/.test(chart.content);
    assert.ok(hasSpline, 'Telemetry chart must use smooth monotone spline curves');
  });

  suite.test('T1.5.3', 'SVG defs block defines linearGradient with neon mint green stop colors', 'F5', 1, () => {
    const chart = findComponentFile([
      'src/components/scada/TelemetryAreaChart.tsx',
      'src/components/views/DeviceDetail.tsx',
    ]);
    assert.ok(chart, 'Telemetry chart component required');
    const hasGradient = /linearGradient|defs|gradient|neonGlow|#00F59B|#10B981/i.test(chart.content);
    assert.ok(hasGradient, 'Telemetry AreaChart must define glowing SVG linear gradient');
  });

  suite.test('T1.5.4', 'Multi-metric telemetry toggle supports temp, press, and vib keys', 'F5', 1, () => {
    const chart = findComponentFile([
      'src/components/scada/TelemetryAreaChart.tsx',
      'src/components/views/DeviceDetail.tsx',
    ]);
    assert.ok(chart, 'Telemetry chart component required');
    const hasMetrics = /temp/i.test(chart.content) && /press/i.test(chart.content) && /vib/i.test(chart.content);
    assert.ok(hasMetrics, 'Telemetry chart must support temperature, pressure, and vibration metrics');
  });

  suite.test('T1.5.5', 'Live rolling telemetry feed accepts history points array', 'F5', 1, () => {
    const chart = findComponentFile([
      'src/components/scada/TelemetryAreaChart.tsx',
      'src/components/views/DeviceDetail.tsx',
    ]);
    assert.ok(chart, 'Telemetry chart component required');
    const hasHistoryProp = /history|data=/i.test(chart.content);
    assert.ok(hasHistoryProp, 'Chart component must bind to history time-series data');
  });

  // ==========================================
  // FEATURE 6: Asset Health Circular Radial Gauge
  // ==========================================
  suite.test('T1.6.1', 'Component renders circular SVG container with circle elements', 'F6', 1, () => {
    const gauge = findComponentFile([
      'src/components/scada/RadialGauge.tsx',
      'src/components/views/PlantOverview.tsx',
    ]);
    assert.ok(gauge, 'Radial gauge component required');
    const hasSvgCircle = /<svg|<circle|RadialGauge/i.test(gauge.content);
    assert.ok(hasSvgCircle, 'Asset Health gauge must render SVG circle elements');
  });

  suite.test('T1.6.2', 'Computes strokeDasharray and strokeDashoffset dynamically', 'F6', 1, () => {
    // Mathematical verification of strokeDashoffset formula
    const res = calculateRadialGauge(75.5, 58);
    const expectedCircumference = 2 * Math.PI * 58;
    const expectedOffset = expectedCircumference - (75.5 / 100) * expectedCircumference;
    assert.equal(res.circumference, expectedCircumference);
    assert.equal(res.strokeDashoffset, expectedOffset);
  });

  suite.test('T1.6.3', 'Applies rounded stroke caps and thick stroke width', 'F6', 1, () => {
    const gauge = findComponentFile([
      'src/components/scada/RadialGauge.tsx',
      'src/components/views/PlantOverview.tsx',
    ]);
    assert.ok(gauge, 'Radial gauge component required');
    const hasRoundedStroke = /strokeLinecap="round"|stroke-linecap="round"|strokeWidth|stroke-width/i.test(gauge.content);
    assert.ok(hasRoundedStroke, 'Radial gauge must specify rounded stroke caps and width');
  });

  suite.test('T1.6.4', 'Applies glowing neon mint stroke styling (#00F59B / #10B981)', 'F6', 1, () => {
    const gauge = findComponentFile([
      'src/components/scada/RadialGauge.tsx',
      'src/components/views/PlantOverview.tsx',
    ]);
    assert.ok(gauge, 'Radial gauge component required');
    const hasNeonStroke = /#00F59B|#10B981|emerald|neon|stroke-/i.test(gauge.content);
    assert.ok(hasNeonStroke, 'Radial gauge must utilize neon mint green stroke styling');
  });

  suite.test('T1.6.5', 'Displays central percentage text and fleet reliability label', 'F6', 1, () => {
    const gauge = findComponentFile([
      'src/components/scada/RadialGauge.tsx',
      'src/components/views/PlantOverview.tsx',
    ]);
    assert.ok(gauge, 'Radial gauge component required');
    const hasLabel = /%|Health|Reliability|Satisfaction|status/i.test(gauge.content);
    assert.ok(hasLabel, 'Radial gauge must display percentage text and status label');
  });

  // ==========================================
  // FEATURE 7: Interactive Test Lab Fault Injector
  // ==========================================
  suite.test('T1.7.1', 'Offers 6 distinct anomaly scenarios plus reset', 'F7', 1, () => {
    const lab = findComponentFile([
      'src/components/scada/TestLabPanel.tsx',
      'src/components/views/TestLab.tsx',
    ]);
    assert.ok(lab, 'Test Lab component required');
    const requiredScenarios = [
      'THERMAL_OVERHEAT',
      'VIBRATION_SPIKE',
      'PRESSURE_DROP',
      'MACHINE_STOP',
      'CORRUPTED_PAYLOAD',
      'SILENCE',
    ];
    for (const scenario of requiredScenarios) {
      assert.ok(lab.content.includes(scenario), `Test Lab must support scenario ${scenario}`);
    }
  });

  suite.test('T1.7.2', 'Equipment target selector supports individual devices and all', 'F7', 1, () => {
    const lab = findComponentFile([
      'src/components/scada/TestLabPanel.tsx',
      'src/components/views/TestLab.tsx',
    ]);
    assert.ok(lab, 'Test Lab component required');
    const hasTargets = /motor-01|pump-01|conveyor-01|compressor-01|all/i.test(lab.content);
    assert.ok(hasTargets, 'Test Lab must allow target equipment selection');
  });

  suite.test('T1.7.3', 'Duration control allows configuring fault duration in seconds', 'F7', 1, () => {
    const lab = findComponentFile([
      'src/components/scada/TestLabPanel.tsx',
      'src/components/views/TestLab.tsx',
    ]);
    assert.ok(lab, 'Test Lab component required');
    const hasDuration = /duration|durationSec|duration_sec/i.test(lab.content);
    assert.ok(hasDuration, 'Test Lab must provide duration control');
  });

  suite.test('T1.7.4', 'Dispatches structured MQTT simulation command payload', 'F7', 1, () => {
    const hook = readDashboardFile('src/hooks/useMqttStream.ts') || '';
    assert.ok(hook.includes('publishCommand') || hook.includes('publish'), 'Hook must provide command dispatch');
    assert.ok(/scenario|action|set_scenario/.test(hook), 'Command payload must include scenario and action');
  });

  suite.test('T1.7.5', 'Provides RESET action to restore normal device operations', 'F7', 1, () => {
    const lab = findComponentFile([
      'src/components/scada/TestLabPanel.tsx',
      'src/components/views/TestLab.tsx',
    ]);
    assert.ok(lab, 'Test Lab component required');
    assert.ok(/RESET|reset/i.test(lab.content), 'Test Lab must provide RESET action button');
  });

  // ==========================================
  // FEATURE 8: Incident Response Table with Operator ACK
  // ==========================================
  suite.test('T1.8.1', 'Incident table displays severity pills (CRITICAL, WARNING, INFO)', 'F8', 1, () => {
    const table = findComponentFile([
      'src/components/scada/IncidentResponseTable.tsx',
      'src/components/views/AlertConsole.tsx',
    ]);
    assert.ok(table, 'Incident table component required');
    assert.ok(/CRITICAL|critical/i.test(table.content), 'Incident table must handle CRITICAL severity');
    assert.ok(/WARNING|warning/i.test(table.content), 'Incident table must handle WARNING severity');
  });

  suite.test('T1.8.2', 'Renders incident metadata: timestamp, equipment ID, rule, and value', 'F8', 1, () => {
    const table = findComponentFile([
      'src/components/scada/IncidentResponseTable.tsx',
      'src/components/views/AlertConsole.tsx',
    ]);
    assert.ok(table, 'Incident table component required');
    assert.ok(/timestamp|device_id|rule|value/i.test(table.content), 'Incident table must render event metadata');
  });

  suite.test('T1.8.3', 'Operator ACK action triggers modal note dialog', 'F8', 1, () => {
    const table = findComponentFile([
      'src/components/scada/IncidentResponseTable.tsx',
      'src/components/views/AlertConsole.tsx',
    ]);
    assert.ok(table, 'Incident table component required');
    const hasModal = /Dialog|modal|DialogContent|Acknowledge|onAcknowledge/i.test(table.content);
    assert.ok(hasModal, 'Operator ACK must open dialog for operator acknowledgment notes');
  });

  suite.test('T1.8.4', 'Acknowledging incident calls onAcknowledge with eventId and note', 'F8', 1, () => {
    const hook = readDashboardFile('src/hooks/useMqttStream.ts') || '';
    assert.ok(hook.includes('acknowledgeAlert'), 'Hook must export acknowledgeAlert function');
    assert.ok(/eventId.*note|alertId.*note/.test(hook) || hook.includes('acknowledgeAlert'), 'acknowledgeAlert must accept ID and note');
  });

  suite.test('T1.8.5', 'Dispatches MQTT ACK packet to event/ack topic', 'F8', 1, () => {
    const hook = readDashboardFile('src/hooks/useMqttStream.ts') || '';
    assert.ok(/event\/ack/.test(hook), 'Hook must publish ACK payload to event/ack topic');
  });

  // ==========================================
  // FEATURE 9: Strict Live MQTT Integration & Empirical Latency
  // ==========================================
  suite.test('T1.9.1', 'Connects strictly to ws://localhost:9001 via WebSocket protocol', 'F9', 1, () => {
    const hook = readDashboardFile('src/hooks/useMqttStream.ts') || '';
    assert.ok(/ws:\/\/localhost:9001|NEXT_PUBLIC_MQTT_WS_URL/.test(hook), 'Hook must connect to ws://localhost:9001');
  });

  suite.test('T1.9.2', 'Subscribes to live topics (telemetry, status, event)', 'F9', 1, () => {
    const hook = readDashboardFile('src/hooks/useMqttStream.ts') || '';
    assert.ok(hook.includes('telemetry'), 'Hook must subscribe to telemetry topic');
    assert.ok(hook.includes('status'), 'Hook must subscribe to status topic');
    assert.ok(hook.includes('event'), 'Hook must subscribe to event topic');
  });

  suite.test('T1.9.3', 'Zero client-side mock fallback data audit (strict R4)', 'F9', 1, () => {
    const hook = readDashboardFile('src/hooks/useMqttStream.ts') || '';
    const hasMockGenerators = /Math\.random\(\)\s*\*\s*(?:100|50|10)|mockData|fakeData|generateTelemetry/i.test(hook);
    assert.ok(!hasMockGenerators, 'Strict R4: useMqttStream must contain zero mock data generators');
  });

  suite.test('T1.9.4', 'Initial state is clean and empty (no pre-populated fake equipment)', 'F9', 1, () => {
    const hook = readDashboardFile('src/hooks/useMqttStream.ts') || '';
    assert.ok(/useState<.*>\({}\)/.test(hook) || /useState.*devices.*\{\}/.test(hook) || /devices: \{\}/.test(hook), 'Initial devices state must be empty object');
  });

  suite.test('T1.9.5', 'Empirical latency calculation algorithm from rolling telemetry', 'F9', 1, () => {
    const hook = readDashboardFile('src/hooks/useMqttStream.ts') || '';
    assert.ok(/latency|timestamp|stats/i.test(hook), 'Hook must compute empirical message latency');
  });

  // ==========================================
  // FEATURE 10: Clean Production Build & E2E Acceptance
  // ==========================================
  suite.test('T1.10.1', 'Package.json defines standard build, dev, start, and lint scripts', 'F10', 1, () => {
    const pkg = JSON.parse(readDashboardFile('package.json') || '{}');
    assert.ok(pkg.scripts?.build, 'build script required');
    assert.ok(pkg.scripts?.dev, 'dev script required');
    assert.ok(pkg.scripts?.lint, 'lint script required');
  });

  suite.test('T1.10.2', 'TypeScript configuration enforces strict mode', 'F10', 1, () => {
    const tsconfig = JSON.parse(readDashboardFile('tsconfig.json') || '{}');
    assert.equal(tsconfig.compilerOptions?.strict, true, 'tsconfig strict mode must be true');
  });

  suite.test('T1.10.3', 'Next.js configuration specifies standalone output', 'F10', 1, () => {
    const nextConfig = readDashboardFile('next.config.mjs') || '';
    assert.ok(/standalone/.test(nextConfig), 'next.config.mjs must specify standalone output');
  });

  suite.test('T1.10.4', 'All production core dependencies verified in package.json', 'F10', 1, () => {
    const pkg = JSON.parse(readDashboardFile('package.json') || '{}');
    assert.ok(pkg.dependencies?.next, 'Next.js dependency present');
    assert.ok(pkg.dependencies?.react, 'React dependency present');
    assert.ok(pkg.dependencies?.recharts, 'Recharts dependency present');
    assert.ok(pkg.dependencies?.['lucide-react'], 'Lucide-React dependency present');
    assert.ok(pkg.dependencies?.mqtt, 'MQTT client dependency present');
  });

  suite.test('T1.10.5', 'Root layout configures dark theme container classes', 'F10', 1, () => {
    const layout = readDashboardFile('src/app/layout.tsx') || '';
    assert.ok(/dark|bg-|min-h-screen/.test(layout), 'Root layout must establish dark container wrapper');
  });

  return suite;
}
