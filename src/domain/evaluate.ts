// AI-assisted: written with Claude Code, reviewed by the team.
// Biometric and Environment agents: each reading is compared with the astronaut's own baseline.
import type { Indicator, IndicatorResult, Measure, Rules, Series, Status } from './types';

export const SEVERITY: Record<Status, number> = { 'no-data': 0, nominal: 1, watch: 2, alert: 3 };

export function present(values: Series): number[] {
  return values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
}

export function mean(values: Series): number | null {
  const xs = present(values);
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export function round(value: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

export function format(value: number | null, decimals = 1): string {
  return value === null ? 'no reading' : String(round(value, decimals));
}

/**
 * Status of one indicator on one day (index into the series).
 * The mean of the last `recentDays` is compared with the mean of the first `baselineDays`,
 * so one odd reading does not change a status.
 */
export function evaluateIndicator(indicator: Indicator, series: Series, dayIndex: number, rules: Rules): IndicatorResult {
  const baselineValues = present(series.slice(0, rules.baselineDays));
  const recentValues = present(series.slice(Math.max(0, dayIndex - rules.recentDays + 1), dayIndex + 1));
  const history = series.slice(Math.max(0, dayIndex - 13), dayIndex + 1);
  const today = series[dayIndex] ?? null;
  const base = { indicator, today, history };
  // A sourced limit needs no baseline: it holds for everyone.
  const { limit } = indicator;
  const recentMean = recentValues.length >= rules.minRecentReadings ? mean(recentValues) : null;
  const overLimit = limit !== undefined && recentMean !== null && recentMean >= limit.alert;
  const limitReason = limit && recentMean !== null
    ? `Your last ${rules.recentDays} days average ${format(recentMean)} ${indicator.unit}, at or above the limit of ${limit.alert} ${indicator.unit} (${limit.label}).`
    : '';

  if (baselineValues.length < rules.minBaselineReadings || recentValues.length < rules.minRecentReadings) {
    return {
      ...base, status: overLimit ? 'alert' : 'no-data', recent: mean(recentValues), baseline: mean(baselineValues), watchAt: null, alertAt: null, overLimit,
      reason: overLimit ? limitReason : 'Not enough readings to compare with your baseline.',
    };
  }

  const baseline = mean(baselineValues)!;
  const recent = mean(recentValues)!;
  const { direction, mode, watch, alert } = indicator.rule;
  const step = (level: number) => (mode === 'abs' ? level : Math.abs(baseline * level - baseline));
  const watchStep = step(watch);
  const alertStep = step(alert);
  const diff = recent - baseline;
  const bad = direction === 'lower' ? -diff : direction === 'higher' ? diff : Math.abs(diff);
  const status: Status = overLimit || bad >= alertStep ? 'alert' : bad >= watchStep ? 'watch' : 'nominal';
  const sign = direction === 'lower' ? -1 : 1;
  const side = direction === 'both' ? 'away from' : direction === 'lower' ? 'below' : 'above';

  return {
    ...base, status, recent, baseline, overLimit,
    watchAt: baseline + sign * watchStep,
    alertAt: baseline + sign * alertStep,
    reason:
      overLimit ? limitReason
      : status === 'nominal'
        ? `Your last ${rules.recentDays} days average ${format(recent)} ${indicator.unit}, close to your baseline of ${format(baseline)}.`
        : `Your last ${rules.recentDays} days average ${format(recent)} ${indicator.unit}, ${format(Math.abs(diff))} ${side} your baseline of ${format(baseline)}.`,
  };
}

/** Status of a body-system measure against its bands. */
export function measureStatus(measure: Measure, value: number): Status {
  if (measure.direction === 'lower') return value < measure.alert ? 'alert' : value < measure.watch ? 'watch' : 'nominal';
  return value >= measure.alert ? 'alert' : value >= measure.watch ? 'watch' : 'nominal';
}
