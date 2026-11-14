# NASA sources and research acquisition plan

These are **verified NASA resource starting points** (checked Nov 13, 2026). They are **NOT yet confirmed as included in the challenge-specific Resources tab**. Before asserting Global Award eligibility, Codex/the team must inspect https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/ and use a source listed there.

## Core primary sources

1. **2026 challenge description (official).** https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/ — use to align product features with monitoring, evaluation and action.
2. **NASA Human Research Roadmap — Evidence collection.** https://humanresearchroadmap.nasa.gov/evidence/ — authoritative overview of risk evidence, including 'Risk of Performance Decrements and Adverse Health Outcomes Resulting from Sleep Loss, Circadian Desynchronization, and Work Overload', bone risk and cardiovascular risks. Use as *contextual risk taxonomy*, not algorithm calibration.
3. **NASA Human System Risks.** https://www.nasa.gov/hhp/human-system-risks/ — risk categories: sleep, altered cardiovascular function, muscle/bone health, radiation and cabin CO2. Use as source evidence for problems addressed.
4. **NASA Risks of Human Spaceflight.** https://www.nasa.gov/hrp/risks/ — NASA discusses physiological impacts of spaceflight and exercise countermeasures; avoid inventing countermeasure effect sizes.
5. **NASA Open Science Data Repository (OSDR).** https://science.nasa.gov/biological-physical/data/osdr/ — overview of life-science spaceflight data; includes omics, physiological, behavioral, environmental and more. **Important:** most astronaut private/raw data are not openly released.
6. **NASA OSDR Public API.** https://api.nasa.gov/ — describes metadata/search/data-file APIs. Public dataset search endpoint: https://osdr.nasa.gov/osdr/data/search . Consult live API docs for request syntax and access before building an adapter. Do not assume endpoint semantics from this plan alone.
7. **NASA OSDR Visualization Portal.** https://visualization.osdr.nasa.gov/ — includes environmental telemetry visualizations and biology tools, potentially useful for evidence discovery.
8. **NASA OSDR FAQ.** https://science.nasa.gov/reference/osdr-faq/ — explains public data availability and controlled human sequence data.

## How to integrate a real NASA resource during P4

1. Visit official challenge page -> Resources tab; list NASA resource URLs and choose one matching ASTRA's sleep/exercise/spaceflight risk context.
2. Save a true research record (metadata/summary/observation) from that NASA resource, not made-up values. Prefer an open OSDR study metadata record with an actual accession if appropriate; alternatively use a relevant official HRP resource if listed for the challenge.
3. Log exact source title, URL, accession if any, retrieved date, license/usage caveats, mapping to UI and `is_challenge_listed` result in `data/nasa/source_manifest.json`.
4. Create an in-app NASA Evidence panel or linked risk card that **actually consumes** the curated record. Avoid calling citation-only usage 'model validation'.
5. Keep full synthetic demo separate; on-page label 'Research evidence' vs 'Simulation observations'.
6. Add URL and resource usage description to the official submission form. If the chosen source is not on the Resources list, pick a listed one or explicitly flag review.

## Suggested NASA evidence card (not a data record)

Title: Sleep and circadian disruption in space missions  
Source: NASA Human Research Roadmap / Evidence  
Used for: Selecting sleep-related risk domain and explaining why sleep trends matter.  
Not used for: Deriving ASTRA's demo-only 1-hour drop rule, forecasting human outcomes or clinical diagnosis.

## Research audit table (Codex completes)

| Source | Challenge-listed? | Exact asset used | Data recorded locally? | In-app location | Verified by/date |
|---|---|---|---|---|---|
| NASA HRR Evidence | unverified | risk category context | planned | /about/science | TBD |
| NASA OSDR | unverified | selected study metadata | planned | /about/science | TBD |

### Scientific caution

Human-specific data availability varies; animal/omics data cannot be directly applied as individual astronaut wearable baselines. Never substitute unverified figures for a source's measurements. Mark studies/metadata only where actual records were accessed.
