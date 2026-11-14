# Implementation decision log

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
