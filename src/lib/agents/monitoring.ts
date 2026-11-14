import { assertCrewId, selectObservations } from "../data";
import { BASELINE_END, clampMissionDay, mean, METRICS, MISSION_END, MISSION_START } from "../metrics";
import { METRIC_KEYS, type DailyObservation, type DataQuality, type Deviation, type MetricKey, type MetricSummary, type MonitoringOutput } from "../types";

/** The optional cutoff matters during replay: baseline days after it are unseen. */
export function calculateBaselines(rows: readonly DailyObservation[], crewId: string, day = MISSION_END): Record<MetricKey, number | null> {
  const baseline = selectObservations(rows, crewId, day).filter((row) => row.missionDay <= BASELINE_END);
  return Object.fromEntries(METRIC_KEYS.map((metric) => {
    const values = baseline.flatMap((row) => row[metric] === null ? [] : [row[metric]]);
    return [metric, values.length >= 10 ? mean(values) : null];
  })) as Record<MetricKey, number | null>;
}

export function runMonitoring(rows: readonly DailyObservation[], crewId: string, day: number): MonitoringOutput {
  assertCrewId(crewId);
  const missionDay = clampMissionDay(day);
  const observations = selectObservations(rows, crewId, missionDay);
  const baselineRows = observations.filter((row) => row.missionDay <= BASELINE_END);
  const windowStart = Math.max(MISSION_START, missionDay - 2);
  const recentRows = observations.filter((row) => row.missionDay >= windowStart);
  const deviations: Deviation[] = [];
  const summaries = METRIC_KEYS.map((metric): [MetricKey, MetricSummary] => {
    const definition = METRICS[metric];
    const baselineValues = baselineRows.flatMap((row) => row[metric] === null ? [] : [row[metric]]);
    const recentValues = recentRows.flatMap((row) => row[metric] === null ? [] : [row[metric]]);
    const baselineMean = baselineValues.length >= 10 ? mean(baselineValues) : null;
    const recentMean = recentValues.length >= 2 ? mean(recentValues) : null;
    const quality: DataQuality = baselineMean === null || recentMean === null ? "insufficient" : baselineValues.length === 14 && recentValues.length === 3 ? "high" : "limited";
    const threshold = baselineMean === null ? null : definition.threshold(baselineMean);
    const crosses = (value: number) => threshold !== null && (definition.direction === "lower" ? value <= threshold : value >= threshold);
    const thresholdDays = recentRows.filter((row) => row[metric] !== null && crosses(row[metric])).map((row) => row.missionDay);
    const absoluteChange = baselineMean === null || recentMean === null ? null : recentMean - baselineMean;
    const relativeChange = absoluteChange === null || baselineMean === null ? null : absoluteChange / Math.max(Math.abs(baselineMean), 1e-9);
    const persistent = recentMean !== null && crosses(recentMean) && thresholdDays.length >= 2;
    const summary: MetricSummary = {
      metric, label: definition.label, unit: definition.unit, baselineMean, recentMean,
      baselineSamples: baselineValues.length, recentSamples: recentValues.length,
      baselineDays: baselineRows.filter((row) => row[metric] !== null).map((row) => row.missionDay),
      recentDays: recentRows.filter((row) => row[metric] !== null).map((row) => row.missionDay),
      absoluteChange, relativeChange, quality, ruleId: definition.ruleId, threshold, thresholdDays, persistent,
    };
    if (baselineMean !== null && recentMean !== null && threshold !== null && absoluteChange !== null && relativeChange !== null && crosses(recentMean)) {
      deviations.push({
        id: `${crewId}:${missionDay}:${definition.ruleId}`, crewId, missionDay, metric,
        baselineMean, recentMean, absoluteChange, relativeChange, unit: definition.unit,
        ruleId: definition.ruleId, direction: definition.direction, persistent,
        availableDays: recentValues.length, quality, threshold, thresholdDays, windowStart, windowEnd: missionDay,
      });
    }
    return [metric, summary];
  });
  const metrics = Object.fromEntries(summaries) as Record<MetricKey, MetricSummary>;
  const quality: DataQuality = summaries.some(([, metric]) => metric.quality === "insufficient") ? "insufficient" : summaries.some(([, metric]) => metric.quality === "limited") ? "limited" : "high";
  const baselines = Object.fromEntries(summaries.map(([metric, summary]) => [metric, summary.baselineMean])) as Record<MetricKey, number | null>;
  return {
    crewId, missionDay, baselines, metrics, deviations, quality,
    trace: {
      agent: "monitoring",
      inputSummary: `${crewId}; selected mission day ${missionDay}; ${observations.length} unique synthetic observations at or before that day.`,
      outputSummary: `${deviations.length} deviations; quality ${quality}. ` + summaries.map(([, summary]) => `${summary.metric}: baseline n=${summary.baselineSamples}, recent n=${summary.recentSamples}, quality=${summary.quality}`).join("; "),
      rules: ["BASELINE_DAYS_120_133_MIN_10", "RECENT_3_CALENDAR_DAYS_MIN_2", "PERSISTENCE_2_DAILY_DEPARTURES_OF_3", "NO_FUTURE_DATA", "RADIATION_PROXY_EXCLUDED", ...METRIC_KEYS.map((metric) => METRICS[metric].ruleId)],
      sourceIds: [],
    },
  };
}

/** Compact contract from docs/05; use runMonitoring when quality/summaries are needed. */
export function monitor(rows: readonly DailyObservation[], crewId: string, day: number): Deviation[] {
  return runMonitoring(rows, crewId, day).deviations;
}
