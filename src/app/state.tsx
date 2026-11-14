// AI-assisted: written with Claude Code, reviewed by the team.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { applyOverrides, buildTwin, createDataset, loadOverrides, overrideKey, rules, saveOverrides } from '../domain';
import type { Dataset, Overrides, Scenario, Twin, WhatIfInput } from '../domain';

interface Mission {
  dataset: Dataset;
  crewId: string;
  setCrewId: (id: string) => void;
  day: number;
  minDay: number;
  setDay: (day: number) => void;
  twin: Twin;
  scenario: Scenario;
  setWhatIf: (input: WhatIfInput, value: number | undefined) => void;
  resetScenario: () => void;
  focusSystem: string | null;
  setFocusSystem: (id: string | null) => void;
  overrides: Overrides;
  setReading: (indicatorId: string, value: number | null) => void;
  resetReadings: () => void;
}

const MissionContext = createContext<Mission | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const base = useMemo(createDataset, []);
  const [overrides, setOverrides] = useState<Overrides>(() => loadOverrides());
  const dataset = useMemo(() => applyOverrides(base, overrides), [base, overrides]);
  // Open on a frame that has something to explain: the last day, the crew member with an alert.
  const [crewId, setCrewId] = useState('c');
  const [day, setDay] = useState(base.lastDay);
  const [scenarios, setScenarios] = useState<Record<string, Scenario>>({});
  const [focusSystem, setFocusSystem] = useState<string | null>(null);
  const scenario = useMemo(() => scenarios[crewId] ?? {}, [scenarios, crewId]);
  const twin = useMemo(() => buildTwin(dataset, crewId, day, scenario), [dataset, crewId, day, scenario]);

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

  const value: Mission = {
    dataset, crewId, setCrewId, day, minDay: base.firstDay + rules.baselineDays, setDay, twin, scenario, setWhatIf, resetScenario,
    focusSystem, setFocusSystem, overrides, setReading, resetReadings,
  };
  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMission(): Mission {
  const mission = useContext(MissionContext);
  if (!mission) throw new Error('useMission must be used inside MissionProvider');
  return mission;
}
