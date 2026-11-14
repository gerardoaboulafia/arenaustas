import { selectObservations } from "../data";
import { clampMissionDay, mean, MISSION_START } from "../metrics";
import type { DailyObservation, ScenarioControls, ScenarioInput, ScenarioOutput } from "../types";

export const DEFAULT_SCENARIO: Readonly<ScenarioControls> = Object.freeze({ targetSleepHours: 8, additionalExerciseMinutes: 15 });

function clampStep(value: number, min: number, max: number, step: number, fallback: number): number {
  const numeric = Number.isNaN(value) ? fallback : value;
  return Math.round(Math.min(max, Math.max(min, numeric)) / step) * step;
}

/** Bounds first, then rounds to the nearest allowed slider step (ties round upward). */
export function normalizeScenarioControls(input: ScenarioControls): ScenarioControls {
  return {
    targetSleepHours: clampStep(input.targetSleepHours, 5, 9, 0.5, DEFAULT_SCENARIO.targetSleepHours),
    additionalExerciseMinutes: clampStep(input.additionalExerciseMinutes, 0, 30, 5, DEFAULT_SCENARIO.additionalExerciseMinutes),
  };
}

export function simulateScenario(rows: readonly DailyObservation[], input: ScenarioInput): ScenarioOutput {
  const missionDay = clampMissionDay(input.missionDay);
  const normalizedInput = { crewId: input.crewId, missionDay, ...normalizeScenarioControls(input) };
  const windowStart = Math.max(MISSION_START, missionDay - 6);
  const recent = selectObservations(rows, input.crewId, missionDay).filter((row) => row.missionDay >= windowStart);
  const sleep = recent.flatMap((row) => row.sleepHours === null ? [] : [row.sleepHours]);
  const exercise = recent.flatMap((row) => row.exerciseMinutes === null ? [] : [row.exerciseMinutes]);
  const recentSleepMean = sleep.length >= 3 ? mean(sleep) : null;
  const recentExerciseMean = exercise.length >= 3 ? mean(exercise) : null;
  const exercisePlan = recentExerciseMean === null ? null : Math.min(180, Math.max(0, recentExerciseMean + normalizedInput.additionalExerciseMinutes));
  const insufficient = recentSleepMean === null || recentExerciseMean === null;
  const quality = insufficient ? "insufficient" : sleep.length === 7 && exercise.length === 7 ? "high" : "limited";
  const assumptions = [
    `Synthetic observations from mission days ${windowStart}–${missionDay} only; minimum 3 valid readings per metric within this 7-calendar-day window. No future data or gap filling.`,
    "Both baseline schedules hold their recent observed mean constant for 30 planning days.",
    `Assumed sleep schedule: ${normalizedInput.targetSleepHours} h/day; requested extra exercise: ${normalizedInput.additionalExerciseMinutes} min/day. These are hypothetical user assumptions, not prescribed targets.`,
    "Sleep target is clamped to 5–9 h in 0.5 h steps; additional exercise to 0–30 min in 5 min steps. NaN resets that control to its default; infinities clamp to the corresponding bound.",
    "Total scenario exercise is clamped to 0–180 min/day. Planned exercise delta uses the actual schedule difference after that cap, not an unrealizable requested addition.",
    "Unavailable metric comparisons and deltas are null. Limited data is not interpolated; no HRV or health outcomes are projected.",
  ];
  return {
    horizonDays: 30, status: insufficient ? "insufficient_data" : "ready", input: normalizedInput, quality,
    recentSleepSamples: sleep.length, recentExerciseSamples: exercise.length, recentSleepMean, recentExerciseMean,
    baselineSleepPlan: Array<number | null>(30).fill(recentSleepMean),
    scenarioSleepPlan: Array<number | null>(30).fill(recentSleepMean === null ? null : normalizedInput.targetSleepHours),
    baselineExercisePlan: Array<number | null>(30).fill(recentExerciseMean),
    scenarioExercisePlan: Array<number | null>(30).fill(exercisePlan),
    sleepOpportunityDeltaHours: recentSleepMean === null ? null : 30 * (normalizedInput.targetSleepHours - recentSleepMean),
    additionalPlannedExerciseMinutes: recentExerciseMean === null || exercisePlan === null ? null : 30 * (exercisePlan - recentExerciseMean),
    assumptions,
    disclaimer: "Illustrative assumed schedules, not predicted actual behavior. Actual adherence, health outcomes and benefit are unknown; this is a planning comparison, not efficacy prediction.",
    trace: {
      agent: "simulation", inputSummary: `${input.crewId}; mission day ${missionDay}; recent sleep n=${sleep.length}, exercise n=${exercise.length}; target sleep=${normalizedInput.targetSleepHours} h; requested extra exercise=${normalizedInput.additionalExerciseMinutes} min/day.`,
      outputSummary: `30 assumed planning days; ${insufficient ? "insufficient_data" : "ready"}; quality ${quality}; schedule deltas only.`,
      rules: ["RECENT_7_CALENDAR_DAYS_MIN_3", "NO_FUTURE_DATA", "CONSTANT_ASSUMED_SCHEDULE_30_DAYS", "SLEEP_5_9_STEP_0_5", "EXTRA_EXERCISE_0_30_STEP_5", "EXERCISE_PLAN_CAP_180", "DELTA_AFTER_CAP", "NO_PHYSIOLOGICAL_PREDICTIONS"], sourceIds: [],
    },
  };
}
