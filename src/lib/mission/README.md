# Deterministic mission engine

This module implements the supplied mission types without dependencies, network
access, API keys or an LLM. All telemetry is invented demonstration data. Code and
tests were generated with AI assistance; this is not NASA software or a medical
assessment. The main application owns `types.ts` and `public/mission-data/config.json`.

## Public contract

`index.ts` exports `validateConfig`, `parseOverrides`, `serializeOverrides`,
`fingerprint`, `phaseAt`, `activityAt`, `getSchedule`, `generateTelemetry`,
`assessMission`, `initialClock`, `sanitizeClock`, `advanceClock`, and
`formatMissionTime`. It also exports typed Monitoring, Risk, Simulation and
Explanation functions under both `runMonitoring`/`runRisk`/`runSimulation`/
`runExplanation` and `MonitoringAgent`/`RiskAgent`/`SimulationAgent`/
`ExplanationAgent` names.

Validation is atomic: `{value: null, errors}` on any invalid input. Generation
throws descriptive errors on invalid config or direct overrides. Omitted crew
baseline maps normalize to `{}`; omitted work hours normalize to 09:00–18:00.
Configuration values are finite numbers, not numeric strings. Crew IDs and metric
IDs must be unique safe identifiers; activity references must exist. Two through
eight crew members are allowed, in equally sized A/B groups. Metrics are generic:
their IDs do not select hardcoded rules. No `review` means `unconfigured`.

Mission duration is 1–366 integer days, subject to fitting a positive transit,
1–364 orbital days and at least 15 minutes of return. Transit must end on a
15-minute boundary; record interval is exactly 15 minutes. Maximums are eight
crew, 32 metrics and 64 activities. These limits bound local browser workloads.

## Time and schedule

Mission minute zero is `D000 00:00` UTC. Default transit is 36 hours, orbit is
176 days, total duration is 180 days, and return occupies the remaining 60 hours.
Phases and activities use half-open intervals. The exact terminal minute is
`complete`; `getSchedule` produces no terminal activity interval. The initial
60 minutes are launch; sleep and meals otherwise apply during transit/return too.

Orbital day/week zero starts at orbit entry (default D001 12:00), not UTC
midnight. `orbitalWeek` is **one-based**, or null outside orbit. Exercise occurs
on relative days 0, 2 and 5 at 13:00 UTC, for 60 minutes. Weekly exercise and EVA
occur only in complete orbital weeks. The final short week is closeout work and
rest, with no EVA or exercise block. The default contains 75 exercise blocks per
crew and 25 EVA events (13 group A, 12 group B), two participating crew each.

`evaStartHour` means **EVA start**, with preparation immediately before it. The
updated default is prep 14:00–15:00, EVA 15:00–19:00, recovery 19:00–20:00 on
relative day 3. The other group supports the whole block. An EVA block, including
preparation/recovery, must fit its orbital-relative day. The earlier 09:00 EVA
start crossed that day's noon boundary and is rejected. Meals overlapping EVA
or support are intentionally suppressed; there is no automatic make-up meal.
Sleep/meal/exercise conflicts, overlapping meals and EVA/sleep/exercise conflicts
are rejected.

Sleep is 22:00–06:00 by default. Meals remain at absolute UTC hours 08:00, 12:00,
19:00, including across the noon orbital boundary. Orbital work is science before
15:00 and maintenance thereafter within the configured work window; other awake
time is rest. Relative day 6 is light/rest. Sleep, meals, exercise and EVA take
precedence over ordinary work/rest. Schedules are compressed from minute states
and fully cover the requested in-mission range without gaps or overlap.

## Synthesis and overrides

Each 15-minute record synthesizes its fifteen integer start-of-minute samples:
an endpoint of 13:15 describes **[13:00, 13:15)**, minutes 13:00 through 13:14.
There is no row at zero or after completion. The last record ends at the exact
terminal minute and covers the preceding 15 minutes. Default output is **69,120
records** (17,280 per crew), sorted by endpoint and configured crew order.

Minute values combine a baseline, activity offset, linear trend per mission day
and bounded uniform seeded noise. Crew baseline overrides affect only that crew.
The seed is keyed by metric ID, crew ID and minute, so adding/reordering metrics
does not change existing signals. Mean metrics average minute values; sum metrics
sum them. For sum metrics the generator, offsets, baseline overrides, trend and
noise use **units per minute**, whereas declared min/max and CSV overrides use
**units per 15-minute record**. Minute values are clamped to the corresponding
bounds (divided by 15 for sums); final values are rounded and bounded.

For `activeOnly`, **all fifteen minutes must belong to permitted activities**;
otherwise the entire record is null. Any configured `settlingMinutes` are counted
from the latest activity transition; every contributing minute must be settled.
No partial window is scaled up, and no missing value becomes zero. `activityId`
is the dominant contributing activity, ties preferring the last contributing
activity. `activityMinutes` retains every activity's count.

Habitat metrics use one independent station timeline and seed. The station does
not exercise or perform EVA; it performs support during EVA blocks. A habitat
signal never depends on crew pair assignment or personal baseline. Its identical
value is copied to every crew record. CSV habitat overrides must use crew ID
`habitat`, and propagate to all records at that endpoint. All other overrides
change exactly one crew/metric/endpoint and do not affect subsequent random noise.

CSV header: `end_minute,crew_id,metric_id,value`. Only an empty value cell means
explicit null. Numeric zero remains zero. Unknown references, duplicate keys,
nonfinite/out-of-bounds numbers and non-15-minute timestamps are rejected. BOM,
CRLF, quoted fields and blank lines are supported; an empty file means no
overrides. CSV import has no small row/byte cap. The full default export has
**293,760 override rows**: (4 crew × 4 crew metrics + 1 habitat metric) × 17,280.
Serialization sorts a copy and preserves nulls. Fingerprints canonicalize object
keys and override order; they are cache/provenance IDs, not cryptographic proofs.

## Runtime assessment and clock

Monitoring reads only endpoints at or before `asOfMinute`. Baselines use the first
14 orbital days, capped at the clock. Recent observations use the last three
days. Pure activity windows are grouped by activity; each baseline activity mean
is weighted by that activity's recent sample count. Configured review activities
filter both windows. Exercise can never be compared against resting data.
Both windows must meet `minimumSamples`; any unmatched activity, invalid latest
eligible observation or stale dataset endpoint makes the comparison insufficient.
Some missing samples may coexist with a comparison when minimum sample counts
are satisfied and the latest eligible observation is valid; missing counts remain
available in Monitoring output. Habitat is assessed once, without multiplying its
sample count by crew size. Its activity context is the station timeline.

Risk applies the configured absolute relative deviation, dividing by
`max(abs(baseline), 1e-9)`. The result is a unitless demo rule, not clinical risk.
Explanation reports exact structured evidence and limitations. The exported
Simulation helper holds available recent means constant for up to 30 days;
optional bounded targets are independent assumptions and never imply medical
effects. Unavailable references remain null. The application may use its own
separate scenario plan helper. `assessMission` returns findings plus all four
runtime audits.

`initialClock(speed = 60)` is ready at minute zero. `sanitizeClock(value, total)`
restores running clocks as paused, clamps elapsed time and marks completion only
at the exact duration. `advanceClock(clock, deltaMinute, total)` advances running
clocks only; its delta is **already simulated minutes** (caller applies speed).
Negative/nonfinite deltas do not advance. Completion is exact and terminal.

## Owned-file verification

Run `npm test -- tests/mission-domain.test.ts` for config, full schedule, aggregation,
seed/noise stability, extensibility, overrides, full CSV round trip, missingness,
activity matching, future exclusion, agent stages and clock boundaries. Repository
checks remain `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
Project-level build logs belong to the coordinating task; this module deliberately
does not modify files outside its assigned ownership.
