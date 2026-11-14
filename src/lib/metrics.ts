import type { MetricKey } from "./types";

export const MISSION_START = 120;
export const MISSION_END = 149;
export const BASELINE_END = 133;
export const PROTOTYPE_DISCLAIMER = "Synthetic demonstration. Prototype signal / not a clinical assessment. These fixture-only rules are not NASA-validated thresholds.";

export const METRICS: Record<MetricKey, {
  label: string;
  unit: string;
  ruleId: string;
  ruleDescription: string;
  direction: "higher" | "lower";
  threshold: (baseline: number) => number;
}> = {
  sleepHours: { label: "Sleep", unit: "h", ruleId: "SLEEP_BASELINE_MINUS_1H", ruleDescription: "at least 1.0 h below baseline", direction: "lower", threshold: (baseline) => baseline - 1 },
  hrvMs: { label: "HRV", unit: "ms", ruleId: "HRV_BELOW_80_PERCENT_BASELINE", ruleDescription: "at or below 80% of baseline", direction: "lower", threshold: (baseline) => baseline * 0.8 },
  restingHrBpm: { label: "Resting heart rate", unit: "beats/min", ruleId: "RESTING_HR_ABOVE_112_PERCENT_BASELINE", ruleDescription: "at or above 112% of baseline", direction: "higher", threshold: (baseline) => baseline * 1.12 },
  exerciseMinutes: { label: "Exercise", unit: "min/day", ruleId: "EXERCISE_BELOW_65_PERCENT_BASELINE", ruleDescription: "at or below 65% of baseline", direction: "lower", threshold: (baseline) => baseline * 0.65 },
  cabinCo2Ppm: { label: "Cabin CO2", unit: "ppm", ruleId: "CO2_ABOVE_140_PERCENT_BASELINE", ruleDescription: "at or above 140% of baseline (habitat context only)", direction: "higher", threshold: (baseline) => baseline * 1.4 },
};

/** NaN uses the default; infinities clamp to bounds; fractions select the earlier day. */
export function clampMissionDay(day: number): number {
  if (Number.isNaN(day)) return MISSION_END;
  return Math.min(MISSION_END, Math.max(MISSION_START, Math.floor(day)));
}

export function mean(values: readonly number[]): number | null {
  // Dividing each term first avoids overflowing a finite nonnegative sum.
  return values.length ? values.reduce((sum, value) => sum + value / values.length, 0) : null;
}
