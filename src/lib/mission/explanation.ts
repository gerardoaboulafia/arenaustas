import type { MetricFinding, RuntimeAudit } from "./types";
import type { MonitoringOutput } from "./monitoring";
import type { RiskOutput } from "./risk";

export interface ExplanationOutput {
  findings: MetricFinding[];
  audit: RuntimeAudit[];
}
export function runExplanation(
  monitoring: MonitoringOutput,
  risk: RiskOutput,
): ExplanationOutput {
  const signals = new Map(
    monitoring.signals.map((signal) => [
      `${signal.crewId}|${signal.metric.id}`,
      signal,
    ]),
  );
  const findings = risk.findings.map((finding) => {
    const signal = signals.get(`${finding.crewId}|${finding.metricId}`);
    if (!signal) throw new Error("Finding has no monitoring evidence");
    const metric = signal.metric;
    const fmt = (value: number | null) =>
      value === null
        ? "unavailable"
        : `${value.toFixed(metric.decimals)} ${metric.unit}`;
    let message = "No review rule configured for this metric.";
    if (finding.state === "insufficient_data")
      message = `Insufficient matching observations: ${signal.sampleCount} recent and ${signal.baselineSamples} baseline samples; ${metric.review!.minimumSamples} required in each window. Missing, invalid or stale observations prevent a confident comparison.`;
    else if (finding.state !== "unconfigured")
      message = `Recent 3-day ${metric.label}: ${fmt(finding.current)}; individually based first-14-orbital-day reference: ${fmt(finding.baseline)}. Matched activities: ${signal.activities.join(", ")}. ${signal.sampleCount} recent samples; ${(metric.review!.relativeDeviation * 100).toFixed(2)}% illustrative deviation rule: ${finding.state === "review_suggested" ? "review suggested; review measurement quality and activity records" : "within demo rule"}.`;
    return {
      ...finding,
      message: `${message} Synthetic prototype signal; not a clinical assessment.${metric.scope === "habitat" ? " Shared habitat context; no toxicity or individual health inference." : ""}`,
    };
  });
  return {
    findings,
    audit: [
      {
        agent: "Explanation",
        detail: `Rendered ${findings.length} evidence-based templates from Monitoring and Risk outputs, including values, matching activities, sample counts and explicit limitations. No invented sources, medical actions or LLM calls.`,
      },
    ],
  };
}

export const ExplanationAgent = runExplanation;
