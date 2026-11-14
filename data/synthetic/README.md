# Synthetic crew telemetry — NOT NASA or real astronaut data

- `crew_telemetry.csv`: 4 fictional crew members × 30 days = 120 rows, mission days 120–149, with fixed-seed realistic-looking **invented** numbers. Unit headers are in `docs/05_API_AND_SCHEMAS.md`.
- `crew_profiles.json`: fictional names and roles. Do not infer actual NASA crew or use real portrait images.
- Fixture narrative: Maya's sleep and HRV decline late; Eli remains stable; Sofia has a temporary cabin CO2 anomaly; Noah reduces exercise duration late in the mission. These are deliberately constructed to exercise UI logic.
- Values are **not** sourced from NASA, not clinical data, and not intended for medical thresholds or model calibration.
- `radiation_proxy_index` is a fabricated unitless indicator for optional ambient context; **not** dose (mSv or Gy). Do not include in health risk calculation for MVP.
- Fixed data generated with seed=20261114 via an AI-assisted Python fixture-generation script for reproducibility; record this in AI/data provenance disclosures. The 14-day first-window baseline should be computed fresh by app code, not prefilled with authoritative-looking scores.
