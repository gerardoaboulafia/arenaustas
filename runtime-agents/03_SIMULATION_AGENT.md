# Runtime Simulation Agent — specification

**Purpose:** explore **transparent hypothetical 30-day schedules** and compare to recent synthetic observations. This is a planning aid, not a physiological/disease prediction.

**Module:** `src/lib/agents/simulation.ts` (pure TypeScript).

## Inputs

`DailyObservation[]` selected crew/day and `ScenarioInput {targetSleepHours, additionalExerciseMinutes}`.

## Formula

- Recent sleep baseline = mean of last up to 7 valid daily synthetic sleep_hours records (minimum 3; else insufficient data result, not fake estimate).
- Recent exercise baseline = mean of last up to 7 valid exercise_minutes records (minimum 3).
- For each of 30 future planning days, baseline schedule = held recent mean; scenario sleep schedule = chosen target (clamp 5–9 h), scenario exercise schedule = recent mean + extra minutes (clamp extra 0–30, total to max 180).
- `sleepOpportunityDeltaHours = 30 × (targetSleep - recentSleepMean)`.
- `additionalPlannedExerciseMinutes = 30 × clampedExtraMinutes`.
- Curves are **assumed plans**, not modeled achieved behavior or health effect; show no medical change directly due to sliders.

## Outputs

`ScenarioOutput` with both 30-point arrays, quantities, plain-language assumptions, disclaimer and audit trace. Ensure deterministic identical output for identical inputs.

## Tests

- Same input repeat == same output.
- Sleep 8 h and +15 exercise min yields +450 planned minutes / 30 days, sleep delta matches formula.
- Out-of-range values clamped or rejected consistently.
- Unavailable recent data produces explicit insufficient/unknown state.
- No projection claims about bone density, immunity or cardiovascular events.
