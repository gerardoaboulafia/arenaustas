// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import rawConfig from "../public/mission-data/config.json";
import type {
  MetricDefinition,
  MissionConfig,
  MissionDataset,
} from "../src/lib/mission/types";
import { assessMission, getSchedule } from "../src/lib/mission";
import MissionDashboard from "../src/components/mission-v2/dashboard";
import MissionSchedule, {
  formatMissionMinute,
} from "../src/components/mission-v2/schedule";
import MissionPosition from "../src/components/mission-v2/animation";

// Keep the real domain pipeline; count invocations to catch frame-by-frame scans.
vi.mock("../src/lib/mission", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/lib/mission")>();
  return { ...actual, assessMission: vi.fn(actual.assessMission) };
});

// jsdom has no SVG layout. Preserve chart data, lines, nulls, and Brush events
// as observable contracts while exercising the real accessible UI and tables.
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  LineChart: ({ children, data }: { children: ReactNode; data: unknown }) => (
    <div data-testid="plot" data-points={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({
    name,
    stroke,
    strokeDasharray,
    connectNulls,
    dataKey,
  }: {
    name: string;
    stroke: string;
    strokeDasharray: string;
    connectNulls: boolean;
    dataKey: string;
  }) => (
    <span
      data-testid="plot-line"
      data-name={name}
      data-stroke={stroke}
      data-dash={strokeDasharray}
      data-connect-nulls={String(connectNulls)}
      data-key={dataKey}
    />
  ),
  Brush: ({
    onChange,
    startIndex,
    endIndex,
  }: {
    onChange: (range: { startIndex: number; endIndex: number }) => void;
    startIndex: number;
    endIndex: number;
  }) => (
    <button
      aria-label="Test Brush interval"
      data-start={startIndex}
      data-end={endIndex}
      onClick={() => onChange({ startIndex: 1, endIndex: 2 })}
    >
      Brush
    </button>
  ),
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}));

function metric(
  id: string,
  label: string,
  scope: "crew" | "habitat" = "crew",
): MetricDefinition {
  return {
    id,
    label,
    scope,
    unit: "demo units",
    description: `Synthetic ${label}`,
    aggregation: "mean",
    decimals: 1,
    min: 0,
    max: 10000,
    generator: { baseline: 100, noise: 0, activityOffsets: {} },
  };
}

function fixture(): MissionDataset {
  const config = structuredClone(rawConfig) as MissionConfig;
  config.crew = config.crew.map((crew, index) => ({
    ...crew,
    id: `configured crew ${index}`,
    name: `Test Astronaut ${index + 1}`,
    baselines: { signal_alpha: 100, signal_beta: 200 },
  }));
  config.metrics = [
    metric("signal_alpha", "Alpha reading"),
    metric("signal_beta", "Beta reading"),
    metric("shared_signal", "Shared cabin reading", "habitat"),
  ];
  const rows = [0, 15, 30, 45, 60, 1440, 1455, 1470].flatMap((endMinute) =>
    config.crew.flatMap((crew, index) =>
      index === 1 && endMinute === 30
        ? []
        : [
            {
              endMinute,
              crewId: crew.id,
              activityId: "science",
              activityMinutes: { science: 15 },
              values: {
                signal_alpha:
                  index === 0 && endMinute === 45
                    ? null
                    : 100 + endMinute / 15 + index,
                signal_beta: 200 + endMinute / 15 + index,
                shared_signal: 700 + endMinute / 15,
              },
            },
          ],
    ),
  );
  return { config, rows, overrides: [], fingerprint: "dashboard-test-fixture" };
}

function points(): Array<Record<string, number | null>> {
  return JSON.parse(
    screen.getByTestId("plot").getAttribute("data-points") ?? "[]",
  );
}
function lineNames(): string[] {
  return screen
    .queryAllByTestId("plot-line")
    .map((line) => line.getAttribute("data-name") ?? "");
}
async function exactTable(): Promise<HTMLElement> {
  const summary = screen.getByText(/^Exact readings/);
  if (!summary.closest("details")?.open) fireEvent.click(summary);
  return waitFor(() =>
    screen.getByRole("table", {
      name: /Stored values without display rounding/,
    }),
  );
}
beforeEach(() => {
  vi.mocked(assessMission).mockClear();
});
afterEach(cleanup);

describe("mission dashboard configuration and interaction", () => {
  it("compares all configured crew with stable line colors and dashes through hide, show, and isolate", () => {
    const dataset = fixture();
    render(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={60}
        inspectedDay={0}
      />,
    );
    expect(lineNames()).toEqual(dataset.config.crew.map((crew) => crew.name));
    const identity = screen
      .getAllByTestId("plot-line")
      .map((line) => [
        line.getAttribute("data-stroke"),
        line.getAttribute("data-dash"),
      ]);
    fireEvent.click(screen.getByRole("button", { name: "Hide all" }));
    expect(lineNames()).toEqual([]);
    expect(screen.getByText("All crew lines are hidden")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Show all" }));
    expect(
      screen
        .getAllByTestId("plot-line")
        .map((line) => [
          line.getAttribute("data-stroke"),
          line.getAttribute("data-dash"),
        ]),
    ).toEqual(identity);
    fireEvent.click(
      screen.getByRole("button", {
        name: `Isolate ${dataset.config.crew[2].name}`,
      }),
    );
    expect(lineNames()).toEqual([dataset.config.crew[2].name]);
    fireEvent.click(
      screen.getByRole("checkbox", { name: dataset.config.crew[0].name }),
    );
    expect(lineNames()).toEqual([
      dataset.config.crew[0].name,
      dataset.config.crew[2].name,
    ]);
  });

  it("initializes crew detail as a single line, supports comparison, and links arbitrary IDs through query parameters", () => {
    const dataset = fixture();
    render(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={60}
        inspectedDay={0}
        crewId={dataset.config.crew[1].id}
      />,
    );
    expect(lineNames()).toEqual([dataset.config.crew[1].name]);
    for (const crew of dataset.config.crew) {
      expect(
        screen
          .getByRole("link", { name: `View ${crew.name} details` })
          .getAttribute("href"),
      ).toBe(`/mission?crew=${encodeURIComponent(crew.id)}`);
    }
    expect(
      screen
        .getByRole("link", { name: /Mission comparison/ })
        .getAttribute("href"),
    ).toBe("/mission");
    fireEvent.click(screen.getByRole("button", { name: "Show all" }));
    expect(lineNames()).toHaveLength(dataset.config.crew.length);
  });

  it("retains a shared Spacecraft series even when every crew line was hidden", async () => {
    const dataset = fixture();
    render(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={60}
        inspectedDay={0}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Hide all" }));
    fireEvent.change(screen.getByLabelText("Compare metric"), {
      target: { value: "shared_signal" },
    });
    expect(lineNames()).toEqual(["Spacecraft · shared habitat"]);
    expect(
      screen
        .getByRole("group", { name: "Crew visibility" })
        .hasAttribute("disabled"),
    ).toBe(true);
    const table = await exactTable();
    expect(within(table).getAllByRole("columnheader")).toHaveLength(3);
    expect(within(table).getByText("704")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Compare metric"), {
      target: { value: "signal_alpha" },
    });
    expect(lineNames()).toEqual([]);
  });

  it("renders newly configured metrics and falls back immediately when the selected metric is removed", async () => {
    const dataset = fixture();
    const { rerender } = render(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={60}
        inspectedDay={0}
      />,
    );
    fireEvent.change(screen.getByLabelText("Compare metric"), {
      target: { value: "signal_beta" },
    });
    const next: MissionDataset = {
      ...dataset,
      config: {
        ...dataset.config,
        metrics: [metric("custom_new_metric", "New observation")],
      },
      rows: dataset.rows.map((row) => ({
        ...row,
        values: { custom_new_metric: 123.456789 },
      })),
    };
    rerender(
      <MissionDashboard dataset={next} elapsedMinute={60} inspectedDay={0} />,
    );
    expect(
      (screen.getByLabelText("Compare metric") as HTMLSelectElement).value,
    ).toBe("custom_new_metric");
    expect(
      screen.getByRole("heading", { name: "New observation" }),
    ).toBeTruthy();
    expect(
      within(await exactTable()).getAllByText("123.456789").length,
    ).toBeGreaterThan(0);
  });

  it("falls back to configured crew if an isolated identity is removed without undoing deliberate Hide all", () => {
    const dataset = fixture();
    const { rerender } = render(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={60}
        inspectedDay={0}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: `Isolate ${dataset.config.crew[0].name}`,
      }),
    );
    const next = {
      ...dataset,
      config: { ...dataset.config, crew: dataset.config.crew.slice(1) },
    };
    rerender(
      <MissionDashboard dataset={next} elapsedMinute={60} inspectedDay={0} />,
    );
    expect(lineNames()).toEqual(next.config.crew.map((crew) => crew.name));
    fireEvent.click(screen.getByRole("button", { name: "Hide all" }));
    rerender(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={60}
        inspectedDay={0}
      />,
    );
    expect(lineNames()).toEqual([]);
  });
});

describe("mission dashboard time, evidence, and missingness", () => {
  it("excludes future points and keeps midnight in the previous day, with zero-based mission day labels", async () => {
    const dataset = fixture();
    const { rerender } = render(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={1440}
        inspectedDay={0}
      />,
    );
    expect(
      points().every(
        (point) => Number(point.minute) > 0 && Number(point.minute) <= 1440,
      ),
    ).toBe(true);
    expect(points().at(-1)?.minute).toBe(1440);
    let table = await exactTable();
    expect(
      within(table).getByRole("columnheader", { name: "Day 0 time" }),
    ).toBeTruthy();
    expect(
      within(table).getByRole("rowheader", { name: "24:00" }),
    ).toBeTruthy();
    rerender(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={1455}
        inspectedDay={1}
      />,
    );
    expect(points().map((point) => point.minute)).toEqual([1455]);
    table = await exactTable();
    expect(
      within(table).getByRole("columnheader", { name: "Day 1 time" }),
    ).toBeTruthy();
    expect(within(table).queryByText("1440")).toBeNull();
    expect(within(table).queryByText("1470")).toBeNull();
    expect(formatMissionMinute(0)).toBe("Day 0 · 00:00");
  });

  it("preserves nulls and absent rows as gaps, and exposes Missing in the exact table", async () => {
    const dataset = fixture();
    render(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={60}
        inspectedDay={0}
      />,
    );
    expect(points().find((point) => point.minute === 30)?.crew_1).toBeNull();
    expect(points().find((point) => point.minute === 45)?.crew_0).toBeNull();
    for (const line of screen.getAllByTestId("plot-line"))
      expect(line.getAttribute("data-connect-nulls")).toBe("false");
    expect(within(await exactTable()).getAllByText("Missing")).toHaveLength(2);
  });

  it("applies Brush and accessible time zoom to the exact table, limits bounds to completed intervals, and resets", async () => {
    render(
      <MissionDashboard
        dataset={fixture()}
        elapsedMinute={60}
        inspectedDay={0}
      />,
    );
    expect(
      Array.from(
        (screen.getByLabelText("Zoom end") as HTMLSelectElement).options,
      ).map((option) => option.text),
    ).toEqual(["00:30", "00:45", "01:00"]);
    fireEvent.click(
      screen.getByRole("button", { name: "Test Brush interval" }),
    );
    let table = await exactTable();
    expect(
      within(table)
        .getAllByRole("rowheader")
        .map((cell) => cell.textContent),
    ).toEqual(["00:30", "00:45"]);
    fireEvent.change(screen.getByLabelText("Zoom end"), {
      target: { value: "3" },
    });
    table = await exactTable();
    expect(
      within(table)
        .getAllByRole("rowheader")
        .map((cell) => cell.textContent),
    ).toEqual(["00:30", "00:45", "01:00"]);
    fireEvent.click(screen.getByRole("button", { name: "Reset zoom" }));
    expect(within(table).getAllByRole("rowheader")).toHaveLength(4);
  });

  it("does not expose a future day or future activity through charts, cards, or accessible schedules", () => {
    const dataset = fixture();
    const { rerender } = render(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={20}
        inspectedDay={0}
      />,
    );
    expect(points().map((point) => point.minute)).toEqual([15]);
    const tracks = screen.getAllByRole("img", {
      name: /elapsed synthetic activities/,
    });
    expect(tracks).toHaveLength(dataset.config.crew.length);
    for (const track of tracks)
      expect(track.getAttribute("aria-label")).toMatch(/to Day 0 · 00:20/);
    rerender(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={20}
        inspectedDay={1}
      />,
    );
    expect(screen.queryByTestId("plot")).toBeNull();
    expect(
      screen.getByText("No completed intervals for this day"),
    ).toBeTruthy();
    expect(screen.getAllByText("No reading this day")).toHaveLength(
      dataset.config.crew.length,
    );
    for (const track of screen.getAllByRole("img", {
      name: /elapsed synthetic activities/,
    }))
      expect(track.getAttribute("aria-label")).toMatch(/No elapsed activities/);
  });

  it("memoizes domain assessments between sample endpoints and when inspecting completed history", () => {
    const dataset = fixture();
    const { rerender } = render(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={60}
        inspectedDay={0}
      />,
    );
    expect(assessMission).toHaveBeenCalledTimes(1);
    rerender(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={61}
        inspectedDay={0}
      />,
    );
    rerender(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={74}
        inspectedDay={0}
      />,
    );
    expect(assessMission).toHaveBeenCalledTimes(1);
    rerender(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={75}
        inspectedDay={0}
      />,
    );
    expect(assessMission).toHaveBeenCalledTimes(2);
    rerender(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={1440}
        inspectedDay={0}
      />,
    );
    rerender(
      <MissionDashboard
        dataset={dataset}
        elapsedMinute={2880}
        inspectedDay={0}
      />,
    );
    expect(assessMission).toHaveBeenCalledTimes(3);
    expect(assessMission).toHaveBeenLastCalledWith(dataset, 1440);
  });

  it("shows unconfigured findings without reassurance and exposes all four real audit stages", () => {
    render(
      <MissionDashboard
        dataset={fixture()}
        elapsedMinute={60}
        inspectedDay={0}
      />,
    );
    expect(screen.getAllByText("No review rule")).toHaveLength(4);
    expect(screen.getAllByText("No assessed rules")).toHaveLength(4);
    expect(
      screen.queryByText(/No notable|No signal|Normal|Healthy/),
    ).toBeNull();
    fireEvent.click(screen.getByText(/^Runtime audit/));
    for (const agent of ["Monitoring", "Risk", "Simulation", "Explanation"])
      expect(screen.getByText(agent, { exact: true })).toBeTruthy();
    for (const link of screen.getAllByRole("link", {
      name: /NASA human-research context|Explore sources & limitations/,
    }))
      expect(link.getAttribute("href")).toBe("/about/science#nasa-human-risks");
  });
});

describe("configured schedule and clock-driven position", () => {
  it("shows actual domain schedules, alternating pairs, the one-day final orbital week, and exact phase durations", () => {
    const { config } = fixture();
    render(<MissionSchedule config={config} />);
    const week = screen.getByLabelText("Orbital week");
    expect((week as HTMLSelectElement).options).toHaveLength(26);
    expect(screen.getByText("EVA rotation · Pair A")).toBeTruthy();
    expect(screen.getAllByRole("article")).toHaveLength(7);
    const dayStart = config.timeline.transitHours * 60;
    const firstSlot = getSchedule(
      config,
      config.crew[0].id,
      dayStart,
      dayStart + 1440,
    )[0];
    const firstActivity = config.activities.find(
      (activity) => activity.id === firstSlot.activityId,
    )?.label;
    expect(
      screen
        .getAllByRole("img", {
          name: new RegExp(`${config.crew[0].name}, orbital day 1,`),
        })[0]
        .getAttribute("aria-label"),
    ).toContain(
      `${firstActivity}, ${formatMissionMinute(firstSlot.startMinute)} to ${formatMissionMinute(firstSlot.endMinute)}`,
    );
    fireEvent.change(week, { target: { value: "2" } });
    expect(screen.getByText("EVA rotation · Pair B")).toBeTruthy();
    fireEvent.change(week, { target: { value: "26" } });
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "Orbital day 176" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByText("Exact phase boundaries and durations"));
    const phaseTable = screen.getByRole("table");
    const phaseRows = within(phaseTable).getAllByRole("row").slice(1);
    expect(
      phaseRows.map((row) =>
        within(row)
          .getAllByRole("cell")
          .map((cell) => cell.textContent),
      ),
    ).toEqual([
      ["0", "2160", "2160", "36"],
      ["2160", "255600", "253440", "4224"],
      ["255600", "259200", "3600", "60"],
    ]);
  });

  it("updates position and phase solely from the supplied mission clock, with an accessible static SVG", () => {
    const { config } = fixture();
    const timer = vi.spyOn(globalThis, "setInterval");
    const { rerender } = render(<MissionPosition config={config} minute={0} />);
    expect(
      screen.getByRole("img", {
        name: /Outbound transit · elapsed 0d 00h 00m/,
      }),
    ).toBeTruthy();
    rerender(<MissionPosition config={config} minute={2160} />);
    expect(
      screen.getByRole("img", {
        name: /Orbital operations · elapsed 1d 12h 00m/,
      }),
    ).toBeTruthy();
    rerender(<MissionPosition config={config} minute={255600} />);
    expect(screen.getByRole("img", { name: /Return transit/ })).toBeTruthy();
    rerender(<MissionPosition config={config} minute={259200} />);
    expect(
      screen.getByRole("img", {
        name: /Mission complete · elapsed 180d 00h 00m/,
      }),
    ).toBeTruthy();
    expect(timer).not.toHaveBeenCalled();
    timer.mockRestore();
  });
});
