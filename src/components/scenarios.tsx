"use client";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { CREW_IDS, type CrewId, type DailyObservation } from "@/lib/types";
import { clampMissionDay } from "@/lib/metrics";
import { getMissionView } from "@/lib/agents/orchestrator";
import profiles from "../../data/synthetic/crew_profiles.json";
import evidence from "../../data/nasa/curated_evidence.json";
import { AgentTracePanel, MissionTabs } from "./mission-shared";
import { PlanChart } from "./charts";
import { Disclaimer } from "./shell";
export default function Scenarios({ rows }: { rows: DailyObservation[] }) {
  const search = useSearchParams();
  const router = useRouter();
  const requested = search.get("crew");
  const crew = CREW_IDS.includes(requested as CrewId)
    ? (requested as CrewId)
    : "maya-torres";
  const day = clampMissionDay(Number(search.get("day") ?? 149));
  const [sleep, setSleep] = useState(8);
  const [exercise, setExercise] = useState(15);
  const [mode, setMode] = useState<"sleep" | "exercise">("sleep");
  const view = useMemo(
    () =>
      getMissionView(
        rows,
        crew,
        day,
        { targetSleepHours: sleep, additionalExerciseMinutes: exercise },
        evidence,
      ),
    [rows, crew, day, sleep, exercise],
  );
  const scenario = view.scenario!;
  const fmt = (n: number | null, unit: string) =>
    n === null
      ? "Unknown"
      : `${n >= 0 ? "+" : ""}${n.toFixed(unit === "h" ? 1 : 0)} ${unit}`;
  return (
    <main id="main" className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ASTRA / A TRANSPARENT WHAT-IF</span>
          <h1>Scenario explorer</h1>
          <p>
            Change the plan. See the assumptions. Keep the uncertainty in view.
          </p>
        </div>
        <span className="tag">30-DAY ILLUSTRATIVE OUTLOOK</span>
      </div>
      <MissionTabs active="scenarios" />
      <div className="scenario-layout">
        <aside className="panel">
          <div className="panel-heading">
            <h2>Your assumptions</h2>
          </div>
          <div className="control">
            <label htmlFor="scenario-crew">Fictional crew member</label>
            <select
              id="scenario-crew"
              value={crew}
              onChange={(e) =>
                router.replace(
                  `/mission/scenarios?crew=${e.target.value}&day=${day}`,
                  { scroll: false },
                )
              }
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </select>
          </div>
          <div className="control">
            <label htmlFor="scenario-day">
              Start from mission day <output>{day}</output>
            </label>
            <input
              id="scenario-day"
              type="range"
              min="120"
              max="149"
              value={day}
              onChange={(e) =>
                router.replace(
                  `/mission/scenarios?crew=${crew}&day=${e.target.value}`,
                  { scroll: false },
                )
              }
            />
            <small>
              Baseline plan uses the recent 7-calendar-day window ending on day{" "}
              {day}.
            </small>
          </div>
          <div className="control">
            <label htmlFor="sleep-plan">
              Target sleep opportunity{" "}
              <output htmlFor="sleep-plan">{sleep.toFixed(1)} h / night</output>
            </label>
            <input
              id="sleep-plan"
              type="range"
              min="5"
              max="9"
              step=".5"
              value={sleep}
              onChange={(e) => setSleep(Number(e.target.value))}
            />
            <div className="axis-labels">
              <span>5 H</span>
              <span>9 H</span>
            </div>
            <small>
              A hypothetical schedule, not a prediction of actual sleep.
            </small>
          </div>
          <div className="control">
            <label htmlFor="exercise-plan">
              Additional planned exercise{" "}
              <output htmlFor="exercise-plan">+{exercise} min / day</output>
            </label>
            <input
              id="exercise-plan"
              type="range"
              min="0"
              max="30"
              step="5"
              value={exercise}
              onChange={(e) => setExercise(Number(e.target.value))}
            />
            <div className="axis-labels">
              <span>0 MIN</span>
              <span>30 MIN</span>
            </div>
          </div>
          <button
            className="button secondary"
            onClick={() => {
              setSleep(8);
              setExercise(15);
              setMode("sleep");
            }}
          >
            <RotateCcw size={14} /> Reset assumptions
          </button>
          <p style={{ fontSize: 11, marginTop: 18 }}>
            Default illustration: 8 h and +15 min. These values are interface
            defaults, not recommendations.
          </p>
          <Link className="text-link" href={`/mission/crew/${crew}?day=${day}`}>
            <ArrowLeft size={14} /> Back to crew profile
          </Link>
        </aside>
        <section>
          <div className="result-grid" aria-live="polite">
            <div className="result-card">
              <span className="eyebrow">PLANNED SLEEP OPPORTUNITY</span>
              <strong>{fmt(scenario.sleepOpportunityDeltaHours, "h")}</strong>
              <p>Difference across 30 days</p>
            </div>
            <div className="result-card">
              <span className="eyebrow">PLANNED EXERCISE</span>
              <strong>
                {fmt(scenario.additionalPlannedExerciseMinutes, "min")}
              </strong>
              <p>Difference across 30 days</p>
            </div>
          </div>
          <div className="panel">
            <div className="panel-heading">
              <h2>Two plans, one comparison</h2>
              <span className="tag">ASSUMED SCHEDULES</span>
            </div>
            <div className="metric-tabs">
              <button
                aria-pressed={mode === "sleep"}
                onClick={() => setMode("sleep")}
              >
                Sleep opportunity (h/night)
              </button>
              <button
                aria-pressed={mode === "exercise"}
                onClick={() => setMode("exercise")}
              >
                Exercise (min/day)
              </button>
            </div>
            {scenario.status === "insufficient_data" ? (
              <p role="status">
                Insufficient recent data. At least three readings per metric are
                required. Move to a later mission day.
              </p>
            ) : (
              <PlanChart scenario={scenario} mode={mode} />
            )}
            <div className="chart-note">
              <span className="live-dot" /> Assumed scenario{" "}
              <span className="dashed" /> Recent synthetic mean held constant ·
              Planning days 1–30
            </div>
            <div className="table-scroll">
              <table className="data-table">
                <caption>
                  Constant daily schedules · synthetic baseline and hypothetical
                  plan
                </caption>
                <thead>
                  <tr>
                    <th>Daily plan</th>
                    <th>Recent baseline</th>
                    <th>Scenario</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Sleep opportunity</td>
                    <td>
                      {scenario.recentSleepMean?.toFixed(2) ?? "Unknown"} h
                    </td>
                    <td>
                      {scenario.scenarioSleepPlan[0]?.toFixed(2) ?? "Unknown"} h
                    </td>
                  </tr>
                  <tr>
                    <td>Exercise</td>
                    <td>
                      {scenario.recentExerciseMean?.toFixed(2) ?? "Unknown"} min
                    </td>
                    <td>
                      {scenario.scenarioExercisePlan[0]?.toFixed(2) ??
                        "Unknown"}{" "}
                      min
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="assumptions">
            <h3>Scenario assumptions ≠ proven health outcomes</h3>
            <p>{scenario.disclaimer}</p>
            <ul>
              {scenario.assumptions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p>
              Actual adherence, health outcomes and benefit are unknown. No
              physiological response is modeled.
            </p>
          </div>
        </section>
      </div>
      <AgentTracePanel trace={view.trace} />
      <Disclaimer />
    </main>
  );
}
