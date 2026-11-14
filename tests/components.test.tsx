// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { getTelemetry } from "../src/lib/repository";
import Mission from "../src/components/mission";
import Scenarios from "../src/components/scenarios";
import Home from "../src/app/page";
const navigation = vi.hoisted(() => ({
  query: "day=149",
  pathname: "/mission",
  replace: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigation.query),
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
}));
// Charts are tested through their semantic values; jsdom has no SVG layout engine.
vi.mock("../src/components/charts", () => ({
  TelemetryChart: () => <div>Telemetry chart renderer</div>,
  PlanChart: () => <div>Plan chart renderer</div>,
}));
const rows = getTelemetry();
beforeEach(() => {
  navigation.query = "day=149";
  navigation.pathname = "/mission";
  navigation.replace.mockClear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
describe("product interactions", () => {
  it("T13 landing CTAs target the implemented mission", () => {
    render(<Home />);
    const ctas = screen.getAllByRole("link", { name: /Launch Mission/ });
    expect(ctas.length).toBeGreaterThan(0);
    for (const cta of ctas) expect(cta.getAttribute("href")).toBe("/mission");
  });
  it("T14 shows four linked crew and computed Maya values with exact evidence", () => {
    render(<Mission rows={rows} crewId="maya-torres" />);
    expect(
      screen
        .getAllByRole("link")
        .filter((link) =>
          link.getAttribute("href")?.startsWith("/mission/crew/"),
        ),
    ).toHaveLength(4);
    expect(screen.getByText("5.9")).toBeTruthy();
    expect(screen.getByText("40.0")).toBeTruthy();
    expect(
      screen.getByText("3 persistent health signals · high quality"),
    ).toBeTruthy();
    fireEvent.click(screen.getByText("Why this finding?"));
    expect(
      screen.getByText("SLEEP_BASELINE_MINUS_1H", { exact: true }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: /NASA evidence: Risk of Performance/ })
        .getAttribute("href"),
    ).toBe("/about/science#nasa-sleep");
  });
  it("review and acknowledgement are resettable session state", () => {
    render(<Mission rows={rows} crewId="maya-torres" />);
    fireEvent.click(screen.getByRole("button", { name: "Acknowledge" }));
    expect(screen.getByRole("status").textContent).toMatch(/Acknowledged/);
    fireEvent.click(
      screen.getByRole("button", { name: "Review with medical officer" }),
    );
    expect(screen.getByRole("status").textContent).toMatch(
      /No notification sent/,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Reset review actions" }),
    );
    expect(screen.queryByRole("status")).toBeNull();
  });
  it("metric selector updates pressed state and accessible exact readings", () => {
    render(<Mission rows={rows} crewId="maya-torres" />);
    fireEvent.click(screen.getByRole("button", { name: "Cabin CO2" }));
    expect(
      screen
        .getByRole("button", { name: "Cabin CO2" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Sleep" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    expect(screen.getByText(/Synthetic Cabin CO2 \(ppm\)/)).toBeTruthy();
  });
  it("timeline updates URL, clamps query, plays and resets", () => {
    vi.useFakeTimers();
    navigation.query = "day=999";
    const { rerender } = render(<Mission rows={rows} crewId="maya-torres" />);
    expect(
      (screen.getByLabelText("Mission day") as HTMLInputElement).value,
    ).toBe("149");
    fireEvent.change(screen.getByLabelText("Mission day"), {
      target: { value: "142" },
    });
    expect(navigation.replace).toHaveBeenLastCalledWith("/mission?day=142", {
      scroll: false,
    });
    navigation.query = "day=142";
    rerender(<Mission rows={rows} crewId="maya-torres" />);
    fireEvent.click(screen.getByRole("button", { name: "Play timeline" }));
    act(() => vi.advanceTimersByTime(1000));
    expect(navigation.replace).toHaveBeenLastCalledWith("/mission?day=143", {
      scroll: false,
    });
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Reset timeline to day 149" }),
    );
    expect(navigation.replace).toHaveBeenLastCalledWith("/mission?day=149", {
      scroll: false,
    });
  });
  it("trace exposes the four runtime stages and early replay admits missing baseline", () => {
    navigation.query = "day=120";
    render(<Mission rows={rows} crewId="maya-torres" />);
    expect(
      screen.getByText("Insufficient data for a complete assessment"),
    ).toBeTruthy();
    fireEvent.click(screen.getByText(/How this insight was produced/));
    for (const name of ["monitoring", "risk", "simulation", "explanation"])
      expect(screen.getByRole("heading", { name })).toBeTruthy();
  });
  it("T15 scenario sliders update plan totals and reset exactly", () => {
    navigation.query = "crew=maya-torres&day=149";
    render(<Scenarios rows={rows} />);
    expect(screen.getByText("+450 min")).toBeTruthy();
    expect(screen.getByText("+61.0 h")).toBeTruthy();
    fireEvent.change(
      screen.getByLabelText("Target sleep opportunity", { selector: "input" }),
      { target: { value: "9" } },
    );
    expect(screen.getByText("+91.0 h")).toBeTruthy();
    fireEvent.change(
      screen.getByLabelText("Additional planned exercise", {
        selector: "input",
      }),
      { target: { value: "30" } },
    );
    expect(screen.getByText("+900 min")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Exercise (min/day)" }));
    expect(
      screen
        .getByRole("button", { name: "Exercise (min/day)" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Reset assumptions" }));
    expect(screen.getByText("+450 min")).toBeTruthy();
    expect(screen.getByText("+61.0 h")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Sleep opportunity (h/night)" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });
  it("scenario crew selection preserves day and unavailable samples stay unknown", () => {
    navigation.query = "crew=invalid&day=120";
    render(<Scenarios rows={rows} />);
    expect(
      (screen.getByLabelText("Fictional crew member") as HTMLSelectElement)
        .value,
    ).toBe("maya-torres");
    fireEvent.change(screen.getByLabelText("Fictional crew member"), {
      target: { value: "eli-chen" },
    });
    expect(navigation.replace).toHaveBeenCalledWith(
      "/mission/scenarios?crew=eli-chen&day=120",
      { scroll: false },
    );
    expect(screen.getByText(/Insufficient recent data/)).toBeTruthy();
    expect(screen.getAllByText("Unknown").length).toBeGreaterThanOrEqual(2);
  });
});
