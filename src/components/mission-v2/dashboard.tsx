"use client";

import Link from "next/link";
import { memo, useId, useMemo, useState, type CSSProperties } from "react";
import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { assessMission, getSchedule } from "@/lib/mission";
import type {
  CrewDefinition,
  MetricDefinition,
  MetricFinding,
  MissionDataset,
  TelemetryRow,
} from "@/lib/mission/types";
import {
  ActivityLegend,
  ActivityTrack,
  formatMissionMinute,
  ScheduleList,
} from "./schedule";

const DAY = 1440;
const COLORS = ["#65dce9", "#b6a4ff", "#f2bd71", "#86dfb6"];
const DASHES = ["", "8 4", "3 4", "10 3 2 3"];
const FINDING_LABELS: Record<MetricFinding["state"], string> = {
  insufficient_data: "Insufficient data",
  within_demo_rule: "Within demo rule",
  review_suggested: "Review suggested",
  unconfigured: "No review rule",
};

type Series = {
  key: string;
  id: string;
  label: string;
  color: string;
  dash: string;
};
type ChartPoint = { minute: number; [key: string]: number | null };
type CrewSelection = {
  route: string | undefined;
  mode: "all" | "none" | "custom";
  ids: string[];
};

function crewColor(crew: CrewDefinition): string {
  let hash = 0;
  for (const character of crew.id)
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return crew.color || COLORS[hash % COLORS.length];
}

function timeOfDay(minute: number, day: number): string {
  const within = Math.min(DAY, Math.max(0, Math.round(minute - day * DAY)));
  return `${String(Math.floor(within / 60)).padStart(2, "0")}:${String(within % 60).padStart(2, "0")}`;
}

function reading(
  value: number | null | undefined,
  metric: MetricDefinition,
): string {
  return value == null || !Number.isFinite(value)
    ? "Missing"
    : value.toFixed(Math.min(10, Math.max(0, metric.decimals)));
}

function exactReading(value: number | null | undefined): string {
  return value == null || !Number.isFinite(value) ? "Missing" : String(value);
}

function LineSwatch({ series }: { series: Series }) {
  return (
    <svg
      className="mx-line-swatch"
      width="30"
      height="12"
      viewBox="0 0 30 12"
      aria-hidden="true"
    >
      <line
        x1="0"
        y1="6"
        x2="30"
        y2="6"
        stroke={series.color}
        strokeWidth="2.5"
        strokeDasharray={series.dash}
      />
    </svg>
  );
}

const TelemetryComparison = memo(function TelemetryComparison({
  points,
  series,
  metric,
  day,
}: {
  points: ChartPoint[];
  series: Series[];
  metric: MetricDefinition;
  day: number;
}) {
  const id = useId();
  const [zoom, setZoom] = useState<{
    startIndex: number;
    endIndex: number;
  } | null>(null);
  const [tableOpen, setTableOpen] = useState(false);
  const last = Math.max(0, points.length - 1);
  const startIndex = Math.min(zoom?.startIndex ?? 0, Math.max(0, last - 1));
  const endIndex = Math.max(
    Math.min(startIndex + 1, last),
    Math.min(zoom?.endIndex ?? last, last),
  );
  const displayed = points.slice(startIndex, endIndex + 1);
  const hasValues = displayed.some((point) =>
    series.some((item) => point[item.key] != null),
  );

  return (
    <>
      <div className="mx-chart-meta">
        <p id={`${id}-description`}>
          Synthetic telemetry · <strong>{metric.unit || "unitless"}</strong> ·
          Day {day} · interval-end time
        </p>
        <button
          type="button"
          className="mx-button mx-button-quiet"
          disabled={!zoom}
          onClick={() => setZoom(null)}
        >
          Reset zoom
        </button>
      </div>
      <ul className="mx-chart-legend" aria-label="Chart series">
        {series.map((item) => (
          <li key={item.id}>
            <LineSwatch series={item} />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      {!series.length ? (
        <div className="mx-chart-empty">
          <strong>All crew lines are hidden</strong>
          <p>Show a crew member or choose Show all to compare readings.</p>
        </div>
      ) : !points.length ? (
        <div className="mx-chart-empty">
          <strong>No completed intervals for this day</strong>
          <p>
            Advance the mission clock to reveal synthetic readings. Future data
            stays hidden.
          </p>
        </div>
      ) : (
        <>
          <div className="mx-chart" aria-describedby={`${id}-description`}>
            <ResponsiveContainer width="100%" height={320} minWidth={0}>
              <LineChart
                data={points}
                margin={{ top: 16, right: 20, bottom: 12, left: 0 }}
                accessibilityLayer
              >
                <CartesianGrid
                  stroke="#22384d"
                  strokeDasharray="3 6"
                  vertical={false}
                />
                <XAxis
                  dataKey="minute"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(value: number) => timeOfDay(value, day)}
                  minTickGap={30}
                  tick={{ fill: "#a8bfd2", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#294259" }}
                />
                <YAxis
                  width={64}
                  domain={["auto", "auto"]}
                  tick={{ fill: "#a8bfd2", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) =>
                    new Intl.NumberFormat("en", {
                      maximumFractionDigits: Math.min(
                        5,
                        Math.max(0, metric.decimals),
                      ),
                      notation:
                        Math.abs(value) >= 10000 ? "compact" : "standard",
                    }).format(value)
                  }
                />
                <Tooltip
                  isAnimationActive={false}
                  filterNull={false}
                  cursor={{ stroke: "#7db5c8", strokeDasharray: "4 4" }}
                  content={({ active, label }) => {
                    if (!active || label == null) return null;
                    const point = points.find(
                      (item) => item.minute === Number(label),
                    );
                    if (!point) return null;
                    return (
                      <div className="mx-chart-tooltip">
                        <strong>
                          Day {day} · {timeOfDay(point.minute, day)}
                        </strong>
                        <span className="mx-muted">
                          Synthetic · {metric.label}
                        </span>
                        {series.map((item) => (
                          <div key={item.id}>
                            <LineSwatch series={item} />
                            <span>{item.label}</span>
                            <b>
                              {reading(point[item.key], metric)}{" "}
                              {point[item.key] == null ? "" : metric.unit}
                            </b>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                {series.map((item) => (
                  <Line
                    key={item.id}
                    dataKey={item.key}
                    name={item.label}
                    type="linear"
                    stroke={item.color}
                    strokeWidth={2.2}
                    strokeDasharray={item.dash}
                    dot={points.length <= 1 ? { r: 4 } : false}
                    activeDot={{ r: 4, stroke: "#091726", strokeWidth: 2 }}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                ))}
                {points.length > 1 && (
                  <Brush
                    dataKey="minute"
                    height={28}
                    travellerWidth={12}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    stroke="#487389"
                    fill="#0d2033"
                    tickFormatter={(value: number) => timeOfDay(value, day)}
                    ariaLabel="Zoom the completed telemetry interval"
                    onChange={(range) => {
                      if (range.startIndex != null && range.endIndex != null)
                        setZoom({
                          startIndex: range.startIndex,
                          endIndex: range.endIndex,
                        });
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {!hasValues && (
            <p className="mx-inline-notice">
              No available readings in this interval. Missing samples are gaps,
              never zero.
            </p>
          )}
          {points.length > 1 && (
            <div className="mx-zoom-controls">
              <label htmlFor={`${id}-start`}>
                Zoom start
                <select
                  id={`${id}-start`}
                  value={startIndex}
                  onChange={(event) =>
                    setZoom({
                      startIndex: Number(event.target.value),
                      endIndex,
                    })
                  }
                >
                  {points.slice(0, endIndex).map((point, index) => (
                    <option value={index} key={point.minute}>
                      {timeOfDay(point.minute, day)}
                    </option>
                  ))}
                </select>
              </label>
              <span aria-hidden="true">→</span>
              <label htmlFor={`${id}-end`}>
                Zoom end
                <select
                  id={`${id}-end`}
                  value={endIndex}
                  onChange={(event) =>
                    setZoom({
                      startIndex,
                      endIndex: Number(event.target.value),
                    })
                  }
                >
                  {points.map((point, index) =>
                    index > startIndex ? (
                      <option value={index} key={point.minute}>
                        {timeOfDay(point.minute, day)}
                      </option>
                    ) : null,
                  )}
                </select>
              </label>
              <p>Drag the handles, or use these time controls.</p>
            </div>
          )}
        </>
      )}
      <p className="mx-chart-footnote">
        Gaps indicate missing readings. 24:00 closes this day and belongs to the
        preceding interval. Values are fictional; they are not NASA
        measurements.
      </p>
      <details
        className="mx-details"
        open={tableOpen}
        onToggle={(event) => setTableOpen(event.currentTarget.open)}
      >
        <summary>
          Exact readings{" "}
          <span className="mx-muted">
            · {displayed.length} interval endpoints in view
          </span>
        </summary>
        {tableOpen && (
          <div
            className="mx-table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Exact synthetic telemetry readings"
          >
            <table className="mx-table">
              <caption>
                {metric.label} · synthetic · {metric.unit || "unitless"}. Stored
                values without display rounding; Missing means unavailable. Same
                crew filters and zoom as the chart.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Day {day} time</th>
                  <th scope="col">Elapsed minute</th>
                  {series.map((item) => (
                    <th key={item.id} scope="col">
                      {item.label} ({metric.unit || "unitless"})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.length && series.length ? (
                  displayed.map((point) => (
                    <tr key={point.minute}>
                      <th scope="row">{timeOfDay(point.minute, day)}</th>
                      <td>{point.minute}</td>
                      {series.map((item) => (
                        <td key={item.id}>{exactReading(point[item.key])}</td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={series.length + 2}>No readings to display.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </details>
    </>
  );
});

export default function MissionDashboard({
  dataset,
  elapsedMinute,
  inspectedDay,
  crewId,
}: {
  dataset: MissionDataset;
  elapsedMinute: number;
  inspectedDay: number;
  crewId?: string;
}) {
  const { config } = dataset;
  const id = useId();
  const [selectedMetricId, setSelectedMetricId] = useState(
    config.metrics[0]?.id ?? "",
  );
  // Derive fallbacks during render: configuration edits never leave a stale metric selected.
  const metric =
    config.metrics.find((item) => item.id === selectedMetricId) ??
    config.metrics[0];
  const [selection, setSelection] = useState<CrewSelection>({
    route: crewId,
    mode: crewId ? "custom" : "all",
    ids: crewId ? [crewId] : [],
  });
  const [showAllFindings, setShowAllFindings] = useState(false);
  const day = Math.max(
    0,
    Math.min(
      config.timeline.durationDays - 1,
      Math.floor(Number.isFinite(inspectedDay) ? inspectedDay : 0),
    ),
  );
  const dayStart = day * DAY;
  const dayEnd = (day + 1) * DAY;
  const elapsed = Math.max(
    0,
    Math.min(
      config.timeline.durationDays * DAY,
      Number.isFinite(elapsedMinute) ? elapsedMinute : 0,
    ),
  );
  const viewEnd = Math.min(elapsed, dayEnd);
  const interval = Math.max(1, config.timeline.intervalMinutes);
  // The expensive assessment and data projection advance only at completed sample boundaries.
  const sampledEnd = Math.min(
    dayEnd,
    Math.floor(viewEnd / interval) * interval,
  );
  const actualSelection =
    selection.route === crewId
      ? selection
      : {
          route: crewId,
          mode: crewId ? ("custom" as const) : ("all" as const),
          ids: crewId ? [crewId] : [],
        };
  const validSelected = actualSelection.ids.filter((selected) =>
    config.crew.some((crew) => crew.id === selected),
  );
  const visibleIds =
    actualSelection.mode === "none"
      ? []
      : actualSelection.mode === "all" || !validSelected.length
        ? config.crew.map((crew) => crew.id)
        : validSelected;
  const crewSeries = useMemo(() => {
    const sortedIds = config.crew.map((crew) => crew.id).sort();
    return config.crew.map((crew, index) => ({
      key: `crew_${index}`,
      id: crew.id,
      label: crew.name,
      color: crewColor(crew),
      dash: DASHES[sortedIds.indexOf(crew.id) % DASHES.length],
    }));
  }, [config.crew]);
  const series: Series[] =
    metric?.scope === "habitat"
      ? [
          {
            key: "spacecraft",
            id: "spacecraft",
            label: "Spacecraft · shared habitat",
            color: "#65dce9",
            dash: "",
          },
        ]
      : crewSeries.filter((item) => visibleIds.includes(item.id));

  // Index the 180-day fixture once. Clock ticks only inspect one day's small bucket.
  const rowsByDay = useMemo(() => {
    const indexed = new Map<number, TelemetryRow[]>();
    for (const row of dataset.rows) {
      if (row.endMinute <= 0) continue;
      const rowDay = Math.ceil(row.endMinute / DAY) - 1;
      const bucket = indexed.get(rowDay);
      if (bucket) bucket.push(row);
      else indexed.set(rowDay, [row]);
    }
    for (const bucket of indexed.values())
      bucket.sort((a, b) => a.endMinute - b.endMinute);
    return indexed;
  }, [dataset.rows]);
  const dayRows = useMemo(
    () =>
      (rowsByDay.get(day) ?? []).filter(
        (row) =>
          row.endMinute > dayStart &&
          row.endMinute <= sampledEnd &&
          row.endMinute <= dayEnd,
      ),
    [rowsByDay, day, dayStart, dayEnd, sampledEnd],
  );
  const latestByCrew = useMemo(() => {
    const latest = new Map<string, TelemetryRow>();
    for (const row of dayRows) latest.set(row.crewId, row);
    return latest;
  }, [dayRows]);
  const latestShared = dayRows[dayRows.length - 1];
  const points = useMemo<ChartPoint[]>(() => {
    if (!metric || sampledEnd <= dayStart) return [];
    const endpoints = new Map<number, TelemetryRow[]>();
    for (const row of dayRows) {
      const bucket = endpoints.get(row.endMinute);
      if (bucket) bucket.push(row);
      else endpoints.set(row.endMinute, [row]);
    }
    // Include absent whole rows as null to preserve true gaps between readings.
    const times = new Set<number>(endpoints.keys());
    for (
      let minute = (Math.floor(dayStart / interval) + 1) * interval;
      minute <= sampledEnd;
      minute += interval
    )
      times.add(minute);
    return [...times]
      .sort((a, b) => a - b)
      .map((minute) => {
        const rows = endpoints.get(minute) ?? [];
        const point: ChartPoint = { minute };
        if (metric.scope === "habitat") {
          const source = rows.find(
            (row) => row.values[metric.id] !== undefined,
          );
          const value = source?.values[metric.id];
          point.spacecraft =
            value != null && Number.isFinite(value) ? value : null;
        } else {
          for (const item of crewSeries) {
            const value = rows.find((row) => row.crewId === item.id)?.values[
              metric.id
            ];
            point[item.key] =
              value != null && Number.isFinite(value) ? value : null;
          }
        }
        return point;
      });
  }, [metric, sampledEnd, dayStart, dayRows, interval, crewSeries]);
  const assessment = useMemo(
    () => assessMission(dataset, Math.min(sampledEnd, dayEnd)),
    [dataset, sampledEnd, dayEnd],
  );
  const scheduled = useMemo(
    () =>
      config.crew.map((crew) => ({
        crew,
        slots: getSchedule(config, crew.id, dayStart, dayEnd),
      })),
    [config, dayStart, dayEnd],
  );
  const elapsedTracks = useMemo(
    () =>
      scheduled.map(({ crew, slots }) => ({
        crew,
        slots: slots
          .filter((slot) => slot.startMinute < viewEnd)
          .map((slot) => ({
            ...slot,
            startMinute: Math.max(slot.startMinute, dayStart),
            endMinute: Math.min(slot.endMinute, viewEnd),
          }))
          .filter((slot) => slot.endMinute > slot.startMinute),
      })),
    [scheduled, viewEnd, dayStart],
  );
  const selectedFindings = assessment.findings.filter(
    (finding) =>
      finding.metricId === metric?.id &&
      (metric?.scope === "habitat" || visibleIds.includes(finding.crewId)),
  );
  const findings =
    metric?.scope === "habitat"
      ? selectedFindings.slice(0, 1)
      : selectedFindings;
  const displayedFindings = showAllFindings
    ? findings
    : findings.filter((finding) => finding.state !== "within_demo_rule");
  const reviewCount = findings.filter(
    (finding) => finding.state === "review_suggested",
  ).length;
  const toggleCrew = (target: string) => {
    const next = visibleIds.includes(target)
      ? visibleIds.filter((item) => item !== target)
      : [...visibleIds, target];
    setSelection({
      route: crewId,
      mode: next.length ? "custom" : "none",
      ids: next,
    });
  };

  return (
    <div className="mx-dashboard mx-stack">
      <section className="mx-crew-section" aria-labelledby={`${id}-crew`}>
        <div className="mx-section-heading">
          <div>
            <p className="mx-eyebrow">CREW TELEMETRY</p>
            <h2 id={`${id}-crew`}>One mission. Every perspective.</h2>
            <p className="mx-muted">
              Day {day} · latest completed synthetic interval for each crew
              member.
            </p>
          </div>
          <Link className="mx-text-link" href="/mission">
            Mission comparison <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="mx-crew-grid">
          {config.crew.map((crew) => {
            const latest = latestByCrew.get(crew.id);
            const activity = elapsedTracks
              .find((track) => track.crew.id === crew.id)
              ?.slots.at(-1);
            const activityLabel = config.activities.find(
              (item) => item.id === activity?.activityId,
            )?.label;
            const crewFindings = assessment.findings.filter(
              (finding) =>
                finding.crewId === crew.id &&
                config.metrics.some(
                  (item) =>
                    item.id === finding.metricId && item.scope === "crew",
                ),
            );
            const hasReview = crewFindings.some(
              (finding) => finding.state === "review_suggested",
            );
            const insufficient = crewFindings.some(
              (finding) => finding.state === "insufficient_data",
            );
            const cardLabel = !latest
              ? "Awaiting data"
              : hasReview
                ? "Review suggested"
                : insufficient
                  ? "Incomplete assessment"
                  : crewFindings.some(
                        (finding) => finding.state === "within_demo_rule",
                      )
                    ? "See metric findings"
                    : "No assessed rules";
            return (
              <article
                className={`mx-crew-card ${visibleIds.includes(crew.id) ? "mx-crew-visible" : ""}`}
                key={crew.id}
                style={{ "--mx-crew": crewColor(crew) } as CSSProperties}
              >
                <div className="mx-crew-top">
                  <span className="mx-avatar" aria-hidden="true">
                    {crew.name
                      .split(/\s+/)
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span
                    className={`mx-status ${hasReview ? "mx-status-review" : ""}`}
                  >
                    {cardLabel}
                  </span>
                </div>
                <h3>
                  <Link href={`/mission?crew=${encodeURIComponent(crew.id)}`}>
                    {crew.name}
                  </Link>
                </h3>
                <p className="mx-crew-role">
                  {crew.role} · Pair {crew.pair}
                </p>
                <div className="mx-crew-activity">
                  <span
                    className="mx-activity-dot"
                    style={{
                      backgroundColor:
                        config.activities.find(
                          (item) => item.id === activity?.activityId,
                        )?.color ?? "#91a9bd",
                    }}
                    aria-hidden="true"
                  />
                  {activityLabel ?? "No elapsed activity"}
                </div>
                <dl className="mx-card-metrics">
                  {config.metrics.map((item) => {
                    const value = (
                      item.scope === "habitat" ? latestShared : latest
                    )?.values[item.id];
                    return (
                      <div key={item.id}>
                        <dt>
                          {item.label}
                          {item.scope === "habitat" && (
                            <span className="mx-shared-label">Shared</span>
                          )}
                        </dt>
                        <dd>
                          {reading(value, item)}
                          {value != null && (
                            <small> {item.unit || "unitless"}</small>
                          )}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                <div className="mx-crew-footer">
                  <span>
                    {latest
                      ? `Reading ${timeOfDay(latest.endMinute, day)}`
                      : "No reading this day"}
                  </span>
                  <Link
                    href={`/mission?crew=${encodeURIComponent(crew.id)}`}
                    aria-label={`View ${crew.name} details`}
                  >
                    Details <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="mx-panel mx-telemetry-panel"
        aria-labelledby={`${id}-chart`}
      >
        <div className="mx-section-heading">
          <div>
            <p className="mx-eyebrow">SIGNAL COMPARISON</p>
            <h2 id={`${id}-chart`}>
              {metric?.label ?? "No metrics configured"}
            </h2>
            <p className="mx-muted">
              {metric?.description ??
                "Add a metric in mission configuration to display telemetry."}
            </p>
          </div>
          <label className="mx-field" htmlFor={`${id}-metric`}>
            <span>Compare metric</span>
            <select
              id={`${id}-metric`}
              value={metric?.id ?? ""}
              onChange={(event) => setSelectedMetricId(event.target.value)}
              disabled={!config.metrics.length}
            >
              {config.metrics.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.label} ({item.unit || "unitless"})
                  {item.scope === "habitat" ? " · shared habitat" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
        <fieldset
          className="mx-crew-filters"
          disabled={metric?.scope === "habitat"}
        >
          <legend>Crew visibility</legend>
          <div className="mx-filter-actions">
            <button
              className="mx-button mx-button-quiet"
              type="button"
              onClick={() =>
                setSelection({ route: crewId, mode: "all", ids: [] })
              }
            >
              Show all
            </button>
            <button
              className="mx-button mx-button-quiet"
              type="button"
              onClick={() =>
                setSelection({ route: crewId, mode: "none", ids: [] })
              }
            >
              Hide all
            </button>
          </div>
          <div className="mx-filter-chips">
            {crewSeries.map((item) => (
              <div
                className={`mx-crew-chip ${visibleIds.includes(item.id) ? "mx-crew-chip-active" : ""}`}
                key={item.id}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={visibleIds.includes(item.id)}
                    onChange={() => toggleCrew(item.id)}
                  />
                  <LineSwatch series={item} />
                  <span>{item.label}</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setSelection({
                      route: crewId,
                      mode: "custom",
                      ids: [item.id],
                    })
                  }
                  aria-label={`Isolate ${item.label}`}
                >
                  Only
                </button>
              </div>
            ))}
          </div>
        </fieldset>
        {metric?.scope === "habitat" && (
          <p className="mx-inline-notice">
            <strong>Shared habitat reading.</strong> One Spacecraft series
            represents the whole cabin. Crew visibility filters do not change
            this signal.
          </p>
        )}
        {metric && (
          <TelemetryComparison
            key={`${day}-${metric.id}-${dataset.fingerprint}`}
            points={points}
            series={series}
            metric={metric}
            day={day}
          />
        )}
      </section>

      <section className="mx-panel" aria-labelledby={`${id}-activities`}>
        <div className="mx-section-heading">
          <div>
            <p className="mx-eyebrow">DAY CONTEXT</p>
            <h2 id={`${id}-activities`}>Activity alongside the signal</h2>
            <p className="mx-muted">
              Synthetic schedule · Day {day} · time in hours. Only elapsed
              activity is shown; blank space is not yet elapsed.
            </p>
          </div>
          <span className="mx-badge">
            {viewEnd > dayStart
              ? `Through ${timeOfDay(viewEnd, day)}`
              : "Day not yet elapsed"}
          </span>
        </div>
        <ActivityLegend config={config} />
        <div className="mx-track-axis">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
        {elapsedTracks.map(({ crew, slots }) => (
          <div className="mx-track-row" key={crew.id}>
            <span className="mx-track-name">
              {crew.name}
              <small>{crew.role}</small>
            </span>
            <ActivityTrack
              config={config}
              slots={slots}
              startMinute={dayStart}
              endMinute={dayEnd}
              label={`${crew.name}, elapsed synthetic activities, Day ${day}, time in hours`}
            />
          </div>
        ))}
        <details className="mx-details">
          <summary>Accessible activity list and exact times</summary>
          {elapsedTracks.map(({ crew, slots }) => (
            <section className="mx-list-section" key={crew.id}>
              <h3>{crew.name}</h3>
              <ScheduleList config={config} slots={slots} />
            </section>
          ))}
        </details>
      </section>

      <section className="mx-evidence-grid" aria-labelledby={`${id}-findings`}>
        <div className="mx-panel">
          <div className="mx-section-heading">
            <div>
              <p className="mx-eyebrow">STRUCTURED FINDINGS</p>
              <h2 id={`${id}-findings`}>Explain the observation</h2>
            </div>
            <span
              className={`mx-badge ${reviewCount ? "mx-status-review" : ""}`}
            >
              {reviewCount} review {reviewCount === 1 ? "flag" : "flags"}
            </span>
          </div>
          <p className="mx-muted">
            {metric?.label ?? "No metric selected"} · assessed through{" "}
            {formatMissionMinute(sampledEnd)}. Assessment may include earlier
            mission days.
          </p>
          <p className="mx-prototype-label">
            Prototype signal / not a clinical assessment
          </p>
          <label className="mx-checkbox-label">
            <input
              type="checkbox"
              checked={showAllFindings}
              onChange={(event) => setShowAllFindings(event.target.checked)}
            />
            Include findings within the demo rule
          </label>
          <div className="mx-findings">
            {displayedFindings.map((finding, index) => (
              <details
                className={`mx-finding mx-finding-${finding.state}`}
                key={`${finding.crewId}-${finding.metricId}-${index}`}
              >
                <summary>
                  <span className="mx-finding-label">
                    {metric?.scope === "habitat"
                      ? "Spacecraft · shared"
                      : (config.crew.find((crew) => crew.id === finding.crewId)
                          ?.name ?? finding.crewId)}
                  </span>
                  <span className="mx-status">
                    {FINDING_LABELS[finding.state]}
                  </span>
                </summary>
                <div className="mx-finding-body">
                  <p>{finding.message}</p>
                  <dl className="mx-evidence-values">
                    <div>
                      <dt>Baseline</dt>
                      <dd>
                        {metric
                          ? reading(finding.baseline, metric)
                          : "Unavailable"}{" "}
                        {finding.baseline != null ? metric?.unit : ""}
                      </dd>
                    </div>
                    <div>
                      <dt>Current assessment</dt>
                      <dd>
                        {metric
                          ? reading(finding.current, metric)
                          : "Unavailable"}{" "}
                        {finding.current != null ? metric?.unit : ""}
                      </dd>
                    </div>
                    <div>
                      <dt>Available samples</dt>
                      <dd>{finding.sampleCount}</dd>
                    </div>
                  </dl>
                  {metric?.review ? (
                    <p className="mx-muted">
                      Configured demo rule:{" "}
                      {metric.review.relativeDeviation * 100}% relative
                      deviation; at least {metric.review.minimumSamples}{" "}
                      samples.
                      {metric.review.activities?.length
                        ? ` Activity context: ${metric.review.activities.map((activityId) => config.activities.find((activity) => activity.id === activityId)?.label ?? activityId).join(", ")}.`
                        : ""}{" "}
                      This is a fixture rule, not a NASA or clinical threshold.
                    </p>
                  ) : (
                    <p className="mx-muted">
                      This metric has no configured review rule. Its values are
                      not classified as normal or safe.
                    </p>
                  )}
                  <Link
                    className="mx-text-link"
                    href="/about/science#nasa-human-risks"
                  >
                    NASA human-research context{" "}
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </details>
            ))}
          </div>
          {!displayedFindings.length && (
            <p className="mx-empty-state">
              {!metric
                ? "Configure a metric to inspect findings."
                : metric.scope === "crew" && !visibleIds.length
                  ? "Show a crew member to inspect their findings."
                  : !metric.review
                    ? "No review rule is configured for this metric. Readings are available for inspection without a risk classification."
                    : !findings.length
                      ? "No assessment is available for this selection yet. This does not establish the absence of a signal."
                      : "Findings within the configured demo rule are hidden. Enable the option above to inspect them; these findings do not establish clinical safety."}
            </p>
          )}
          <details className="mx-details">
            <summary>
              Runtime audit{" "}
              <span className="mx-muted">
                · {assessment.audit.length} entries
              </span>
            </summary>
            <ol className="mx-audit">
              {assessment.audit.map((entry, index) => (
                <li key={`${entry.agent}-${index}`}>
                  <span className="mx-audit-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <strong>{entry.agent}</strong>
                    <p>{entry.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            {!assessment.audit.length && (
              <p className="mx-muted">No audit entries at this endpoint.</p>
            )}
          </details>
        </div>
        <aside className="mx-panel mx-provenance">
          <p className="mx-eyebrow">EVIDENCE & PROVENANCE</p>
          <h2>Know what the data can say.</h2>
          <span className="mx-badge">100% synthetic telemetry</span>
          <p>
            Readings describe fictional crew and a fictional spacecraft. Missing
            observations remain missing. The demo rules are configuration
            choices, not medical limits.
          </p>
          <div className="mx-source-card">
            <span className="mx-eyebrow">RESEARCH CONTEXT</span>
            <h3>NASA human spaceflight risks</h3>
            <p>
              Use the science page to review the cited research context
              separately from these generated measurements. NASA does not
              validate this prototype’s thresholds.
            </p>
            <Link
              className="mx-text-link"
              href="/about/science#nasa-human-risks"
            >
              Explore sources & limitations <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <dl className="mx-provenance-meta">
            <div>
              <dt>Configuration</dt>
              <dd>{config.revision}</dd>
            </div>
            <div>
              <dt>Dataset fingerprint</dt>
              <dd className="mx-mono">{dataset.fingerprint}</dd>
            </div>
            <div>
              <dt>Sampling interval</dt>
              <dd>{interval} minutes</dd>
            </div>
          </dl>
          <p className="mx-muted">
            Independent educational prototype. AI-assisted interface and code;
            human review is required for submission.
          </p>
        </aside>
      </section>
    </div>
  );
}
