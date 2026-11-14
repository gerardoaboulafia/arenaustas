// AI-assisted: written with Claude Code, reviewed by the team.

export type Status = 'nominal' | 'watch' | 'alert' | 'no-data';
export type Basis = 'nasa' | 'partner' | 'clinical' | 'assumption';
export type WhatIfInput = 'sleepHours' | 'exerciseMin' | 'radiationDose';
export type AgentName =
  | 'Biometric Agent'
  | 'Physiology Agent'
  | 'Environment Agent'
  | 'Prediction Agent'
  | 'Medical Advisor';

export interface Source {
  id: string;
  title: string;
  org: string;
  url: string;
  accessed: string;
  challengeListed: boolean;
  usedFor: string;
}

export interface Hazard {
  id: string;
  name: string;
  summary: string;
  sourceIds: string[];
}

export interface ActionDef {
  text: string;
  basis: Basis;
  needsReview?: boolean;
  sourceId?: string;
  whatIf?: { input: WhatIfInput; delta: number };
}

export interface Indicator {
  id: string;
  name: string;
  unit: string;
  agent: 'biometric' | 'environment';
  input: { min: number; max: number; step: number };
  /** Deviation from the astronaut's own baseline. `abs` is in the indicator's unit, `ratio` multiplies the baseline. */
  rule: { direction: 'lower' | 'higher' | 'both'; mode: 'abs' | 'ratio'; watch: number; alert: number };
  basis: Basis;
  needsReview?: boolean;
  sourceId?: string;
  hazardIds: string[];
  whyItMatters: string;
  howToMeasure: string;
  whatIfInput?: WhatIfInput;
  actions: { watch: ActionDef[]; alert: ActionDef[] };
}

export interface Measure {
  name: string;
  unit: string;
  decimals: number;
  direction: 'lower' | 'higher';
  watch: number;
  alert: number;
  basis: Basis;
  needsReview?: boolean;
}

export interface SystemDef {
  id: string;
  name: string;
  modelId: string;
  drivers: string[];
  hazardIds: string[];
  measure: Measure;
}

export interface ProjectionModel {
  id: string;
  output: string;
  inputs: string[];
  form: 'linear-rate' | 'rolling-deficit' | 'cumulative-sum';
  description: string;
  parameters: Record<string, number>;
  parameterBasis: Record<string, Basis>;
  horizonDays: number;
  limits: string;
  basis: Basis;
  sourceId?: string;
  needsReview?: boolean;
}

export interface Rules {
  baselineDays: number;
  recentDays: number;
  minRecentReadings: number;
  minBaselineReadings: number;
  habitDays: number;
  basis: Basis;
  needsReview: boolean;
  note: string;
}

export type Series = (number | null)[];

export interface CrewMember {
  id: string;
  label: string;
  /** One value per mission day, starting at the dataset's firstDay. */
  readings: Record<string, Series>;
  /** Simulated measure values at the end of the day before firstDay. */
  start: Record<string, number>;
}

export interface Dataset {
  firstDay: number;
  lastDay: number;
  simulated: true;
  crew: CrewMember[];
}

export type Scenario = Partial<Record<WhatIfInput, number>>;

export interface IndicatorResult {
  indicator: Indicator;
  status: Status;
  today: number | null;
  recent: number | null;
  baseline: number | null;
  watchAt: number | null;
  alertAt: number | null;
  history: Series;
  reason: string;
}

export interface Projection {
  model: ProjectionModel;
  input: WhatIfInput;
  habit: number;
  scenarioInput: number;
  history: number[];
  baseline: number[];
  scenario: number[];
}

export interface SystemResult {
  system: SystemDef;
  status: Status;
  value: number;
  projection: Projection;
  day30: { baseline: { value: number; status: Status }; scenario: { value: number; status: Status } };
  /** First projected day (1-based) on which the status differs from today, if nothing changes. */
  change: { day: number; status: Status } | null;
  reason: string;
}

export interface Advice {
  key: string;
  status: Status;
  title: string;
  explanation: string;
  actions: ActionDef[];
  sourceId?: string;
  agent: AgentName;
}

export interface TraceEntry {
  agent: AgentName;
  input: string;
  rule: string;
  output: string;
}

export interface Twin {
  crew: CrewMember;
  missionDay: number;
  indicators: IndicatorResult[];
  systems: SystemResult[];
  radiation: Projection;
  habits: Record<WhatIfInput, number>;
  advice: Advice[];
  summary: string;
  trace: TraceEntry[];
}
