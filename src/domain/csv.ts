// AI-assisted: written with Claude Code, reviewed by the team.
// Readings as CSV, so they can leave the tool and come back.
// The feature and its rules come from the team's `astra` branch: check every row, change nothing
// if any row is wrong, keep an empty value as "no reading", and never export or accept the future.
import { overrideKey } from './storage';
import type { Overrides } from './storage';
import type { Dataset, Indicator } from './types';

export const CSV_HEADER = 'mission_day,crew_id,indicator_id,value';

/** Every reading of every crew member from the first recorded day up to `upToDay`. An empty value means no reading. */
export function exportReadings(dataset: Dataset, indicators: Indicator[], upToDay: number): string {
  const lines = [CSV_HEADER];
  const last = Math.min(upToDay, dataset.lastDay);
  for (let day = dataset.firstDay; day <= last; day++) {
    for (const member of dataset.crew) {
      for (const indicator of indicators) {
        const value = member.readings[indicator.id]?.[day - dataset.firstDay];
        lines.push(`${day},${member.id},${indicator.id},${typeof value === 'number' ? value : ''}`);
      }
    }
  }
  return `${lines.join('\n')}\n`;
}

export interface ImportResult {
  /** The readings to keep over the simulated ones, or null when the file was rejected. */
  overrides: Overrides | null;
  /** Data rows read from the file. */
  rows: number;
  /** Rows whose value differs from the simulated reading. */
  changed: number;
  errors: string[];
}

const unquote = (cell: string) => cell.trim().replace(/^"(.*)"$/, '$1').trim();

/**
 * Reads a CSV in the export format. `base` is the simulated dataset without typed-in readings.
 * The result keeps `current` for readings the file does not mention. Any error rejects the whole file.
 */
export function importReadings(
  text: string, base: Dataset, indicators: Indicator[], upToDay: number, current: Overrides = {},
): ImportResult {
  const errors: string[] = [];
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  const firstLine = lines.findIndex((line) => line.trim() !== '');
  if (firstLine === -1) return { overrides: null, rows: 0, changed: 0, errors: ['The file is empty.'] };
  if (lines[firstLine].split(',').map(unquote).join(',').toLowerCase() !== CSV_HEADER) {
    return { overrides: null, rows: 0, changed: 0, errors: [`The first line must be: ${CSV_HEADER}`] };
  }

  const last = Math.min(upToDay, base.lastDay);
  const next: Overrides = { ...current };
  const seen = new Set<string>();
  let rows = 0;
  let changed = 0;

  for (let i = firstLine + 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    rows += 1;
    const at = `Line ${i + 1}`;
    const cells = lines[i].split(',').map(unquote);
    if (cells.length !== 4) {
      errors.push(`${at}: expected 4 values, found ${cells.length}.`);
      continue;
    }
    const [dayText, crewId, indicatorId, valueText] = cells;
    const day = Number(dayText);
    const member = base.crew.find((c) => c.id === crewId);
    const indicator = indicators.find((n) => n.id === indicatorId);
    if (!Number.isInteger(day) || dayText === '') errors.push(`${at}: "${dayText}" is not a mission day.`);
    else if (day < base.firstDay) errors.push(`${at}: day ${day} is before the first recorded day, ${base.firstDay}.`);
    else if (day > last) errors.push(`${at}: day ${day} is after mission day ${last}. Readings from the future are not accepted.`);
    if (!member) errors.push(`${at}: unknown crew member "${crewId}".`);
    if (!indicator) errors.push(`${at}: unknown indicator "${indicatorId}".`);

    let value: number | null = null;
    if (valueText !== '') {
      value = Number(valueText);
      if (!Number.isFinite(value)) errors.push(`${at}: "${valueText}" is not a number.`);
      else if (indicator && (value < indicator.input.min || value > indicator.input.max)) {
        errors.push(`${at}: ${value} is outside ${indicator.input.min} to ${indicator.input.max} ${indicator.unit}.`);
      }
    }

    const key = overrideKey(crewId, day, indicatorId);
    if (seen.has(key)) errors.push(`${at}: a second value for ${crewId}, day ${day}, ${indicatorId}.`);
    seen.add(key);
    if (errors.length > 0 || !member || !indicator) continue;

    const simulated = member.readings[indicatorId]?.[day - base.firstDay] ?? null;
    if (value === simulated) delete next[key];
    else {
      next[key] = value;
      changed += 1;
    }
  }

  if (errors.length > 0) return { overrides: null, rows, changed: 0, errors };
  return { overrides: next, rows, changed, errors };
}
