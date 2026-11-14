import type { RuntimeAudit } from "./types";
import type { MonitoringOutput } from "./monitoring";

export interface SimulationTarget {
  crewId: string;
  metricId: string;
  value: number;
}
export interface SimulationInput {
  monitoring: MonitoringOutput;
  targets?: SimulationTarget[];
  horizonDays?: number;
}
export interface SimulationPoint {
  day: number;
  baseline: number | null;
  assumed: number | null;
}
export interface SimulationPlan {
  crewId: string;
  metricId: string;
  points: SimulationPoint[];
}
export interface SimulationOutput {
  plans: SimulationPlan[];
  assumptions: string[];
  audit: RuntimeAudit[];
}

/** Generic assumption comparison; targets never change another metric's biology. */
export function runSimulation({
  monitoring,
  targets = [],
  horizonDays = 30,
}: SimulationInput): SimulationOutput {
  if (!Number.isInteger(horizonDays) || horizonDays < 1 || horizonDays > 30)
    throw new RangeError("Plan horizon must be 1–30 days");
  const targetMap = new Map<string, number>();
  for (const target of targets) {
    const signal = monitoring.signals.find(
      (signal) =>
        signal.crewId === target.crewId && signal.metric.id === target.metricId,
    );
    const key = `${target.crewId}|${target.metricId}`;
    if (
      !signal ||
      targetMap.has(key) ||
      !Number.isFinite(target.value) ||
      target.value < signal.metric.min ||
      target.value > signal.metric.max
    )
      throw new RangeError(
        "Invalid, duplicate or out-of-bounds simulation target",
      );
    targetMap.set(key, target.value);
  }
  const plans = monitoring.signals.map((signal) => {
    const baseline = signal.sufficient ? signal.current : null;
    const assumed =
      targetMap.get(`${signal.crewId}|${signal.metric.id}`) ?? baseline;
    return {
      crewId: signal.crewId,
      metricId: signal.metric.id,
      points: Array.from({ length: horizonDays }, (_, index) => ({
        day: index + 1,
        baseline,
        assumed,
      })),
    };
  });
  return {
    plans,
    assumptions: [
      "Illustrative synthetic signal plan: available recent activity-matched means held constant.",
      "Explicit targets are independent assumptions, not treatment efficacy, adherence or personalized medical predictions.",
      "Insufficient observations remain missing; no NASA measurement or validated forecast is implied.",
    ],
    audit: [
      {
        agent: "Simulation",
        detail: `Built ${plans.length} deterministic ${horizonDays}-day assumption comparisons from observations available through minute ${monitoring.asOfMinute}; ${targets.length} explicit targets. No future telemetry read; no causal health effects modeled.`,
      },
    ],
  };
}

export const SimulationAgent = runSimulation;
