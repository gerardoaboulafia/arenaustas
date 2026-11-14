import type { MissionDataset } from "./mission/types";

export interface MissionPlan {
  metricId: string;
  unit: string;
  aggregation: "mean" | "sum";
  baseline: number | null;
  target: number;
  availableDays: number;
  points: { day: number; baseline: number | null; assumption: number }[];
  totalDelta: number | null;
}
/** A flat hypothetical signal/schedule comparison. It does not predict physiology. */
export function compareMissionPlan(
  dataset: MissionDataset,
  crewId: string,
  metricId: string,
  asOfMinute: number,
  target: number,
): MissionPlan {
  const metric = dataset.config.metrics.find((item) => item.id === metricId);
  if (!metric) throw new Error("Unknown indicator");
  const intervalsPerDay = 1440 / dataset.config.timeline.intervalMinutes;
  const scale = metric.aggregation === "sum" ? intervalsPerDay : 1;
  const boundedTarget = Number.isFinite(target)
    ? Math.max(metric.min * scale, Math.min(metric.max * scale, target))
    : metric.generator.baseline;
  const endDay = Math.floor(
    Math.max(
      0,
      Math.min(asOfMinute, dataset.config.timeline.durationDays * 1440),
    ) / 1440,
  );
  const firstDay = Math.max(0, endDay - 7);
  const daily = new Map<
    number,
    { sum: number; count: number; missing: number }
  >();
  const effectiveCrew =
    metric.scope === "habitat" ? dataset.config.crew[0].id : crewId;
  for (const row of dataset.rows) {
    if (
      row.crewId !== effectiveCrew ||
      row.endMinute > endDay * 1440 ||
      row.endMinute <= firstDay * 1440
    )
      continue;
    const day = Math.floor((row.endMinute - 1) / 1440);
    const bucket = daily.get(day) ?? { sum: 0, count: 0, missing: 0 };
    const value = row.values[metricId];
    if (typeof value === "number" && Number.isFinite(value)) {
      bucket.sum += value;
      bucket.count++;
    } else bucket.missing++;
    daily.set(day, bucket);
  }
  const values = [...daily.values()]
    .filter((bucket) =>
      metric.aggregation === "sum"
        ? bucket.count === intervalsPerDay
        : bucket.count >= 4,
    )
    .map((bucket) =>
      metric.aggregation === "sum" ? bucket.sum : bucket.sum / bucket.count,
    );
  const baseline =
    values.length >= 3
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null;
  return {
    metricId,
    unit: metric.unit,
    aggregation: metric.aggregation,
    baseline,
    target: boundedTarget,
    availableDays: values.length,
    points: Array.from({ length: 30 }, (_, index) => ({
      day: index + 1,
      baseline,
      assumption: boundedTarget,
    })),
    totalDelta:
      baseline !== null && metric.aggregation === "sum"
        ? 30 * (boundedTarget - baseline)
        : null,
  };
}
