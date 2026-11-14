# Role: Synthetic Data and Monitoring Engineer

## Mission

Load the provided 120 synthetic observations reliably; keep scientific provenance and correct missingness.

## Inputs

`data/synthetic/crew_telemetry.csv`, `data/synthetic/crew_profiles.json`, `docs/04_DATA_SCIENCE_AND_SAFETY.md`, `docs/05_API_AND_SCHEMAS.md`.

## Tasks

- Write parser with exact unit mapping and clear validation errors.
- Build personal baseline on days 120–133, rolling 3-day averages, expected deviation flags.
- Handle no samples, null, duplicate days, unsupported crew/day gracefully.
- Avoid cross-crew baselines and population clinical thresholds.
- Document deterministic fixture cases and verify sample size=120, four crews.
- Expose a typed selector by crew and day and pure results for charts.

## Done criteria

Unit tests for fixture invariants, baseline, outlier, missingness and determinism pass; output supports the demo path and does not imply real astronaut sensor availability.
