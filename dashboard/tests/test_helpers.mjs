import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const DASHBOARD_ROOT = path.resolve(__dirname, '..');
export const PROJECT_ROOT = path.resolve(DASHBOARD_ROOT, '..');

/**
 * Safely read a file from dashboard directory
 */
export function readDashboardFile(relPath) {
  const fullPath = path.resolve(DASHBOARD_ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  return fs.readFileSync(fullPath, 'utf8');
}

/**
 * Check if file exists in dashboard
 */
export function dashboardFileExists(relPath) {
  const fullPath = path.resolve(DASHBOARD_ROOT, relPath);
  return fs.existsSync(fullPath);
}

/**
 * Find first existing file among candidates
 */
export function findComponentFile(candidates) {
  for (const relPath of candidates) {
    const fullPath = path.resolve(DASHBOARD_ROOT, relPath);
    if (fs.existsSync(fullPath)) {
      return { path: relPath, content: fs.readFileSync(fullPath, 'utf8') };
    }
  }
  return null;
}

/**
 * Calculate WCAG 2.1 relative luminance for hex color
 */
export function hexToLuminance(hex) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Calculate WCAG contrast ratio between two hex colors
 */
export function calculateContrastRatio(hex1, hex2) {
  const lum1 = hexToLuminance(hex1);
  const lum2 = hexToLuminance(hex2);
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (brighter + 0.05) / (darker + 0.05);
}

/**
 * SVG Radial Gauge mathematical model
 */
export function calculateRadialGauge(percentage, radius = 58) {
  const clamped = Math.max(0, Math.min(100, isNaN(percentage) ? 0 : Number(percentage)));
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;
  return {
    radius,
    circumference,
    clampedPercentage: clamped,
    strokeDashoffset,
    strokeDasharray: circumference,
  };
}

/**
 * Empirical p95 calculation on latency ring buffer
 */
export function calculateEmpiricalP95(samples) {
  if (!samples || samples.length === 0) return 0;
  const valid = samples.filter((s) => typeof s === 'number' && !isNaN(s) && s >= 0);
  if (valid.length === 0) return 0;
  const sorted = [...valid].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
  return sorted[index];
}

/**
 * Rolling telemetry window buffer simulation
 */
export function updateRollingHistory(currentHistory, newPoint, maxCapacity = 30) {
  const next = [...(currentHistory || []), newPoint];
  if (next.length > maxCapacity) {
    return next.slice(-maxCapacity);
  }
  return next;
}

/**
 * Simple test suite aggregator
 */
export class TestSuiteRunner {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.tests = [];
    this.results = [];
  }

  test(id, name, featureId, tier, fn) {
    this.tests.push({ id, name, featureId, tier, fn });
  }

  async run() {
    this.results = [];
    for (const t of this.tests) {
      const start = Date.now();
      try {
        await t.fn();
        this.results.push({
          id: t.id,
          name: t.name,
          featureId: t.featureId,
          tier: t.tier,
          status: 'PASS',
          durationMs: Date.now() - start,
          error: null,
        });
      } catch (err) {
        this.results.push({
          id: t.id,
          name: t.name,
          featureId: t.featureId,
          tier: t.tier,
          status: 'FAIL',
          durationMs: Date.now() - start,
          error: err.message || String(err),
        });
      }
    }
    return this.results;
  }
}
