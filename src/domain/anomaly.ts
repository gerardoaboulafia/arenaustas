// AI-assisted: written with Claude Code, reviewed by the team.
// Pattern check: a small machine-learning model inside the Biometric Agent.
//
// For each astronaut it learns what "normal" looks like from their own baseline days:
// the mean of every biometric indicator and how they move together (a covariance matrix,
// shrunk toward its diagonal because the baseline is short). A day is then scored by its
// Mahalanobis distance from that normal. The score is calibrated on the astronaut's own
// data: each baseline day is scored by a model fitted without it (leave-one-out), and a
// day counts as unusual when it is farther than the farthest of those.
//
// It is unsupervised, fitted in the browser, and deterministic. It has only ever seen
// simulated data, so it can raise a watch for a human to look at and never an alert.
import type { PatternConfig, PatternResult, Rules, Series } from './types';

/** Inverse of a square matrix by Gauss-Jordan elimination with partial pivoting; null if singular. */
export function invert(matrix: number[][]): number[][] | null {
  const n = matrix.length;
  const a = matrix.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    if (Math.abs(a[pivot][col]) < 1e-12) return null;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const d = a[col][col];
    for (let j = 0; j < 2 * n; j++) a[col][j] /= d;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = a[r][col];
      if (f !== 0) for (let j = 0; j < 2 * n; j++) a[r][j] -= f * a[col][j];
    }
  }
  return a.map((row) => row.slice(n));
}

interface Fitted { mean: number[]; sd: number[]; inverse: number[][] }

/** Mean and shrunk covariance of the rows; the off-diagonal terms are scaled by (1 - shrinkage). */
export function fit(rows: number[][], shrinkage: number): Fitted | null {
  const n = rows.length;
  const p = rows[0]?.length ?? 0;
  if (n < 3 || p === 0) return null;
  const mean = Array.from({ length: p }, (_, j) => rows.reduce((s, r) => s + r[j], 0) / n);
  const cov = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => {
    const c = rows.reduce((s, r) => s + (r[i] - mean[i]) * (r[j] - mean[j]), 0) / (n - 1);
    return i === j ? Math.max(c, 1e-6) : c * (1 - shrinkage);
  }));
  const inverse = invert(cov);
  return inverse ? { mean, sd: cov.map((row, i) => Math.sqrt(row[i])), inverse } : null;
}

/** Mahalanobis distance of one day from the fitted normal, with each indicator's share of it. */
export function distance(model: Fitted, x: number[]): { d: number; shares: number[]; z: number[] } {
  const diff = x.map((v, i) => v - model.mean[i]);
  const weighted = model.inverse.map((row) => row.reduce((s, v, j) => s + v * diff[j], 0));
  const parts = diff.map((v, i) => Math.max(0, v * weighted[i]));
  const d2 = Math.max(0, diff.reduce((s, v, i) => s + v * weighted[i], 0));
  const total = parts.reduce((s, v) => s + v, 0) || 1;
  return { d: Math.sqrt(d2), shares: parts.map((v) => v / total), z: diff.map((v, i) => v / model.sd[i]) };
}

const complete = (row: (number | null | undefined)[]): row is number[] => row.every((v) => typeof v === 'number' && Number.isFinite(v));

export function patternCheck(readings: Record<string, Series>, dayIndex: number, rules: Rules): PatternResult {
  const cfg: PatternConfig = rules.pattern;
  const rowAt = (i: number) => cfg.features.map((id) => readings[id]?.[i]);
  const empty: PatternResult = {
    status: 'no-data', ratio: null, history: [], contributors: [], trainedOn: 0,
    reason: 'Not enough complete days to learn your normal pattern.',
  };
  const baseline = Array.from({ length: rules.baselineDays }, (_, i) => rowAt(i)).filter(complete);
  if (baseline.length < cfg.minBaselineDays) return empty;
  const model = fit(baseline, cfg.shrinkage);
  if (!model) return empty;

  // Calibration: how far does one of your own normal days fall from a model that has not seen it?
  let reach = 0;
  for (let i = 0; i < baseline.length; i++) {
    const others = fit(baseline.filter((_, j) => j !== i), cfg.shrinkage);
    if (others) reach = Math.max(reach, distance(others, baseline[i]).d);
  }
  if (reach <= 0) return empty;

  const from = Math.max(0, dayIndex - 13);
  const scored = Array.from({ length: dayIndex - from + 1 }, (_, k) => {
    const row = rowAt(from + k);
    return complete(row) ? distance(model, row) : null;
  });
  const history = scored.map((s) => (s ? s.d / reach : null));
  const recent = history.slice(-cfg.persistDays);
  const known = recent.filter((r): r is number => r !== null);
  const last = [...scored].reverse().find((s) => s !== null) ?? null;
  const contributors = last
    ? cfg.features.map((id, i) => ({ id, z: last.z[i], share: last.shares[i] })).sort((a, b) => b.share - a.share)
    : [];
  const ratio = history[history.length - 1] ?? null;
  if (known.length < rules.minRecentReadings) return { ...empty, history, contributors, trainedOn: baseline.length, ratio };
  const unusual = known.length === cfg.persistDays && known.every((r) => r >= cfg.unusualAt);
  return {
    status: unusual ? 'watch' : 'nominal',
    ratio, history, contributors, trainedOn: baseline.length,
    reason: unusual
      ? `For ${cfg.persistDays} days in a row your readings, taken together, have been farther from your normal than any day of your baseline.`
      : 'Taken together, your readings are within the range of your own baseline days.',
  };
}
