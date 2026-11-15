// AI-assisted: written with Claude Code, reviewed by the team.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { applyOverrides, buildTwin, createDataset, exportReadings, importReadings, indicators, loadOverrides, overrideKey, rules, saveOverrides } from '../domain';
import type { Dataset, ImportResult, Overrides, Scenario, Twin, WhatIfInput } from '../domain';
import { snap } from './whatIf';

interface Mission {
  dataset: Dataset;
  crewId: string;
  setCrewId: (id: string) => void;
  day: number;
  minDay: number;
  setDay: (day: number) => void;
  twin: Twin;
  /** One twin per crew member on the current day, for the crew selector. */
  crewTwins: Twin[];
  scenario: Scenario;
  setWhatIf: (input: WhatIfInput, value: number | undefined) => void;
  resetScenario: () => void;
  focusSystem: string | null;
  setFocusSystem: (id: string | null) => void;
  overrides: Overrides;
  setReading: (indicatorId: string, value: number | null) => void;
  resetReadings: () => void;
  /** Every crew member's readings up to the current mission day, as CSV. */
  exportCsv: () => string;
  /** Applies a CSV of readings if every row is valid; otherwise changes nothing. */
  importCsv: (text: string) => ImportResult;
}

const MissionContext = createContext<Mission | null>(null);

const LINK_INPUTS: [string, WhatIfInput][] = [['sleep', 'sleepHours'], ['exercise', 'exerciseMin'], ['radiation', 'radiationDose']];

/**
 * Deep links: #/app/projection?crew=c&sleep=8 opens the tool on that crew member, day and what-if.
 * Read once, on load. Anything missing or invalid falls back to the default frame.
 */
function linkedFrame(base: Dataset, minDay: number) {
  const query = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
  const crew = query.get('crew');
  // Default: the last day, the crew member with an alert, so the first frame has something to explain.
  const crewId = base.crew.some((c) => c.id === crew) ? (crew as string) : 'c';
  const dayParam = Number(query.get('day'));
  const day = query.has('day') && Number.isFinite(dayParam)
    ? Math.min(base.lastDay, Math.max(minDay, Math.round(dayParam)))
    : base.lastDay;
  const scenario: Scenario = {};
  for (const [param, input] of LINK_INPUTS) {
    const value = Number(query.get(param));
    if (query.has(param) && Number.isFinite(value)) scenario[input] = snap(input, value);
  }
  const scenarios: Record<string, Scenario> = Object.keys(scenario).length > 0 ? { [crewId]: scenario } : {};
  return { crewId, day, scenarios, system: query.get('system') };
}

export function MissionProvider({ children }: { children: ReactNode }) {
  const base = useMemo(createDataset, []);
  const [overrides, setOverrides] = useState<Overrides>(() => loadOverrides());
  const dataset = useMemo(() => applyOverrides(base, overrides), [base, overrides]);
  const minDay = base.firstDay + rules.baselineDays;
  const linked = useMemo(() => linkedFrame(base, minDay), [base, minDay]);
  const [crewId, setCrewId] = useState(linked.crewId);
  const [day, setDay] = useState(linked.day);
  const [scenarios, setScenarios] = useState<Record<string, Scenario>>(linked.scenarios);
  const [focusSystem, setFocusSystem] = useState<string | null>(linked.system);
  const scenario = useMemo(() => scenarios[crewId] ?? {}, [scenarios, crewId]);
  const crewTwins = useMemo(
    () => dataset.crew.map((c) => buildTwin(dataset, c.id, day, scenarios[c.id] ?? {})),
    [dataset, day, scenarios],
  );
  const twin = crewTwins.find((t) => t.crew.id === crewId) ?? crewTwins[0];

  const setWhatIf = useCallback((input: WhatIfInput, value: number | undefined) => {
    setScenarios((all) => {
      const next = { ...(all[crewId] ?? {}) };
      if (value === undefined) delete next[input];
      else next[input] = value;
      return { ...all, [crewId]: next };
    });
  }, [crewId]);

  const resetScenario = useCallback(() => setScenarios((all) => ({ ...all, [crewId]: {} })), [crewId]);

  const setReading = useCallback((indicatorId: string, value: number | null) => {
    setOverrides((current) => {
      const next = { ...current, [overrideKey(crewId, day, indicatorId)]: value };
      saveOverrides(next);
      return next;
    });
  }, [crewId, day]);

  const resetReadings = useCallback(() => {
    saveOverrides({});
    setOverrides({});
  }, []);

  const exportCsv = useCallback(() => exportReadings(dataset, indicators, day), [dataset, day]);

  const importCsv = useCallback((text: string) => {
    const result = importReadings(text, base, indicators, day, overrides);
    if (result.overrides) {
      saveOverrides(result.overrides);
      setOverrides(result.overrides);
    }
    return result;
  }, [base, day, overrides]);

  const value: Mission = {
    dataset, crewId, setCrewId, day, minDay, setDay, twin, crewTwins, scenario, setWhatIf, resetScenario,
    focusSystem, setFocusSystem, overrides, setReading, resetReadings, exportCsv, importCsv,
  };
  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMission(): Mission {
  const mission = useContext(MissionContext);
  if (!mission) throw new Error('useMission must be used inside MissionProvider');
  return mission;
}
