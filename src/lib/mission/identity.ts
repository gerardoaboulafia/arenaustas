import type { MissionConfig, TelemetryOverride } from "./types";
import { sortedOverrides } from "./overrides";

export function hashString(text: string, seed = 2166136261): number {
  let hash = seed >>> 0;
  for (let i = 0; i < text.length; i++)
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return hash >>> 0;
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, v]) => `${JSON.stringify(key)}:${canonical(v)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}

/** Stable cache/provenance identifier, not a cryptographic integrity signature. */
export function fingerprint(
  config: MissionConfig,
  overrides: TelemetryOverride[] = [],
): string {
  const normalized = {
    ...config,
    schedule: {
      ...config.schedule,
      workStartHour: config.schedule.workStartHour ?? 9,
      workEndHour: config.schedule.workEndHour ?? 18,
    },
    crew: config.crew.map((member) => ({
      ...member,
      baselines: member.baselines ?? {},
    })),
  };
  const serialized = canonical({
    engine: 1,
    config: normalized,
    overrides: sortedOverrides(overrides),
  });
  return `mission-v1-${hashString(serialized).toString(16).padStart(8, "0")}${hashString(serialized, 0x9e3779b9).toString(16).padStart(8, "0")}`;
}
