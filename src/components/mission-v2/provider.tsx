"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  advanceClock,
  fingerprint,
  generateTelemetry,
  initialClock,
  parseOverrides,
  sanitizeClock,
  validateConfig,
} from "@/lib/mission";
import type { ClockState, MissionDataset } from "@/lib/mission/types";

const CUSTOM_KEY = "astra.mission.custom.v2";
const CLOCK_KEY = "astra.mission.clock.v2";
const EMPTY_CLOCK: ClockState = initialClock(15);
export type SourceInput = { configText: string; csv: string };
interface MissionContextValue {
  dataset: MissionDataset | null;
  clock: ClockState;
  source: string;
  loading: boolean;
  error: string | null;
  notice: string | null;
  csv: string;
  start: () => void;
  pause: () => void;
  reset: () => void;
  stepDay: () => void;
  setSpeed: (speed: number) => void;
  apply: (input: SourceInput) => Promise<boolean>;
  reload: () => Promise<void>;
}
const MissionContext = createContext<MissionContextValue | null>(null);
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
function buildDataset(input: SourceInput): MissionDataset {
  let raw: unknown;
  try {
    raw = JSON.parse(input.configText);
  } catch {
    throw new Error(
      "Configuration must be valid JSON. Your active mission has not changed.",
    );
  }
  const checked = validateConfig(raw);
  if (!checked.value) throw new Error(checked.errors.join("\n"));
  const parsed = parseOverrides(input.csv, checked.value);
  if (!parsed.value) throw new Error(parsed.errors.join("\n"));
  return {
    config: checked.value,
    overrides: parsed.value,
    rows: generateTelemetry(checked.value, parsed.value),
    fingerprint: fingerprint(checked.value, parsed.value),
  };
}
export function MissionProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<MissionDataset | null>(null);
  const [clock, setClock] = useState<ClockState>(EMPTY_CLOCK);
  const [source, setSource] = useState("Local source files");
  const [csv, setCsv] = useState("end_minute,crew_id,metric_id,value\n");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const generation = useRef(0);
  const install = useCallback(
    (input: SourceInput, sourceName: string, restore: boolean) => {
      const next = buildDataset(input);
      let nextClock = { ...EMPTY_CLOCK };
      if (restore) {
        try {
          const saved = JSON.parse(readStorage(CLOCK_KEY) ?? "null");
          if (
            saved?.fingerprint === next.fingerprint &&
            Number.isFinite(saved.elapsedMinute)
          ) {
            const end = next.config.timeline.durationDays * 1440;
            nextClock = sanitizeClock(
              {
                ...saved,
                speed: [15, 60, 360, 1440].includes(saved.speed)
                  ? saved.speed
                  : 15,
              },
              end,
            );
          }
        } catch {
          /* A damaged session never invalidates the data source. */
        }
      }
      setDataset(next);
      setCsv(input.csv);
      setSource(sourceName);
      setClock(nextClock);
      setError(null);
      return next;
    },
    [],
  );
  const load = useCallback(
    async (restore: boolean) => {
      const token = ++generation.current;
      setLoading(true);
      setError(null);
      try {
        const custom = restore ? readStorage(CUSTOM_KEY) : null;
        let input: SourceInput;
        if (custom) input = JSON.parse(custom) as SourceInput;
        else {
          const responses = await Promise.all([
            fetch("/mission-data/config.json", { cache: "no-store" }),
            fetch("/mission-data/overrides.csv", { cache: "no-store" }),
          ]);
          if (responses.some((response) => !response.ok))
            throw new Error(
              "Could not load local mission data. Check the local server and retry.",
            );
          const [configText, csv] = await Promise.all(
            responses.map((response) => response.text()),
          );
          input = { configText, csv };
        }
        if (token !== generation.current) return;
        install(
          input,
          custom ? "Browser customization" : "Local source files",
          restore,
        );
        if (!restore) {
          try {
            localStorage.removeItem(CUSTOM_KEY);
          } catch {}
          setNotice(
            "Source files reloaded. The new mission is ready at day 0.",
          );
        }
      } catch (err) {
        if (token === generation.current)
          setError(
            err instanceof Error ? err.message : "Could not load mission data.",
          );
      } finally {
        if (token === generation.current) setLoading(false);
      }
    },
    [install],
  );
  useEffect(() => {
    let disposed = false;
    const pending = generation;
    void Promise.resolve().then(() => {
      if (!disposed) return load(true);
    });
    return () => {
      disposed = true;
      pending.current++;
    };
  }, [load]);
  useEffect(() => {
    if (!dataset) return;
    if (
      !writeStorage(
        CLOCK_KEY,
        JSON.stringify({ ...clock, fingerprint: dataset.fingerprint }),
      )
    ) {
      const timer = setTimeout(
        () =>
          setNotice(
            "Browser storage is unavailable. This session works, but will not survive a reload.",
          ),
        0,
      );
      return () => clearTimeout(timer);
    }
  }, [clock, dataset]);
  useEffect(() => {
    if (clock.status !== "running" || !dataset || loading) return;
    // Each tick advances simulated minutes. Hidden tabs pause, never catch up silently.
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setClock((previous) => {
        const end = dataset.config.timeline.durationDays * 1440;
        return advanceClock(previous, previous.speed, end);
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [clock.status, dataset, loading]);
  const apply = useCallback(
    async (input: SourceInput) => {
      const token = ++generation.current;
      setLoading(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 0));
      try {
        if (token !== generation.current) return false;
        install(input, "Browser customization", false);
        const stored = writeStorage(CUSTOM_KEY, JSON.stringify(input));
        setNotice(
          stored
            ? "Changes applied. Telemetry regenerated; mission reset to day 0. Export files to save them in the project."
            : "Changes applied for this session. Export files to keep them; browser storage is unavailable.",
        );
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid mission input.");
        return false;
      } finally {
        if (token === generation.current) setLoading(false);
      }
    },
    [install],
  );
  const end = dataset ? dataset.config.timeline.durationDays * 1440 : 0;
  const value: MissionContextValue = {
    dataset,
    clock,
    source,
    loading,
    error,
    notice,
    csv,
    apply,
    reload: () => load(false),
    start: () =>
      setClock((previous) =>
        previous.elapsedMinute >= end
          ? previous
          : { ...previous, status: "running" },
      ),
    pause: () =>
      setClock((previous) =>
        previous.status === "running"
          ? { ...previous, status: "paused" }
          : previous,
      ),
    reset: () =>
      setClock((previous) => ({ ...EMPTY_CLOCK, speed: previous.speed })),
    stepDay: () =>
      setClock((previous) => {
        const elapsedMinute = Math.min(
          end,
          (Math.floor(previous.elapsedMinute / 1440) + 1) * 1440,
        );
        return {
          ...previous,
          elapsedMinute,
          status: elapsedMinute >= end ? "completed" : "paused",
        };
      }),
    setSpeed: (speed) => {
      if ([15, 60, 360, 1440].includes(speed))
        setClock((previous) => ({ ...previous, speed }));
    },
  };
  return (
    <MissionContext.Provider value={value}>{children}</MissionContext.Provider>
  );
}
export function useMission() {
  const value = useContext(MissionContext);
  if (!value) throw new Error("MissionProvider is required");
  return value;
}
