import type { MetricFinding, RuntimeAudit } from "./types";
import type { MonitoringOutput } from "./monitoring";

export interface RiskOutput {
  findings: MetricFinding[];
  audit: RuntimeAudit[];
}

export function runRisk(monitoring: MonitoringOutput): RiskOutput {
  const findings = monitoring.signals.map((signal): MetricFinding => {
    const review = signal.metric.review;
    let state: MetricFinding["state"] = "unconfigured";
    if (review) {
      if (
        !signal.sufficient ||
        signal.baseline === null ||
        signal.current === null
      )
        state = "insufficient_data";
      else {
        const relative =
          Math.abs(signal.current - signal.baseline) /
          Math.max(Math.abs(signal.baseline), 1e-9);
        state =
          relative >= review.relativeDeviation
            ? "review_suggested"
            : "within_demo_rule";
      }
    }
    return {
      crewId: signal.crewId,
      metricId: signal.metric.id,
      state,
      baseline: signal.baseline,
      current: signal.current,
      sampleCount: signal.sampleCount,
      message:
        state === "unconfigured"
          ? "No review rule configured for this metric."
          : "",
    };
  });
  return {
    findings,
    audit: [
      {
        agent: "Risk",
        detail: `Applied only explicit per-metric relative-deviation rules to activity-matched observations. ${findings.filter((finding) => finding.state === "review_suggested").length} review suggestions; ${findings.filter((finding) => finding.state === "unconfigured").length} metrics without rules. Unitless prototype comparisons, not clinical severity or probability.`,
      },
    ],
  };
}

export const RiskAgent = runRisk;
