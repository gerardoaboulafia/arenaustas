"use client";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyObservation, MetricKey, ScenarioOutput } from "@/lib/types";
import { METRICS } from "@/lib/metrics";
const tooltip = {
  background: "#102238",
  border: "1px solid #315467",
  borderRadius: 4,
  color: "#ebf6fa",
  fontSize: 12,
};
export function TelemetryChart({
  rows,
  metric,
  baseline,
}: {
  rows: DailyObservation[];
  metric: MetricKey;
  baseline: number | null;
}) {
  return (
    <div
      className="chart"
      role="img"
      aria-label={`Synthetic ${METRICS[metric].label} daily readings in ${METRICS[metric].unit}; personal baseline ${baseline?.toFixed(2) ?? "unavailable"}. Exact readings in data table below.`}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart
          data={rows}
          margin={{ top: 15, right: 12, left: -18, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#203448"
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="missionDay"
            type="number"
            domain={[120, 149]}
            ticks={[120, 127, 133, 142, 149]}
            tick={{ fill: "#91aabe", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "#91aabe", fontSize: 10 }}
            tickFormatter={(v) =>
              Number(v).toFixed(metric === "sleepHours" ? 1 : 0)
            }
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltip}
            labelFormatter={(v) => `Mission day ${v} · synthetic`}
            formatter={(v) => [
              `${Number(v).toFixed(2)} ${METRICS[metric].unit}`,
              METRICS[metric].label,
            ]}
          />
          {baseline !== null && (
            <ReferenceLine
              y={baseline}
              stroke="#e6ac55"
              strokeDasharray="5 5"
            />
          )}
          <Line
            type="linear"
            dataKey={metric}
            stroke="#58d8e8"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
export function PlanChart({
  scenario,
  mode,
}: {
  scenario: ScenarioOutput;
  mode: "sleep" | "exercise";
}) {
  const data = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    baseline:
      mode === "sleep"
        ? scenario.baselineSleepPlan[i]
        : scenario.baselineExercisePlan[i],
    scenario:
      mode === "sleep"
        ? scenario.scenarioSleepPlan[i]
        : scenario.scenarioExercisePlan[i],
  }));
  const unit = mode === "sleep" ? "h/night" : "min/day";
  return (
    <div
      className="chart"
      role="img"
      aria-label={`30-day assumed ${mode} schedules in ${unit}. Baseline ${data[0].baseline?.toFixed(2) ?? "unknown"}; scenario ${data[0].scenario?.toFixed(2) ?? "unknown"}, held constant each day.`}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart
          data={data}
          margin={{ top: 15, right: 15, left: -18, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#203448"
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="day"
            ticks={[1, 7, 14, 21, 30]}
            tick={{ fill: "#91aabe", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={mode === "sleep" ? [4, 10] : [0, "auto"]}
            tick={{ fill: "#91aabe", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltip}
            labelFormatter={(v) => `Planning day ${v}`}
            formatter={(v, name) => [`${Number(v).toFixed(2)} ${unit}`, name]}
          />
          <Line
            dataKey="baseline"
            name="Recent mean held constant"
            stroke="#e6ac55"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="scenario"
            name="Assumed schedule"
            stroke="#58d8e8"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
