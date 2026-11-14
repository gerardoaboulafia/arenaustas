"use client";
import { useState } from "react";
import Link from "next/link";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMission } from "./provider";
import { compareMissionPlan } from "@/lib/mission-plan";
import type { MissionDataset } from "@/lib/mission/types";
import { Disclaimer } from "../shell";
export default function MissionScenarios() {
  const mission = useMission();
  return (
    <main id="main" className="page mx-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            ASTRA / 30-DAY ILLUSTRATIVE COMPARISON
          </span>
          <h1>Make the assumption explicit.</h1>
          <p>
            Compare a hypothetical constant value with the recent synthetic
            record.
          </p>
        </div>
        <Link className="button secondary" href="/mission">
          Back to mission
        </Link>
      </div>
      <p className="mx-message">
        This uses completed days from your active mission. A target is an
        assumption, not a prediction of adherence, health or countermeasure
        efficacy.
      </p>
      {mission.error && <p role="alert">{mission.error}</p>}
      {mission.dataset ? (
        <PlanForm
          key={mission.dataset.fingerprint}
          dataset={mission.dataset}
          asOf={mission.clock.elapsedMinute}
        />
      ) : (
        <p role="status">Loading mission data…</p>
      )}
      <Disclaimer />
    </main>
  );
}
function PlanForm({
  dataset,
  asOf,
}: {
  dataset: MissionDataset;
  asOf: number;
}) {
  const [metricId, setMetricId] = useState(dataset.config.metrics[0].id);
  const [crewId, setCrewId] = useState(dataset.config.crew[0].id);
  const metric =
    dataset.config.metrics.find((item) => item.id === metricId) ??
    dataset.config.metrics[0];
  const [targets, setTargets] = useState<Record<string, string>>({});
  const initial = compareMissionPlan(
    dataset,
    crewId,
    metric.id,
    asOf,
    metric.generator.baseline,
  );
  const targetText =
    targets[metric.id] ??
    String(
      Number(
        (initial.baseline ?? metric.generator.baseline).toFixed(
          metric.decimals,
        ),
      ),
    );
  const target = Number(targetText);
  const scale =
    metric.aggregation === "sum"
      ? 1440 / dataset.config.timeline.intervalMinutes
      : 1;
  const validTarget =
    targetText.trim() !== "" &&
    Number.isFinite(target) &&
    target >= metric.min * scale &&
    target <= metric.max * scale;
  const plan = compareMissionPlan(
    dataset,
    crewId,
    metric.id,
    asOf,
    validTarget ? target : (initial.baseline ?? metric.generator.baseline),
  );
  const unit =
    metric.unit + (metric.aggregation === "sum" ? "/day" : " (daily mean)");
  const format = (value: number | null) =>
    value === null ? "Unknown" : value.toFixed(metric.decimals);
  return (
    <section className="panel">
      <div className="mx-scenario-controls">
        <label>
          Indicator
          <select
            value={metric.id}
            onChange={(event) => setMetricId(event.target.value)}
          >
            {dataset.config.metrics.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fictional crew member
          <select
            value={crewId}
            disabled={metric.scope === "habitat"}
            onChange={(event) => setCrewId(event.target.value)}
          >
            {dataset.config.crew.map((crew) => (
              <option key={crew.id} value={crew.id}>
                {crew.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Hypothetical target ({unit})
          <input
            aria-label="Hypothetical target"
            type="number"
            step="any"
            min={metric.min * scale}
            max={metric.max * scale}
            value={targetText}
            onChange={(event) =>
              setTargets((previous) => ({
                ...previous,
                [metric.id]: event.target.value,
              }))
            }
          />
        </label>
      </div>
      {!validTarget && (
        <p role="alert">
          Enter a target between {metric.min * scale} and {metric.max * scale}.
          The chart keeps the baseline assumption until the input is valid.
        </p>
      )}
      <button className="button secondary" onClick={() => setTargets({})}>
        Reset assumptions
      </button>
      <h2>
        {metric.label} ·{" "}
        {metric.scope === "habitat"
          ? "Shared spacecraft"
          : dataset.config.crew.find((crew) => crew.id === crewId)?.name}
      </h2>
      <p>{metric.description}</p>
      <div className="metric-grid">
        <div className="panel">
          <span>Recent baseline</span>
          <h3>
            {format(plan.baseline)} {unit}
          </h3>
          <small>
            {plan.availableDays} usable completed days in the last 7; minimum 3.
          </small>
        </div>
        <div className="panel">
          <span>30-day assumption</span>
          <h3>
            {format(plan.target)} {unit}
          </h3>
          <small>Held constant for illustration.</small>
        </div>
        <div className="panel">
          <span>
            {metric.aggregation === "sum"
              ? "30-day planned difference"
              : "Assumed daily difference"}
          </span>
          <h3>
            {format(
              metric.aggregation === "sum"
                ? plan.totalDelta
                : plan.baseline === null
                  ? null
                  : plan.target - plan.baseline,
            )}{" "}
            {metric.unit}
          </h3>
          <small>No health outcome is inferred.</small>
        </div>
      </div>
      {plan.baseline === null ? (
        <p role="status">
          Insufficient recent data. Advance the mission through at least three
          complete days. Missing values remain unknown.
        </p>
      ) : null}
      <p className="mx-muted">
        Synthetic {metric.label} ({unit}) · Future scenario days, not observed
        telemetry
      </p>
      <div style={{ height: 300, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={plan.points}>
            <CartesianGrid stroke="#203547" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              stroke="#a5baca"
              label={{
                value: "Scenario day",
                position: "insideBottomRight",
                offset: -2,
              }}
            />
            <YAxis stroke="#a5baca" width={64} />
            <Tooltip
              contentStyle={{
                background: "#0c1a2b",
                border: "1px solid #345064",
              }}
              formatter={(value) => [
                typeof value === "number"
                  ? value.toFixed(metric.decimals) + " " + unit
                  : "Unknown",
              ]}
            />
            <Legend />
            <Line
              dataKey="baseline"
              name="Recent baseline held constant"
              stroke="#8c9db3"
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="assumption"
              name="Hypothetical assumption"
              stroke="#58d8e8"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details>
        <summary>Exact scenario values and method</summary>
        <p>
          Only completed mission days are used. Summed indicators require every
          interval to be present; averages require four valid intervals per day.
          At least three usable days are required. No future telemetry enters
          the baseline.
        </p>
        <div className="mx-plan-table">
          <table>
            <caption>Synthetic comparison, {unit}</caption>
            <thead>
              <tr>
                <th>Scenario day</th>
                <th>Baseline</th>
                <th>Assumption</th>
              </tr>
            </thead>
            <tbody>
              {plan.points.map((point) => (
                <tr key={point.day}>
                  <td>{point.day}</td>
                  <td>{format(point.baseline)}</td>
                  <td>{format(point.assumption)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
