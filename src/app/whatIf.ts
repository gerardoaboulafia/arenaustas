// AI-assisted: written with Claude Code, reviewed by the team.
import type { WhatIfInput } from '../domain';

/** The three things the astronaut can change in a what-if. Ranges are slider limits, not medical limits. */
export const WHAT_IF: Record<WhatIfInput, { label: string; unit: string; min: number; max: number; step: number; system: string }> = {
  sleepHours: { label: 'Sleep', unit: 'h per night', min: 4, max: 10, step: 0.5, system: 'circadian' },
  exerciseMin: { label: 'Resistive exercise', unit: 'min per day', min: 0, max: 120, step: 5, system: 'bone' },
  radiationDose: { label: 'Radiation exposure', unit: 'mSv per day', min: 0, max: 2, step: 0.05, system: 'radiation' },
};

export function snap(input: WhatIfInput, value: number): number {
  const { min, max, step } = WHAT_IF[input];
  const snapped = Math.round(value / step) * step;
  return Math.round(Math.min(max, Math.max(min, snapped)) * 100) / 100;
}
