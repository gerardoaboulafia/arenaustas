/** Server-only filesystem boundary. Client components import data/agents, not this module. */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseSyntheticCsv } from "./data";
import type { DailyObservation } from "./types";

export function getTelemetry(): DailyObservation[] {
  const result = parseSyntheticCsv(readFileSync(join(process.cwd(), "data", "synthetic", "crew_telemetry.csv"), "utf8"));
  if (result.errors.length) throw new Error(`Synthetic telemetry validation failed:\n${result.errors.join("\n")}`);
  return result.rows;
}
