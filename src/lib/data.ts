import { CREW_IDS, METRIC_KEYS, type CrewId, type DailyObservation, type TelemetryMetric } from "./types";
import { clampMissionDay, MISSION_END, MISSION_START } from "./metrics";

export class UnknownCrewError extends Error {
  constructor(crewId: string) {
    super(`Unknown fictional crew ID: ${crewId}`);
    this.name = "UnknownCrewError";
  }
}

export function isCrewId(value: string): value is CrewId {
  return (CREW_IDS as readonly string[]).includes(value);
}

export function assertCrewId(value: string): asserts value is CrewId {
  if (!isCrewId(value)) throw new UnknownCrewError(value);
}

const COLUMNS = {
  sleep_hours: "sleepHours",
  hrv_ms: "hrvMs",
  resting_hr_bpm: "restingHrBpm",
  exercise_minutes: "exerciseMinutes",
  cabin_co2_ppm: "cabinCo2Ppm",
  radiation_proxy_index: "radiationProxyIndex",
} as const;
const REQUIRED_HEADERS = ["crew_id", "mission_day", ...Object.keys(COLUMNS), "origin"];
const ALL_METRICS: readonly TelemetryMetric[] = [...METRIC_KEYS, "radiationProxyIndex"];

/** Bounds express recording validity, never clinical thresholds. */
export function isValidReading(metric: TelemetryMetric, value: unknown): value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return false;
  if (metric === "sleepHours") return value <= 24;
  if (metric === "exerciseMinutes") return value <= 1440;
  if (metric === "radiationProxyIndex") return value <= 10;
  return true;
}

/** Handles escaped quotes, quoted newlines, CRLF and BOM without a dependency. */
function csvRecords(text: string): { records: string[][]; errors: string[] } {
  const records: string[][] = [];
  const errors: string[] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let closedQuote = false;
  const input = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"' && input[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') { quoted = false; closedQuote = true; }
      else field += character;
    } else if (character === "," || character === "\n") {
      row.push(field.trim()); field = ""; closedQuote = false;
      if (character === "\n") { if (row.some(Boolean)) records.push(row); row = []; }
    } else if (character === '"' && field.trim() === "" && !closedQuote) {
      quoted = true; field = "";
    } else if (character === '"' || (closedQuote && character.trim() !== "")) {
      errors.push("Malformed CSV quoting; no observations accepted.");
      return { records: [], errors };
    } else field += character;
  }
  if (quoted) return { records: [], errors: ["Unterminated quoted CSV field; no observations accepted."] };
  row.push(field.trim());
  if (row.some(Boolean)) records.push(row);
  return { records, errors };
}

export function parseSyntheticCsv(csvText: string): { rows: DailyObservation[]; errors: string[] } {
  const { records, errors } = csvRecords(csvText);
  if (errors.length) return { rows: [], errors };
  const headers = records.shift();
  if (!headers) return { rows: [], errors: ["Missing CSV header."] };
  if (new Set(headers).size !== headers.length || REQUIRED_HEADERS.some((header) => !headers.includes(header))) {
    return { rows: [], errors: ["CSV requires unique headers including: " + REQUIRED_HEADERS.join(", ")] };
  }
  const rows: DailyObservation[] = [];
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  records.forEach((record, index) => {
    const label = `CSV record ${index + 2}`;
    if (record.length !== headers.length) { errors.push(`${label}: wrong number of fields.`); return; }
    const fields = Object.fromEntries(headers.map((header, column) => [header, record[column]]));
    const crewId = fields.crew_id;
    const missionDay = Number(fields.mission_day);
    if (!isCrewId(crewId)) { errors.push(`${label}: unknown crew_id '${crewId}'.`); return; }
    if (!/^\d+$/.test(fields.mission_day) || !Number.isInteger(missionDay) || missionDay < MISSION_START || missionDay > MISSION_END) {
      errors.push(`${label}: mission_day must be an integer from 120 to 149.`); return;
    }
    if (fields.origin !== "synthetic") { errors.push(`${label}: origin must be synthetic.`); return; }
    const key = `${crewId}:${missionDay}`;
    if (seen.has(key)) { errors.push(`${label}: duplicate crew/day '${key}'; all copies excluded.`); duplicates.add(key); return; }
    seen.add(key);
    const observation: DailyObservation = { crewId, missionDay, origin: "synthetic", sleepHours: null, hrvMs: null, restingHrBpm: null, exerciseMinutes: null, cabinCo2Ppm: null, radiationProxyIndex: null };
    for (const [column, metric] of Object.entries(COLUMNS)) {
      const raw = fields[column];
      if (/^(?:|null|na|n\/a)$/i.test(raw)) continue;
      const value = Number(raw);
      if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(raw) || !isValidReading(metric, value)) {
        errors.push(`${label}: invalid ${column} '${raw}'; reading marked missing.`);
      } else observation[metric] = value;
    }
    rows.push(observation);
  });
  return { rows: rows.filter((row) => !duplicates.has(`${row.crewId}:${row.missionDay}`)).sort((a, b) => a.crewId.localeCompare(b.crewId) || a.missionDay - b.missionDay), errors };
}

/** Copy and sanitize data at the pure boundary; never count duplicate days twice. */
export function selectObservations(rows: readonly DailyObservation[], crewId: string, day: number): DailyObservation[] {
  assertCrewId(crewId);
  const missionDay = clampMissionDay(day);
  const eligible = rows.filter((row) => row.crewId === crewId && row.origin === "synthetic" && Number.isInteger(row.missionDay) && row.missionDay >= MISSION_START && row.missionDay <= missionDay);
  const counts = new Map<number, number>();
  for (const row of eligible) counts.set(row.missionDay, (counts.get(row.missionDay) ?? 0) + 1);
  return eligible.filter((row) => counts.get(row.missionDay) === 1).map((row) => {
    const sanitized = { ...row };
    for (const metric of ALL_METRICS) sanitized[metric] = isValidReading(metric, row[metric]) ? row[metric] : null;
    return sanitized;
  }).sort((a, b) => a.missionDay - b.missionDay);
}
