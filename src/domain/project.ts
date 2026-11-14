// AI-assisted: written with Claude Code, reviewed by the team.
// Physiology and Prediction agents. These are simplified projections from the explicit
// models in models.json, never predictions. No coefficient is written in this file.
import { mean } from './evaluate';
import type { Projection, ProjectionModel, Rules, Series, WhatIfInput } from './types';

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Replace missing readings with the last known one (the first known one at the start). */
export function fill(series: Series): number[] {
  const first = series.find((v): v is number => typeof v === 'number') ?? 0;
  let last = first;
  return series.map((v) => (typeof v === 'number' ? (last = v) : last));
}

/** Value of a model's output after each day, given one input value per day. */
export function simulate(model: ProjectionModel, start: number, inputs: number[]): number[] {
  const p = model.parameters;
  const out: number[] = [];
  let value = start;
  inputs.forEach((x, i) => {
    if (model.form === 'linear-rate') {
      const protection = p.maxProtection * clamp(x / p.fullProtectionAt, 0, 1);
      value = Math.max(0, value - (p.lossPctPerMonth / 30) * (1 - protection));
    } else if (model.form === 'cumulative-sum') {
      value += Math.max(0, x);
    } else {
      const window = inputs.slice(Math.max(0, i - p.windowDays + 1), i + 1);
      value = window.reduce((debt, hours) => debt + Math.max(0, p.needHours - hours), 0);
    }
    out.push(value);
  });
  return out;
}

/** Current habit: the mean of the last `habitDays` readings up to the given day. */
export function habit(series: Series, dayIndex: number, rules: Rules): number {
  return mean(series.slice(Math.max(0, dayIndex - rules.habitDays + 1), dayIndex + 1)) ?? 0;
}

/**
 * History up to today, then two projections for the model's horizon:
 * one with the current habit, one with the what-if value.
 */
export function project(
  model: ProjectionModel,
  series: Series,
  start: number,
  dayIndex: number,
  rules: Rules,
  whatIf?: number,
): Projection {
  const past = fill(series.slice(0, dayIndex + 1));
  const current = habit(series, dayIndex, rules);
  const scenarioInput = whatIf ?? current;
  const run = (future: number) =>
    simulate(model, start, [...past, ...Array<number>(model.horizonDays).fill(future)]);
  const baselineRun = run(current);
  const scenarioRun = run(scenarioInput);
  return {
    model,
    input: model.inputs[0] as WhatIfInput,
    habit: current,
    scenarioInput,
    history: baselineRun.slice(0, past.length),
    baseline: baselineRun.slice(past.length),
    scenario: scenarioRun.slice(past.length),
  };
}
