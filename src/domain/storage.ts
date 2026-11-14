// AI-assisted: written with Claude Code, reviewed by the team.
// Readings typed in the Log screen are kept in the browser only. Nothing is sent anywhere.
import type { Dataset } from './types';

/** Key: `${crewId}:${missionDay}:${indicatorId}`. A null value records "no reading". */
export type Overrides = Record<string, number | null>;

const KEY = 'astra.readings.v1';

export const overrideKey = (crewId: string, day: number, indicatorId: string) => `${crewId}:${day}:${indicatorId}`;

export function loadOverrides(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): Overrides {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(KEY) ?? '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const clean: Overrides = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value === null || (typeof value === 'number' && Number.isFinite(value))) clean[key] = value;
    }
    return clean;
  } catch {
    return {};
  }
}

export function saveOverrides(overrides: Overrides, storage: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage): void {
  try {
    storage?.setItem(KEY, JSON.stringify(overrides));
  } catch {
    // Private windows can refuse storage; the session still works in memory.
  }
}

/** A copy of the dataset with the typed-in readings applied over the simulated ones. */
export function applyOverrides(dataset: Dataset, overrides: Overrides): Dataset {
  if (!Object.keys(overrides).length) return dataset;
  return {
    ...dataset,
    crew: dataset.crew.map((member) => {
      const readings = { ...member.readings };
      for (const [key, value] of Object.entries(overrides)) {
        const [crewId, day, indicatorId] = key.split(':');
        const index = Number(day) - dataset.firstDay;
        if (crewId !== member.id || !readings[indicatorId] || index < 0 || index >= readings[indicatorId].length) continue;
        readings[indicatorId] = readings[indicatorId].map((v, i) => (i === index ? value : v));
      }
      return { ...member, readings };
    }),
  };
}
