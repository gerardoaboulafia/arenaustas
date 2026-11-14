import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import {
  activityAt,
  advanceClock,
  assessMission,
  ExplanationAgent,
  fingerprint,
  formatMissionTime,
  generateTelemetry,
  getSchedule,
  initialClock,
  MonitoringAgent,
  parseOverrides,
  phaseAt,
  RiskAgent,
  sanitizeClock,
  serializeOverrides,
  SimulationAgent,
  validateConfig,
  type MetricDefinition,
  type MissionConfig,
  type MissionDataset,
  type TelemetryOverride,
  type TelemetryRow,
} from "../src/lib/mission";

const source: MissionConfig = JSON.parse(
  readFileSync("public/mission-data/config.json", "utf8"),
);
const DAY = 1440,
  WEEK = DAY * 7,
  total = 180 * DAY,
  entry = 36 * 60,
  orbitEnd = entry + 176 * DAY;
const first = source.crew[0].id;
const clone = (): MissionConfig => structuredClone(source);
function small(): MissionConfig {
  const config = clone();
  config.timeline.durationDays = 10;
  config.timeline.orbitalDays = 7;
  return config;
}
function dataset(config: MissionConfig, rows: TelemetryRow[]): MissionDataset {
  return { config, rows, overrides: [], fingerprint: fingerprint(config) };
}
function metric(overrides: Partial<MetricDefinition> = {}): MetricDefinition {
  return {
    id: "novel_signal",
    label: "Novel signal",
    description: "Fictional units",
    unit: "u",
    scope: "crew",
    aggregation: "mean",
    decimals: 4,
    min: 0,
    max: 1000,
    generator: { baseline: 50, noise: 0, activityOffsets: {} },
    ...overrides,
  };
}
function oneMetric(definition = metric()): MissionConfig {
  const config = small();
  config.metrics = [definition];
  config.crew.forEach((crew) => {
    crew.baselines = {};
  });
  return config;
}
let rows: TelemetryRow[], full: MissionDataset;
beforeAll(() => {
  const start = performance.now();
  rows = generateTelemetry(source);
  full = dataset(source, rows);
  console.info(
    `Mission generation: ${rows.length} records in ${Math.round(performance.now() - start)} ms`,
  );
});

describe("mission configuration", () => {
  it("validates the actual default JSON and preserves four crew, 180 days and 176 orbital days", () => {
    const result = validateConfig(source);
    expect(result.errors).toEqual([]);
    expect(result.value).toMatchObject({
      timeline: { durationDays: 180, transitHours: 36, orbitalDays: 176 },
      crew: source.crew,
    });
  });
  it.each([2, 6, 8])("accepts %i crew in equal A/B groups", (count) => {
    const config = clone();
    config.crew = Array.from({ length: count }, (_, index) => ({
      ...source.crew[index % 4],
      id: `crew-${index}`,
      pair: index < count / 2 ? "A" : "B",
    }));
    expect(validateConfig(config).errors).toEqual([]);
  });
  it("normalizes optional personal baselines and work hours without mutating input", () => {
    const raw = JSON.parse(JSON.stringify(source));
    delete raw.crew[0].baselines;
    delete raw.schedule.workStartHour;
    delete raw.schedule.workEndHour;
    const result = validateConfig(raw);
    expect(result.value?.crew[0].baselines).toEqual({});
    expect(result.value?.schedule).toMatchObject({
      workStartHour: 9,
      workEndHour: 18,
    });
    expect(raw.crew[0].baselines).toBeUndefined();
  });
  it.each([
    (c: MissionConfig) => {
      c.metrics[0].generator.baseline = NaN;
    },
    (c: MissionConfig) => {
      c.metrics[0].generator.noise = Infinity;
    },
    (c: MissionConfig) => {
      c.seed = 1.5;
    },
    (c: MissionConfig) => {
      c.crew[1].id = c.crew[0].id;
    },
    (c: MissionConfig) => {
      c.crew.pop();
    },
    (c: MissionConfig) => {
      c.crew[0].pair = "B";
    },
    (c: MissionConfig) => {
      c.activities.pop();
    },
    (c: MissionConfig) => {
      c.metrics[0].id = "__proto__";
    },
    (c: MissionConfig) => {
      c.metrics[0].generator.activityOffsets.unknown = 3;
    },
    (c: MissionConfig) => {
      c.metrics[0].generator.activeOnly = ["unknown"];
    },
    (c: MissionConfig) => {
      c.metrics[0].review!.minimumSamples = 0;
    },
    (c: MissionConfig) => {
      c.metrics[0].review!.relativeDeviation = NaN;
    },
    (c: MissionConfig) => {
      c.crew[0].baselines.unknown = 1;
    },
    (c: MissionConfig) => {
      c.crew[0].baselines.cabin_co2 = 800;
    },
    (c: MissionConfig) => {
      c.timeline.intervalMinutes = 10;
    },
    (c: MissionConfig) => {
      c.timeline.transitHours = 36.1;
    },
    (c: MissionConfig) => {
      c.timeline.orbitalDays = 180;
    },
    (c: MissionConfig) => {
      c.timeline.durationDays = 1000;
    },
    (c: MissionConfig) => {
      c.schedule.exerciseDays = [0, 0];
    },
    (c: MissionConfig) => {
      c.schedule.workStartHour = 18;
      c.schedule.workEndHour = 9;
    },
  ])(
    "rejects malformed configuration %# without throwing or producing a partial config",
    (change) => {
      const config = clone();
      change(config);
      expect(validateConfig(config).value).toBeNull();
      expect(validateConfig(config).errors.length).toBeGreaterThan(0);
    },
  );
  it.each([
    null,
    [],
    {},
    5,
    {
      timeline: null,
      crew: [null],
      activities: [null],
      metrics: [null],
      schedule: null,
    },
  ])("rejects untrusted structure %j", (raw) => {
    expect(() => validateConfig(raw)).not.toThrow();
    expect(validateConfig(raw).value).toBeNull();
  });
  it.each([
    (c: MissionConfig) => {
      c.schedule.exerciseStartHour = 23;
    },
    (c: MissionConfig) => {
      c.schedule.exerciseStartHour = 12;
    },
    (c: MissionConfig) => {
      c.schedule.evaStartHour = 21;
    },
    (c: MissionConfig) => {
      c.schedule.exerciseDays.push(c.schedule.evaDay);
      c.schedule.exerciseStartHour = 15;
    },
    (c: MissionConfig) => {
      c.schedule.meals.push({ hour: 8, minutes: 30 });
    },
    (c: MissionConfig) => {
      c.schedule.meals.push({ hour: 23, minutes: 30 });
    },
    (c: MissionConfig) => {
      c.schedule.evaStartHour = 9;
    },
  ])(
    "rejects sleep/meal/exercise/EVA conflicts and orbital day spill %#",
    (change) => {
      const config = clone();
      change(config);
      expect(
        validateConfig(config).errors.some((error) =>
          error.startsWith("schedule"),
        ),
      ).toBe(true);
    },
  );
  it("allows a meal during an EVA block because that meal is explicitly suppressed", () => {
    const config = clone();
    config.schedule.meals.push({ hour: 16, minutes: 30 });
    expect(validateConfig(config).errors).toEqual([]);
  });
});

describe("orbital-relative schedule and mission phases", () => {
  it("has exact transit/orbit/return/completion boundaries", () => {
    expect(
      [
        0,
        entry - 1,
        entry,
        orbitEnd - 1,
        orbitEnd,
        total - 1,
        total,
        total + 1,
      ].map((minute) => phaseAt(source, minute)),
    ).toEqual([
      "transit",
      "transit",
      "orbit",
      "orbit",
      "return",
      "return",
      "complete",
      "complete",
    ]);
  });
  it("anchors exercise to orbital days 0,2,5 at 13:00 UTC for all 25 full weeks", () => {
    const slots = getSchedule(source, first, entry, orbitEnd).filter(
      (slot) => slot.activityId === "exercise",
    );
    expect(slots).toHaveLength(75);
    for (let week = 0; week < 25; week++) {
      const weekly = slots.filter((slot) => slot.orbitalWeek === week + 1);
      expect(
        weekly.map((slot) => slot.startMinute - entry - week * WEEK),
      ).toEqual([60, 2 * DAY + 60, 5 * DAY + 60]);
      expect(
        weekly.every((slot) => slot.endMinute - slot.startMinute === 60),
      ).toBe(true);
    }
    expect(activityAt(source, first, entry + 60 - 1).activityId).toBe("meals");
    expect(activityAt(source, first, entry + 60).activityId).toBe("exercise");
  });
  it("alternates exactly 25 EVA groups with prep, four-hour EVA, recovery and nonpair support", () => {
    const allSlots = source.crew.flatMap((crew) =>
      getSchedule(source, crew.id, entry, orbitEnd),
    );
    const evas = allSlots.filter((slot) => slot.activityId === "eva");
    expect(evas).toHaveLength(50);
    for (let week = 0; week < 25; week++) {
      const at = entry + week * WEEK + source.schedule.evaDay * DAY + 3 * 60;
      const pair = week % 2 === 0 ? "A" : "B";
      expect(
        evas
          .filter((slot) => slot.orbitalWeek === week + 1)
          .map(
            (slot) => source.crew.find((crew) => crew.id === slot.crewId)!.pair,
          ),
      ).toEqual([pair, pair]);
      const actor = source.crew.find((crew) => crew.pair === pair)!.id,
        support = source.crew.find((crew) => crew.pair !== pair)!.id;
      expect(activityAt(source, actor, at - 60).activityId).toBe("eva_prep");
      expect(activityAt(source, actor, at).activityId).toBe("eva");
      expect(activityAt(source, actor, at + 240).activityId).toBe(
        "eva_recovery",
      );
      expect(activityAt(source, support, at + 240).activityId).toBe("support");
      expect(activityAt(source, actor, at + 300).activityId).toBe("rest");
    }
    expect(
      evas.every((slot) => slot.endMinute - slot.startMinute === 240),
    ).toBe(true);
    expect(
      allSlots
        .filter((slot) => slot.startMinute >= entry + 25 * WEEK)
        .every(
          (slot) =>
            !["eva", "eva_prep", "eva_recovery", "exercise"].includes(
              slot.activityId,
            ),
        ),
    ).toBe(true);
  });
  it("keeps meals at UTC hours across the noon orbital boundary and supplies daily rest", () => {
    expect(activityAt(source, first, entry).activityId).toBe("meals");
    expect(activityAt(source, first, entry + 20 * 60).activityId).toBe("meals"); // next 08:00
    expect(activityAt(source, first, entry + 8 * 60).activityId).toBe("rest"); // 20:00
    expect(activityAt(source, first, entry + 10 * 60).activityId).toBe("sleep");
    expect(activityAt(source, first, entry + 18 * 60).activityId).toBe("rest"); // 06:00
    expect(activityAt(source, first, entry + 6 * DAY + 3 * 60).activityId).toBe(
      "rest",
    );
  });
  it("generates gap-free positive intervals clipped to the mission, with no terminal slot", () => {
    const slots = getSchedule(source, first, -300, total + 500);
    expect(slots[0].startMinute).toBe(0);
    expect(slots.at(-1)!.endMinute).toBe(total);
    for (let i = 0; i < slots.length; i++) {
      expect(slots[i].endMinute).toBeGreaterThan(slots[i].startMinute);
      if (i) expect(slots[i - 1].endMinute).toBe(slots[i].startMinute);
    }
    expect(getSchedule(source, first, total, total + 15)).toEqual([]);
    expect(() => activityAt(source, "missing", 0)).toThrow("Unknown crew");
  });
});

describe("minute synthesis and 15-minute aggregation", () => {
  it("produces exactly 69,120 records, 17,280 per crew, with no time-zero or post-terminal record", () => {
    expect(rows).toHaveLength(69120);
    for (const crew of source.crew) {
      const crewRows = rows.filter((row) => row.crewId === crew.id);
      expect(crewRows).toHaveLength(17280);
      expect(crewRows[0].endMinute).toBe(15);
      expect(crewRows.at(-1)!.endMinute).toBe(total);
    }
    expect(
      rows.every(
        (row) =>
          Object.values(row.activityMinutes).reduce((a, b) => a + b, 0) === 15,
      ),
    ).toBe(true);
  });
  it("repeats deterministically, changes seeded noise, and preserves existing metrics when another is added", () => {
    const config = small(),
      firstRun = generateTelemetry(config);
    expect(generateTelemetry(config)).toEqual(firstRun);
    config.seed++;
    expect(generateTelemetry(config)[0].values.heart_rate).not.toBe(
      firstRun[0].values.heart_rate,
    );
    config.seed--;
    config.metrics.push(metric());
    const extended = generateTelemetry(config);
    expect(
      extended.every(
        (row, index) =>
          row.values.heart_rate === firstRun[index].values.heart_rate &&
          row.values.novel_signal === 50,
      ),
    ).toBe(true);
    const assessment = assessMission(dataset(config, extended), 7 * DAY);
    expect(
      assessment.findings
        .filter((finding) => finding.metricId === "novel_signal")
        .every(
          (finding) =>
            finding.state === "unconfigured" &&
            finding.message.includes("No review rule configured"),
        ),
    ).toBe(true);
  });
  it("computes exact mean from minute trend and exact scheduled-minute sums", () => {
    const config = oneMetric(
      metric({
        generator: {
          baseline: 10,
          noise: 0,
          trendPerDay: 1440,
          activityOffsets: {},
        },
        max: 1e6,
      }),
    );
    expect(generateTelemetry(config)[0].values.novel_signal).toBe(17); // mean of minutes 0...14
    const at = entry + 60;
    expect(
      rows.find((row) => row.crewId === first && row.endMinute === at)!.values
        .exercise_minutes,
    ).toBe(0);
    expect(
      rows.find((row) => row.crewId === first && row.endMinute === at + 15)!
        .values.exercise_minutes,
    ).toBe(15);
    expect(
      rows.find((row) => row.crewId === first && row.endMinute === at + 60)!
        .values.exercise_minutes,
    ).toBe(15);
    expect(
      rows.find((row) => row.crewId === first && row.endMinute === at + 75)!
        .values.exercise_minutes,
    ).toBe(0);
  });
  it("uses crew baselines, bounds all generated values and makes active-only mixed/settling windows null", () => {
    const config = oneMetric(
      metric({
        generator: {
          baseline: 50,
          noise: 0,
          activityOffsets: { exercise: 60 },
          activeOnly: ["exercise"],
          settlingMinutes: 5,
        },
        max: 100,
      }),
    );
    config.schedule.exerciseMinutes = 62;
    const generated = generateTelemetry(config).filter(
      (row) => row.crewId === first,
    );
    const at = entry + 60;
    expect(
      generated.find((row) => row.endMinute === at + 15)!.values.novel_signal,
    ).toBeNull();
    expect(
      generated.find((row) => row.endMinute === at + 30)!.values.novel_signal,
    ).toBe(100);
    expect(
      generated.find((row) => row.endMinute === at + 75)!.values.novel_signal,
    ).toBeNull();
    const steady = oneMetric();
    steady.crew[0].baselines.novel_signal = 70;
    expect(
      generateTelemetry(steady)
        .slice(0, 4)
        .map((row) => row.values.novel_signal),
    ).toEqual([70, 50, 50, 50]);
  });
  it("keeps habitat identical during differing crew activities and independent of crew baselines/pair assignment", () => {
    expect(
      rows.every(
        (row, index) =>
          row.values.cabin_co2 === rows[index - (index % 4)].values.cabin_co2,
      ),
    ).toBe(true);
    const config = oneMetric(
      metric({
        scope: "habitat",
        generator: {
          baseline: 50,
          noise: 2,
          activityOffsets: { eva: 300, support: 40, exercise: 100 },
        },
      }),
    );
    const original = generateTelemetry(config);
    config.crew.reverse();
    config.crew.forEach((crew) => {
      crew.pair = crew.pair === "A" ? "B" : "A";
    });
    expect(
      generateTelemetry(config).map((row) => row.values.novel_signal),
    ).toEqual(original.map((row) => row.values.novel_signal));
  });
  it("applies overrides only to target records and broadcasts habitat overrides, including null", () => {
    const config = small(),
      base = generateTelemetry(config);
    const overrides: TelemetryOverride[] = [
      { endMinute: 15, crewId: first, metricId: "heart_rate", value: 100 },
      { endMinute: 30, crewId: first, metricId: "hrv", value: null },
      { endMinute: 15, crewId: "habitat", metricId: "cabin_co2", value: null },
    ];
    const changed = generateTelemetry(config, overrides);
    expect(changed[0].values.heart_rate).toBe(100);
    expect(changed[4].values.hrv).toBeNull();
    expect(
      changed.slice(0, 4).every((row) => row.values.cabin_co2 === null),
    ).toBe(true);
    expect(changed[1].values.heart_rate).toBe(base[1].values.heart_rate);
    expect(changed.slice(8)).toEqual(base.slice(8));
    expect(() =>
      generateTelemetry(config, [{ ...overrides[0], value: NaN }]),
    ).toThrow("Invalid telemetry overrides");
  });
});

describe("CSV overrides and reproducible fingerprints", () => {
  const header = "end_minute,crew_id,metric_id,value\n";
  it("supports BOM, CRLF, quotes, explicit missing cells and lossless serialization", () => {
    const csv = `\uFEFF${header.replace("\n", "\r\n")}15,"${first}",heart_rate,70\r\n30,habitat,cabin_co2,\r\n`;
    const result = parseOverrides(csv, source);
    expect(result.errors).toEqual([]);
    expect(result.value?.[1].value).toBeNull();
    expect(
      parseOverrides(serializeOverrides(result.value!), source).value,
    ).toEqual(result.value);
    expect(parseOverrides("", source).value).toEqual([]);
  });
  it.each([
    `0,${first},heart_rate,70`,
    `16,${first},heart_rate,70`,
    `${total + 15},${first},heart_rate,70`,
    "15,unknown,heart_rate,70",
    `15,${first},unknown,70`,
    `15,${first},heart_rate,NaN`,
    `15,${first},heart_rate,Infinity`,
    `15,${first},heart_rate,0x40`,
    `15,${first},heart_rate,190`,
    `15,${first},heart_rate,null`,
    `15,${first},cabin_co2,900`,
    "15,habitat,heart_rate,70",
    `15,${first},heart_rate,70\n15,${first},heart_rate,`,
    `15,${first},heart_rate,70,extra`,
    `15,"${first},heart_rate,70`,
    `15,${first},heart_rate,1e999`,
  ])("rejects malformed row %s atomically", (row) => {
    const result = parseOverrides(header + row, source);
    expect(result.value).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });
  it("round-trips the entire default telemetry export, including all missing cells", () => {
    const exported: TelemetryOverride[] = [];
    for (const row of rows)
      for (const definition of source.metrics) {
        if (definition.scope === "habitat" && row.crewId !== first) continue;
        exported.push({
          endMinute: row.endMinute,
          crewId: definition.scope === "habitat" ? "habitat" : row.crewId,
          metricId: definition.id,
          value: row.values[definition.id],
        });
      }
    const csv = serializeOverrides(exported),
      parsed = parseOverrides(csv, source);
    expect(exported).toHaveLength(293760);
    expect(csv.length).toBeLessThan(30 * 1024 * 1024);
    expect(parsed.errors).toEqual([]);
    expect(parsed.value).toHaveLength(exported.length);
    expect(parsed.value?.filter((row) => row.value === null).length).toBe(
      exported.filter((row) => row.value === null).length,
    );
    console.info(
      `Full CSV: ${exported.length} overrides, ${(csv.length / 1024 / 1024).toFixed(1)} MiB`,
    );
  }, 20000);
  it("fingerprints canonical object keys and override ordering, changing for any actual input change", () => {
    const overrides: TelemetryOverride[] = [
      { endMinute: 15, crewId: first, metricId: "heart_rate", value: null },
      { endMinute: 30, crewId: first, metricId: "heart_rate", value: 70 },
    ];
    const reordered = Object.fromEntries(
      Object.entries(source).reverse(),
    ) as unknown as MissionConfig;
    expect(fingerprint(source, overrides)).toBe(
      fingerprint(reordered, [...overrides].reverse()),
    );
    const changed = clone();
    changed.seed++;
    expect(fingerprint(changed, overrides)).not.toBe(
      fingerprint(source, overrides),
    );
    expect(fingerprint(source, overrides)).not.toBe(
      fingerprint(source, overrides.slice(0, 1)),
    );
  });
});

describe("four deterministic runtime stages", () => {
  it("emits all four meaningful audit stages and never consumes future observations", () => {
    const asOf = entry + 30 * DAY + 8 * 60;
    const assessment = assessMission(full, asOf);
    const past = { ...full, rows: rows.filter((row) => row.endMinute <= asOf) };
    expect(assessMission(past, asOf)).toEqual(assessment);
    expect(assessment.audit.map((audit) => audit.agent)).toEqual([
      "Monitoring",
      "Risk",
      "Simulation",
      "Explanation",
    ]);
    expect(
      assessment.findings
        .filter((finding) => ["heart_rate", "hrv"].includes(finding.metricId))
        .every((finding) => finding.state === "within_demo_rule"),
    ).toBe(true);
    expect(
      assessment.findings.filter((finding) => finding.metricId === "cabin_co2"),
    ).toHaveLength(1);
  });
  it("uses exercise baseline for exercise even when resting baseline is lower", () => {
    const config = clone();
    config.metrics = [
      metric({ review: { minimumSamples: 2, relativeDeviation: 0.2 } }),
    ];
    const asOf = entry + 30 * DAY;
    const row = (
      endMinute: number,
      activityId: string,
      value: number | null,
    ): TelemetryRow => ({
      endMinute,
      crewId: first,
      activityId,
      activityMinutes: { [activityId]: 15 },
      values: { novel_signal: value },
    });
    const observations = [
      row(entry + 15, "rest", 50),
      row(entry + 30, "rest", 50),
      row(entry + 45, "exercise", 100),
      row(entry + 60, "exercise", 100),
      row(asOf - 15, "exercise", 100),
      row(asOf, "exercise", 100),
    ];
    const finding = assessMission(dataset(config, observations), asOf)
      .findings[0];
    expect(finding).toMatchObject({
      baseline: 100,
      current: 100,
      state: "within_demo_rule",
      sampleCount: 2,
    });
    observations.at(-1)!.values.novel_signal = 160;
    observations.at(-2)!.values.novel_signal = 160;
    expect(
      assessMission(dataset(config, observations), asOf).findings[0].state,
    ).toBe("review_suggested");
    observations.at(-1)!.values.novel_signal = null;
    expect(
      assessMission(dataset(config, observations), asOf).findings[0].state,
    ).toBe("insufficient_data");
  });
  it("caps the first-14-day baseline at the clock, exposes invalid/missing recent values and stale datasets", () => {
    const config = clone();
    config.metrics = [
      metric({ review: { minimumSamples: 1, relativeDeviation: 0.2 } }),
    ];
    const row = (endMinute: number, value: number | null): TelemetryRow => ({
      endMinute,
      crewId: first,
      activityId: "rest",
      activityMinutes: { rest: 15 },
      values: { novel_signal: value },
    });
    const observations = [row(entry + 15, 50), row(entry + 30, 500)];
    expect(
      assessMission(dataset(config, observations), entry + 15).findings[0],
    ).toMatchObject({ baseline: 50, current: 50, sampleCount: 1 });
    const asOf = entry + 30 * DAY;
    for (const value of [null, NaN, Infinity, 1001])
      expect(
        assessMission(
          dataset(config, [row(entry + 15, 50), row(asOf, value)]),
          asOf,
        ).findings[0].state,
      ).toBe("insufficient_data");
    expect(
      assessMission(dataset(config, observations), asOf).findings[0].state,
    ).toBe("insufficient_data");
    expect(
      assessMission(full, 0)
        .findings.filter(
          (finding) =>
            source.metrics.find((metric) => metric.id === finding.metricId)
              ?.review,
        )
        .every((finding) => finding.state === "insufficient_data"),
    ).toBe(true);
  });
  it("offers deterministic generic assumptions without modifying source signals or inventing missing data", () => {
    const monitoring = MonitoringAgent(full, entry + 30 * DAY + 8 * 60),
      risk = RiskAgent(monitoring);
    const targets = [{ crewId: first, metricId: "heart_rate", value: 70 }];
    const plan = SimulationAgent({ monitoring, targets });
    expect(SimulationAgent({ monitoring, targets })).toEqual(plan);
    expect(plan.plans[0].points).toHaveLength(30);
    expect(plan.plans[0].points.every((point) => point.assumed === 70)).toBe(
      true,
    );
    expect(ExplanationAgent(monitoring, risk).findings[0].message).toContain(
      "not a clinical assessment",
    );
    expect(() =>
      SimulationAgent({
        monitoring,
        targets: [{ ...targets[0], value: Infinity }],
      }),
    ).toThrow();
    expect(
      SimulationAgent({ monitoring: MonitoringAgent(full, 0) }).plans.every(
        (plan) =>
          plan.points.every(
            (point) => point.baseline === null && point.assumed === null,
          ),
      ),
    ).toBe(true);
  });
});

describe("mission clock", () => {
  it("starts day zero, clamps exact completion and does not run paused/ready clocks", () => {
    expect(initialClock()).toMatchObject({ elapsedMinute: 0, status: "ready" });
    expect(formatMissionTime(0)).toBe("D000 00:00");
    expect(formatMissionTime(total)).toBe("D180 00:00");
    expect(formatMissionTime(1500)).toBe("D001 01:00");
    expect(
      advanceClock(
        { elapsedMinute: total - 1, status: "running", speed: 60 },
        100,
        total,
      ),
    ).toMatchObject({ elapsedMinute: total, status: "completed" });
    expect(advanceClock(initialClock(), 100, total).elapsedMinute).toBe(0);
    expect(
      advanceClock(
        { elapsedMinute: 100, status: "paused", speed: 60 },
        100,
        total,
      ).elapsedMinute,
    ).toBe(100);
  });
  it("restores running as paused and handles damaged clocks and invalid deltas", () => {
    expect(
      sanitizeClock(
        { elapsedMinute: 123, status: "running", speed: 60 },
        total,
      ),
    ).toEqual({ elapsedMinute: 123, status: "paused", speed: 60 });
    expect(
      sanitizeClock({ elapsedMinute: total + 30, status: "running" }, total),
    ).toMatchObject({ elapsedMinute: total, status: "completed" });
    expect(
      sanitizeClock({ elapsedMinute: NaN, speed: Infinity }, total)
        .elapsedMinute,
    ).toBe(0);
    const running = { elapsedMinute: 5, status: "running" as const, speed: 60 };
    for (const delta of [-50, NaN, Infinity])
      expect(advanceClock(running, delta, total).elapsedMinute).toBe(5);
    expect(advanceClock(running, 0.5, total).elapsedMinute).toBe(5.5);
    expect(() => sanitizeClock({}, NaN)).toThrow();
  });
});
