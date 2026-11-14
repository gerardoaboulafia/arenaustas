import type {
  MetricDefinition,
  MissionDataset,
  RuntimeAudit,
  TelemetryRow,
} from "./types";
import { activityResolver } from "./schedule";
import { DAY, INTERVAL } from "./validation";

export interface MonitoredMetric {
  crewId: string;
  metric: MetricDefinition;
  baseline: number | null;
  current: number | null;
  baselineSamples: number;
  sampleCount: number;
  missingSamples: number;
  sufficient: boolean;
  activities: string[];
}
export interface MonitoringOutput {
  asOfMinute: number;
  signals: MonitoredMetric[];
  audit: RuntimeAudit[];
}
interface Bucket {
  sum: number;
  count: number;
}

/** Activity-stratified, individually based comparisons; never read future rows. */
export function runMonitoring(
  dataset: MissionDataset,
  asOfMinute: number,
): MonitoringOutput {
  if (!Number.isFinite(asOfMinute))
    throw new RangeError("Assessment minute must be finite");
  const { config } = dataset;
  const asOf = Math.min(
    config.timeline.durationDays * DAY,
    Math.max(0, asOfMinute),
  );
  const orbitStart = config.timeline.transitHours * 60;
  const orbitEnd = orbitStart + config.timeline.orbitalDays * DAY;
  const baselineEnd = Math.min(orbitEnd, orbitStart + 14 * DAY, asOf);
  const recentStart = Math.max(orbitStart, asOf - 3 * DAY);
  const rowsByCrew = new Map<string, TelemetryRow[]>();
  for (const crew of config.crew) rowsByCrew.set(crew.id, []);
  for (const row of dataset.rows)
    if (
      Number.isInteger(row.endMinute) &&
      row.endMinute % INTERVAL === 0 &&
      row.endMinute >= INTERVAL &&
      row.endMinute <= asOf
    )
      rowsByCrew.get(row.crewId)?.push(row);
  const signals: MonitoredMetric[] = [];
  const habitatActivity = activityResolver(config, "habitat");
  for (const metric of config.metrics) {
    const members =
      metric.scope === "habitat"
        ? ["habitat"]
        : config.crew.map((crew) => crew.id);
    for (const crewId of members) {
      // Habitat is sampled once, not four pseudo-independent crew measurements.
      const rows =
        rowsByCrew.get(crewId === "habitat" ? config.crew[0].id : crewId) ?? [];
      const baseline = new Map<string, Bucket>(),
        recent = new Map<string, Bucket>();
      const allowed = metric.review?.activities
        ? new Set(metric.review.activities)
        : null;
      const seen = new Set<number>();
      let missingSamples = 0,
        latestEligible = -1,
        latestValid = false,
        lastEndpoint = 0;
      for (const row of rows) {
        lastEndpoint = Math.max(lastEndpoint, row.endMinute);
        if (row.endMinute - INTERVAL < orbitStart || row.endMinute > orbitEnd)
          continue;
        let activity = row.activityId;
        let pure =
          row.activityMinutes[activity] === INTERVAL &&
          Object.values(row.activityMinutes).reduce(
            (sum, value) => sum + value,
            0,
          ) === INTERVAL;
        if (crewId === "habitat") {
          activity = habitatActivity(row.endMinute - 1).activityId;
          pure = true;
          for (
            let minute = row.endMinute - INTERVAL;
            minute < row.endMinute;
            minute++
          )
            if (habitatActivity(minute).activityId !== activity) {
              pure = false;
              break;
            }
        }
        if (!pure || (allowed && !allowed.has(activity))) continue;
        const value = row.values[metric.id];
        const valid =
          typeof value === "number" &&
          Number.isFinite(value) &&
          value >= metric.min &&
          value <= metric.max &&
          !seen.has(row.endMinute);
        seen.add(row.endMinute);
        if (row.endMinute > recentStart) {
          if (row.endMinute >= latestEligible) {
            latestEligible = row.endMinute;
            latestValid = valid;
          }
          if (!valid) missingSamples++;
        }
        if (!valid) continue;
        const add = (map: Map<string, Bucket>) => {
          const bucket = map.get(activity) ?? { sum: 0, count: 0 };
          bucket.sum += value;
          bucket.count++;
          map.set(activity, bucket);
        };
        if (row.endMinute <= baselineEnd) add(baseline);
        if (row.endMinute > recentStart) add(recent);
      }
      let weightedBaseline = 0,
        recentSum = 0,
        sampleCount = 0,
        baselineSamples = 0;
      let matched = true;
      for (const [activity, current] of recent) {
        const reference = baseline.get(activity);
        if (!reference) matched = false;
        else {
          weightedBaseline += (reference.sum / reference.count) * current.count;
          baselineSamples += reference.count;
        }
        recentSum += current.sum;
        sampleCount += current.count;
      }
      const minimum = metric.review?.minimumSamples ?? 1;
      const fresh = lastEndpoint === Math.floor(asOf / INTERVAL) * INTERVAL;
      const sufficient =
        matched &&
        fresh &&
        latestValid &&
        sampleCount >= minimum &&
        baselineSamples >= minimum;
      signals.push({
        crewId,
        metric,
        baseline:
          matched && sampleCount ? weightedBaseline / sampleCount : null,
        current: sampleCount ? recentSum / sampleCount : null,
        baselineSamples,
        sampleCount,
        missingSamples,
        sufficient,
        activities: [...recent.keys()].sort(),
      });
    }
  }
  return {
    asOfMinute: asOf,
    signals,
    audit: [
      {
        agent: "Monitoring",
        detail: `Synthetic records through minute ${asOf} only. Baseline: first 14 orbital days, capped at minute ${baselineEnd}; recent: last 3 days. Baseline activity means weighted to matching recent activity counts; mixed windows excluded. Minimum samples apply to both windows; missing latest eligible observations or stale endpoints prevent reassurance. Habitat sampled once. ${signals.length} metric comparisons; ${signals.filter((signal) => !signal.sufficient).length} have insufficient data.`,
      },
    ],
  };
}

export const MonitoringAgent = runMonitoring;
