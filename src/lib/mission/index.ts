import type { MetricFinding, MissionDataset, RuntimeAudit } from "./types";
import { runMonitoring } from "./monitoring";
import { runRisk } from "./risk";
import { runSimulation } from "./simulation";
import { runExplanation } from "./explanation";

export * from "./types";
export { validateConfig } from "./validation";
export { parseOverrides, serializeOverrides } from "./overrides";
export { fingerprint } from "./identity";
export { phaseAt, activityAt, getSchedule } from "./schedule";
export { generateTelemetry } from "./telemetry";
export {
  initialClock,
  sanitizeClock,
  advanceClock,
  formatMissionTime,
} from "./clock";
export * from "./monitoring";
export * from "./risk";
export * from "./simulation";
export * from "./explanation";

export function assessMission(
  dataset: MissionDataset,
  asOfMinute: number,
): { findings: MetricFinding[]; audit: RuntimeAudit[] } {
  const monitoring = runMonitoring(dataset, asOfMinute);
  const risk = runRisk(monitoring);
  const simulation = runSimulation({ monitoring });
  const explanation = runExplanation(monitoring, risk);
  return {
    findings: explanation.findings,
    audit: [
      ...monitoring.audit,
      ...risk.audit,
      ...simulation.audit,
      ...explanation.audit,
    ],
  };
}
