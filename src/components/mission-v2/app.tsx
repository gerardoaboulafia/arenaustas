"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Pause,
  Play,
  RotateCcw,
  ArrowRight,
  CalendarDays,
  SlidersHorizontal,
  Activity,
} from "lucide-react";
import { useMission } from "./provider";
import { formatMissionTime } from "@/lib/mission";
import MissionDashboard from "./dashboard";
import MissionSchedule from "./schedule";
import MissionPosition from "./animation";
import { Disclaimer } from "../shell";

export default function MissionApp({
  crewId: routeCrewId,
}: {
  crewId?: string;
}) {
  const query = useSearchParams();
  const crewId = routeCrewId ?? query.get("crew") ?? undefined;
  const mission = useMission();
  const { dataset, clock, loading, error, notice } = mission;
  const [tab, setTab] = useState<"telemetry" | "schedule">("telemetry");
  const [history, setHistory] = useState<{
    fingerprint: string;
    day: number;
  } | null>(null);
  if (!dataset)
    return (
      <main id="main" className="page mx-page">
        <span className="eyebrow">ASTRA / MISSION CONTROL</span>
        <h1>Your mission starts here.</h1>
        <p role={error ? "alert" : "status"}>
          {error ??
            "Preparing the editable mission schedule and synthetic telemetry…"}
        </p>
        <button
          className="button"
          onClick={() => void mission.reload()}
          disabled={loading}
        >
          Reload source files
        </button>
      </main>
    );
  const total = dataset.config.timeline.durationDays * 1440;
  const latestDay = Math.min(
    dataset.config.timeline.durationDays - 1,
    Math.floor(clock.elapsedMinute / 1440),
  );
  const following = !history || history.fingerprint !== dataset.fingerprint;
  const inspectedDay = following ? latestDay : Math.min(latestDay, history.day);
  const activeCrew = dataset.config.crew.find((crew) => crew.id === crewId);
  return (
    <main id="main" className="page mx-page" aria-busy={loading}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            ASTRA / {dataset.config.timeline.durationDays}-DAY EXPEDITION
          </span>
          <h1>{activeCrew ? activeCrew.name : "Mission control."}</h1>
          <p>A fictional crew. One shared timeline. Every signal in context.</p>
        </div>
        <Link href="/mission/data" className="button secondary">
          <SlidersHorizontal size={16} /> Data & configuration
        </Link>
      </div>
      <div className="mx-toolbar">
        <span className="tag">SYNTHETIC TELEMETRY</span>
        <span>
          {sourceLabel(mission.source)} · {dataset.config.revision}
        </span>
        <Link href="/mission/scenarios">
          Explore a scenario <ArrowRight size={15} />
        </Link>
      </div>
      {error && (
        <p className="mx-message error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="mx-message" role="status">
          {notice}
        </p>
      )}
      <section className="mx-flight panel" aria-label="Mission playback">
        <div className="mx-flight-main">
          <span className="eyebrow">
            MISSION CLOCK / {clock.status.toUpperCase()}
          </span>
          <div className="mx-clock" aria-label="Current mission time">
            {formatMissionTime(clock.elapsedMinute)}
          </div>
          <progress
            aria-label="Mission progress"
            max={total}
            value={clock.elapsedMinute}
          />
          <div className="mx-controls">
            {clock.status === "running" ? (
              <button className="button" onClick={mission.pause}>
                <Pause size={16} />
                Pause
              </button>
            ) : (
              <button
                className="button"
                disabled={loading || clock.status === "completed"}
                onClick={mission.start}
              >
                <Play size={16} />
                {clock.status === "ready"
                  ? "Start mission"
                  : clock.status === "completed"
                    ? "Mission complete"
                    : "Resume mission"}
              </button>
            )}
            <button
              className="button secondary"
              onClick={mission.stepDay}
              disabled={loading || clock.status === "completed"}
            >
              Advance one day
            </button>
            <button
              className="button secondary"
              onClick={() => {
                mission.reset();
                setHistory(null);
              }}
              disabled={loading}
            >
              <RotateCcw size={15} />
              Reset mission
            </button>
            <label>
              Playback speed
              <select
                aria-label="Playback speed"
                value={clock.speed}
                onChange={(event) =>
                  mission.setSpeed(Number(event.target.value))
                }
              >
                <option value={15}>15 min / second</option>
                <option value={60}>1 hour / second</option>
                <option value={360}>6 hours / second</option>
                <option value={1440}>1 day / second</option>
              </select>
            </label>
          </div>
          <p className="mx-muted">
            Elapsed mission time (UTC reference). Reloading restores a paused
            session. Hidden tabs do not advance.
          </p>
        </div>
        <MissionPosition config={dataset.config} minute={clock.elapsedMinute} />
      </section>
      <nav className="page-tabs" aria-label="Mission views">
        <button
          className={tab === "telemetry" ? "active" : ""}
          onClick={() => setTab("telemetry")}
          aria-pressed={tab === "telemetry"}
        >
          <Activity size={16} /> Crew telemetry
        </button>
        <button
          className={tab === "schedule" ? "active" : ""}
          onClick={() => setTab("schedule")}
          aria-pressed={tab === "schedule"}
        >
          <CalendarDays size={16} /> Mission schedule
        </button>
        <Link href="/mission/scenarios">Scenarios</Link>
        <Link href="/about/science">Science & sources</Link>
      </nav>
      {tab === "schedule" ? (
        <MissionSchedule config={dataset.config} />
      ) : (
        <>
          <section
            className="mx-day-browser panel"
            aria-label="Inspect mission history"
          >
            <div>
              <span className="eyebrow">
                {following ? "FOLLOWING PRESENT" : "HISTORICAL VIEW"}
              </span>
              <h2>Mission day {inspectedDay}</h2>
              <p>
                {following
                  ? "Completed 15-minute intervals from the latest day."
                  : `Reviewing day ${inspectedDay}. The mission clock continues independently.`}
              </p>
            </div>
            <div className="mx-controls">
              <label>
                Review day
                <input
                  aria-label="Review day"
                  type="number"
                  min={0}
                  max={latestDay}
                  value={inspectedDay}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (Number.isFinite(value))
                      setHistory({
                        fingerprint: dataset.fingerprint,
                        day: Math.max(
                          0,
                          Math.min(latestDay, Math.floor(value)),
                        ),
                      });
                  }}
                />
              </label>
              <button
                className="button secondary"
                onClick={() => setHistory(null)}
                disabled={following}
              >
                Follow present
              </button>
            </div>
            <input
              className="mx-day-range"
              type="range"
              aria-label="History timeline"
              min={0}
              max={latestDay || 1}
              value={inspectedDay}
              disabled={latestDay === 0}
              onChange={(event) =>
                setHistory({
                  fingerprint: dataset.fingerprint,
                  day: Number(event.target.value),
                })
              }
            />
          </section>
          {crewId && !activeCrew ? (
            <p role="status">
              This crew member is not in the active configuration. Showing the
              full crew.
            </p>
          ) : null}
          <MissionDashboard
            key={`${dataset.fingerprint}:${crewId ?? "all"}`}
            dataset={dataset}
            elapsedMinute={clock.elapsedMinute}
            inspectedDay={inspectedDay}
            crewId={activeCrew?.id}
          />
        </>
      )}
      <Disclaimer />
    </main>
  );
}
function sourceLabel(source: string) {
  return source === "Browser customization"
    ? "Your browser configuration"
    : "Editable local files";
}
