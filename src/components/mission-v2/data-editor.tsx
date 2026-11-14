"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Plus, RefreshCw, Save } from "lucide-react";
import { useMission } from "./provider";
import type { MissionConfig, MissionDataset } from "@/lib/mission/types";

function download(name: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function telemetryCsv(dataset: MissionDataset, asOf = Infinity): string {
  const lines = ["end_minute,crew_id,metric_id,value"];
  for (const row of dataset.rows) {
    if (row.endMinute > asOf) continue;
    for (const metric of dataset.config.metrics) {
      if (
        metric.scope === "habitat" &&
        row.crewId !== dataset.config.crew[0].id
      )
        continue;
      const value = row.values[metric.id];
      lines.push(
        `${row.endMinute},${metric.scope === "habitat" ? "habitat" : row.crewId},${metric.id},${value ?? ""}`,
      );
    }
  }
  return lines.join("\n") + "\n";
}
export default function DataEditor() {
  const mission = useMission();
  return (
    <main id="main" className="page mx-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ASTRA / EDITABLE MISSION</span>
          <h1>The data is yours to shape.</h1>
          <p>
            Change the schedule, tune fictional profiles, or add an indicator.
            The simulator reads the same configuration.
          </p>
        </div>
        <Link className="button secondary" href="/mission">
          Back to mission
        </Link>
      </div>
      <section className="panel mx-source-info">
        <h2>One source for the whole mission</h2>
        <p>
          Active source: <strong>{mission.source}</strong>. Files:{" "}
          <code>public/mission-data/config.json</code> and{" "}
          <code>public/mission-data/overrides.csv</code>.
        </p>
        <p>
          Browser edits stay on this device. Export the files to keep them in
          your project. After editing the files locally, use{" "}
          <strong>Reload source files</strong>; no code changes or rebuild are
          needed with the local server. Applying valid changes starts a fresh
          mission at day 0.
        </p>
        <button
          className="button secondary"
          onClick={() => void mission.reload()}
          disabled={mission.loading}
        >
          <RefreshCw size={16} />
          Reload source files
        </button>
        <p className="mx-muted">
          Reload replaces browser customizations with the project files. Export
          your edits first if you want to keep them.
        </p>
      </section>
      {mission.error && (
        <pre className="mx-message error" role="alert">
          {mission.error}
        </pre>
      )}
      {mission.notice && (
        <p className="mx-message" role="status">
          {mission.notice}
        </p>
      )}
      {mission.loading && (
        <p role="status">
          Validating sources and generating synthetic telemetry…
        </p>
      )}
      {mission.dataset && (
        <EditorForm
          key={mission.dataset.fingerprint}
          dataset={mission.dataset}
          initialCsv={mission.csv}
        />
      )}
    </main>
  );
}
function EditorForm({
  dataset,
  initialCsv,
}: {
  dataset: MissionDataset;
  initialCsv: string;
}) {
  const mission = useMission();
  const [configText, setConfigText] = useState(
    JSON.stringify(dataset.config, null, 2),
  );
  const [csv, setCsv] = useState(initialCsv);
  const [localError, setLocalError] = useState<string | null>(null);
  const [indicator, setIndicator] = useState({
    id: "temperature",
    label: "Body temperature",
    unit: "°C",
    baseline: "36.6",
    min: "30",
    max: "45",
    noise: "0.1",
    scope: "crew",
  });
  let draft: MissionConfig | null = null;
  try {
    draft = JSON.parse(configText) as MissionConfig;
  } catch {}
  const editSchedule = (
    key: keyof MissionConfig["schedule"],
    value: number | number[],
  ) => {
    if (!draft?.schedule) return;
    setConfigText(
      JSON.stringify(
        { ...draft, schedule: { ...draft.schedule, [key]: value } },
        null,
        2,
      ),
    );
  };
  const addIndicator = () => {
    if (!Array.isArray(draft?.metrics)) {
      setLocalError("Fix the configuration JSON before adding an indicator.");
      return;
    }
    if (
      !/^[a-z][a-z0-9_]*$/.test(indicator.id) ||
      draft.metrics.some((metric) => metric?.id === indicator.id)
    ) {
      setLocalError(
        "Use a unique indicator ID: lowercase letters, digits and underscores, starting with a letter.",
      );
      return;
    }
    const numbers = [
      indicator.baseline,
      indicator.min,
      indicator.max,
      indicator.noise,
    ].map(Number);
    if (
      !indicator.label.trim() ||
      !indicator.unit.trim() ||
      numbers.some((value) => !Number.isFinite(value)) ||
      numbers[1] >= numbers[2] ||
      numbers[0] < numbers[1] ||
      numbers[0] > numbers[2] ||
      numbers[3] < 0
    ) {
      setLocalError(
        "Provide a label, unit and finite values; baseline must be within min/max, and noise cannot be negative.",
      );
      return;
    }
    setConfigText(
      JSON.stringify(
        {
          ...draft,
          metrics: [
            ...draft.metrics,
            {
              id: indicator.id,
              label: indicator.label,
              unit: indicator.unit,
              description:
                "User-defined fictional indicator. No review rule configured.",
              scope: indicator.scope,
              aggregation: "mean",
              decimals: 2,
              min: numbers[1],
              max: numbers[2],
              generator: {
                baseline: numbers[0],
                noise: numbers[3],
                activityOffsets: {},
              },
            },
          ],
        },
        null,
        2,
      ),
    );
    setLocalError(null);
  };
  const importText = async (
    file: File | undefined,
    setter: (value: string) => void,
  ) => {
    if (!file) return;
    if (file.size > 32 * 1024 * 1024) {
      setLocalError("Please use a file smaller than 32 MB.");
      return;
    }
    try {
      setter(await file.text());
      setLocalError(null);
    } catch {
      setLocalError("The selected file could not be read.");
    }
  };
  return (
    <>
      {localError && (
        <p className="mx-message error" role="alert">
          {localError}
        </p>
      )}
      <div className="mx-editor-grid">
        <section className="panel">
          <span className="eyebrow">01 / ROUTINE</span>
          <h2>Weekly mission rhythm</h2>
          <p>
            Three exercise days and one alternating-pair EVA per full orbital
            week. Times use the mission UTC reference; orbital days start at
            orbit entry.
          </p>
          <div className="mx-form-grid">
            {(
              [
                ["exerciseStartHour", "Exercise starts (hour UTC)", 0, 23],
                ["exerciseMinutes", "Exercise duration (minutes)", 15, 240],
                ["evaStartHour", "EVA starts (hour UTC)", 0, 23],
                [
                  "evaPrepMinutes",
                  "EVA preparation (minutes before EVA)",
                  15,
                  180,
                ],
                ["evaMinutes", "Outside spacecraft (minutes)", 15, 480],
                ["evaRecoveryMinutes", "EVA recovery (minutes)", 15, 180],
                ["sleepStartHour", "Sleep starts (hour UTC)", 0, 23],
                ["sleepHours", "Sleep opportunity (hours)", 1, 12],
                ["workStartHour", "Routine work starts (hour UTC)", 0, 23],
                ["workEndHour", "Routine work ends (hour UTC)", 1, 23],
              ] as const
            ).map(([key, label, min, max]) => (
              <label key={key}>
                {label}
                <input
                  type="number"
                  min={min}
                  max={max}
                  value={
                    typeof draft?.schedule?.[key] === "number"
                      ? draft.schedule[key]
                      : ""
                  }
                  onChange={(event) =>
                    editSchedule(key, Number(event.target.value))
                  }
                />
              </label>
            ))}
          </div>
          <p className="mx-muted">
            Advanced JSON below contains weekdays, meals, pair assignments and
            individual baselines. Scheduled EVA/support takes precedence over
            routine meals.
          </p>
        </section>
        <section className="panel">
          <span className="eyebrow">02 / EXTENSIBLE INDICATORS</span>
          <h2>Add an indicator</h2>
          <p>
            It will appear automatically in the selector, charts, table, CSV
            export and scenarios after applying changes. Review rules are
            optional.
          </p>
          <div className="mx-form-grid">
            {(
              [
                ["id", "Unique ID"],
                ["label", "Display name"],
                ["unit", "Unit"],
                ["baseline", "Default baseline"],
                ["min", "Minimum"],
                ["max", "Maximum"],
                ["noise", "Synthetic noise amplitude"],
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  value={indicator[key]}
                  onChange={(event) =>
                    setIndicator((previous) => ({
                      ...previous,
                      [key]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
            <label>
              Signal scope
              <select
                value={indicator.scope}
                onChange={(event) =>
                  setIndicator((previous) => ({
                    ...previous,
                    scope: event.target.value,
                  }))
                }
              >
                <option value="crew">Individual crew</option>
                <option value="habitat">Shared spacecraft</option>
              </select>
            </label>
          </div>
          <button className="button secondary" onClick={addIndicator}>
            <Plus size={16} />
            Add indicator to draft
          </button>
          <p className="mx-muted">
            {Array.isArray(draft?.metrics) ? draft.metrics.length : "—"}{" "}
            indicators in draft. Activity offsets and per-crew baselines can be
            customized in JSON.
          </p>
        </section>
      </div>
      <section className="panel mx-editor-section">
        <span className="eyebrow">03 / CONFIGURATION SOURCE</span>
        <h2>Configuration JSON</h2>
        <div className="mx-controls">
          <label>
            Import configuration
            <input
              type="file"
              accept=".json,application/json"
              onChange={(event) =>
                void importText(event.target.files?.[0], setConfigText)
              }
            />
          </label>
          <button
            className="button secondary"
            onClick={() =>
              download("config.json", configText, "application/json")
            }
          >
            <Download size={16} />
            Export draft configuration
          </button>
        </div>
        <textarea
          spellCheck={false}
          aria-label="Configuration JSON"
          className="mx-code-editor"
          value={configText}
          onChange={(event) => setConfigText(event.target.value)}
        />
      </section>
      <section className="panel mx-editor-section">
        <span className="eyebrow">04 / SYNTHETIC DATA CORRECTIONS</span>
        <h2>Override individual readings</h2>
        <p>
          CSV columns: <code>end_minute,crew_id,metric_id,value</code>. A row
          replaces that generated reading. An empty value means missing, never
          zero. Use <code>habitat</code> for shared signals. Omitted rows keep
          the generated value.
        </p>
        <p>
          Example: <code>2235,maya-torres,heart_rate,125</code> changes the
          13:00–13:15 interval on mission day 1. Values are interval averages,
          or interval totals for summed indicators.
        </p>
        <div className="mx-controls">
          <label>
            Import overrides CSV
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) =>
                void importText(event.target.files?.[0], setCsv)
              }
            />
          </label>
          <button
            className="button secondary"
            onClick={() => download("overrides.csv", csv, "text/csv")}
          >
            <Download size={16} />
            Export draft overrides
          </button>
        </div>
        <textarea
          spellCheck={false}
          aria-label="Telemetry overrides CSV"
          className="mx-code-editor mx-csv-editor"
          value={csv}
          onChange={(event) => setCsv(event.target.value)}
        />
        <p className="mx-muted">
          For end minute 2235, the measurement window is [2220, 2235). Future
          values are hidden in mission views until their interval is complete.
        </p>
        <div className="mx-controls">
          <button
            className="button secondary"
            onClick={() =>
              download(
                "observed-telemetry.csv",
                telemetryCsv(dataset, mission.clock.elapsedMinute),
                "text/csv",
              )
            }
          >
            Export observed readings
          </button>
          <button
            className="button secondary"
            onClick={() =>
              download(
                "full-synthetic-fixture.csv",
                telemetryCsv(dataset),
                "text/csv",
              )
            }
          >
            Export full fixture (includes future)
          </button>
        </div>
        <p className="mx-muted">
          Exports use the active dataset, not the unapplied draft. The full
          fixture is an editable synthetic input, not observed mission history.
        </p>
      </section>
      <div className="mx-save-bar">
        <span>
          Validation happens before replacing the active mission. Invalid
          changes leave it intact.
        </span>
        <button
          className="button"
          disabled={mission.loading}
          onClick={() => void mission.apply({ configText, csv })}
        >
          <Save size={16} />
          Apply changes & restart mission
        </button>
      </div>
    </>
  );
}
