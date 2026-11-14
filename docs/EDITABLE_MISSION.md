# Editable 180-day mission

This is a fictional educational simulator. The schedule, minute-level generator coefficients, thresholds and values are synthetic assumptions, not NASA astronaut measurements or a validated physiological model.

## Source files and precedence

- `public/mission-data/config.json`: timeline, seed, crew, activity labels, routine, indicator definitions, generation assumptions and optional review rules.
- `public/mission-data/overrides.csv`: optional corrected observations. An empty file with its header means no overrides.
- `/mission/data`: edit/import/export both sources, add an indicator using a form, validate and apply. Applying changes regenerates the dataset and resets the mission to day 0. Invalid input leaves the active dataset intact.
- Browser customization is stored locally and takes precedence. Export it to save it to the project. **Reload source files** replaces browser customization with the files and resets the mission. A normal refresh reuses browser customization if present.
- `npm run dev` serves the files directly. `npm start` serves the compiled interface plus these two allowlisted files from `public/mission-data`, with caching disabled. Save a file and reload sources; no rebuild required locally. A portable static host serves the copies in `out/mission-data`; update those deployed assets or rebuild for a new hosted release. Code changes still require a build.
- Invalid JSON, invalid CSV, unknown IDs, duplicate observations, nonfinite numbers, inconsistent schedule settings and bounds violations produce errors. No source is silently replaced with a made-up default.

## Time and activities

| Phase | Start | End | Duration |
|---|---|---|---|
| Launch/outbound | D000 00:00 | D001 12:00 | 36 hours |
| Orbital operations | D001 12:00 | D177 12:00 | 176 days |
| Return | D177 12:00 | D180 00:00 | 60 hours |

Mission days are zero-based elapsed UTC-reference days. No real launch date or browser timezone is used. Orbital days are one-based and begin at orbit entry, 12:00 in the default configuration. There are 25 full orbital weeks and one closeout day.

Default full-week exercise days are orbital weekdays 1, 3 and 6 (`exerciseDays: [0,2,5]`), 13:00–14:00. EVA is orbital weekday 4: preparation 14:00–15:00, outside 15:00–19:00, recovery 19:00–20:00. Pair A (Maya/Eli) handles odd weeks; Pair B (Sofia/Noah) handles even weeks. The other pair supports onboard. There are 25 pair EVAs: A has 13, B has 12. The last partial week has no EVA or exercise block. Sleep, routine work, meals and rest fill the remaining timeline. EVA/support can replace a routine meal block; no person has overlapping activities. Changing durations/times is validated before use.

## Generation and extensibility

The generator evaluates each minute from the seeded profile, activity offset, optional linear trend and deterministic noise, then aggregates 15 minutes. Default output: 17,280 records per crew member, 69,120 total. The final reading ends at minute 259200; there is no day-180 extra record.

`end_minute=2235` means D001 13:15, averaging [D001 13:00, D001 13:15). An activity starting at 13:15 first affects the reading ending 13:30. Rates use `aggregation: "mean"`; activity minutes use `"sum"`. Sum generator baselines/offsets are units per minute, while `min`/`max` bound the final 15-minute total. Crew baselines override a metric's default. Habitat metrics are generated once and shared across all crew records; charts display a single spacecraft series.

Each metric has `id`, `label`, `unit`, `description`, `scope`, `aggregation`, `decimals`, `min`, `max`, and `generator`. Add an entry or use **Add indicator**; selectors, charts, tables, CSV export and scenario comparisons discover it automatically. No fixed TypeScript metric union is used in this pipeline. An optional `review` rule determines classification; a new metric without one is explicitly unclassified. Deleting a metric also requires removing its per-crew baseline entries and CSV overrides; validation identifies stale references.

Generator fields:

- `baseline`: default value (or rate per minute for summed metrics).
- `noise`: deterministic minute noise amplitude; it averages down across a 15-minute window.
- `activityOffsets`: values keyed by activity ID. These are illustrative assumptions.
- `trendPerDay`: optional linear synthetic drift, bounded by the configured limits.
- `activeOnly`: optional eligible activities. An interval containing any ineligible minute is missing.
- `settlingMinutes`: optional missing-data settling period after an activity transition. It does not imply a calibrated recovery response.

Example indicator:

```json
{
  "id": "temperature",
  "label": "Body temperature",
  "unit": "°C",
  "description": "Invented temperature for demonstration only.",
  "scope": "crew",
  "aggregation": "mean",
  "decimals": 2,
  "min": 30,
  "max": 45,
  "generator": { "baseline": 36.6, "noise": 0.1, "activityOffsets": { "exercise": 0.3 } }
}
```

Changing seed/profile/metric/schedule changes the dataset fingerprint and resets incompatible saved playback. Adding a metric does not change the random stream of existing metrics.

## CSV edits

```csv
end_minute,crew_id,metric_id,value
2235,maya-torres,heart_rate,125
2250,maya-torres,heart_rate,
2235,habitat,cabin_co2,920
```

The first row replaces that pulse average; the second explicitly marks it missing; the third changes the single habitat reading for everyone. Unmentioned readings retain generated values. Zero is a valid number where bounds allow it. End minutes must be aligned to the 15-minute grid, after zero and at or before mission end. Unknown metric/crew IDs and duplicate keys are rejected.

Export observed readings for the visible mission history, or export the **full fixture (includes future)** for offline enrichment. Import it as overrides after editing. Full-fixture export is an explicit data-authoring operation; it is not observed history. The dashboard and agents still limit observations to completed intervals. Large browser customizations may exceed storage quota; the session still works and shows an export reminder.

## Playback, inspection and interpretation

Start/pause/resume/reset and four speed levels use the same mission clock as the schematic and data cutoff. Advance one day pauses at the next midnight. History inspection has a separate cursor; **Follow present** rejoins the current day. Navigation within mission routes preserves the running clock. Refresh restores matching data paused. Closed/hidden tabs do not simulate unattended time.

The dashboard compares one indicator across selected crew; show all/hide all/isolate and brush/time-select zoom share the exact-value table. Missing values produce gaps. Shared habitat is never plotted as four independent crew measurements. Days with no completed interval show an empty state, not future data.

Monitoring compares the first 14 orbital days (capped at the current inspection time) with the latest three days, matching activity strata. Optional per-metric minimum samples and relative deviation rules produce review suggestions or insufficient-data states. Four deterministic agent stages expose an audit trail. These rules do not diagnose, establish EVA safety or prescribe actions.

The scenario page uses the latest seven completed days, requiring at least three usable days. Sums require full daily interval coverage; daily means require four valid intervals. A 30-day constant target is compared with the recent baseline. It never changes other indicators or claims health efficacy. NASA links supply separately labeled research context only.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e`. Legacy fixture assertions remain in the suite. New tests cover boundaries, alternating EVA, sampling, editable data, new metrics, playback persistence, no future leakage, filters and assumptions. See `docs/TEST_REPORT.md` for executed results and browser limits.
