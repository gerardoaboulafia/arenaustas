import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSyntheticCsv, selectObservations, UnknownCrewError } from "../src/lib/data";
import { getTelemetry } from "../src/lib/repository";
import { CREW_IDS, METRIC_KEYS, type DailyObservation, type EvidenceRecord, type ScenarioInput } from "../src/lib/types";
import { calculateBaselines, runMonitoring } from "../src/lib/agents/monitoring";
import { assessRisk } from "../src/lib/agents/riskAssessment";
import { DEFAULT_SCENARIO, normalizeScenarioControls, simulateScenario } from "../src/lib/agents/simulation";
import { explainFinding } from "../src/lib/agents/explanation";
import { getMissionView } from "../src/lib/agents/orchestrator";

const csv = readFileSync(join(process.cwd(), "data/synthetic/crew_telemetry.csv"), "utf8");
const parsed = parseSyntheticCsv(csv);
const rows = parsed.rows;
const header = "crew_id,mission_day,sleep_hours,hrv_ms,resting_hr_bpm,exercise_minutes,cabin_co2_ppm,radiation_proxy_index,origin";
const validLine = "maya-torres,120,8,50,60,60,750,2,synthetic";
const input: ScenarioInput = { crewId: "maya-torres", missionDay: 149, ...DEFAULT_SCENARIO };
const evidence: EvidenceRecord[] = [{
  source_id: "nasa-sleep", title: "Sleep research context", provider: "NASA",
  url: "https://www.nasa.gov/hrp/", used_for: "Sleep research context only",
  summary: "Context for the demonstration; no validation of prototype thresholds.",
  retrieved_utc: null, is_challenge_listed: null,
}];

function changeRows(change: (row: DailyObservation) => Partial<DailyObservation>): DailyObservation[] {
  return rows.map((row) => ({ ...row, ...change(row) }));
}

describe("synthetic ingestion and repository", () => {
  it("T01 parses exactly 120 fictional observations with four complete 30-day timelines", () => {
    expect(parsed.errors).toEqual([]);
    expect(rows).toHaveLength(120);
    for (const crewId of CREW_IDS) {
      expect(rows.filter((row) => row.crewId === crewId).map((row) => row.missionDay)).toEqual(Array.from({ length: 30 }, (_, index) => 120 + index));
    }
    expect(rows.every((row) => row.origin === "synthetic")).toBe(true);
    expect(getTelemetry()).toEqual(rows);
  });

  it("parses BOM, CRLF, quoted values and null readings without fabricating zeros", () => {
    const result = parseSyntheticCsv(`\uFEFF${header}\r\n"maya-torres",120,,null,N/A,60,750,2,synthetic\r\n`);
    expect(result.errors).toEqual([]);
    expect(result.rows[0]).toMatchObject({ crewId: "maya-torres", sleepHours: null, hrvMs: null, restingHrBpm: null, exerciseMinutes: 60 });
  });

  it.each(["NaN", "Infinity", "1e999", "-2", "25", "8 hours", "0x10"])("T02 flags invalid sleep reading %s and keeps it missing", (reading) => {
    const result = parseSyntheticCsv(`${header}\nmaya-torres,120,${reading},50,60,60,750,2,synthetic`);
    expect(result.errors).toHaveLength(1);
    expect(result.rows[0].sleepHours).toBeNull();
  });

  it.each([
    validLine.replace("maya-torres", "unknown-crew"),
    validLine.replace(",120,", ",119,"),
    validLine.replace(",120,", ",150,"),
    validLine.replace(",120,", ",120.5,"),
    validLine.replace(",synthetic", ",NASA"),
    validLine + ",extra",
  ])("rejects invalid structural record %s", (line) => {
    const result = parseSyntheticCsv(`${header}\n${line}`);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.rows).toEqual([]);
  });

  it("rejects missing/duplicate headers, broken quoting and duplicate crew days", () => {
    for (const text of ["", `${header.replace("sleep_hours", "hrv_ms")}\n${validLine}`, `${header}\n\"${validLine}`]) {
      expect(parseSyntheticCsv(text).errors.length).toBeGreaterThan(0);
    }
    const duplicate = parseSyntheticCsv(`${header}\n${validLine}\n${validLine}`);
    expect(duplicate.errors[0]).toContain("duplicate crew/day");
    expect(duplicate.rows).toEqual([]);
  });

  it("sorts shuffled data, sanitizes nonfinite readings and excludes all duplicate day copies", () => {
    const selected = selectObservations([...rows].reverse(), "maya-torres", 130);
    expect(selected.map((row) => row.missionDay)).toEqual(Array.from({ length: 11 }, (_, index) => 120 + index));
    const invalid = changeRows((row) => row.crewId === "maya-torres" && row.missionDay === 149 ? { sleepHours: NaN } : {});
    expect(selectObservations(invalid, "maya-torres", 149).at(-1)?.sleepHours).toBeNull();
    const duplicate = rows.find((row) => row.crewId === "maya-torres" && row.missionDay === 149)!;
    expect(selectObservations([...rows, duplicate], "maya-torres", 149).some((row) => row.missionDay === 149)).toBe(false);
  });
});

describe("monitoring and risk agents", () => {
  it("T03 uses 14 individualized baseline samples with independently checked fixture means", () => {
    const monitoring = runMonitoring(rows, "maya-torres", 149);
    expect(monitoring.baselines.sleepHours).toBeCloseTo(7.545, 10);
    expect(monitoring.baselines.hrvMs).toBeCloseTo(55.0642857142857, 10);
    expect(monitoring.baselines.restingHrBpm).toBeCloseTo(63.278571428571425, 10);
    expect(monitoring.baselines.exerciseMinutes).toBeCloseTo(63.96428571428571, 10);
    expect(monitoring.baselines.cabinCo2Ppm).toBeCloseTo(767.6857142857143, 10);
    for (const crewId of CREW_IDS) {
      const result = runMonitoring(rows, crewId, 149);
      for (const metric of METRIC_KEYS) expect(result.metrics[metric].baselineSamples).toBe(14);
    }
  });

  it("T04/T09 flags Maya's persistent sleep, HRV and resting heart rate deviations for review", () => {
    const view = getMissionView(rows, "maya-torres", 149);
    expect(view.workflowState).toBe("review");
    expect(view.findings[0].signalCount).toBe(3);
    expect(view.monitoring.deviations.map((deviation) => deviation.metric)).toEqual(["sleepHours", "hrvMs", "restingHrBpm"]);
    expect(view.monitoring.deviations.every((deviation) => deviation.persistent)).toBe(true);
    expect(view.monitoring.metrics.sleepHours.recentMean).toBeCloseTo(5.906666666666666, 10);
    expect(view.monitoring.metrics.hrvMs.recentMean).toBeCloseTo(39.95333333333334, 10);
    expect(view.monitoring.metrics.restingHrBpm.recentMean).toBeCloseTo(72.83333333333333, 10);
    expect(view.findings[0].reasonCodes).toContain("SLEEP_BASELINE_MINUS_1H");
  });

  it("T05 keeps Eli normal using only his own baseline", () => {
    const view = getMissionView(rows, "eli-chen", 149);
    expect(view.workflowState).toBe("normal");
    expect(view.monitoring.deviations).toEqual([]);
    expect(view.monitoring.metrics.sleepHours.baselineMean).toBeCloseTo(7.402142857142858, 10);
  });

  it("T06 treats Sofia's day-140 CO2 elevation as habitat context only", () => {
    const view = getMissionView(rows, "sofia-okafor", 140);
    expect(view.workflowState).toBe("observe");
    expect(view.findings[0].signalCount).toBe(0);
    expect(view.findings[0].tags).toContain("Habitat context");
    expect(view.monitoring.deviations.map((deviation) => deviation.metric)).toEqual(["cabinCo2Ppm"]);
    expect(view.explanations[0].narrative).toContain("no toxicity or health outcome is inferred");
  });

  it("T07 observes Noah's reduced exercise duration", () => {
    const view = getMissionView(rows, "noah-patel", 149);
    expect(view.workflowState).toBe("observe");
    expect(view.monitoring.deviations[0]).toMatchObject({ metric: "exerciseMinutes", persistent: true });
    expect(view.monitoring.metrics.exerciseMinutes.recentMean).toBeCloseTo(33.3, 10);
    expect(view.monitoring.metrics.exerciseMinutes.baselineMean).toBeCloseTo(71.65714285714286, 10);
  });

  it("T08 reports insufficient metrics instead of false normality and retains known deviations", () => {
    const missing = changeRows((row) => row.missionDay >= 147 ? { sleepHours: null } : {});
    const stable = getMissionView(missing, "eli-chen", 149);
    expect(stable.workflowState).toBe("insufficient_data");
    expect(stable.monitoring.metrics.sleepHours).toMatchObject({ quality: "insufficient", recentMean: null, recentSamples: 0 });
    expect(stable.findings[0].missingMetrics).toContain("sleepHours");
    const maya = getMissionView(missing, "maya-torres", 149);
    expect(maya.workflowState).toBe("insufficient_data");
    expect(maya.findings[0].signalCount).toBe(2);
    expect(maya.monitoring.deviations.map((deviation) => deviation.metric)).toContain("hrvMs");
  });

  it("enforces 10 baseline and 2 recent readings while marking incomplete windows limited", () => {
    expect(runMonitoring(rows, "eli-chen", 128).metrics.sleepHours.baselineMean).toBeNull();
    expect(runMonitoring(rows, "eli-chen", 129).metrics.sleepHours.quality).toBe("limited");
    const oneMissing = rows.filter((row) => row.missionDay !== 148);
    expect(runMonitoring(oneMissing, "eli-chen", 149).metrics.sleepHours.quality).toBe("limited");
    const twoMissing = oneMissing.filter((row) => row.missionDay !== 147);
    const result = runMonitoring(twoMissing, "eli-chen", 149);
    expect(result.metrics.sleepHours.recentSamples).toBe(1);
    expect(result.metrics.sleepHours.recentMean).toBeNull();
  });

  it("never fills a recent calendar window from older observations", () => {
    const gaps = rows.filter((row) => row.missionDay < 145 || row.missionDay === 149);
    const result = runMonitoring(gaps, "eli-chen", 149);
    expect(result.metrics.sleepHours.recentDays).toEqual([149]);
    expect(result.quality).toBe("insufficient");
  });

  it("does not leak later baseline or telemetry values into an earlier replay day", () => {
    const earlier = rows.filter((row) => row.missionDay <= 129);
    expect(getMissionView(rows, "maya-torres", 129, DEFAULT_SCENARIO)).toEqual(getMissionView(earlier, "maya-torres", 129, DEFAULT_SCENARIO));
    expect(calculateBaselines(rows, "maya-torres", 128).sleepHours).toBeNull();
  });

  it("distinguishes one extreme day from a persistent deviation", () => {
    const transient = changeRows((row) => row.crewId === "eli-chen" && row.missionDay >= 147 ? { sleepHours: row.missionDay === 147 ? 1 : 8 } : {});
    const view = getMissionView(transient, "eli-chen", 149);
    expect(view.monitoring.deviations[0]).toMatchObject({ metric: "sleepHours", persistent: false, thresholdDays: [147] });
    expect(view.workflowState).toBe("normal");
    expect(view.explanations[0].narrative).toContain("short-term fluctuation");
  });

  it("counts distinct metrics only and excludes radiation proxy from classification", () => {
    const monitoring = runMonitoring(rows, "noah-patel", 149);
    monitoring.deviations.push({ ...monitoring.deviations[0] });
    const risk = assessRisk(monitoring);
    expect(risk.workflowState).toBe("observe");
    expect(risk.findings[0].signalCount).toBe(1);
    const changedProxy = changeRows(() => ({ radiationProxyIndex: null }));
    expect(runMonitoring(changedProxy, "eli-chen", 149)).toEqual(runMonitoring(rows, "eli-chen", 149));
  });
});

describe("illustrative scenario agent", () => {
  it("T10/T11 produces deterministic 30-day assumed schedules and the correct plan deltas", () => {
    const output = simulateScenario(rows, input);
    expect(output).toEqual(simulateScenario(rows, input));
    expect(output.status).toBe("ready");
    expect(output.recentSleepMean).toBeCloseTo(5.965714285714285, 10);
    expect(output.recentExerciseMean).toBeCloseTo(65.8, 10);
    expect(output.sleepOpportunityDeltaHours).toBeCloseTo(61.02857142857144, 10);
    expect(output.additionalPlannedExerciseMinutes).toBeCloseTo(450, 10);
    for (const plan of [output.baselineSleepPlan, output.scenarioSleepPlan, output.baselineExercisePlan, output.scenarioExercisePlan]) expect(plan).toHaveLength(30);
    expect(output.scenarioSleepPlan).toEqual(Array(30).fill(8));
    expect(output.disclaimer).toContain("not efficacy prediction");
  });

  it("T12 clamps bounds, handles nonfinite inputs and snaps slider increments consistently", () => {
    expect(normalizeScenarioControls({ targetSleepHours: 20, additionalExerciseMinutes: -100 })).toEqual({ targetSleepHours: 9, additionalExerciseMinutes: 0 });
    expect(normalizeScenarioControls({ targetSleepHours: -20, additionalExerciseMinutes: 100 })).toEqual({ targetSleepHours: 5, additionalExerciseMinutes: 30 });
    expect(normalizeScenarioControls({ targetSleepHours: 7.3, additionalExerciseMinutes: 12 })).toEqual({ targetSleepHours: 7.5, additionalExerciseMinutes: 10 });
    expect(normalizeScenarioControls({ targetSleepHours: NaN, additionalExerciseMinutes: NaN })).toEqual(DEFAULT_SCENARIO);
    expect(normalizeScenarioControls({ targetSleepHours: Infinity, additionalExerciseMinutes: -Infinity })).toEqual({ targetSleepHours: 9, additionalExerciseMinutes: 0 });
  });

  it("uses the actual capped exercise schedule for its total rather than the requested addition", () => {
    const highExercise = changeRows((row) => row.missionDay >= 143 ? { exerciseMinutes: 175 } : {});
    const output = simulateScenario(highExercise, { ...input, additionalExerciseMinutes: 30 });
    expect(output.scenarioExercisePlan[0]).toBe(180);
    expect(output.additionalPlannedExerciseMinutes).toBeCloseTo(150, 10);
  });

  it("reports missing comparisons with null points while retaining independently available metrics", () => {
    const missing = changeRows((row) => row.missionDay >= 143 ? { sleepHours: null } : {});
    const output = simulateScenario(missing, input);
    expect(output.status).toBe("insufficient_data");
    expect(output.baselineSleepPlan).toEqual(Array(30).fill(null));
    expect(output.scenarioSleepPlan).toEqual(Array(30).fill(null));
    expect(output.sleepOpportunityDeltaHours).toBeNull();
    expect(output.additionalPlannedExerciseMinutes).toBeCloseTo(450, 10);
    expect(output.recentExerciseSamples).toBe(7);
  });

  it("uses a seven-calendar-day window and requires three valid samples", () => {
    const onlyTwo = rows.filter((row) => row.missionDay < 143 || row.missionDay >= 148);
    expect(simulateScenario(onlyTwo, input).status).toBe("insufficient_data");
    const three = rows.filter((row) => row.missionDay < 143 || row.missionDay >= 147);
    expect(simulateScenario(three, input).quality).toBe("limited");
    expect(simulateScenario([...three].reverse(), input)).toEqual(simulateScenario(three, input));
  });

  it("cannot change monitoring or workflow findings through sleep/exercise assumptions", () => {
    const first = getMissionView(rows, "maya-torres", 149, DEFAULT_SCENARIO);
    const second = getMissionView(rows, "maya-torres", 149, { targetSleepHours: 9, additionalExerciseMinutes: 30 });
    expect(first.findings).toEqual(second.findings);
    expect(first.monitoring).toEqual(second.monitoring);
    expect(first.scenario?.scenarioSleepPlan).not.toEqual(second.scenario?.scenarioSleepPlan);
  });
});

describe("explanation and orchestration", () => {
  it("uses numeric findings, resolves catalog IDs exactly, and preserves evidence provenance", () => {
    const view = getMissionView(rows, "maya-torres", 149, DEFAULT_SCENARIO, evidence);
    const explanation = view.explanations[0];
    expect(explanation.narrative).toContain("5.91 h");
    expect(explanation.narrative).toContain("7.54 h");
    expect(explanation.narrative).toContain("147–149");
    expect(explanation.narrative).toContain("NASA has not validated");
    expect(explanation.citations).toEqual([evidence[0].url]);
    expect(explanation.sourceIds).toEqual(["nasa-sleep"]);
    expect(explanation.evidence[0].is_challenge_listed).toBeNull();
  });

  it("omits invented IDs, deceptive hosts, unsafe URLs and ambiguous evidence IDs", () => {
    const finding = getMissionView(rows, "maya-torres", 149).findings[0];
    finding.sourceIds = ["invented", "nasa-sleep"];
    expect(explainFinding(finding, evidence).sourceIds).toEqual(["nasa-sleep"]);
    for (const url of ["javascript:alert(1)", "https://nasa.gov.example.com/", "https://example.com/nasa.gov", "not a URL"]) {
      expect(explainFinding(finding, [{ ...evidence[0], url }]).citations).toEqual([]);
    }
    expect(explainFinding(finding, [...evidence, evidence[0]]).citations).toEqual([]);
    expect(explainFinding(finding, []).narrative).toContain("No catalog-backed NASA citation");
  });

  it("expresses missingness as uncertainty", () => {
    const view = getMissionView([], "eli-chen", 149, DEFAULT_SCENARIO);
    expect(view.workflowState).toBe("insufficient_data");
    expect(view.explanations[0].narrative).toContain("Unknown values do not establish normality");
    expect(view.scenario?.status).toBe("insufficient_data");
  });

  it("emits exactly four deterministic agent traces, is JSON serializable and never mutates inputs", () => {
    const frozen = Object.freeze(rows.map((row) => Object.freeze({ ...row })));
    const view = getMissionView(frozen, "maya-torres", 149, DEFAULT_SCENARIO, evidence);
    expect(view.trace.map((trace) => trace.agent)).toEqual(["monitoring", "risk", "simulation", "explanation"]);
    expect(view.trace.every((trace) => trace.inputSummary && trace.outputSummary && trace.rules.length)).toBe(true);
    expect(JSON.stringify(view)).toBe(JSON.stringify(getMissionView(frozen, "maya-torres", 149, DEFAULT_SCENARIO, evidence)));
    expect(JSON.parse(JSON.stringify(view))).toEqual(view);
    expect(getMissionView([...rows].reverse(), "maya-torres", 149, DEFAULT_SCENARIO)).toEqual(getMissionView(rows, "maya-torres", 149, DEFAULT_SCENARIO));
    expect(getMissionView(rows, "maya-torres", 149).scenario).toBeNull();
  });

  it("clamps replay days and rejects an unknown crew explicitly", () => {
    expect(getMissionView(rows, "maya-torres", 999).missionDay).toBe(149);
    expect(getMissionView(rows, "maya-torres", 0).missionDay).toBe(120);
    expect(getMissionView(rows, "maya-torres", 140.9).missionDay).toBe(140);
    expect(getMissionView(rows, "maya-torres", NaN).missionDay).toBe(149);
    expect(() => getMissionView(rows, "unknown-crew", 149)).toThrow(UnknownCrewError);
    expect(() => simulateScenario(rows, { ...input, crewId: "unknown-crew" as ScenarioInput["crewId"] })).toThrow(UnknownCrewError);
  });

  it("uses selected crew/day even when passed a full scenario input with conflicting context", () => {
    const conflicting: ScenarioInput = { crewId: "eli-chen", missionDay: 149, ...DEFAULT_SCENARIO };
    const view = getMissionView(rows, "maya-torres", 130, conflicting);
    expect(view.scenario?.input).toMatchObject({ crewId: "maya-torres", missionDay: 130 });
    expect(view.observations.every((row) => row.crewId === "maya-torres" && row.missionDay <= 130)).toBe(true);
  });
});
