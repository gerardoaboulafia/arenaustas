"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";
import { getSchedule } from "@/lib/mission";
import type { ActivitySlot, MissionConfig } from "@/lib/mission/types";

const DAY = 1440;

export function formatMissionMinute(minute: number): string {
  const whole = Math.max(0, Math.floor(minute));
  return `Day ${Math.floor(whole / DAY)} · ${String(Math.floor((whole % DAY) / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
}

function durationLabel(minutes: number): string {
  const days = Math.floor(minutes / DAY);
  const hours = Math.floor((minutes % DAY) / 60);
  const remainder = minutes % 60;
  return (
    [
      days ? `${days}d` : "",
      hours ? `${hours}h` : "",
      remainder ? `${remainder}m` : "",
    ]
      .filter(Boolean)
      .join(" ") || "0m"
  );
}

/** Presentation-only compression; the domain owns activity selection and timing. */
function compressSlots(
  slots: ActivitySlot[],
  start: number,
  end: number,
): ActivitySlot[] {
  const result: ActivitySlot[] = [];
  for (const slot of slots) {
    const clipped = {
      ...slot,
      startMinute: Math.max(start, slot.startMinute),
      endMinute: Math.min(end, slot.endMinute),
    };
    if (clipped.endMinute <= clipped.startMinute) continue;
    const previous = result[result.length - 1];
    if (
      previous &&
      previous.activityId === clipped.activityId &&
      previous.crewId === clipped.crewId &&
      previous.endMinute === clipped.startMinute
    ) {
      previous.endMinute = clipped.endMinute;
    } else result.push(clipped);
  }
  return result;
}

export function ActivityTrack({
  config,
  slots,
  startMinute,
  endMinute,
  label,
}: {
  config: MissionConfig;
  slots: ActivitySlot[];
  startMinute: number;
  endMinute: number;
  label: string;
}) {
  const compressed = useMemo(
    () => compressSlots(slots, startMinute, endMinute),
    [slots, startMinute, endMinute],
  );
  const span = Math.max(1, endMinute - startMinute);
  const definitions = new Map(
    config.activities.map((activity) => [activity.id, activity]),
  );
  return (
    <div
      className="mx-activity-track"
      role="img"
      aria-label={`${label}. ${compressed.length ? compressed.map((slot) => `${definitions.get(slot.activityId)?.label ?? slot.activityId}, ${formatMissionMinute(slot.startMinute)} to ${formatMissionMinute(slot.endMinute)}`).join("; ") : "No elapsed activities."}`}
    >
      {compressed.map((slot) => {
        const activity = definitions.get(slot.activityId);
        const width = ((slot.endMinute - slot.startMinute) / span) * 100;
        return (
          <span
            key={`${slot.startMinute}-${slot.activityId}`}
            className="mx-activity-span"
            style={
              {
                left: `${((slot.startMinute - startMinute) / span) * 100}%`,
                width: `${width}%`,
                "--mx-activity": activity?.color ?? "#91a9bd",
              } as CSSProperties
            }
            title={`${activity?.label ?? slot.activityId} · ${formatMissionMinute(slot.startMinute)} → ${formatMissionMinute(slot.endMinute)}`}
            aria-hidden="true"
          >
            {width >= 8 ? (activity?.label ?? slot.activityId) : ""}
          </span>
        );
      })}
    </div>
  );
}

export function ActivityLegend({ config }: { config: MissionConfig }) {
  return (
    <ul className="mx-activity-legend" aria-label="Activity legend">
      {config.activities.map((activity) => (
        <li key={activity.id}>
          <span
            className="mx-activity-dot"
            style={{ backgroundColor: activity.color }}
            aria-hidden="true"
          />
          {activity.label}
        </li>
      ))}
    </ul>
  );
}

export function ScheduleList({
  config,
  slots,
}: {
  config: MissionConfig;
  slots: ActivitySlot[];
}) {
  const definitions = new Map(
    config.activities.map((activity) => [activity.id, activity.label]),
  );
  const compressed = compressSlots(slots, -Infinity, Infinity);
  if (!compressed.length)
    return <p className="mx-muted">No activities in this interval.</p>;
  return (
    <ol className="mx-schedule-list">
      {compressed.map((slot) => (
        <li key={`${slot.crewId}-${slot.startMinute}-${slot.activityId}`}>
          <span className="mx-schedule-time">
            {formatMissionMinute(slot.startMinute)} →{" "}
            {formatMissionMinute(slot.endMinute)}
          </span>
          <strong>{definitions.get(slot.activityId) ?? slot.activityId}</strong>
          <span className="mx-muted">
            {durationLabel(slot.endMinute - slot.startMinute)}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function MissionSchedule({ config }: { config: MissionConfig }) {
  const id = useId();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const transitEnd = config.timeline.transitHours * 60;
  const orbitEnd = transitEnd + config.timeline.orbitalDays * DAY;
  const missionEnd = config.timeline.durationDays * DAY;
  const weekCount = Math.max(1, Math.ceil(config.timeline.orbitalDays / 7));
  const week = Math.min(Math.max(1, selectedWeek), weekCount);
  const start = transitEnd + (week - 1) * 7 * DAY;
  const end = Math.min(start + 7 * DAY, orbitEnd);
  const days = useMemo(
    () =>
      Array.from(
        { length: Math.max(0, Math.ceil((end - start) / DAY)) },
        (_, index) => {
          const dayStart = start + index * DAY;
          const dayEnd = Math.min(dayStart + DAY, end);
          return {
            start: dayStart,
            end: dayEnd,
            orbitalDay: (week - 1) * 7 + index + 1,
            crews: config.crew.map((crew) => ({
              crew,
              slots: getSchedule(config, crew.id, dayStart, dayEnd),
            })),
          };
        },
      ),
    [config, start, end, week],
  );
  const phases = [
    {
      label: "Outbound transit",
      start: 0,
      end: transitEnd,
      duration: `${config.timeline.transitHours} hours`,
      className: "mx-phase-transit",
    },
    {
      label: "Orbital operations",
      start: transitEnd,
      end: orbitEnd,
      duration: `${config.timeline.orbitalDays} days`,
      className: "mx-phase-orbit",
    },
    {
      label: "Return transit",
      start: orbitEnd,
      end: missionEnd,
      duration: `${(missionEnd - orbitEnd) / 60} hours`,
      className: "mx-phase-return",
    },
  ];

  return (
    <section className="mx-schedule mx-stack" aria-labelledby={`${id}-title`}>
      <div className="mx-section-heading">
        <div>
          <p className="mx-eyebrow">MISSION ARCHITECTURE</p>
          <h2 id={`${id}-title`}>
            {config.timeline.durationDays}-day flight plan
          </h2>
          <p className="mx-muted">
            Full synthetic plan · includes future activities. This is a
            schedule, not observed telemetry.
          </p>
        </div>
        <span className="mx-badge">Configuration {config.revision}</span>
      </div>

      <div className="mx-panel mx-phase-panel">
        <div className="mx-phase-cards">
          {phases.map((phase, index) => (
            <div
              className={`mx-phase-card ${phase.className}`}
              key={phase.label}
            >
              <span className="mx-eyebrow">
                0{index + 1} / {phase.label}
              </span>
              <strong>{phase.duration}</strong>
              <span>
                {formatMissionMinute(phase.start)} →{" "}
                {formatMissionMinute(phase.end)}
              </span>
            </div>
          ))}
        </div>
        <div
          className="mx-phase-bar"
          role="img"
          aria-label={`Synthetic plan in mission minutes. ${phases.map((phase) => `${phase.label}: ${phase.start} to ${phase.end}, ${phase.end - phase.start} minutes`).join(". ")}`}
        >
          {phases.map((phase) => (
            <span
              key={phase.label}
              className={phase.className}
              style={{
                width: `${((phase.end - phase.start) / Math.max(1, missionEnd)) * 100}%`,
              }}
            />
          ))}
        </div>
        <details className="mx-details">
          <summary>Exact phase boundaries and durations</summary>
          <div
            className="mx-table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Exact mission phase boundaries"
          >
            <table className="mx-table">
              <caption>
                Synthetic plan · elapsed minutes from launch; intervals include
                their start and exclude their end.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Phase</th>
                  <th scope="col">Start (min)</th>
                  <th scope="col">End (min)</th>
                  <th scope="col">Duration (min)</th>
                  <th scope="col">Duration (hours)</th>
                </tr>
              </thead>
              <tbody>
                {phases.map((phase) => (
                  <tr key={phase.label}>
                    <th scope="row">{phase.label}</th>
                    <td>{phase.start}</td>
                    <td>{phase.end}</td>
                    <td>{phase.end - phase.start}</td>
                    <td>{(phase.end - phase.start) / 60}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      <div className="mx-panel">
        <div className="mx-section-heading">
          <div>
            <p className="mx-eyebrow">ORBITAL ROUTINE</p>
            <h3>
              Week {week} <span className="mx-muted">/ {weekCount}</span>
            </h3>
          </div>
          <div className="mx-week-controls">
            <button
              className="mx-button mx-button-quiet"
              type="button"
              aria-label="Previous orbital week"
              disabled={week <= 1}
              onClick={() => setSelectedWeek(week - 1)}
            >
              ←
            </button>
            <label className="mx-field" htmlFor={`${id}-week`}>
              <span className="mx-sr-only">Orbital week</span>
              <select
                id={`${id}-week`}
                value={week}
                onChange={(event) =>
                  setSelectedWeek(Number(event.target.value))
                }
              >
                {Array.from({ length: weekCount }, (_, index) => (
                  <option key={index} value={index + 1}>
                    Orbital week {index + 1}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="mx-button mx-button-quiet"
              type="button"
              aria-label="Next orbital week"
              disabled={week >= weekCount}
              onClick={() => setSelectedWeek(week + 1)}
            >
              →
            </button>
          </div>
        </div>
        <div className="mx-plan-note">
          <span className="mx-badge">
            {days.length < 7
              ? "Closeout · no EVA"
              : `EVA rotation · Pair ${week % 2 === 1 ? "A" : "B"}`}
          </span>
          <p>
            Pair A on odd full orbital weeks; Pair B on even full orbital weeks.{" "}
            {days.length < 7
              ? `Final partial week: ${days.length} orbital ${days.length === 1 ? "day" : "days"}, reserved for closeout.`
              : "Seven orbital days shown."}{" "}
            Activities below come from the configured plan.
          </p>
        </div>
        <ActivityLegend config={config} />
        <div className="mx-orbital-days">
          {days.map((day) => (
            <article className="mx-orbital-day" key={day.start}>
              <div className="mx-section-heading">
                <h4>Orbital day {day.orbitalDay}</h4>
                <span className="mx-muted">
                  {formatMissionMinute(day.start)} →{" "}
                  {formatMissionMinute(day.end)}
                </span>
              </div>
              <div className="mx-track-axis">
                <span>+00h</span>
                <span>+06h</span>
                <span>+12h</span>
                <span>+18h</span>
                <span>+{(day.end - day.start) / 60}h</span>
              </div>
              {day.crews.map(({ crew, slots }) => (
                <div className="mx-track-row" key={crew.id}>
                  <span className="mx-track-name">
                    {crew.name}
                    <small>Pair {crew.pair}</small>
                  </span>
                  <ActivityTrack
                    config={config}
                    slots={slots}
                    startMinute={day.start}
                    endMinute={day.end}
                    label={`${crew.name}, orbital day ${day.orbitalDay}, synthetic planned activity, time in hours`}
                  />
                </div>
              ))}
              <details className="mx-details">
                <summary>Read daily crew activities and exact times</summary>
                {day.crews.map(({ crew, slots }) => (
                  <section className="mx-list-section" key={crew.id}>
                    <h4>
                      {crew.name} · Pair {crew.pair}
                    </h4>
                    <ScheduleList config={config} slots={slots} />
                  </section>
                ))}
              </details>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
