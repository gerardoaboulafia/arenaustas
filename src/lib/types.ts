/** Shared, serializable contracts. All telemetry describes fictional crew. */
export const CREW_IDS = ["maya-torres", "eli-chen", "sofia-okafor", "noah-patel"] as const;
export type CrewId = (typeof CREW_IDS)[number];
export const METRIC_KEYS = ["sleepHours", "hrvMs", "restingHrBpm", "exerciseMinutes", "cabinCo2Ppm"] as const;
export type MetricKey = (typeof METRIC_KEYS)[number];
export type TelemetryMetric = MetricKey | "radiationProxyIndex";
export type DataQuality = "high" | "limited" | "insufficient";
export type WorkflowState = "normal" | "observe" | "review" | "insufficient_data";

export interface DailyObservation {
  crewId: CrewId;
  missionDay: number;
  sleepHours: number | null;
  hrvMs: number | null;
  restingHrBpm: number | null;
  exerciseMinutes: number | null;
  cabinCo2Ppm: number | null;
  radiationProxyIndex: number | null;
  origin: "synthetic";
}

export interface EvidenceRecord {
  source_id: string;
  title: string;
  provider: string;
  url: string;
  used_for: string;
  summary: string;
  retrieved_utc: string | null;
  is_challenge_listed: boolean | null;
}

export interface AgentTrace {
  agent: "monitoring" | "risk" | "simulation" | "explanation";
  inputSummary: string;
  outputSummary: string;
  rules: string[];
  sourceIds: string[];
}

export interface MetricSummary {
  metric: MetricKey;
  label: string;
  unit: string;
  baselineMean: number | null;
  recentMean: number | null;
  baselineSamples: number;
  recentSamples: number;
  baselineDays: number[];
  recentDays: number[];
  absoluteChange: number | null;
  relativeChange: number | null;
  quality: DataQuality;
  ruleId: string;
  threshold: number | null;
  thresholdDays: number[];
  persistent: boolean;
}

export interface Deviation {
  id: string;
  crewId: CrewId;
  missionDay: number;
  metric: MetricKey;
  baselineMean: number;
  recentMean: number;
  absoluteChange: number;
  relativeChange: number;
  unit: string;
  ruleId: string;
  direction: "higher" | "lower";
  persistent: boolean;
  availableDays: number;
  quality: DataQuality;
  threshold: number;
  thresholdDays: number[];
  windowStart: number;
  windowEnd: number;
}

export interface MonitoringOutput {
  crewId: CrewId;
  missionDay: number;
  baselines: Record<MetricKey, number | null>;
  metrics: Record<MetricKey, MetricSummary>;
  deviations: Deviation[];
  quality: DataQuality;
  trace: AgentTrace;
}

export interface Finding {
  id: string;
  crewId: CrewId;
  missionDay: number;
  state: WorkflowState;
  title: string;
  reasonCodes: string[];
  deviations: Deviation[];
  sourceIds: string[];
  action: "review_measurements" | "discuss_with_medical_officer" | "continue_observing";
  disclaimer: string;
  signalCount: number;
  missingMetrics: MetricKey[];
  quality: DataQuality;
  tags: string[];
}

export interface RiskAssessmentOutput {
  workflowState: WorkflowState;
  findings: Finding[];
  trace: AgentTrace;
}

export interface ScenarioControls {
  targetSleepHours: number;
  additionalExerciseMinutes: number;
}
export interface ScenarioInput extends ScenarioControls {
  crewId: CrewId;
  missionDay: number;
}
export interface ScenarioOutput {
  horizonDays: 30;
  status: "ready" | "insufficient_data";
  input: ScenarioInput;
  quality: DataQuality;
  recentSleepSamples: number;
  recentExerciseSamples: number;
  recentSleepMean: number | null;
  recentExerciseMean: number | null;
  baselineSleepPlan: (number | null)[];
  scenarioSleepPlan: (number | null)[];
  baselineExercisePlan: (number | null)[];
  scenarioExercisePlan: (number | null)[];
  sleepOpportunityDeltaHours: number | null;
  additionalPlannedExerciseMinutes: number | null;
  assumptions: string[];
  disclaimer: string;
  trace: AgentTrace;
}

export interface ExplanationOutput {
  findingId: string;
  narrative: string;
  /** URLs and IDs are resolved only from the supplied evidence catalog. */
  citations: string[];
  sourceIds: string[];
  evidence: EvidenceRecord[];
  trace: AgentTrace;
}

export interface MissionView {
  crewId: CrewId;
  missionDay: number;
  observations: DailyObservation[];
  monitoring: MonitoringOutput;
  workflowState: WorkflowState;
  findings: Finding[];
  scenario: ScenarioOutput | null;
  explanations: ExplanationOutput[];
  trace: AgentTrace[];
  dataMode: "synthetic";
}
