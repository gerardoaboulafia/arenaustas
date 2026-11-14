// AI-assisted: written with Claude Code, reviewed by the team.
import { describe, expect, it } from 'vitest';
import {
  applyOverrides, buildTwin, createDataset, evaluateIndicator, fill, indicators, loadOverrides, measureStatus,
  modelById, models, overallStatus, overrideKey, rules, simulate, sourceById, sources, systems,
} from './index';
import type { Indicator, Series } from './types';

const sleep = indicators.find((i) => i.id === 'sleepHours') as Indicator;
const flat = (value: number, n = 30): Series => Array<number>(n).fill(value);

describe('knowledge files', () => {
  it('give every indicator, system and model a known source or an assumption flag', () => {
    for (const item of [...indicators, ...models]) {
      expect(item.basis === 'assumption' ? item.needsReview : Boolean(sourceById(item.sourceId))).toBe(true);
      if (item.sourceId) expect(sourceById(item.sourceId)).toBeDefined();
    }
    for (const s of systems) expect(s.measure.basis === 'assumption' ? s.measure.needsReview : true).toBe(true);
    for (const a of indicators.flatMap((i) => [...i.actions.watch, ...i.actions.alert])) {
      expect(a.basis === 'assumption' ? a.needsReview : Boolean(a.sourceId)).toBe(true);
    }
  });
  it('flag every model parameter that is not sourced', () => {
    for (const m of models) {
      expect(Object.keys(m.parameterBasis).sort()).toEqual(Object.keys(m.parameters).sort());
      if (Object.values(m.parameterBasis).includes('assumption')) expect(m.needsReview).toBe(true);
    }
  });
  it('list sources with https links', () => {
    expect(sources.length).toBeGreaterThanOrEqual(1);
    for (const s of sources) expect(s.url.startsWith('https://')).toBe(true);
  });
});

describe('evaluateIndicator', () => {
  it('is nominal when recent days match the baseline', () => {
    expect(evaluateIndicator(sleep, flat(7.5), 29, rules).status).toBe('nominal');
  });
  it('turns watch exactly at the watch step and alert exactly at the alert step', () => {
    const at = (recent: number) => evaluateIndicator(sleep, [...flat(7.5, 27), recent, recent, recent], 29, rules).status;
    expect(at(6.6)).toBe('nominal');
    expect(at(6.5)).toBe('watch');
    expect(at(5.6)).toBe('watch');
    expect(at(5.5)).toBe('alert');
  });
  it('does not change status for one odd reading', () => {
    const series = [...flat(7.5, 29), 5.5];
    expect(evaluateIndicator(sleep, series, 29, rules).status).toBe('nominal');
  });
  it('reports no-data instead of guessing', () => {
    const missingRecent: Series = [...flat(7.5, 27), null, null, 7];
    expect(evaluateIndicator(sleep, missingRecent, 29, rules).status).toBe('no-data');
    const missingBaseline: Series = [...Array<null>(10).fill(null), ...flat(7.5, 20)];
    expect(evaluateIndicator(sleep, missingBaseline, 29, rules).status).toBe('no-data');
  });
  it('handles ratio rules and both-direction rules', () => {
    const hrv = indicators.find((i) => i.id === 'hrvMs') as Indicator;
    expect(evaluateIndicator(hrv, [...flat(60, 27), 50, 50, 50], 29, rules).status).toBe('watch');
    expect(evaluateIndicator(hrv, [...flat(60, 27), 40, 40, 40], 29, rules).status).toBe('alert');
    const skin = indicators.find((i) => i.id === 'skinTempC') as Indicator;
    expect(evaluateIndicator(skin, [...flat(33, 27), 34, 34, 34], 29, rules).status).toBe('watch');
    expect(evaluateIndicator(skin, [...flat(33, 27), 32, 32, 32], 29, rules).status).toBe('watch');
  });
});

describe('models', () => {
  const bone = modelById('bone-density');
  it('lose the sourced monthly rate over 30 days without exercise', () => {
    const out = simulate(bone, 100, Array<number>(30).fill(0));
    expect(out[29]).toBeCloseTo(100 - bone.parameters.lossPctPerMonth, 6);
  });
  it('lose less with more exercise, and never gain', () => {
    const none = simulate(bone, 100, Array<number>(30).fill(0))[29];
    const some = simulate(bone, 100, Array<number>(30).fill(30))[29];
    const full = simulate(bone, 100, Array<number>(30).fill(600))[29];
    expect(some).toBeGreaterThan(none);
    expect(full).toBeGreaterThan(some);
    expect(full).toBeLessThan(100);
  });
  it('compute sleep debt over the rolling window', () => {
    const debt = modelById('circadian-sleep-debt');
    const { needHours, windowDays } = debt.parameters;
    const out = simulate(debt, 0, Array<number>(10).fill(needHours - 1));
    expect(out[0]).toBeCloseTo(1, 6);
    expect(out[9]).toBeCloseTo(windowDays, 6);
    expect(simulate(debt, 0, Array<number>(10).fill(needHours + 2))[9]).toBe(0);
  });
  it('sum the radiation dose', () => {
    expect(simulate(modelById('radiation-cumulative'), 10, [0.5, 0.5, 1])[2]).toBeCloseTo(12, 6);
  });
  it('fill gaps with the last known reading', () => {
    expect(fill([null, 2, null, 4])).toEqual([2, 2, 2, 4]);
  });
  it('read a measure against its bands on the boundary', () => {
    const boneMeasure = systems.find((s) => s.id === 'bone')!.measure;
    expect(measureStatus(boneMeasure, boneMeasure.watch)).toBe('nominal');
    expect(measureStatus(boneMeasure, boneMeasure.watch - 0.01)).toBe('watch');
    expect(measureStatus(boneMeasure, boneMeasure.alert - 0.01)).toBe('alert');
    const debt = systems.find((s) => s.id === 'circadian')!.measure;
    expect(measureStatus(debt, debt.watch)).toBe('watch');
    expect(measureStatus(debt, debt.alert)).toBe('alert');
  });
});

describe('simulated crew', () => {
  const data = createDataset();
  it('is the same on every load', () => {
    expect(createDataset()).toEqual(data);
  });
  it('shows all three statuses on the last day', () => {
    const [a, b, c] = ['a', 'b', 'c'].map((id) => buildTwin(data, id, data.lastDay));
    expect(overallStatus(a)).toBe('nominal');
    expect(overallStatus(b)).toBe('watch');
    expect(overallStatus(c)).toBe('alert');
    expect(b.systems.find((s) => s.system.id === 'muscle')!.status).toBe('watch');
    expect(c.systems.find((s) => s.system.id === 'circadian')!.status).toBe('alert');
  });
  it('lists alerts first and gives every flagged item an explanation', () => {
    const c = buildTwin(data, 'c', data.lastDay);
    expect(c.advice[0].status).toBe('alert');
    for (const item of c.advice) expect(item.explanation.length).toBeGreaterThan(10);
    expect(buildTwin(data, 'a', data.lastDay).advice).toHaveLength(0);
  });
  it('moves the projection when a what-if changes', () => {
    const base = buildTwin(data, 'c', data.lastDay);
    const better = buildTwin(data, 'c', data.lastDay, { sleepHours: 8 });
    const pick = (t: typeof base) => t.systems.find((s) => s.system.id === 'circadian')!;
    expect(pick(base).day30.baseline.status).toBe('alert');
    expect(pick(better).day30.scenario.status).toBe('nominal');
    expect(pick(better).day30.baseline.value).toBeCloseTo(pick(base).day30.baseline.value, 6);
    expect(pick(better).status).toBe(pick(base).status);
  });
  it('projects 30 days for every system and five agents in the trace', () => {
    const twin = buildTwin(data, 'b', data.lastDay);
    for (const s of twin.systems) expect(s.projection.baseline).toHaveLength(30);
    expect(twin.trace.map((t) => t.agent)).toEqual([
      'Biometric Agent', 'Environment Agent', 'Physiology Agent', 'Prediction Agent', 'Medical Advisor',
    ]);
  });
  it('clamps the mission day to the record', () => {
    expect(buildTwin(data, 'a', 999).missionDay).toBe(data.lastDay);
    expect(buildTwin(data, 'zzz', data.lastDay).crew.id).toBe('a');
  });
});

describe('storage', () => {
  const data = createDataset();
  it('applies typed readings over the simulated ones without changing the original', () => {
    const key = overrideKey('a', data.lastDay, 'sleepHours');
    const patched = applyOverrides(data, { [key]: 3, 'a:999:sleepHours': 1, 'zzz:149:sleepHours': 1 });
    expect(patched.crew[0].readings.sleepHours.at(-1)).toBe(3);
    expect(data.crew[0].readings.sleepHours.at(-1)).not.toBe(3);
  });
  it('ignores broken stored data', () => {
    expect(loadOverrides({ getItem: () => 'not json' })).toEqual({});
    expect(loadOverrides({ getItem: () => '{"a:149:sleepHours":"x","b:149:spo2":97}' })).toEqual({ 'b:149:spo2': 97 });
    expect(loadOverrides({ getItem: () => null })).toEqual({});
  });
});
