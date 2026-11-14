import type { MissionConfig, ValidationResult } from "./types";

export const REQUIRED_ACTIVITIES = [
  "sleep",
  "rest",
  "science",
  "maintenance",
  "meals",
  "exercise",
  "eva_prep",
  "eva",
  "eva_recovery",
  "support",
  "transit",
  "return",
  "launch",
] as const;
export const DAY = 1440;
export const WEEK = 7 * DAY;
export const INTERVAL = 15;
const unsafeIds = new Set(["__proto__", "prototype", "constructor", "habitat"]);
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
export const mod = (value: number, divisor: number): number =>
  ((value % divisor) + divisor) % divisor;

/** Returns a fresh config; omitted per-crew baseline maps are normalized to {}. */
export function validateConfig(
  input: unknown,
): ValidationResult<MissionConfig> {
  const errors: string[] = [];
  const fail = (path: string, reason: string) => {
    errors.push(`${path}: ${reason}`);
  };
  const record = (value: unknown, path: string): Record<string, unknown> => {
    if (!object(value)) {
      fail(path, "must be an object");
      return {};
    }
    return value;
  };
  const text = (value: unknown, path: string) => {
    if (typeof value !== "string" || !value.trim() || value.length > 1000)
      fail(path, "must be a nonempty string (max 1000 characters)");
  };
  const numeric = (
    value: unknown,
    path: string,
    min: number,
    max: number,
    integer = false,
  ) => {
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < min ||
      value > max ||
      (integer && !Number.isInteger(value))
    )
      fail(
        path,
        `must be ${integer ? "an integer" : "finite"} in [${min}, ${max}]`,
      );
  };
  const list = (
    value: unknown,
    path: string,
    min: number,
    max: number,
  ): unknown[] => {
    if (!Array.isArray(value)) {
      fail(path, "must be an array");
      return [];
    }
    if (value.length < min || value.length > max)
      fail(path, `must have ${min}–${max} entries`);
    return value;
  };
  const uniqueIds = (values: unknown[], path: string): Set<string> => {
    const ids = new Set<string>();
    values.forEach((value, index) => {
      const row = record(value, `${path}[${index}]`);
      if (
        typeof row.id !== "string" ||
        !/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(row.id) ||
        unsafeIds.has(row.id)
      )
        fail(`${path}[${index}].id`, "must be a safe, nonreserved identifier");
      else if (ids.has(row.id))
        fail(`${path}[${index}].id`, "duplicate identifier");
      else ids.add(row.id);
    });
    return ids;
  };
  const raw = record(input, "config");
  if (raw.schemaVersion !== 1) fail("schemaVersion", "must equal 1");
  text(raw.revision, "revision");
  numeric(raw.seed, "seed", 0, 0xffffffff, true);
  const timeline = record(raw.timeline, "timeline");
  numeric(timeline.durationDays, "timeline.durationDays", 1, 366, true);
  numeric(timeline.transitHours, "timeline.transitHours", 0.25, 24 * 30);
  numeric(timeline.orbitalDays, "timeline.orbitalDays", 1, 364, true);
  if (timeline.intervalMinutes !== INTERVAL)
    fail("timeline.intervalMinutes", "must equal 15");
  if (
    typeof timeline.transitHours === "number" &&
    (timeline.transitHours * 60) % INTERVAL !== 0
  )
    fail("timeline.transitHours", "must end on a 15-minute boundary");
  if (
    typeof timeline.durationDays === "number" &&
    typeof timeline.orbitalDays === "number" &&
    typeof timeline.transitHours === "number" &&
    timeline.durationDays * DAY -
      timeline.orbitalDays * DAY -
      timeline.transitHours * 60 <
      INTERVAL
  )
    fail(
      "timeline",
      "must include transit, orbit and at least 15 minutes of return",
    );

  const activities = list(
    raw.activities,
    "activities",
    REQUIRED_ACTIVITIES.length,
    64,
  );
  const activityIds = uniqueIds(activities, "activities");
  for (const id of REQUIRED_ACTIVITIES)
    if (!activityIds.has(id))
      fail("activities", `missing reserved activity ${id}`);
  activities.forEach((value, i) => {
    const row = record(value, `activities[${i}]`);
    text(row.label, `activities[${i}].label`);
    text(row.color, `activities[${i}].color`);
  });
  const metrics = list(raw.metrics, "metrics", 1, 32);
  const metricIds = uniqueIds(metrics, "metrics");
  const refs = (value: unknown, path: string) => {
    const values = list(value, path, 1, 64);
    if (new Set(values).size !== values.length)
      fail(path, "duplicate activity reference");
    values.forEach((id) => {
      if (typeof id !== "string" || !activityIds.has(id))
        fail(path, `unknown activity ${String(id)}`);
    });
  };
  metrics.forEach((value, i) => {
    const path = `metrics[${i}]`,
      row = record(value, path);
    for (const field of ["label", "unit", "description"])
      text(row[field], `${path}.${field}`);
    if (row.scope !== "crew" && row.scope !== "habitat")
      fail(`${path}.scope`, "must be crew or habitat");
    if (row.aggregation !== "mean" && row.aggregation !== "sum")
      fail(`${path}.aggregation`, "must be mean or sum");
    numeric(row.decimals, `${path}.decimals`, 0, 8, true);
    numeric(row.min, `${path}.min`, -1e9, 1e9);
    numeric(row.max, `${path}.max`, -1e9, 1e9);
    if (
      typeof row.min === "number" &&
      typeof row.max === "number" &&
      row.min >= row.max
    )
      fail(path, "min must be less than max");
    const generator = record(row.generator, `${path}.generator`);
    // Bounds describe the final 15-minute record; sum generators use units/minute.
    const scale = row.aggregation === "sum" ? INTERVAL : 1;
    numeric(
      generator.baseline,
      `${path}.generator.baseline`,
      Number(row.min) / scale,
      Number(row.max) / scale,
    );
    numeric(generator.noise, `${path}.generator.noise`, 0, 1e9);
    const offsets = record(
      generator.activityOffsets,
      `${path}.generator.activityOffsets`,
    );
    for (const [id, offset] of Object.entries(offsets)) {
      if (!activityIds.has(id))
        fail(`${path}.generator.activityOffsets`, `unknown activity ${id}`);
      numeric(offset, `${path}.generator.activityOffsets.${id}`, -1e9, 1e9);
    }
    if (generator.activeOnly !== undefined)
      refs(generator.activeOnly, `${path}.generator.activeOnly`);
    if (generator.trendPerDay !== undefined)
      numeric(
        generator.trendPerDay,
        `${path}.generator.trendPerDay`,
        -1e6,
        1e6,
      );
    if (generator.settlingMinutes !== undefined)
      numeric(
        generator.settlingMinutes,
        `${path}.generator.settlingMinutes`,
        0,
        DAY,
        true,
      );
    if (row.review !== undefined) {
      const review = record(row.review, `${path}.review`);
      numeric(
        review.relativeDeviation,
        `${path}.review.relativeDeviation`,
        0.000001,
        1000,
      );
      numeric(
        review.minimumSamples,
        `${path}.review.minimumSamples`,
        1,
        14 * 96,
        true,
      );
      if (review.activities !== undefined)
        refs(review.activities, `${path}.review.activities`);
    }
  });
  const crew = list(raw.crew, "crew", 2, 8);
  uniqueIds(crew, "crew");
  if (crew.length % 2 !== 0)
    fail("crew", "must have an even number of members");
  let pairA = 0,
    pairB = 0;
  crew.forEach((value, i) => {
    const path = `crew[${i}]`,
      row = record(value, path);
    for (const field of ["name", "role", "color"])
      text(row[field], `${path}.${field}`);
    if (row.pair === "A") pairA++;
    else if (row.pair === "B") pairB++;
    else fail(`${path}.pair`, "must be A or B");
    if (row.baselines !== undefined)
      for (const [id, baseline] of Object.entries(
        record(row.baselines, `${path}.baselines`),
      )) {
        if (!metricIds.has(id)) {
          fail(`${path}.baselines`, `unknown metric ${id}`);
          continue;
        }
        const metric = metrics.find((m) => object(m) && m.id === id) as Record<
          string,
          unknown
        >;
        if (metric.scope === "habitat")
          fail(
            `${path}.baselines.${id}`,
            "habitat baselines cannot differ by crew",
          );
        const scale = metric.aggregation === "sum" ? INTERVAL : 1;
        numeric(
          baseline,
          `${path}.baselines.${id}`,
          Number(metric.min) / scale,
          Number(metric.max) / scale,
        );
      }
  });
  if (pairA !== pairB || !pairA)
    fail("crew", "must have equally sized A and B groups");

  const schedule = record(raw.schedule, "schedule");
  const workStart =
    schedule.workStartHour === undefined ? 9 : schedule.workStartHour;
  const workEnd =
    schedule.workEndHour === undefined ? 18 : schedule.workEndHour;
  numeric(workStart, "schedule.workStartHour", 0, 23, true);
  numeric(workEnd, "schedule.workEndHour", 0, 23, true);
  if (
    typeof workStart === "number" &&
    typeof workEnd === "number" &&
    workStart >= workEnd
  )
    fail("schedule", "workStartHour must be before workEndHour");
  for (const field of ["sleepStartHour", "exerciseStartHour", "evaStartHour"])
    numeric(schedule[field], `schedule.${field}`, 0, 23, true);
  numeric(schedule.sleepHours, "schedule.sleepHours", 1, 16, true);
  const exerciseDays = list(
    schedule.exerciseDays,
    "schedule.exerciseDays",
    0,
    7,
  );
  exerciseDays.forEach((day, i) =>
    numeric(day, `schedule.exerciseDays[${i}]`, 0, 6, true),
  );
  if (new Set(exerciseDays).size !== exerciseDays.length)
    fail("schedule.exerciseDays", "duplicate day");
  numeric(schedule.evaDay, "schedule.evaDay", 0, 6, true);
  for (const field of [
    "exerciseMinutes",
    "evaPrepMinutes",
    "evaMinutes",
    "evaRecoveryMinutes",
  ])
    numeric(schedule[field], `schedule.${field}`, 1, 720, true);
  const meals = list(schedule.meals, "schedule.meals", 0, 8);
  meals.forEach((value, i) => {
    const meal = record(value, `schedule.meals[${i}]`);
    numeric(meal.hour, `schedule.meals[${i}].hour`, 0, 23, true);
    numeric(meal.minutes, `schedule.meals[${i}].minutes`, 1, 180, true);
  });
  if (errors.length) return { value: null, errors };
  const config = structuredClone(input) as MissionConfig;
  config.crew = config.crew.map((member) => ({
    ...member,
    baselines: member.baselines ?? {},
  }));
  Object.assign(config.schedule, {
    workStartHour: workStart,
    workEndHour: workEnd,
  });
  validateSchedule(config, fail);
  return errors.length
    ? { value: null, errors }
    : { value: config, errors: [] };
}

/** Check a repeating orbital week minute by minute, including midnight wraps. */
function validateSchedule(
  config: MissionConfig,
  fail: (path: string, reason: string) => void,
): void {
  const s = config.schedule;
  const entry = mod(config.timeline.transitHours * 60, DAY);
  const evaStart = s.evaDay * DAY + mod(s.evaStartHour * 60 - entry, DAY);
  const evaFrom = evaStart - s.evaPrepMinutes,
    evaTo = evaStart + s.evaMinutes + s.evaRecoveryMinutes;
  if (evaFrom < s.evaDay * DAY || evaTo > (s.evaDay + 1) * DAY)
    fail(
      "schedule.evaStartHour",
      "EVA including prep/recovery must fit its orbital-relative day",
    );
  const exercises = s.exerciseDays.map(
    (day) => day * DAY + mod(s.exerciseStartHour * 60 - entry, DAY),
  );
  for (const start of exercises)
    if ((start % DAY) + s.exerciseMinutes > DAY)
      fail(
        "schedule.exerciseStartHour",
        "exercise must fit its orbital-relative day",
      );
  const collisions = new Set<string>();
  for (let minute = 0; minute < WEEK; minute++) {
    const utc = mod(entry + minute, DAY);
    const sleeping = mod(utc - s.sleepStartHour * 60, DAY) < s.sleepHours * 60;
    const mealCount = s.meals.filter(
      (meal) => mod(utc - meal.hour * 60, DAY) < meal.minutes,
    ).length;
    const exercising = exercises.some(
      (start) => minute >= start && minute < start + s.exerciseMinutes,
    );
    const eva = minute >= evaFrom && minute < evaTo;
    if (mealCount > 1) collisions.add("meals overlap each other");
    if (sleeping && mealCount) collisions.add("meals overlap sleep");
    if (sleeping && exercising) collisions.add("exercise overlaps sleep");
    if (sleeping && eva) collisions.add("EVA/prep/recovery overlaps sleep");
    if (eva && exercising)
      collisions.add("EVA/prep/recovery overlaps exercise");
    if (mealCount && exercising) collisions.add("exercise overlaps meals");
    // Meals are intentionally suppressed during EVA/prep/recovery and support.
  }
  for (const reason of collisions) fail("schedule", reason);
}

export function assertConfig(config: MissionConfig): MissionConfig {
  const checked = validateConfig(config);
  if (!checked.value)
    throw new Error(`Invalid mission config: ${checked.errors.join("; ")}`);
  return checked.value;
}
