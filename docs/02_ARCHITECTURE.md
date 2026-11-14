# 02 — Technical architecture

## One application, no compulsory services

**Recommended:** Next.js App Router + React + TypeScript + Tailwind CSS + Recharts + Lucide; native SVG/CSS for decorations. Pure domain logic with Vitest and smoke tests. Static fixtures in `data/synthetic/`; imported at build time through typed adapters or served as a static JSON generated from CSV. No DB or server API is required for the critical path.

```text
[CSV synthetic data] --> [Parsing and validation] --> [Per-crew day snapshots]
                                                  |
                                                  v
[UI /mission + /crew] <-- [Risk findings] <-- [Monitoring Agent]
                               |                  |
                               |            [Risk Assessment Agent]
                               v
                    [Explanation Agent] ---> [Findings / citations / audit]
                               ^
                               |
                       [Simulation Agent] <--- [Scenario sliders]
                               |
                           [30-day outlook]

[NASA curated sources + evidence records] --> [/about/science + evidence cards]
```

## Suggested source tree (Codex creates this during event)

```text
src/
  app/
    page.tsx
    mission/page.tsx
    mission/crew/[id]/page.tsx
    mission/scenarios/page.tsx
    about/science/page.tsx
    layout.tsx
  components/
    landing/ Hero.tsx HowItWorks.tsx SciencePreview.tsx
    mission/ MissionHeader.tsx CrewGrid.tsx TelemetryChart.tsx
    mission/ RiskFindingCard.tsx TimelinePlayer.tsx
    scenarios/ ScenarioControls.tsx OutlookChart.tsx
    common/ DataProvenanceTag.tsx Disclaimer.tsx
  lib/
    data/ parseTelemetry.ts syntheticRepository.ts nasaSources.ts
    agents/ monitoring.ts riskAssessment.ts simulation.ts explanation.ts orchestrator.ts
    models/ baselines.ts trend.ts risk.ts scenario.ts
    types/ telemetry.ts agents.ts science.ts
  styles/
  test/
public/
  app-icon.svg (original, non-NASA)
```

Keep domain functions framework-independent. Frontend consumes a single `getMissionView(crewId, missionDay, scenario)` use-case (pure composition) with outputs specified in `docs/05_API_AND_SCHEMAS.md`.

## Four runtime agents (functional separation, not four expensive LLM calls)

1. **MonitoringAgent:** parse and quality-check observations; compare against personalized first-14-valid-day baseline, compute rolling summaries, emit deviations.
2. **RiskAssessmentAgent:** combine reproducible deviations into workflow findings (`none`, `observe`, `review`, `insufficient_data`) and list exact contributing values and rules.
3. **SimulationAgent:** deterministically extrapolate illustrative *habit/telemetry proxy* series to 30 days; compare baseline and user-selected assumptions, no causal medical outcomes.
4. **ExplanationAgent:** format structured, source-linked summary templates; use only evidence IDs from verified research records; produce safe review steps rather than treatment orders.

For detailed per-agent handoffs, read `runtime-agents/01_MONITORING_AGENT.md` through `runtime-agents/04_EXPLANATION_AGENT.md`. The agents run locally in sequence or pure functions; expose intermediate inputs/outputs in the UI via a 'How this insight was produced' accordion. Their autonomy means specialized processing and handoff, not unsupervised medical acts.

## State / rendering

- Client components for timeline, selected astronaut, interactive charts, sliders and acknowledgements.
- All content works offline after initial app load except optional external source links; deterministic data included in bundle.
- App root and science page can be server components.
- If using localStorage for acknowledgement, it must be clearly labeled 'this browser only' and resettable.
- Avoid SSR hydration mismatch: no `Math.random()` or `Date.now()` in displayed scenario logic. Source fixtures use fixed mission-day integers.

## Minimal security / resilience

- No real health data; no analytics SDK by default; no personal account data.
- Never expose API keys through `NEXT_PUBLIC_...`; optional LLM route must be server-side with rate limit and a non-LLM fallback.
- Validate input parameters, use a safe allowlist of astronaut IDs, clamp ranges and sanitize displayed content.
- Unsupported data must not be silently replaced with fabricated readings.

## Performance budgets

Landing initially usable in <= 3 sec on a typical laptop broadband connection (aspirational), primary interaction under 100ms on synthetic fixture, no > 500KB proprietary image assets, charts lazy-loaded if necessary, no unnecessary WebGL.

## Deployment

Static-first deployment compatible with Vercel or similar Next.js host. Document `npm install`, `npm run dev`, `npm run build`, and environment-free demo path. For GitHub Pages use an explicit static-export configuration only if chosen; avoid untested assumptions. Public preview must be unauthenticated.
