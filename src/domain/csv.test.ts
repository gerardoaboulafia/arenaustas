// AI-assisted: written with Claude Code, reviewed by the team.
// Checks carried over from the team's `astra` branch: data that leaves the tool comes back unchanged,
// a bad file changes nothing, a missing value stays missing, and nothing reads the future.
import { describe, expect, it } from 'vitest';
import { CSV_HEADER, applyOverrides, buildTwin, createDataset, evaluateIndicator, exportReadings, importReadings, indicators, modelById, rules, sourceById } from './index';

const base = createDataset();
const DAY = 149;

describe('readings as CSV', () => {
  it('exports one row per day, crew member and indicator, and never the future', () => {
    const csv = exportReadings(base, indicators, 140);
    const lines = csv.trim().split('\n');
    expect(lines[0]).toBe(CSV_HEADER);
    expect(lines.length - 1).toBe((140 - base.firstDay + 1) * base.crew.length * indicators.length);
    expect(lines.some((line) => line.startsWith('141,'))).toBe(false);
  });

  it('round-trips: importing an untouched export changes nothing', () => {
    const result = importReadings(exportReadings(base, indicators, DAY), base, indicators, DAY);
    expect(result.errors).toEqual([]);
    expect(result.rows).toBe(30 * 4 * indicators.length);
    expect(result.changed).toBe(0);
    expect(result.overrides).toEqual({});
  });

  it('keeps only the readings that differ, and they reach the twin', () => {
    const csv = `${CSV_HEADER}\n147,a,sleepHours,4\n148,a,sleepHours,4\n149,a,sleepHours,4\n`;
    const result = importReadings(csv, base, indicators, DAY);
    expect(result.overrides).toEqual({ 'a:147:sleepHours': 4, 'a:148:sleepHours': 4, 'a:149:sleepHours': 4 });
    const twin = buildTwin(applyOverrides(base, result.overrides!), 'a', DAY);
    expect(twin.indicators.find((r) => r.indicator.id === 'sleepHours')!.status).toBe('alert');
  });

  it('keeps an empty value as "no reading", not zero', () => {
    const result = importReadings(`${CSV_HEADER}\n149,b,mood,\n`, base, indicators, DAY);
    expect(result.overrides).toEqual({ 'b:149:mood': null });
  });

  it('exports typed-in readings and missing values as they are', () => {
    const edited = applyOverrides(base, { 'c:149:spo2': 91, 'c:148:spo2': null });
    const csv = exportReadings(edited, indicators, DAY);
    expect(csv).toContain('\n149,c,spo2,91\n');
    expect(csv).toContain('\n148,c,spo2,\n');
  });

  it('accepts a byte-order mark, Windows line ends, quotes and blank lines', () => {
    const result = importReadings(`﻿"mission_day","crew_id","indicator_id","value"\r\n\r\n"149","d","restingHr","70"\r\n`, base, indicators, DAY);
    expect(result.errors).toEqual([]);
    expect(result.overrides).toEqual({ 'd:149:restingHr': 70 });
  });

  it('rejects the whole file when any row is wrong, and says where', () => {
    const csv = [
      CSV_HEADER,
      '149,a,sleepHours,6',
      '149,z,sleepHours,6',
      '149,a,unknownThing,6',
      '149,a,spo2,abc',
      '149,a,restingHr,9999',
      '150,a,spo2,97',
      '149,a,spo2',
      '149,a,sleepHours,7',
    ].join('\n');
    const current = { 'b:149:mood': 2 };
    const result = importReadings(csv, base, indicators, DAY, current);
    expect(result.overrides).toBeNull();
    expect(result.changed).toBe(0);
    expect(result.errors).toEqual([
      'Line 3: unknown crew member "z".',
      'Line 4: unknown indicator "unknownThing".',
      'Line 5: "abc" is not a number.',
      expect.stringContaining('Line 6: 9999 is outside'),
      expect.stringContaining('Line 7: day 150 is after mission day 149'),
      'Line 8: expected 4 values, found 3.',
      'Line 9: a second value for a, day 149, sleepHours.',
    ]);
    expect(current).toEqual({ 'b:149:mood': 2 });
  });

  it('rejects a file with the wrong header or no content', () => {
    expect(importReadings('day,crew,indicator,value\n149,a,spo2,97\n', base, indicators, DAY).overrides).toBeNull();
    expect(importReadings('  \n', base, indicators, DAY).errors).toEqual(['The file is empty.']);
  });

  it('keeps earlier typed-in readings the file does not mention, and clears one set back to the simulated value', () => {
    const simulated = base.crew[0].readings.spo2[DAY - base.firstDay];
    const result = importReadings(`${CSV_HEADER}\n149,a,spo2,${simulated}\n`, base, indicators, DAY, { 'a:149:spo2': 90, 'b:149:mood': 2 });
    expect(result.overrides).toEqual({ 'b:149:mood': 2 });
  });
});

describe('no reading from the future reaches the twin', () => {
  it('gives the same twin on a day whatever is recorded after it', () => {
    const later: Record<string, number> = {};
    for (let day = 141; day <= base.lastDay; day++) {
      later[`b:${day}:sleepHours`] = 4;
      later[`b:${day}:restingHr`] = 95;
      later[`b:${day}:exerciseMin`] = 0;
    }
    const before = buildTwin(base, 'b', 140);
    const after = buildTwin(applyOverrides(base, later), 'b', 140);
    expect(after.indicators.map((r) => [r.indicator.id, r.status, r.recent])).toEqual(before.indicators.map((r) => [r.indicator.id, r.status, r.recent]));
    expect(after.systems.map((s) => [s.system.id, s.status, s.value, s.day30.baseline.value])).toEqual(before.systems.map((s) => [s.system.id, s.status, s.value, s.day30.baseline.value]));
    expect(after.pattern.ratio).toBe(before.pattern.ratio);
    expect(after.advice.map((a) => a.key)).toEqual(before.advice.map((a) => a.key));
  });
});

describe('crew', () => {
  it('is four fictional people with a role each', () => {
    expect(base.crew.map((c) => c.label)).toEqual(['Maya Torres', 'Eli Chen', 'Sofia Okafor', 'Noah Patel']);
    expect(base.crew.every((c) => c.role.length > 0)).toBe(true);
  });
});

describe('limits taken from NASA sources', () => {
  const co2 = indicators.find((n) => n.id === 'cabinCo2')!;

  it('carry a source and are never an assumption', () => {
    for (const indicator of indicators.filter((n) => n.limit)) {
      expect(indicator.limit!.basis).not.toBe('assumption');
      expect(sourceById(indicator.limit!.sourceId)).toBeDefined();
    }
    const radiation = modelById('radiation-cumulative');
    expect(radiation.parameters.careerLimitMsv).toBe(600);
    expect(radiation.parameterBasis.careerLimitMsv).toBe('nasa');
    expect(radiation.alsoSourceIds!.every((id) => sourceById(id))).toBe(true);
  });

  it('raise an alert at the limit even when the change from the personal baseline is small', () => {
    // Baseline 2.9 mmHg, then 3.0: far below the +25% watch step, but at NASA's 3 mmHg limit.
    const series = [...Array(14).fill(2.9), ...Array(6).fill(3.0)];
    const result = evaluateIndicator(co2, series, 19, rules);
    expect(result.status).toBe('alert');
    expect(result.overLimit).toBe(true);
    expect(result.reason).toContain('limit of 3 mmHg');
    const below = evaluateIndicator(co2, [...Array(14).fill(2.9), ...Array(6).fill(2.95)], 19, rules);
    expect(below.status).toBe('nominal');
    expect(below.overLimit).toBe(false);
  });

  it('apply to the simulated crew: only the one whose cabin CO2 rose is over the limit', () => {
    const over = base.crew.map((c) => buildTwin(base, c.id, DAY).indicators.find((r) => r.indicator.id === 'cabinCo2')!.overLimit);
    expect(over).toEqual([false, false, true, false]);
  });

  it('keep the projected mission dose far below the career limit in the simulated data', () => {
    const twin = buildTwin(base, 'c', DAY);
    const day30 = twin.radiation.baseline[twin.radiation.baseline.length - 1];
    expect(day30).toBeLessThan(twin.radiation.model.parameters.careerLimitMsv);
  });
});
