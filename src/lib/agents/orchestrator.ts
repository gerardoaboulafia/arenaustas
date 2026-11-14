import { assertCrewId, selectObservations } from "../data";
import { clampMissionDay } from "../metrics";
import type { AgentTrace, DailyObservation, EvidenceRecord, MissionView, ScenarioControls, ScenarioInput } from "../types";
import { explainFinding, resolveEvidence } from "./explanation";
import { runMonitoring } from "./monitoring";
import { assessRisk } from "./riskAssessment";
import { simulateScenario } from "./simulation";

/**
 * Pure UI entry point: rows are serialized server props, never a browser fs import.
 * Context always comes from this selected crew/day, even if scenario has extra keys.
 * Omit scenario to skip simulation, or pass DEFAULT_SCENARIO to run all four agents.
 */
export function getMissionView(
  rows: readonly DailyObservation[],
  crewId: string,
  day: number,
  scenario?: ScenarioControls | ScenarioInput,
  evidenceCatalog: readonly EvidenceRecord[] = [],
): MissionView {
  assertCrewId(crewId);
  const missionDay = clampMissionDay(day);
  const observations = selectObservations(rows, crewId, missionDay);
  const monitoring = runMonitoring(observations, crewId, missionDay);
  const risk = assessRisk(monitoring);
  // These agreed IDs attach catalog research context, never calibration evidence.
  const findings = risk.findings.map((finding) => ({
    ...finding,
    sourceIds: resolveEvidence([
      ...(finding.deviations.some((deviation) => deviation.metric === "sleepHours") ? ["nasa-sleep"] : []),
      "nasa-human-risks", "nasa-spaceflight",
    ], evidenceCatalog).map((record) => record.source_id),
  }));
  const simulation = scenario ? simulateScenario(observations, { ...scenario, crewId, missionDay }) : null;
  const explanations = findings.map((finding) => explainFinding(finding, evidenceCatalog));
  const explanationTrace: AgentTrace = {
    agent: "explanation",
    inputSummary: `${findings.length} structured findings; ${evidenceCatalog.length} supplied catalog records.`,
    outputSummary: `${explanations.length} deterministic explanations; catalog-resolved context only.`,
    rules: [...new Set(explanations.flatMap((explanation) => explanation.trace.rules))],
    sourceIds: [...new Set(explanations.flatMap((explanation) => explanation.sourceIds))],
  };
  return {
    crewId, missionDay, observations, monitoring, workflowState: risk.workflowState,
    findings, scenario: simulation, explanations,
    trace: [monitoring.trace, risk.trace, ...(simulation ? [simulation.trace] : []), explanationTrace],
    dataMode: "synthetic",
  };
}
