// AI-assisted: written with Claude Code, reviewed by the team.
// Simulated mission data. Seeded, so every load gives the same numbers.
// None of these values describes a real person or a real mission.
// The four fictional crew members (names and roles) come from the team's `astra` branch.
import type { CrewMember, Dataset, Series } from './types';

export const FIRST_DAY = 120;
export const LAST_DAY = 149;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Channel {
  base: number;
  noise: number;
  decimals: number;
  /** Multiplier or offset applied from a mission day onward. */
  shift?: { fromDay: number; factor?: number; to?: number };
}

function series(rand: () => number, c: Channel): Series {
  const f = 10 ** c.decimals;
  return Array.from({ length: LAST_DAY - FIRST_DAY + 1 }, (_, i) => {
    const day = FIRST_DAY + i;
    let level = c.base;
    if (c.shift && day >= c.shift.fromDay) level = c.shift.to ?? c.base * (c.shift.factor ?? 1);
    return Math.round((level + (rand() * 2 - 1) * c.noise) * f) / f;
  });
}

function member(
  id: string,
  label: string,
  role: string,
  seed: number,
  channels: Record<string, Channel>,
  start: Record<string, number>,
): CrewMember {
  const rand = mulberry32(seed);
  const readings: Record<string, Series> = {};
  for (const [key, channel] of Object.entries(channels)) readings[key] = series(rand, channel);
  return { id, label, role, readings, start };
}

const common = (overrides: Record<string, Partial<Channel>>, bases: Record<string, number>): Record<string, Channel> => {
  const template: Record<string, Channel> = {
    restingHr: { base: bases.restingHr, noise: 2, decimals: 0 },
    sleepHours: { base: bases.sleepHours, noise: 0.3, decimals: 1 },
    hrvMs: { base: bases.hrvMs, noise: 4, decimals: 0 },
    spo2: { base: bases.spo2, noise: 0.6, decimals: 0 },
    skinTempC: { base: bases.skinTempC, noise: 0.2, decimals: 1 },
    exerciseMin: { base: bases.exerciseMin, noise: 4, decimals: 0 },
    cabinCo2: { base: 2.6, noise: 0.12, decimals: 2 },
    radiationDose: { base: 0.55, noise: 0.05, decimals: 2 },
    // Added after the first eight, so their seeded values stay the same.
    mood: { base: bases.mood ?? 4, noise: 0.6, decimals: 0 },
    systolicBp: { base: bases.systolicBp ?? 118, noise: 4, decimals: 0 },
    diastolicBp: { base: bases.diastolicBp ?? 76, noise: 3, decimals: 0 },
    glucose: { base: bases.glucose ?? 92, noise: 5, decimals: 0 },
    bodyTempC: { base: bases.bodyTempC ?? 36.7, noise: 0.15, decimals: 1 },
  };
  for (const [key, patch] of Object.entries(overrides)) template[key] = { ...template[key], ...patch };
  return template;
};

export function createDataset(): Dataset {
  return {
    firstDay: FIRST_DAY,
    lastDay: LAST_DAY,
    simulated: true,
    crew: [
      member(
        'a', 'Maya Torres', 'Mission Commander', 11,
        common({}, { restingHr: 56, sleepHours: 7.6, hrvMs: 62, spo2: 97, skinTempC: 33.4, exerciseMin: 62 }),
        { bone: 98.9, muscle: 98.2, cardio: 98.6, radiation: 66 },
      ),
      member(
        'b', 'Eli Chen', 'Flight Engineer', 22,
        common(
          { exerciseMin: { shift: { fromDay: 138, to: 32 } } },
          { restingHr: 60, sleepHours: 7.6, hrvMs: 55, spo2: 98, skinTempC: 33.1, exerciseMin: 56 },
        ),
        { bone: 97.45, muscle: 95.6, cardio: 96.4, radiation: 64 },
      ),
      member(
        'c', 'Sofia Okafor', 'Science Officer', 33,
        common(
          {
            sleepHours: { shift: { fromDay: 143, to: 5.1 } },
            hrvMs: { shift: { fromDay: 143, factor: 0.8 } },
            restingHr: { shift: { fromDay: 143, factor: 1.06 } },
            cabinCo2: { shift: { fromDay: 145, factor: 1.32 } },
            mood: { shift: { fromDay: 144, to: 2.7 } },
          },
          { restingHr: 58, sleepHours: 7.4, hrvMs: 60, spo2: 97, skinTempC: 33.6, exerciseMin: 58 },
        ),
        { bone: 98.3, muscle: 97.4, cardio: 97.9, radiation: 65 },
      ),
      // Several small shifts at once, each inside its own limit: the case single-indicator rules miss.
      member(
        'd', 'Noah Patel', 'Medical Officer', 44,
        common(
          {
            sleepHours: { shift: { fromDay: 143, to: 7.6 } },
            hrvMs: { shift: { fromDay: 143, factor: 0.9 } },
            restingHr: { shift: { fromDay: 143, factor: 1.06 } },
            skinTempC: { shift: { fromDay: 143, to: 33.6 } },
          },
          { restingHr: 57, sleepHours: 8.2, hrvMs: 64, spo2: 97, skinTempC: 33.2, exerciseMin: 60 },
        ),
        { bone: 98.6, muscle: 97.9, cardio: 98.2, radiation: 66 },
      ),
    ],
  };
}
