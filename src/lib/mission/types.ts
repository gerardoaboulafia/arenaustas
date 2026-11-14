export interface ActivityDefinition {
  id: string;
  label: string;
  color: string;
}
export interface CrewDefinition {
  id: string;
  name: string;
  role: string;
  color: string;
  pair: "A" | "B";
  baselines: Record<string, number>;
}
export interface MetricDefinition {
  id: string;
  label: string;
  unit: string;
  description: string;
  scope: "crew" | "habitat";
  aggregation: "mean" | "sum";
  decimals: number;
  min: number;
  max: number;
  generator: {
    baseline: number;
    noise: number;
    activityOffsets: Record<string, number>;
    activeOnly?: string[];
    trendPerDay?: number;
    settlingMinutes?: number;
  };
  review?: {
    relativeDeviation: number;
    minimumSamples: number;
    activities?: string[];
  };
}
export interface MissionConfig {
  schemaVersion: 1;
  revision: string;
  seed: number;
  timeline: {
    durationDays: number;
    transitHours: number;
    orbitalDays: number;
    intervalMinutes: number;
  };
  crew: CrewDefinition[];
  activities: ActivityDefinition[];
  metrics: MetricDefinition[];
  schedule: {
    workStartHour?: number;
    workEndHour?: number;
    sleepStartHour: number;
    sleepHours: number;
    exerciseDays: number[];
    exerciseStartHour: number;
    exerciseMinutes: number;
    evaDay: number;
    evaStartHour: number;
    evaPrepMinutes: number;
    evaMinutes: number;
    evaRecoveryMinutes: number;
    meals: { hour: number; minutes: number }[];
  };
}
export type MissionPhase = "transit" | "orbit" | "return" | "complete";
export interface ActivitySlot {
  startMinute: number;
  endMinute: number;
  activityId: string;
  crewId: string;
  orbitalWeek: number | null;
}
export interface TelemetryRow {
  endMinute: number;
  crewId: string;
  activityId: string;
  activityMinutes: Record<string, number>;
  values: Record<string, number | null>;
}
export interface TelemetryOverride {
  endMinute: number;
  crewId: string;
  metricId: string;
  value: number | null;
}
export interface ValidationResult<T> {
  value: T | null;
  errors: string[];
}
export interface MissionDataset {
  config: MissionConfig;
  rows: TelemetryRow[];
  overrides: TelemetryOverride[];
  fingerprint: string;
}
export interface ClockState {
  elapsedMinute: number;
  status: "ready" | "running" | "paused" | "completed";
  speed: number;
}
export interface MetricFinding {
  crewId: string;
  metricId: string;
  state:
    | "insufficient_data"
    | "within_demo_rule"
    | "review_suggested"
    | "unconfigured";
  baseline: number | null;
  current: number | null;
  sampleCount: number;
  message: string;
}
export interface RuntimeAudit {
  agent: "Monitoring" | "Risk" | "Simulation" | "Explanation";
  detail: string;
}
