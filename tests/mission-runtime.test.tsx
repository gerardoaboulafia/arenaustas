// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import defaultConfig from "../public/mission-data/config.json";
import {
  MissionProvider,
  useMission,
} from "../src/components/mission-v2/provider";
import MissionApp from "../src/components/mission-v2/app";
import DataEditor, {
  telemetryCsv,
} from "../src/components/mission-v2/data-editor";
import { compareMissionPlan } from "../src/lib/mission-plan";
import {
  generateTelemetry,
  validateConfig,
  fingerprint,
  parseOverrides,
} from "../src/lib/mission";
import type { MissionDataset } from "../src/lib/mission/types";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("../src/components/mission-v2/dashboard", () => ({
  default: ({
    elapsedMinute,
    inspectedDay,
  }: {
    elapsedMinute: number;
    inspectedDay: number;
  }) => (
    <div data-testid="dashboard">
      {elapsedMinute}:{inspectedDay}
    </div>
  ),
}));
vi.mock("../src/components/mission-v2/schedule", () => ({
  default: () => <div>Full mission schedule</div>,
}));
const config = validateConfig(defaultConfig).value!;
const dataset: MissionDataset = {
  config,
  rows: generateTelemetry(config),
  overrides: [],
  fingerprint: fingerprint(config, []),
};
function Probe() {
  const mission = useMission();
  return (
    <>
      <output data-testid="state">
        {mission.clock.status}:{mission.clock.elapsedMinute}:
        {mission.dataset?.config.metrics.map((metric) => metric.id).join(",")}
      </output>
      <output data-testid="override">
        {
          mission.dataset?.rows.find(
            (row) => row.endMinute === 2235 && row.crewId === "maya-torres",
          )?.values.heart_rate
        }
      </output>
    </>
  );
}
beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(document, "hidden", {
    value: false,
    configurable: true,
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (url: string) =>
        new Response(
          url.endsWith(".json")
            ? JSON.stringify(defaultConfig)
            : "end_minute,crew_id,metric_id,value\n",
        ),
    ),
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
async function ready() {
  await waitFor(() =>
    expect(screen.getByTestId("state").textContent).toContain("heart_rate"),
  );
}

describe("180-day mission runtime", () => {
  it("starts at day zero; play/pause, speed and historical day are independent", async () => {
    render(
      <MissionProvider>
        <MissionApp />
        <Probe />
      </MissionProvider>,
    );
    await ready();
    expect(screen.getByLabelText("Current mission time").textContent).toBe(
      "D000 00:00",
    );
    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "Start mission" }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByTestId("dashboard").textContent).toBe("15:0");
    fireEvent.change(screen.getByLabelText("Playback speed"), {
      target: { value: "1440" },
    });
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.change(screen.getByLabelText("Review day"), {
      target: { value: "0" },
    });
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByTestId("dashboard").textContent).toBe("2895:0");
    fireEvent.click(screen.getByRole("button", { name: "Follow present" }));
    expect(screen.getByTestId("dashboard").textContent).toBe("2895:2");
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByTestId("state").textContent).toContain("paused:2895:");
    fireEvent.click(screen.getByRole("button", { name: "Reset mission" }));
    expect(screen.getByTestId("dashboard").textContent).toBe("0:0");
  });
  it("finishes at day 180 without overflow and never advances hidden tabs", async () => {
    render(
      <MissionProvider>
        <MissionApp />
        <Probe />
      </MissionProvider>,
    );
    await ready();
    vi.useFakeTimers();
    fireEvent.change(screen.getByLabelText("Playback speed"), {
      target: { value: "1440" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Start mission" }));
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByTestId("state").textContent).toContain("running:0:");
    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });
    act(() => vi.advanceTimersByTime(181000));
    expect(screen.getByTestId("state").textContent).toContain(
      "completed:259200:",
    );
    expect(screen.getByLabelText("Current mission time").textContent).toBe(
      "D180 00:00",
    );
  });
  it("restores an exact matching session paused and ignores stale fingerprints", async () => {
    localStorage.setItem(
      "astra.mission.clock.v2",
      JSON.stringify({
        fingerprint: dataset.fingerprint,
        elapsedMinute: 3330,
        status: "running",
        speed: 360,
      }),
    );
    const view = render(
      <MissionProvider>
        <Probe />
      </MissionProvider>,
    );
    await ready();
    expect(screen.getByTestId("state").textContent).toContain("paused:3330:");
    view.unmount();
    localStorage.setItem(
      "astra.mission.clock.v2",
      JSON.stringify({
        fingerprint: "old",
        elapsedMinute: 9999,
        status: "running",
      }),
    );
    render(
      <MissionProvider>
        <Probe />
      </MissionProvider>,
    );
    await ready();
    expect(screen.getByTestId("state").textContent).toContain("ready:0:");
  });
  it("adds a registry indicator and applies CSV corrections to regenerated telemetry", async () => {
    render(
      <MissionProvider>
        <DataEditor />
        <Probe />
      </MissionProvider>,
    );
    await ready();
    fireEvent.click(
      screen.getByRole("button", { name: "Add indicator to draft" }),
    );
    fireEvent.change(screen.getByLabelText("Telemetry overrides CSV"), {
      target: {
        value:
          "end_minute,crew_id,metric_id,value\n2235,maya-torres,heart_rate,125\n",
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Apply changes & restart mission" }),
    );
    await waitFor(() =>
      expect(screen.getByTestId("state").textContent).toContain("temperature"),
    );
    expect(screen.getByTestId("override").textContent).toBe("125");
    expect(localStorage.getItem("astra.mission.custom.v2")).toContain(
      "temperature",
    );
    expect(screen.getByText(/Browser customization/)).toBeTruthy();
  });
  it("rejects invalid inputs atomically and reloads updated source files", async () => {
    render(
      <MissionProvider>
        <DataEditor />
        <Probe />
      </MissionProvider>,
    );
    await ready();
    const original = screen.getByTestId("override").textContent;
    fireEvent.change(screen.getByLabelText("Telemetry overrides CSV"), {
      target: {
        value:
          "end_minute,crew_id,metric_id,value\n2235,unknown,heart_rate,125\n",
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Apply changes & restart mission" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toMatch(/crew/i),
    );
    expect(screen.getByTestId("override").textContent).toBe(original);
    const next = structuredClone(defaultConfig);
    next.crew[0].baselines.heart_rate = 80;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (url: string) =>
          new Response(
            url.endsWith(".json")
              ? JSON.stringify(next)
              : "end_minute,crew_id,metric_id,value\n",
          ),
      ),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Reload source files" }),
    );
    await waitFor(() =>
      expect(screen.getByTestId("override").textContent).not.toBe(original),
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
describe("editable observations and generic scenarios", () => {
  it("exports only completed observations and shared habitat once, round-tripping missing values", () => {
    const csv = telemetryCsv(dataset, 15);
    const parsed = parseOverrides(csv, config);
    expect(parsed.errors).toEqual([]);
    expect(parsed.value).toHaveLength(17);
    expect(parsed.value!.every((row) => row.endMinute === 15)).toBe(true);
    expect(
      parsed.value!.filter((row) => row.crewId === "habitat"),
    ).toHaveLength(1);
    expect(
      parsed
        .value!.filter((row) => row.metricId === "hrv")
        .every((row) => row.value === null),
    ).toBe(true);
  });
  it("uses only completed historical days; summed plans expose total difference", () => {
    expect(
      compareMissionPlan(dataset, "maya-torres", "heart_rate", 2 * 1440, 75)
        .baseline,
    ).toBeNull();
    const plan = compareMissionPlan(
      dataset,
      "maya-torres",
      "sleep_minutes",
      8 * 1440 - 1,
      500,
    );
    expect(plan.availableDays).toBe(7);
    // Launch replaces the first hour of the first night's sleep opportunity.
    expect(plan.baseline).toBeCloseTo((420 + 6 * 480) / 7);
    expect(plan.totalDelta).toBeCloseTo(30 * (500 - (420 + 6 * 480) / 7));
    expect(plan.points).toHaveLength(30);
    const futureChanged = {
      ...dataset,
      rows: dataset.rows.map((row) =>
        row.endMinute > 7 * 1440 ? { ...row, values: {} } : row,
      ),
    };
    expect(
      compareMissionPlan(
        futureChanged,
        "maya-torres",
        "sleep_minutes",
        8 * 1440 - 1,
        500,
      ),
    ).toEqual(plan);
  });
  it("never uses incomplete daily sums and accepts newly registered metrics", () => {
    const extra = structuredClone(config.metrics[0]);
    extra.id = "custom_signal";
    extra.label = "Custom";
    const enriched = {
      ...dataset,
      config: { ...config, metrics: [...config.metrics, extra] },
      rows: dataset.rows.map((row) => ({
        ...row,
        values: { ...row.values, custom_signal: 42 },
      })),
    };
    expect(
      compareMissionPlan(enriched, "maya-torres", "custom_signal", 4 * 1440, 50)
        .baseline,
    ).toBe(42);
    const missing = {
      ...dataset,
      rows: dataset.rows.filter((row) => row.endMinute % 1440 !== 15),
    };
    expect(
      compareMissionPlan(missing, "maya-torres", "sleep_minutes", 7 * 1440, 500)
        .baseline,
    ).toBeNull();
  });
});
