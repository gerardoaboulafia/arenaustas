# Implementation decision log

## 180-day revision — November 14, 2026

- Implement the user's new 180-day plan locally; this supersedes the active product's original days-120–149 fixture. Preserve that fixture and its canonical regression tests.
- Timeline: outbound 36h + orbital 176d + return 60h = 180d. Day 0 launches and D180 00:00 completes. Orbital weeks are relative to orbit entry, with 25 full weeks and one closeout day.
- Schedule drives synthetic readings. Minute samples aggregate to 15-minute endpoint records; activity rates sum and continuous signals average. Seed streams are stable by metric/crew/time, so adding an indicator does not reshuffle existing values.
- JSON metric registry and long-format CSV overrides replace fixed UI metric keys. Unknown or invalid input is rejected before replacing the running dataset; missing values stay null. Shared habitat is one signal.
- Same-origin public data fetch is required for editable runtime sources. No external health/backend call is introduced. The local production server reads only two explicitly allowlisted public files live; a portable hosted static build uses its copied public assets.
- Reuse installed Recharts for overlaid series, Brush zoom, shared tooltips and explicit visibility controls. The user's request was for Plotly-like interaction; no second chart library or extra dependency is required.
- Persist browser edits and playback with a dataset fingerprint. Restore playback paused and freeze when hidden. History inspection uses an independent day cursor. Data edits reset incompatible simulation history.
- Default EVA starts at 15:00 UTC after 14:00 preparation, to fit within the noon-to-noon orbital day. Routine meals can be superseded during the EVA/support block. Other schedule collisions are rejected.
- Activity-matched synthetic review rules replace the original daily fixed thresholds in the active product. New indicators without rules are explicitly unclassified. Scenario targets are independent assumptions without causal health effects.
- Original SVG position uses the same elapsed clock and discloses AI assistance. Reduced-motion styling and nonvisual exact-data alternatives remain available.

## Original implementation decisions

| UTC | Decision | Reason | Alternative | Risk |
|---|---|---|---|---|
| pre-build | Typescript/Next.js/local synthetic fixtures by default | deliver polished reliable app fast | microservices + live sensors | not clinically representative |
| 2026-11-14 UTC / Nov 13 Buenos Aires | User explicitly directed immediate implementation | Later user instruction after timing refusal | Wait for event start | Human organizer review required; no backdating or eligibility claim |
| same session | Build in repository root; Next.js static export | User explicitly requested this folder; portable no-key release | Separate Sites project or mandatory cloud backend | No public hosting performed |
| same session | Actual CSV parsed at build time; serialized rows in client | Preserve canonical fixture with no runtime fetch | Hand-copied or regenerated telemetry | Invalid fixture fails build |
| same session | Metric summaries and nullable scenario output extend docs/05 | Missing baselines and inadequate recent data need explicit unknown values | Invent fallback measurements | No reassuring status on insufficient data |
| same session | Evaluate baseline only through selected day; calendar rolling windows | Prevent future-data leakage in replay | Always use all 14 future baseline samples | Early mission correctly shows insufficient/limited data |
| same session | Exercise delta is actual capped plan difference | Keep arrays and displayed total consistent at 180 min/day cap | Report requested addition even if unrealizable | Fixture canonical +15 still equals 450 min |
| same session | Review actions use component state | No personal information, accounts or false notifications | Persistent clinical workflow | Session-only and resettable, clearly labeled |
| same session | NASA curated metadata and deterministic templates | Bounded claims with source allowlist | Live NASA API/LLM dependency | Resource listing remains unknown |
| same session | CUA browser test unavailable; jsdom + HTTP smoke | Browser host unavailable; Edge control denied | Claim unexecuted visual QA | Manual mobile/desktop browser inspection remains |
