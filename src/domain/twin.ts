// AI-assisted: written with Claude Code, reviewed by the team.
// Builds the digital twin for one astronaut on one mission day by running the five
// rule-based agents in order. Same input, same output: no network, no language model.
import { SEVERITY, evaluateIndicator, format, measureStatus } from './evaluate';
import { patternCheck } from './anomaly';
import { habit, project } from './project';
import { indicators, modelById, rules, systems } from './knowledge';
import type {
  Advice, CrewMember, Dataset, Escalation, IndicatorResult, PatternResult, Scenario, Status, SystemResult, TraceEntry, Twin, WhatIfInput,
} from './types';

const STATUS_WORD: Record<Status, string> = { nominal: 'nominal', watch: 'on watch', alert: 'on alert', 'no-data': 'without enough data' };

function buildSystems(crew: CrewMember, dayIndex: number, scenario: Scenario): SystemResult[] {
  return systems.map((system) => {
    const model = modelById(system.modelId);
    const input = model.inputs[0] as WhatIfInput;
    const projection = project(model, crew.readings[input] ?? [], crew.start[system.id] ?? 100, dayIndex, rules, scenario[input]);
    const value = projection.history[projection.history.length - 1];
    const status = measureStatus(system.measure, value);
    const lastBaseline = projection.baseline[projection.baseline.length - 1];
    const lastScenario = projection.scenario[projection.scenario.length - 1];
    const changeAt = projection.baseline.findIndex((v) => measureStatus(system.measure, v) !== status);
    const d = system.measure.decimals;
    return {
      system, status, value, projection,
      day30: {
        baseline: { value: lastBaseline, status: measureStatus(system.measure, lastBaseline) },
        scenario: { value: lastScenario, status: measureStatus(system.measure, lastScenario) },
      },
      change: changeAt >= 0 ? { day: changeAt + 1, status: measureStatus(system.measure, projection.baseline[changeAt]) } : null,
      reason: `${system.measure.name} is ${format(value, d)} ${system.measure.unit}. Watch line ${system.measure.watch}, alert line ${system.measure.alert}.`,
    };
  });
}

function describe(pattern: PatternResult): string {
  return pattern.contributors.slice(0, 3)
    .map((c) => `${indicators.find((i) => i.id === c.id)?.name.toLowerCase()} (${format(Math.abs(c.z))} SD ${c.z < 0 ? 'below' : 'above'} your normal)`)
    .join(', ');
}

function buildAdvice(
  indicatorResults: IndicatorResult[], systemResults: SystemResult[], pattern: PatternResult, alertDaysOf: (key: string) => number,
): Advice[] {
  const advice: Omit<Advice, 'alertDays' | 'escalate'>[] = [];
  if (pattern.status === 'watch') {
    const alone = !indicatorResults.some((r) => r.status === 'watch' || r.status === 'alert');
    advice.push({
      key: 'pattern',
      status: 'watch',
      title: 'Your readings together are unusual for you',
      explanation: `${alone ? 'No single reading crossed its line. ' : ''}${pattern.reason} Main contributors: ${describe(pattern)}.`,
      actions: [rules.pattern.action],
      agent: 'Biometric Agent',
    });
  }
  for (const r of indicatorResults) {
    if (r.status !== 'watch' && r.status !== 'alert') continue;
    advice.push({
      key: `indicator:${r.indicator.id}`,
      status: r.status,
      title: `${r.indicator.name} is ${STATUS_WORD[r.status]}`,
      explanation: r.reason,
      actions: r.indicator.actions[r.status],
      sourceId: r.indicator.sourceId,
      agent: r.indicator.agent === 'environment' ? 'Environment Agent' : 'Biometric Agent',
    });
  }
  for (const s of systemResults) {
    const driver = indicators.find((i) => i.id === s.projection.input);
    const actions = driver ? driver.actions[s.status === 'alert' ? 'alert' : 'watch'] : [];
    if (s.status === 'watch' || s.status === 'alert') {
      advice.push({
        key: `system:${s.system.id}`,
        status: s.status,
        title: `${s.system.name} is ${STATUS_WORD[s.status]}`,
        explanation: s.reason,
        actions,
        sourceId: s.projection.model.sourceId,
        agent: 'Physiology Agent',
      });
    } else if (s.change) {
      advice.push({
        key: `projection:${s.system.id}`,
        status: 'watch',
        title: `${s.system.name} could be ${STATUS_WORD[s.change.status]} in about ${s.change.day} days`,
        explanation: `Nominal today. If your current habits continue, the simplified projection crosses the ${s.change.status} line around day +${s.change.day}.`,
        actions,
        sourceId: s.projection.model.sourceId,
        agent: 'Prediction Agent',
      });
    }
  }
  // Alert first; the same action is not listed twice.
  advice.sort((a, b) => SEVERITY[b.status] - SEVERITY[a.status]);
  const seen = new Set<string>();
  // Escalation ladder: watch stays with the astronaut, an alert goes to the crew medical officer,
  // and an alert that persists goes to the ground. The day count is in rules.json.
  return advice.map((item) => {
    const alertDays = item.status === 'alert' ? alertDaysOf(item.key) : 0;
    return {
      ...item,
      alertDays,
      escalate: item.status !== 'alert' ? 'self' : alertDays >= rules.escalation.groundAfterAlertDays ? 'ground' : 'crew',
      actions: item.actions.filter((action) => (seen.has(action.text) ? false : (seen.add(action.text), true))),
    };
  });
}

function buildSummary(indicatorResults: IndicatorResult[], systemResults: SystemResult[], pattern: PatternResult): string {
  const flagged = [
    ...systemResults.filter((s) => s.status === 'alert' || s.status === 'watch').map((s) => `${s.system.name.toLowerCase()} is ${STATUS_WORD[s.status]}`),
    ...indicatorResults.filter((r) => r.status === 'alert' || r.status === 'watch').map((r) => `${r.indicator.name.toLowerCase()} is ${STATUS_WORD[r.status]}`),
  ];
  if (!flagged.length && pattern.status === 'watch') {
    return 'Every reading is inside its own limits, but the pattern they form together is unusual for you.';
  }
  if (!flagged.length) return 'Everything is nominal against your own baseline.';
  const text = flagged.slice(0, 3).join(', ');
  const more = flagged.length > 3 ? `, and ${flagged.length - 3} more` : '';
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}${more}. Everything else is nominal.`;
}

function buildTrace(indicatorResults: IndicatorResult[], systemResults: SystemResult[], advice: Advice[], pattern: PatternResult): TraceEntry[] {
  const list = (rs: IndicatorResult[]) => rs.map((r) => `${r.indicator.name}: ${r.status}`).join('; ');
  const biometric = indicatorResults.filter((r) => r.indicator.agent === 'biometric');
  const environment = indicatorResults.filter((r) => r.indicator.agent === 'environment');
  const compare = `Mean of the last ${rules.recentDays} days against the mean of the first ${rules.baselineDays} days on record; thresholds from indicators.json.`;
  return [
    {
      agent: 'Biometric Agent', input: `${biometric.length} wearable indicators`,
      rule: `${compare} Plus a pattern model learned from the baseline days (mean and covariance; a day is unusual when it is farther from normal than any baseline day, ${rules.pattern.persistDays} days running).`,
      output: `${list(biometric)}; pattern check: ${pattern.status}${pattern.ratio === null ? '' : ` (${format(pattern.ratio, 2)}x baseline reach)`}`,
    },
    { agent: 'Environment Agent', input: `${environment.length} cabin and dosimeter indicators`, rule: compare, output: list(environment) },
    {
      agent: 'Physiology Agent', input: 'Readings history and the models in models.json',
      rule: 'Each model is applied day by day; the result is read against the bands in systems.json.',
      output: systemResults.map((s) => `${s.system.name}: ${format(s.value, s.system.measure.decimals)} (${s.status})`).join('; '),
    },
    {
      agent: 'Prediction Agent', input: `Current habits (mean of the last ${rules.habitDays} days) and any what-if change`,
      rule: 'The same models run 30 days ahead, once with current habits and once with the changes.',
      output: systemResults.map((s) => `${s.system.name} day +30: ${s.day30.baseline.status} → ${s.day30.scenario.status}`).join('; '),
    },
    {
      agent: 'Medical Advisor', input: 'Every status that is not nominal',
      rule: `Picks the matching actions from the knowledge files, alert first. Watch stays with you, an alert goes to the crew medical officer, an alert lasting ${rules.escalation.groundAfterAlertDays} days or more goes to the ground. No text is generated.`,
      output: advice.length ? `${advice.length} finding(s), ${advice.reduce((n, a) => n + a.actions.length, 0)} action(s); involve: ${rules.escalation.short[topEscalation(advice)]}` : 'Nothing to act on',
    },
  ];
}

export function buildTwin(dataset: Dataset, crewId: string, missionDay: number, scenario: Scenario = {}): Twin {
  const crew = dataset.crew.find((c) => c.id === crewId) ?? dataset.crew[0];
  const day = Math.min(dataset.lastDay, Math.max(dataset.firstDay, missionDay));
  const dayIndex = day - dataset.firstDay;
  const indicatorResults = indicators.map((ind) => evaluateIndicator(ind, crew.readings[ind.id] ?? [], dayIndex, rules));
  const systemResults = buildSystems(crew, dayIndex, scenario);
  const radiation = project(
    modelById('radiation-cumulative'), crew.readings.radiationDose ?? [], crew.start.radiation ?? 0, dayIndex, rules, scenario.radiationDose,
  );
  const pattern = patternCheck(crew.readings, dayIndex, rules);
  const alertDaysOf = (key: string): number => {
    const [kind, id] = key.split(':');
    let days = 0;
    if (kind === 'indicator') {
      const indicator = indicators.find((i) => i.id === id);
      for (let d = dayIndex; indicator && d >= 0 && evaluateIndicator(indicator, crew.readings[id] ?? [], d, rules).status === 'alert'; d--) days++;
    } else if (kind === 'system') {
      const result = systemResults.find((x) => x.system.id === id);
      const past = result?.projection.history ?? [];
      for (let d = past.length - 1; result && d >= 0 && measureStatus(result.system.measure, past[d]) === 'alert'; d--) days++;
    }
    return days;
  };
  const advice = buildAdvice(indicatorResults, systemResults, pattern, alertDaysOf);
  const habitOf = (id: WhatIfInput) => habit(crew.readings[id] ?? [], dayIndex, rules);
  return {
    crew,
    missionDay: day,
    indicators: indicatorResults,
    systems: systemResults,
    pattern,
    radiation,
    habits: { sleepHours: habitOf('sleepHours'), exerciseMin: habitOf('exerciseMin'), radiationDose: habitOf('radiationDose') },
    advice,
    summary: buildSummary(indicatorResults, systemResults, pattern),
    trace: buildTrace(indicatorResults, systemResults, advice, pattern),
  };
}

/** The highest rung of the escalation ladder among the findings. */
export function topEscalation(advice: Advice[]): Escalation {
  return advice.some((a) => a.escalate === 'ground') ? 'ground' : advice.some((a) => a.escalate === 'crew') ? 'crew' : 'self';
}

/** Worst status across indicators, body systems and the pattern check, for the crew selector. */
export function overallStatus(twin: Twin): Status {
  const all = [...twin.indicators.map((r) => r.status), ...twin.systems.map((s) => s.status), twin.pattern.status === 'watch' ? 'watch' as Status : 'nominal' as Status];
  return all.reduce<Status>((worst, s) => (SEVERITY[s] > SEVERITY[worst] ? s : worst), 'nominal');
}

/** Status of every body system on each day of a range: how the twin has evolved. */
export function systemTimeline(dataset: Dataset, crewId: string, fromDay: number, toDay: number): { day: number; statuses: Record<string, Status> }[] {
  const out: { day: number; statuses: Record<string, Status> }[] = [];
  for (let day = fromDay; day <= toDay; day++) {
    const twin = buildTwin(dataset, crewId, day);
    out.push({ day, statuses: Object.fromEntries(twin.systems.map((s) => [s.system.id, s.status])) });
  }
  return out;
}
