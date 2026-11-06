# E2E Test Infra: ENSAM SCADA Operations Center Dashboard

## Test Philosophy
- Opaque-box, requirement-driven testing. Derived strictly from `ORIGINAL_REQUEST.md`.
- Verifies visual hierarchy, active state styles (solid neon green pill buttons), layout components (Sidebar, TopBar, KpiMetricBar), data visualization rendering (AreaChart splines, RadialGauge), interactive controls (fault injection, operator ACK modal), build validation, and strict live MQTT connectivity with zero mock fallbacks.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial + Real-World Workload Testing.

## Feature Inventory Mapping
| # | Feature | Source (Requirement) | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|---------------------|:------:|:------:|:------:|:------:|
| 1 | Theme & Styling (Matte Charcoal, Neon Mint #00F59B) | R1 | 5 | 5 | ✓ | ✓ |
| 2 | Left Categorized Sidebar with Solid Neon Green Pill | R2 | 5 | 5 | ✓ | ✓ |
| 3 | Top Bar (Search + Operator Profile Card) | R2 | 5 | 5 | ✓ | ✓ |
| 4 | Top Horizontal KPI Metric Bar with Hairline Dividers | R2 | 5 | 5 | ✓ | ✓ |
| 5 | Recharts Glowing Spline Area Chart with Gradient | R3 | 5 | 5 | ✓ | ✓ |
| 6 | Circular Radial Progress Gauge for Asset Health | R3 | 5 | 5 | ✓ | ✓ |
| 7 | Interactive Test Lab Fault Injector Panel | R3 | 5 | 5 | ✓ | ✓ |
| 8 | Incident Response Table with Operator ACK Action | R3 | 5 | 5 | ✓ | ✓ |
| 9 | Strict Live MQTT Integration (ws://localhost:9001, No Mocks) | R4 | 5 | 5 | ✓ | ✓ |
| 10| Clean Production Build (npm run build exits 0) | Acceptance | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Test Runner**: Node.js automated test script executing in `dashboard/` (`scripts/run_e2e_tests.mjs` or similar test harness) and headless DOM / build verification tests.
- **Coverage Tiers**:
  - Tier 1: Feature Coverage (>=5 tests per feature = 50 tests)
  - Tier 2: Boundary & Corner Cases (>=5 tests per feature = 50 tests)
  - Tier 3: Cross-Feature Pairwise Interactions (10 pairwise tests)
  - Tier 4: Real-World Industrial SCADA Workloads (5 end-to-end operational scenarios)
- **Total Tests**: >= 115 tests.

## Pass/Fail Semantics
- Every test suite must exit with code 0.
- `npm run build` must succeed with 0 errors.
- Test runner outputs structured JSON and Markdown summary, producing `TEST_READY.md`.
