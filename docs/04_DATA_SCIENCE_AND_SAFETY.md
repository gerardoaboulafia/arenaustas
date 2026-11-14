# 04 — Data, models, validity, safety and ethics

## Hard truth

**ASTRA is an educational research demonstration, not a medical device, diagnostic system, or validated digital twin of human physiology.** Its 'digital twin' is a longitudinal **digital representation of an invented astronaut profile**. Do not claim that charts forecast bone density, immune decline, cardiovascular events or the effectiveness of therapies. The challenge invites proactive monitoring; our scientific validity comes from transparent scope and traceable NASA resources, not from overclaiming.

## Data inventory

| Asset | Origin | How used | Allowed claim |
| --- | --- | --- | --- |
| `data/synthetic/crew_telemetry.csv` | Seeded fictional generation | Demo trends, baselines, flags, comparison | 'Illustrative synthetic readings' |
| `data/synthetic/crew_profiles.json` | Fictional characters | Crew selector and profile baseline context | 'Fictional crew' |
| `research/NASA_SOURCES.md` | NASA sites reviewed for project | Risk taxonomy, contextual cards, source links | 'NASA research informed our risk categories' |
| NASA resource fetched by Codex | Must verify against challenge-specific resource list | Evidence/metadata that is actually shown in UI | Source provenance with URL, accession, retrieval date |

Never pool study-level omics results with individual daily telemetry as if measured on the same persons. Where available, NASA OSDR metadata can be an **evidence catalog** rather than bogus real-time astronaut data.

## Fixture assumptions and units

One observation per crew member per mission day (120–149 inclusive). Columns: crew_id, mission_day, sleep_hours (h), hrv_ms (ms), resting_hr_bpm (beats/min), exercise_minutes (min/day), cabin_co2_ppm (parts/million), radiation_proxy_index (dimensionless fictional). `radiation_proxy_index` is NOT radiation dose. All rates and values are demonstration-only; don't invent clinical thresholds.

## Monitoring methodology

- Use first 14 valid days (120–133) per crew member to build a personal baseline for each metric; if <10 valid readings, mark baseline insufficient.
- For each mission day, compute 3-day rolling mean from available recent daily records; if <2 valid readings, show insufficient data.
- Compare recent rolling mean to individual's baseline. Calculate `relative_change = (rolling_mean - baseline_mean)/max(abs(baseline_mean), epsilon)` for positive-valued signals; for sleep use absolute hour difference too.
- Fixed fixture-only rules for explaining a signal (not medical diagnosis): `sleep_hours` rolling mean <= baseline - 1.0h over 3 days, `hrv_ms` rolling mean <= 0.80× baseline, `resting_hr_bpm` rolling mean >= 1.12× baseline, `exercise_minutes` rolling mean <= 0.65× baseline. Treat `cabin_co2_ppm` elevation as **environment observation only** based on baseline × 1.4; do not infer toxicity or health outcomes.
- If a signal exceeds a rule on >=2 days in a 3-day window, mark a *persistent deviation*; otherwise note as short-term fluctuation. Avoid false precision when days are missing.
- Do not use population-wide clinical ranges for alarms.

## Risk Assessment (workflow prioritization, not probability)

Count distinct persistent **health-related** deviations: 0 -> `normal`; 1 -> `observe`; >=2 -> `review`. If inadequate data -> `insufficient_data` supersedes apparent normality. An environmental-only deviation can create `observe` with 'Habitat context' tag but must not assert clinical harm. Display reason codes and contributing metric values. The number is a **signal count**, not mortality probability, disease probability or NASA-grade risk score.

## Scenario model (P1)

User controls target sleep hours `5.0–9.0` and additional exercise minutes `0–30` in increments; each represents a hypothetical **behavioral plan**, not a physiological intervention with a validated effect. Show for days 1–30:

- Baseline sleep-plan line = mean of last 7 *observed demo* sleep hours, held constant (or linearly trending under strictly documented bound); scenario sleep-plan line = user-chosen constant target. Label 'assumed schedule', not predicted actual sleep.
- Baseline exercise-plan line = mean last 7 observed minutes, scenario = baseline + selected additional minutes (clamp 0–180), held constant.
- Display 'Sleep opportunity delta across 30 days' = 30 × (target sleep - baseline sleep) **hours of planned opportunity**. Display 'Exercise plan delta over 30 days' = 30 × added minutes. Do not call these gains or medical benefits.
- Optional illustrative trend extension for HRV only if visibly labeled 'linear statistical extrapolation (unvalidated)', bounded to plausible demonstration values and never modified by sleep/exercise slider without a cited, calibrated model. Prefer avoiding HRV forward projection altogether.
- Uncertainty annotation: 'Actual adherence, health outcomes and benefit are unknown; this is a planning comparison, not efficacy prediction.'

## ExplanationAgent rules

Output template:

> Over the last 3 mission days, [metric] was [value] compared with [baseline] during baseline days 120–133. This exceeds ASTRA's **illustrative personalized deviation rule** ([rule]). Consider reviewing the measurement quality, relevant activity and sleep log, and discussing the trend with the crew medical officer. This is not a diagnosis.

For source-linked context: distinguish 'NASA identifies sleep loss as a spaceflight risk' from 'NASA validated this particular user threshold' (it did not).

## Safety guardrails

- No medical diagnosis, prescription, medication dosing, radiation evacuation directives, exercise regimen for an individual or emergency-care protocols.
- No ungrounded claims that additional exercise restores bone density or that more sleep reverses immune dysfunction.
- No use of image/voice analysis or psychological inference; privacy by default, no live patient data.
- Clear labels for simulated vs NASA sourced data **on every chart**.
- Never report an uncalibrated 0–100 risk 'percentage'; optional severity indicator is a nonclinical workflow category.
- No generated branding that resembles NASA insignia.
- Evidence IDs/URLs are drawn from vetted source manifests only; don't hallucinate citations.

## Science checklist

- [ ] All input variables have units; source labels visible.
- [ ] No clinical thresholds or causal model coefficients without evidence.
- [ ] Missing data changes quality display and findings.
- [ ] All 'forecast' labels are qualified; opportunity scenarios != real physiological outcomes.
- [ ] NASA information and simulated individual data are not conflated.
- [ ] Each scientific statement has a clickable supporting research source.
- [ ] Team manually reviews final claims before upload.
