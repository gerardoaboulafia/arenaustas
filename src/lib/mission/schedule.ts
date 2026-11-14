import type { ActivitySlot, MissionConfig, MissionPhase } from "./types";
import { DAY, WEEK, mod } from "./validation";

function finiteMinute(minute: number): number {
  if (!Number.isFinite(minute))
    throw new RangeError("Mission minute must be finite");
  return Math.max(0, Math.floor(minute));
}

export function phaseAt(config: MissionConfig, minute: number): MissionPhase {
  minute = finiteMinute(minute);
  if (minute >= config.timeline.durationDays * DAY) return "complete";
  if (minute < config.timeline.transitHours * 60) return "transit";
  if (
    minute <
    config.timeline.transitHours * 60 + config.timeline.orbitalDays * DAY
  )
    return "orbit";
  return "return";
}

/** Compile invariant lookups once for the minute synthesis loop. */
export function activityResolver(
  config: MissionConfig,
  crewId: string,
): (minute: number) => { activityId: string; orbitalWeek: number | null } {
  const crew = config.crew.find((member) => member.id === crewId);
  if (!crew && crewId !== "habitat")
    throw new RangeError(`Unknown crew: ${crewId}`);
  const s = config.schedule,
    entry = config.timeline.transitHours * 60;
  const orbitEnd = entry + config.timeline.orbitalDays * DAY;
  const total = config.timeline.durationDays * DAY;
  const fullWeeks = Math.floor(config.timeline.orbitalDays / 7);
  const exerciseOffset = mod(s.exerciseStartHour * 60 - entry, DAY);
  const evaOffset = mod(s.evaStartHour * 60 - entry, DAY);
  const exerciseDays = new Set(s.exerciseDays);
  return (minute: number) => {
    const orbit = minute >= entry && minute < orbitEnd;
    const relative = minute - entry;
    const week = Math.floor(relative / WEEK);
    const day = Math.floor(relative / DAY) % 7;
    const dayMinute = mod(relative, DAY),
      utc = mod(minute, DAY);
    const orbitalWeek = orbit ? week + 1 : null;
    const result = (activityId: string) => ({ activityId, orbitalWeek });
    if (minute >= total) return result("rest");
    if (minute < Math.min(60, entry)) return result("launch");
    if (mod(utc - s.sleepStartHour * 60, DAY) < s.sleepHours * 60)
      return result("sleep");
    if (orbit && week < fullWeeks) {
      if (
        day === s.evaDay &&
        dayMinute >= evaOffset - s.evaPrepMinutes &&
        dayMinute < evaOffset + s.evaMinutes + s.evaRecoveryMinutes
      ) {
        // Habitat uses a shared station timeline: support, never a crew's EVA.
        if (!crew || crew.pair !== (week % 2 === 0 ? "A" : "B"))
          return result("support");
        if (dayMinute < evaOffset) return result("eva_prep");
        if (dayMinute < evaOffset + s.evaMinutes) return result("eva");
        return result("eva_recovery");
      }
      if (
        crew &&
        exerciseDays.has(day) &&
        dayMinute >= exerciseOffset &&
        dayMinute < exerciseOffset + s.exerciseMinutes
      )
        return result("exercise");
    }
    if (s.meals.some((meal) => mod(utc - meal.hour * 60, DAY) < meal.minutes))
      return result("meals");
    if (!orbit) return result(minute < entry ? "transit" : "return");
    if (day === 6) return result("rest");
    if (utc < (s.workStartHour ?? 9) * 60 || utc >= (s.workEndHour ?? 18) * 60)
      return result("rest");
    if (week >= fullWeeks) return result("maintenance");
    return result(utc < 15 * 60 ? "science" : "maintenance");
  };
}

export function activityAt(
  config: MissionConfig,
  crewId: string,
  minute: number,
): { activityId: string; orbitalWeek: number | null } {
  return activityResolver(config, crewId)(finiteMinute(minute));
}

/** Half-open, gap-free intervals; query endpoints are clipped to the mission. */
export function getSchedule(
  config: MissionConfig,
  crewId: string,
  start: number,
  end: number,
): ActivitySlot[] {
  const resolve = activityResolver(config, crewId);
  const total = config.timeline.durationDays * DAY;
  const from = Math.min(total, finiteMinute(start)),
    to = Math.min(total, finiteMinute(end));
  const slots: ActivitySlot[] = [];
  for (let minute = from; minute < to; minute++) {
    const activity = resolve(minute),
      last = slots[slots.length - 1];
    if (
      last &&
      last.activityId === activity.activityId &&
      last.orbitalWeek === activity.orbitalWeek &&
      phaseAt(config, minute) === phaseAt(config, minute - 1)
    )
      last.endMinute = minute + 1;
    else
      slots.push({
        startMinute: minute,
        endMinute: minute + 1,
        crewId,
        ...activity,
      });
  }
  return slots;
}
