import { PROTOTYPE_DISCLAIMER } from "../metrics";
import { METRIC_KEYS, type Finding, type MonitoringOutput, type RiskAssessmentOutput, type WorkflowState } from "../types";

/** Workflow prioritization only. Insufficient data takes precedence, retaining known signals. */
export function assessRisk(monitoring: MonitoringOutput): RiskAssessmentOutput {
  const { crewId, missionDay, deviations, metrics, quality } = monitoring;
  const missingMetrics = METRIC_KEYS.filter((metric) => metrics[metric].quality === "insufficient");
  const healthSignals = new Set(deviations.filter((deviation) => deviation.persistent && deviation.metric !== "cabinCo2Ppm" && deviation.quality !== "insufficient").map((deviation) => deviation.metric));
  const habitat = deviations.some((deviation) => deviation.metric === "cabinCo2Ppm" && deviation.quality !== "insufficient");
  const signalCount = healthSignals.size;
  const state: WorkflowState = missingMetrics.length > 0 || quality === "insufficient" ? "insufficient_data" : signalCount >= 2 ? "review" : signalCount === 1 || habitat ? "observe" : "normal";
  const title = state === "insufficient_data" ? "Insufficient data for a complete assessment" : state === "review" ? "Review suggested" : state === "observe" ? (signalCount ? "Observe the synthetic trend" : "Habitat context") : "No persistent deviations detected";
  const reasonCodes = [...new Set([
    ...deviations.map((deviation) => deviation.ruleId),
    ...missingMetrics.map((metric) => `INSUFFICIENT_DATA_${metric}`),
    ...(quality === "insufficient" && !missingMetrics.length ? ["INSUFFICIENT_DATA"] : []),
    ...(state === "normal" ? ["NO_PERSISTENT_HEALTH_DEVIATIONS"] : []),
    ...(quality === "limited" ? ["LIMITED_OBSERVATIONS"] : []),
    ...(habitat ? ["HABITAT_CONTEXT_ONLY"] : []),
  ])];
  const finding: Finding = {
    id: `${crewId}:${missionDay}:workflow`, crewId, missionDay, state, title, reasonCodes,
    deviations: deviations.map((deviation) => ({ ...deviation, thresholdDays: [...deviation.thresholdDays] })),
    sourceIds: [], action: state === "review" ? "discuss_with_medical_officer" : state === "insufficient_data" || state === "observe" ? "review_measurements" : "continue_observing",
    disclaimer: PROTOTYPE_DISCLAIMER, signalCount, missingMetrics, quality,
    tags: habitat ? ["Habitat context"] : [],
  };
  return {
    workflowState: state, findings: [finding],
    trace: {
      agent: "risk", inputSummary: `${crewId}; mission day ${missionDay}; ${deviations.length} deviations; quality ${quality}.`,
      outputSummary: `${state}; ${signalCount} distinct persistent health-related signals; ${missingMetrics.length} insufficient metrics. Signal count is not a probability.`,
      rules: ["DISTINCT_PERSISTENT_HEALTH_SIGNALS_0_1_2", "INSUFFICIENT_DATA_SUPERSEDES_CLASSIFICATION", "CO2_HABITAT_CONTEXT_ONLY", ...reasonCodes], sourceIds: [],
    },
  };
}
