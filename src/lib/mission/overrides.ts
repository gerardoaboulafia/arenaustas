import type {
  MissionConfig,
  TelemetryOverride,
  ValidationResult,
} from "./types";
import { DAY, INTERVAL } from "./validation";

const HEADER = "end_minute,crew_id,metric_id,value";
const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
export const overrideKey = (row: TelemetryOverride): string =>
  `${row.endMinute}|${row.crewId}|${row.metricId}`;

export function validateOverrides(
  overrides: TelemetryOverride[],
  config: MissionConfig,
): string[] {
  const errors: string[] = [],
    keys = new Set<string>();
  const metrics = new Map(config.metrics.map((metric) => [metric.id, metric]));
  const crew = new Set(config.crew.map((member) => member.id));
  for (const [index, row] of overrides.entries()) {
    const label = `Override ${index + 1}`;
    if (!row || typeof row !== "object") {
      errors.push(`${label}: must be an object`);
      continue;
    }
    const metric = metrics.get(row.metricId);
    if (
      !Number.isInteger(row.endMinute) ||
      row.endMinute < INTERVAL ||
      row.endMinute > config.timeline.durationDays * DAY ||
      row.endMinute % INTERVAL !== 0
    )
      errors.push(
        `${label}: end_minute must be an in-mission 15-minute endpoint`,
      );
    if (!metric) errors.push(`${label}: unknown metric ${row.metricId}`);
    else {
      if (
        metric.scope === "habitat"
          ? row.crewId !== "habitat"
          : !crew.has(row.crewId)
      )
        errors.push(
          `${label}: ${metric.scope === "habitat" ? "habitat metrics require crew_id='habitat'" : "unknown crew reference"}`,
        );
      if (
        row.value !== null &&
        (typeof row.value !== "number" ||
          !Number.isFinite(row.value) ||
          row.value < metric.min ||
          row.value > metric.max)
      )
        errors.push(
          `${label}: value must be null or finite within [${metric.min}, ${metric.max}]`,
        );
    }
    const key = overrideKey(row);
    if (keys.has(key)) errors.push(`${label}: duplicate endpoint/crew/metric`);
    keys.add(key);
  }
  return errors;
}

/** Small RFC-style reader: quoted fields, escaped quotes, BOM and CRLF. */
function readCsv(csv: string): string[][] {
  const rows: string[][] = [],
    row: string[] = [];
  let field = "",
    quoted = false,
    closed = false;
  const cell = () => {
    row.push(field.trim());
    field = "";
    closed = false;
  };
  const line = () => {
    cell();
    if (row.some((value) => value !== "") || row.length > 1)
      rows.push([...row]);
    row.length = 0;
  };
  csv = csv
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  for (let index = 0; index < csv.length; index++) {
    const char = csv[index];
    if (quoted) {
      if (char === '"' && csv[index + 1] === '"') {
        field += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
        closed = true;
      } else field += char;
    } else if (char === ",") cell();
    else if (char === "\n") line();
    else if (char === '"' && !field && !closed) quoted = true;
    else if (char === '"' || (closed && char.trim()))
      throw new Error("Malformed CSV quoting");
    else field += char;
  }
  if (quoted) throw new Error("Unclosed CSV quote");
  if (field || row.length || closed) line();
  return rows;
}

export function parseOverrides(
  csv: string,
  config: MissionConfig,
): ValidationResult<TelemetryOverride[]> {
  let rows: string[][];
  try {
    rows = readCsv(csv);
  } catch (error) {
    return { value: null, errors: [String(error)] };
  }
  if (!rows.length) return { value: [], errors: [] };
  if (rows.shift()!.join(",") !== HEADER)
    return { value: null, errors: [`Expected CSV header: ${HEADER}`] };
  const overrides: TelemetryOverride[] = [],
    errors: string[] = [];
  rows.forEach((cells, index) => {
    if (cells.length !== 4) {
      errors.push(`CSV row ${index + 2}: expected four columns`);
      return;
    }
    const [end, crewId, metricId, raw] = cells;
    if (!decimal.test(end) || (raw !== "" && !decimal.test(raw))) {
      errors.push(
        `CSV row ${index + 2}: invalid numeric value; only an empty value means missing`,
      );
      return;
    }
    overrides.push({
      endMinute: Number(end),
      crewId,
      metricId,
      value: raw === "" ? null : Number(raw),
    });
  });
  errors.push(...validateOverrides(overrides, config));
  return errors.length
    ? { value: null, errors }
    : { value: overrides, errors: [] };
}

export function sortedOverrides(
  overrides: TelemetryOverride[],
): TelemetryOverride[] {
  return [...overrides].sort(
    (a, b) =>
      a.endMinute - b.endMinute ||
      (a.crewId < b.crewId ? -1 : a.crewId > b.crewId ? 1 : 0) ||
      (a.metricId < b.metricId ? -1 : a.metricId > b.metricId ? 1 : 0),
  );
}

export function serializeOverrides(overrides: TelemetryOverride[]): string {
  const quote = (value: string) =>
    /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  for (const row of overrides)
    if (
      !Number.isFinite(row.endMinute) ||
      (row.value !== null && !Number.isFinite(row.value))
    )
      throw new Error("Cannot serialize nonfinite override values");
  return (
    [
      HEADER,
      ...sortedOverrides(overrides).map((row) =>
        [
          row.endMinute,
          quote(row.crewId),
          quote(row.metricId),
          row.value === null ? "" : row.value,
        ].join(","),
      ),
    ].join("\n") + "\n"
  );
}
