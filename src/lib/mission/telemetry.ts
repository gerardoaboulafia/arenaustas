import type {
  MetricDefinition,
  MissionConfig,
  TelemetryOverride,
  TelemetryRow,
} from "./types";
import { activityResolver } from "./schedule";
import { hashString } from "./identity";
import { DAY, INTERVAL, assertConfig } from "./validation";
import { overrideKey, validateOverrides } from "./overrides";

function noiseAt(seed: number, minute: number): number {
  let value = (seed ^ Math.imul(minute + 1, 0x9e3779b1)) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
  return (((value ^ (value >>> 15)) >>> 0) / 0xffffffff) * 2 - 1;
}

interface CompiledMetric {
  metric: MetricDefinition;
  seed: number;
  baseline: number;
  active: Set<string> | null;
  lower: number;
  upper: number;
  trend: number;
  scale: number;
  rounding: number;
}

function synthesize(
  config: MissionConfig,
  crewId: string,
  metrics: MetricDefinition[],
  overrides: Map<string, number | null>,
): TelemetryRow[] {
  const crew = config.crew.find((member) => member.id === crewId),
    resolve = activityResolver(config, crewId);
  const compiled: CompiledMetric[] = metrics.map((metric) => {
    const scale = metric.aggregation === "sum" ? INTERVAL : 1;
    return {
      metric,
      seed: hashString(`${config.seed}|${crewId}|${metric.id}`),
      baseline: crew?.baselines[metric.id] ?? metric.generator.baseline,
      active: metric.generator.activeOnly
        ? new Set(metric.generator.activeOnly)
        : null,
      lower: metric.min / scale,
      upper: metric.max / scale,
      trend: (metric.generator.trendPerDay ?? 0) / DAY,
      scale,
      rounding: 10 ** metric.decimals,
    };
  });
  const rows: TelemetryRow[] = [],
    total = config.timeline.durationDays * DAY;
  const sums = new Float64Array(compiled.length),
    valid = new Uint8Array(compiled.length);
  let lastActivity = "",
    activityStart = 0;
  for (let start = 0; start < total; start += INTERVAL) {
    sums.fill(0);
    valid.fill(1);
    const activityMinutes: Record<string, number> = {};
    let endActivity = "rest";
    for (let minute = start; minute < start + INTERVAL; minute++) {
      const activity = resolve(minute).activityId;
      endActivity = activity;
      activityMinutes[activity] = (activityMinutes[activity] ?? 0) + 1;
      if (activity !== lastActivity) {
        activityStart = minute;
        lastActivity = activity;
      }
      for (let index = 0; index < compiled.length; index++) {
        const c = compiled[index],
          generator = c.metric.generator;
        // A mixed/ineligible or unsettled minute invalidates the entire window.
        if (
          (c.active && !c.active.has(activity)) ||
          minute - activityStart < (generator.settlingMinutes ?? 0)
        ) {
          valid[index] = 0;
          continue;
        }
        const value =
          c.baseline +
          (generator.activityOffsets[activity] ?? 0) +
          minute * c.trend +
          generator.noise * noiseAt(c.seed, minute);
        sums[index] += Math.min(c.upper, Math.max(c.lower, value));
      }
    }
    const endMinute = start + INTERVAL,
      values: Record<string, number | null> = {};
    for (let index = 0; index < compiled.length; index++) {
      const c = compiled[index];
      const aggregated = (sums[index] / INTERVAL) * c.scale;
      values[c.metric.id] = valid[index]
        ? Math.min(
            c.metric.max,
            Math.max(
              c.metric.min,
              Math.round(aggregated * c.rounding) / c.rounding,
            ),
          )
        : null;
      const key = overrideKey({
        endMinute,
        crewId,
        metricId: c.metric.id,
        value: null,
      });
      if (overrides.has(key)) values[c.metric.id] = overrides.get(key)!;
    }
    // Dominant activity; equal counts prefer the latest contributing activity.
    let activityId = endActivity;
    for (const [id, count] of Object.entries(activityMinutes))
      if (count > activityMinutes[activityId]) activityId = id;
    rows.push({ endMinute, crewId, activityId, activityMinutes, values });
  }
  return rows;
}

/** End 13:15 contains minutes [13:00,13:15); there is no extra post-mission row. */
export function generateTelemetry(
  input: MissionConfig,
  overrides: TelemetryOverride[] = [],
): TelemetryRow[] {
  const config = assertConfig(input);
  const errors = validateOverrides(overrides, config);
  if (errors.length)
    throw new Error(`Invalid telemetry overrides: ${errors.join("; ")}`);
  const overrideMap = new Map(
    overrides.map((row) => [overrideKey(row), row.value]),
  );
  const habitatMetrics = config.metrics.filter(
    (metric) => metric.scope === "habitat",
  );
  const crewMetrics = config.metrics.filter(
    (metric) => metric.scope === "crew",
  );
  const habitat = habitatMetrics.length
    ? synthesize(config, "habitat", habitatMetrics, overrideMap)
    : [];
  const crewRows = config.crew.map((crew) =>
    synthesize(config, crew.id, crewMetrics, overrideMap),
  );
  const rows: TelemetryRow[] = [];
  for (let index = 0; index < totalWindows(config); index++)
    for (const memberRows of crewRows) {
      const row = memberRows[index];
      if (habitat.length) Object.assign(row.values, habitat[index].values);
      rows.push(row);
    }
  return rows;
}

function totalWindows(config: MissionConfig): number {
  return (config.timeline.durationDays * DAY) / INTERVAL;
}
