# 05 — Data contracts, agent signatures and UI state

## CSV daily observation

```ts
export type CrewId = 'maya-torres' | 'eli-chen' | 'sofia-okafor' | 'noah-patel';
export interface DailyObservation {
  crewId: CrewId;
  missionDay: number;                  // integer 120..149
  sleepHours: number | null;           // h
  hrvMs: number | null;                // milliseconds
  restingHrBpm: number | null;         // beats/min
  exerciseMinutes: number | null;      // min/day
  cabinCo2Ppm: number | null;          // ppm, synthetic
  radiationProxyIndex: number | null;  // 0..10, fictional context, NOT dosimetry
  origin: 'synthetic';
}
```

CSV fields are snake_case and map 1:1 through the parser. Reject/flag invalid NaN, IDs outside allowlist, duplicate (crew, day), out-of-range days. Partial readings are allowed and must surface `quality`.

## Findings and agent outputs

```ts
type WorkflowState = 'normal' | 'observe' | 'review' | 'insufficient_data';
type MetricKey = 'sleepHours' | 'hrvMs' | 'restingHrBpm' | 'exerciseMinutes' | 'cabinCo2Ppm';

interface Deviation {
  id: string;
  crewId: CrewId;
  missionDay: number;
  metric: MetricKey;
  baselineMean: number;
  recentMean: number;
  ruleId: string;                      // e.g. 'SLEEP_BASELINE_MINUS_1H'
  direction: 'higher' | 'lower';
  persistent: boolean;
  availableDays: number;
  quality: 'high' | 'limited' | 'insufficient';
}
interface Finding {
  id: string;
  crewId: CrewId;
  missionDay: number;
  state: WorkflowState;
  title: string;
  reasonCodes: string[];
  deviations: Deviation[];
  sourceIds: string[];                 // only vetted evidence records
  action: 'review_measurements' | 'discuss_with_medical_officer' | 'continue_observing';
  disclaimer: string;
}
interface ScenarioInput {
  crewId: CrewId;
  missionDay: number;
  targetSleepHours: number;            // 5.0..9.0, step 0.5
  additionalExerciseMinutes: number;  // 0..30, step 5
}
interface ScenarioOutput {
  horizonDays: 30;
  baselineSleepPlan: number[];
  scenarioSleepPlan: number[];
  baselineExercisePlan: number[];
  scenarioExercisePlan: number[];
  sleepOpportunityDeltaHours: number;
  additionalPlannedExerciseMinutes: number;
  assumptions: string[];
  disclaimer: string;
}
interface AgentTrace {
  agent: 'monitoring' | 'risk' | 'simulation' | 'explanation';
  inputSummary: string;
  outputSummary: string;
  rules: string[];
  sourceIds: string[];
}
interface MissionView {
  crewId: CrewId;
  missionDay: number;
  observations: DailyObservation[];
  findings: Finding[];
  scenario: ScenarioOutput | null;
  trace: AgentTrace[];
  dataMode: 'synthetic';
}
```

## Pure function signatures

```ts
parseSyntheticCsv(csvText: string): { rows: DailyObservation[]; errors: string[] }
calculateBaselines(rows: DailyObservation[], crewId: CrewId): Record<MetricKey, number | null>
monitor(rows: DailyObservation[], crewId: CrewId, missionDay: number): Deviation[]
assessRisk(deviations: Deviation[], dataQuality: 'high'|'limited'|'insufficient'): Finding[]
simulateScenario(rows: DailyObservation[], input: ScenarioInput): ScenarioOutput
explainFinding(finding: Finding, evidenceCatalog: EvidenceRecord[]): { narrative: string; citations: string[] }
getMissionView(crewId: CrewId, day: number, scenario?: ScenarioInput): MissionView
```

## Research evidence record

```json
{
  "source_id": "nasa-hrp-sleep-risk",
  "provider": "NASA Human Research Program",
  "title": "Risk of Performance Decrements and Adverse Health Outcomes Resulting from Sleep Loss, Circadian Desynchronization, and Work Overload",
  "url": "https://humanresearchroadmap.nasa.gov/evidence/",
  "accession": null,
  "record_type": "NASA research risk resource",
  "retrieved_utc": null,
  "used_for": "Contextual sleep/circadian risk taxonomy only",
  "is_challenge_listed": null
}
```

`is_challenge_listed` must remain `null` until checked directly against the challenge Resources page. Do not automatically set true from provider alone.

## UI behaviors

- Query parameter `day=149`, validated/clamped; default 149.
- Crew ID routing uses exact allowlisted slug.
- Scenario state stored in component, no server call; reset restores defaults.
- Alerts are derived on demand, stable IDs, and acknowledgements may be browser-local only.
- The NASA Evidence section displays `source_id`, research title, NASA URL, 'used for' and any checked accession; no implied NASA endorsement.
