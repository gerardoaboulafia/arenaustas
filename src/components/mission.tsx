"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Play,
  Pause,
  RotateCcw,
  Activity,
  FileSearch,
} from "lucide-react";
import type { CrewId, DailyObservation, MetricKey } from "@/lib/types";
import { METRIC_KEYS } from "@/lib/types";
import { clampMissionDay, METRICS } from "@/lib/metrics";
import { getMissionView } from "@/lib/agents/orchestrator";
import profiles from "../../data/synthetic/crew_profiles.json";
import evidence from "../../data/nasa/curated_evidence.json";
import { Disclaimer } from "./shell";
import { AgentTracePanel, MissionTabs, StateBadge } from "./mission-shared";
import { TelemetryChart } from "./charts";
const number = (v: number | null, d = 2) => (v === null ? "—" : v.toFixed(d));

export default function Mission({
  rows,
  crewId,
  detail = false,
}: {
  rows: DailyObservation[];
  crewId: CrewId;
  detail?: boolean;
}) {
  const query = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const day = clampMissionDay(Number(query.get("day") ?? 149));
  const [playing, setPlaying] = useState(false);
  const [metric, setMetric] = useState<MetricKey>("sleepHours");
  const [reviews, setReviews] = useState<Record<string, string>>({});
  const view = useMemo(
    () =>
      getMissionView(
        rows,
        crewId,
        day,
        { targetSleepHours: 8, additionalExerciseMinutes: 15 },
        evidence,
      ),
    [rows, crewId, day],
  );
  const crew = profiles.find((p) => p.id === crewId)!;
  const crewViews = useMemo(
    () => profiles.map((p) => getMissionView(rows, p.id as CrewId, day)),
    [rows, day],
  );
  const changeDay = (next: number) => {
    router.replace(`${pathname}?day=${clampMissionDay(next)}`, {
      scroll: false,
    });
  };
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      if (day >= 149) {
        setPlaying(false);
        return;
      }
      router.replace(`${pathname}?day=${day + 1}`, { scroll: false });
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, day, pathname, router]);
  const mark = (id: string, value: string) =>
    setReviews((old) => ({ ...old, [id]: value }));
  return (
    <main id="main" className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ASTRA / EXPLORATION MISSION 01</span>
          <h1>
            {detail ? `${crew.display_name} / Crew profile` : "Mission control"}
          </h1>
          <p>Your crew. Their trends. The context behind every signal.</p>
        </div>
        <span className="tag">
          <span className="live-dot" /> SIMULATED MISSION · DEMO DATA
        </span>
      </div>
      <MissionTabs active="mission" />
      <div className="crew-grid">
        {profiles.map((p, i) => (
          <Link
            href={`/mission/crew/${p.id}?day=${day}`}
            className={`crew-card ${p.id === crewId ? "selected" : ""}`}
            key={p.id}
            aria-current={p.id === crewId ? "page" : undefined}
          >
            <div className="crew-top">
              <span className="avatar">
                {p.display_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <span className="crew-id">{p.crew_tag} ↗</span>
            </div>
            <h3>{p.display_name}</h3>
            <p>{p.role} · Fictional</p>
            <StateBadge state={crewViews[i].workflowState} />
          </Link>
        ))}
      </div>
      <section className="timeline" aria-label="Synthetic mission timeline">
        <div className="timeline-title">
          <small>MISSION TIMELINE</small>
          <strong>
            Day {day} <small>/ 149</small>
          </strong>
        </div>
        <div className="timeline-slider">
          <label className="sr-only" htmlFor="mission-day">
            Mission day
          </label>
          <input
            id="mission-day"
            type="range"
            min="120"
            max="149"
            value={day}
            onChange={(e) => {
              setPlaying(false);
              changeDay(Number(e.target.value));
            }}
          />
          <div className="axis-labels">
            <span>120 / BASELINE START</span>
            <span>133 / BASELINE END</span>
            <span>149</span>
          </div>
        </div>
        <div className="timeline-controls">
          <button
            className="button secondary small"
            onClick={() => {
              if (!playing && day >= 149) changeDay(120);
              setPlaying(!playing);
            }}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}{" "}
            {playing ? "Pause" : "Play timeline"}
          </button>
          <button
            className="icon-button"
            aria-label="Reset timeline to day 149"
            onClick={() => {
              setPlaying(false);
              changeDay(149);
            }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </section>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>
                {crew.display_name} <span className="crew-id">/ TELEMETRY</span>
              </h2>
              <small>
                3-day means · Days {Math.max(120, day - 2)}–{day} ·{" "}
                {view.monitoring.quality} data quality
              </small>
            </div>
            <Activity size={18} color="#58d8e8" />
          </div>
          <div className="metric-grid">
            {(["sleepHours", "hrvMs", "restingHrBpm"] as MetricKey[]).map(
              (key) => {
                const m = view.monitoring.metrics[key];
                return (
                  <div className="metric-tile" key={key}>
                    <span>{m.label}</span>
                    <div className="metric-value">
                      {number(m.recentMean, 1)}
                      <small>{key === "restingHrBpm" ? "bpm" : m.unit}</small>
                    </div>
                    <p className={m.persistent ? "changed" : ""}>
                      {m.absoluteChange === null
                        ? "Baseline unavailable"
                        : `${m.absoluteChange >= 0 ? "+" : ""}${number(m.absoluteChange, 1)} ${m.unit} vs baseline`}
                    </p>
                    <small>{m.recentSamples}/3 recent readings</small>
                  </div>
                );
              },
            )}
          </div>
          <div className="panel-heading">
            <h3>Signal history</h3>
            <span className="tag">SYNTHETIC · {METRICS[metric].unit}</span>
          </div>
          <div className="metric-tabs" role="group" aria-label="Chart metric">
            {METRIC_KEYS.map((key) => (
              <button
                key={key}
                aria-pressed={key === metric}
                onClick={() => setMetric(key)}
              >
                {METRICS[key].label}
              </button>
            ))}
          </div>
          <TelemetryChart
            rows={view.observations}
            metric={metric}
            baseline={view.monitoring.baselines[metric]}
          />
          <div className="chart-note">
            <span className="live-dot" /> Daily observations{" "}
            <span className="dashed" /> Personal baseline (days 120–133,
            available only)
          </div>
          <details style={{ marginTop: 22 }}>
            <summary className="text-link">
              View exact readings & quality
            </summary>
            <div className="table-scroll">
              <table className="data-table">
                <caption>
                  Synthetic {METRICS[metric].label} ({METRICS[metric].unit}) ·
                  no future observations
                </caption>
                <thead>
                  <tr>
                    <th>Mission day</th>
                    <th>Reading</th>
                    <th>Origin</th>
                  </tr>
                </thead>
                <tbody>
                  {view.observations.map((row) => (
                    <tr key={row.missionDay}>
                      <td>{row.missionDay}</td>
                      <td>{number(row[metric])}</td>
                      <td>Synthetic</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>
        <aside className="panel">
          <div className="panel-heading">
            <h2>Mission findings</h2>
            <FileSearch size={18} color="#58d8e8" />
          </div>
          {view.findings.map((f) => (
            <article className="finding" key={f.id}>
              <StateBadge state={f.state} />
              <h3>{f.title}</h3>
              <p>
                {f.signalCount} persistent health signal
                {f.signalCount === 1 ? "" : "s"} · {f.quality} quality
              </p>
              <details open={detail}>
                <summary>Why this finding?</summary>
                <p>
                  {
                    view.explanations.find((x) => x.findingId === f.id)
                      ?.narrative
                  }
                </p>
                {f.deviations.map((d) => (
                  <div className="comparison" key={d.id}>
                    <strong>
                      {METRICS[d.metric].label} · {d.direction} than baseline
                    </strong>
                    <p>
                      {number(d.recentMean)} {d.unit} recent /{" "}
                      {number(d.baselineMean)} {d.unit} baseline
                    </p>
                    <span className="rule">{d.ruleId}</span>
                    <small>
                      {d.availableDays}/3 readings ·{" "}
                      {d.persistent ? "Persistent" : "Short-term"} · Days{" "}
                      {d.windowStart}–{d.windowEnd}
                    </small>
                  </div>
                ))}
                {f.missingMetrics.length > 0 && (
                  <p>
                    Unavailable:{" "}
                    {f.missingMetrics.map((m) => METRICS[m].label).join(", ")}.
                    Review input quality before interpreting.
                  </p>
                )}
                <small>
                  Rules are calibrated only to this fictional fixture.
                </small>
              </details>
              {f.state !== "normal" && (
                <div className="finding-actions">
                  <button
                    className="button secondary"
                    onClick={() => mark(f.id, "Acknowledged in this session.")}
                  >
                    Acknowledge
                  </button>
                  <button
                    className="button secondary"
                    onClick={() =>
                      mark(
                        f.id,
                        "Marked for medical officer review in this session. No notification sent.",
                      )
                    }
                  >
                    Review with medical officer
                  </button>
                </div>
              )}
              {reviews[f.id] && (
                <p className="status-message" role="status">
                  {reviews[f.id]}
                </p>
              )}
              {f.sourceIds.map((id) => {
                const source = evidence.find((s) => s.source_id === id);
                return source ? (
                  <Link
                    className="evidence-link"
                    href={`/about/science#${id}`}
                    key={id}
                  >
                    NASA evidence: {source.title} ↗
                    <span>{source.used_for}</span>
                  </Link>
                ) : null;
              })}
            </article>
          ))}
          <Link
            className="button"
            href={`/mission/scenarios?crew=${crewId}&day=${day}`}
          >
            Explore scenario <ArrowUpRight size={16} />
          </Link>
          <p style={{ fontSize: 11, marginTop: 15 }}>
            Review actions are session-only demo events.
          </p>
          {Object.keys(reviews).length > 0 && (
            <button
              className="button secondary small"
              onClick={() => setReviews({})}
            >
              Reset review actions
            </button>
          )}
        </aside>
      </div>
      <AgentTracePanel trace={view.trace} />
      <Disclaimer />
    </main>
  );
}
