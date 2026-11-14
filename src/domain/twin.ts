// AI-assisted: written with Claude Code, reviewed by the team.
// Builds the digital twin for one astronaut on one mission day by running the five
// rule-based agents in order. Same input, same output: no network, no language model.
import { SEVERITY, evaluateIndicator, format, measureStatus } from './evaluate';
import { habit, project } from './project';
import { indicators, modelById, rules, systems } from './knowledge';
import type {
  Advice, CrewMember, Dataset, IndicatorResult, Scenario, Status, SystemResult, TraceEntry, Twin, WhatIfInput,
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

function buildAdvice(indicatorResults: IndicatorResult[], systemResults: SystemResult[]): Advice[] {
  const advice: Advice[] = [];
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
  return advice.map((item) => ({
    ...item,
    actions: item.actions.filter((action) => (seen.has(action.text) ? false : (seen.add(action.text), true))),
  }));
}

function buildSummary(indicatorResults: IndicatorResult[], systemResults: SystemResult[]): string {
  const flagged = [
    ...systemResults.filter((s) => s.status === 'alert' || s.status === 'watch').map((s) => `${s.system.name.toLowerCase()} is ${STATUS_WORD[s.status]}`),
    ...indicatorResults.filter((r) => r.status === 'alert' || r.status === 'watch').map((r) => `${r.indicator.name.toLowerCase()} is ${STATUS_WORD[r.status]}`),
  ];
  if (!flagged.length) return 'Everything is nominal against your own baseline.';
  const text = flagged.slice(0, 3).join(', ');
  const more = flagged.length > 3 ? `, and ${flagged.length - 3} more` : '';
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}${more}. Everything else is nominal.`;
}

function buildTrace(indicatorResults: IndicatorResult[], systemResults: SystemResult[], advice: Advice[]): TraceEntry[] {
  const list = (rs: IndicatorResult[]) => rs.map((r) => `${r.indicator.name}: ${r.status}`).join('; ');
  const biometric = indicatorResults.filter((r) => r.indicator.agent === 'biometric');
  const environment = indicatorResults.filter((r) => r.indicator.agent === 'environment');
  const compare = `Mean of the last ${rules.recentDays} days against the mean of the first ${rules.baselineDays} days on record; thresholds from indicators.json.`;
  return [
    { agent: 'Biometric Agent', input: `${biometric.length} wearable indicators`, rule: compare, output: list(biometric) },
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
      rule: 'Picks the matching actions from indicators.json, alert first. No text is generated.',
      output: advice.length ? `${advice.length} finding(s), ${advice.reduce((n, a) => n + a.actions.length, 0)} action(s)` : 'Nothing to act on',
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
  const advice = buildAdvice(indicatorResults, systemResults);
  const habitOf = (id: WhatIfInput) => habit(crew.readings[id] ?? [], dayIndex, rules);
  return {
    crew,
    missionDay: day,
    indicators: indicatorResults,
    systems: systemResults,
    radiation,
    habits: { sleepHours: habitOf('sleepHours'), exerciseMin: habitOf('exerciseMin'), radiationDose: habitOf('radiationDose') },
    advice,
    summary: buildSummary(indicatorResults, systemResults),
    trace: buildTrace(indicatorResults, systemResults, advice),
  };
}

/** Worst status across indicators and body systems, for the crew selector. */
export function overallStatus(twin: Twin): Status {
  const all = [...twin.indicators.map((r) => r.status), ...twin.systems.map((s) => s.status)];
  return all.reduce<Status>((worst, s) => (SEVERITY[s] > SEVERITY[worst] ? s : worst), 'nominal');
}
