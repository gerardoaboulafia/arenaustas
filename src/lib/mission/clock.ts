import type { ClockState } from "./types";
import { DAY } from "./validation";

const speedOf = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.min(value, 100000)
    : 60;
const totalOf = (totalMinute: number): number => {
  if (!Number.isFinite(totalMinute) || totalMinute <= 0)
    throw new RangeError("Mission duration must be positive and finite");
  return totalMinute;
};
export function initialClock(speed = 60): ClockState {
  return { elapsedMinute: 0, status: "ready", speed: speedOf(speed) };
}

/** Restore persisted clocks paused, never automatically running. */
export function sanitizeClock(value: unknown, totalMinute: number): ClockState {
  const total = totalOf(totalMinute);
  if (!value || typeof value !== "object") return initialClock();
  const raw = value as Partial<ClockState>;
  const elapsedMinute =
    typeof raw.elapsedMinute === "number" && Number.isFinite(raw.elapsedMinute)
      ? Math.min(total, Math.max(0, raw.elapsedMinute))
      : 0;
  const status =
    elapsedMinute === total
      ? "completed"
      : raw.status === "ready" && elapsedMinute === 0
        ? "ready"
        : "paused";
  return { elapsedMinute, status, speed: speedOf(raw.speed) };
}

/** deltaMinute is already mission time (the caller applies playback speed). */
export function advanceClock(
  clock: ClockState,
  deltaMinute: number,
  totalMinute: number,
): ClockState {
  const clean = sanitizeClock(clock, totalMinute);
  if (clean.status === "completed" || clock.status !== "running") return clean;
  const delta = Number.isFinite(deltaMinute) ? Math.max(0, deltaMinute) : 0;
  const elapsedMinute = Math.min(totalMinute, clean.elapsedMinute + delta);
  return {
    ...clean,
    elapsedMinute,
    status: elapsedMinute === totalMinute ? "completed" : "running",
  };
}

export function formatMissionTime(minute: number): string {
  const value = Number.isFinite(minute) ? Math.max(0, Math.floor(minute)) : 0;
  const day = Math.floor(value / DAY),
    hour = Math.floor((value % DAY) / 60),
    minutes = value % 60;
  return `D${String(day).padStart(3, "0")} ${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
