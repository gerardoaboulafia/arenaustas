# Runtime Monitoring Agent — specification

**Purpose:** observe synthetic daily health signals and calculate reproducible deviations relative to a fictional individual's early-mission baseline.

**Module to implement:** `src/lib/agents/monitoring.ts` (pure TypeScript, no LLM dependency).

## Inputs

`DailyObservation[]`, `CrewId`, missionDay 120–149. The values in the CSV are synthetic and **not** clinical readings.

## Computation

1. Filter allowed crew ID and all observations `day <= missionDay`.
2. For each metric except radiation proxy, calculate the mean of valid days 120–133 (requires 10+ records). If insufficient, return quality status and no deviation assessment.
3. Compute the last 3 eligible calendar-day readings; requires at least 2 valid records.
4. Compare the recent mean to baseline using rules in `docs/04_DATA_SCIENCE_AND_SAFETY.md`.
5. Determine persistence over at least 2 of the most recent 3 calendar days by evaluating daily departures from baseline using the same threshold; return stable reason codes.
6. Emit `Deviation[]` with baseline, observed mean, unit, available days, quality and rule ID; emit an `AgentTrace` for transparency.

## Constraints

Never use group-average baseline as though individualized, interpolate unseen observations without labeling, or say clinical risk has been measured. Treat elevated CO2 as a habitat observation and radiation_proxy_index as fictional illustrative context only.

## Acceptance tests

Maya day149: persistent lower sleep and HRV. Eli day149: no notable deviations. Sofia during days138–142: environmental context observation. Missing recent metric -> report insufficient quality.

## Handoff

Send typed deviations and metric-level quality to Risk Assessment; no free-text medical directions.
