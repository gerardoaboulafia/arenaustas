# 06 — Autonomous implementation backlog and 48-hour schedule

**Rule:** Complete milestones in order. Make a functioning app before optional polish. Each milestone has a gate with objective evidence.

| ID | Priority | Scope | Primary Codex playbook | Gate |
|---|---|---|---|---|
| P0 | Critical | Toolchain, create app, fixture parsing, app shell, repo hygiene | `agents/01_ARCHITECT.md` | `/` and `/mission` render; no missing key |
| P1 | Critical | Monitoring + risk engine, unit tests, stable fixture outcomes | `agents/03_DATA_ENGINEER.md`, `agents/04_RUNTIME_AGENTS.md` | deterministic results against fixture; clean missingness behavior |
| P2 | Critical | Landing and dashboard, crew detail, day replay | `agents/02_FRONTEND_UX.md` | complete 60-sec manual walkthrough works |
| P3 | Critical | Scenario simulator + explanation + trace | `agents/04_RUNTIME_AGENTS.md` | sliders change output; claims stay bounded |
| P4 | Critical | NASA resource source audit / science page / citation display | `agents/05_NASA_RESEARCH.md` | verified NASA resource in UI with provenance; challenge-list verification recorded |
| P5 | Critical | Quality, mobile, accessibility, build, smoke & edge cases | `agents/06_QA_SAFETY.md` | tests pass; no blocking defects |
| P6 | Critical | Deployment and public preview, if credentials/access exist | `agents/08_RELEASE.md` | anonymous public links validated (or blocker logged) |
| P7 | Critical | Short video OR 7-slide deck, final submission copy, disclosures | `agents/07_DEMO_STORY.md`, `agents/08_RELEASE.md` | complete submission pack ready; human submits |

## Detailed P0 tasks (~first 3 hours)

- [ ] Read full pack, inspect directory, start `docs/BUILD_LOG.md`.
- [ ] Confirm official start time for the registered event and do not write app code before it.
- [ ] Create Next.js TypeScript App Router project inside this folder; preserve docs, PDF, CSV.
- [ ] Add Tailwind and minimal CSS design tokens. Add package scripts: `dev`, `build`, `lint`, `typecheck`, `test`, and `test:e2e` if available.
- [ ] Define typed records and parser, import fixture, validate counts and missingness.
- [ ] Add `/`, `/mission`, `/mission/crew/[id]`, `/mission/scenarios`, `/about/science` placeholders with working navigation.
- [ ] Gate: dev server starts and test validates fixture contains four crew × thirty days.

## P1 tasks (~hours 3–8)

- [ ] Write baseline estimator first-14 days and 3-day rolling mean.
- [ ] Write independent MonitoringAgent, RiskAssessmentAgent, ExplanationAgent, SimulationAgent pure modules.
- [ ] Test baseline logic, persistent vs transient deviation, insufficient data, deterministic scenario, values clamped.
- [ ] Run fixture validation and expected review cases in `qa/ACCEPTANCE_TESTS.md`.
- [ ] Gate: no need for an LLM key, outputs are reproducible across runs.

## P2 tasks (~hours 8–18)

- [ ] Build production-quality landing with English copy, independent iconography, clear CTA.
- [ ] Dashboard with 4 crew, day timeline, selected member, key indicators and charts.
- [ ] Risk card shows comparison and 'Review findings' action, accordion trace.
- [ ] Responsive mobile layout, keyboard navigation and reduced motion.
- [ ] Gate: complete first path in `qa/DEMO_WALKTHROUGH.md` with no dead controls.

## P3 tasks (~hours 18–24)

- [ ] Add scenario controls; update 30-day assumed sleep/exercise plan in real time.
- [ ] Distinguish scenario assumptions from medical improvement, show caveat prominently.
- [ ] Trace pipeline by agent, source/reason code and structured explanation.
- [ ] Gate: reset restores initial state, output matches pure-function tests.

## P4 tasks (~hours 24–28)

- [ ] Read `research/NASA_SOURCES.md` and challenge Resources tab.
- [ ] Pick at least one challenge-listed NASA resource if possible; create raw/normalized metadata and register accession/link/retrieval.
- [ ] Science page: exactly what source informs, what is simulated, caveats and references.
- [ ] Check all URLs. Do not fabricate unavailable studies or citations.

## P5 tasks (~hours 28–36)

- [ ] Test desktop + mobile, keyboard, hydration, edge inputs and empty states.
- [ ] Run lint, typecheck, unit tests, prod build, e2e smoke if feasible.
- [ ] Eliminate broken links and visual overflow. Protect demo from runtime errors.
- [ ] Update test report with actual commands and exact results.

## P6 and P7 (~hours 36–48)

- [ ] Deploy early to avoid last-minute DNS/account delays; verify public link from logged-out browser.
- [ ] Record 30s max demo, OR create ≤7 English-language slides and host publicly; include NASA resource on demo.
- [ ] Finalize `submission/SUBMISSION_COPY.md`, source register and AI use details, screenshot/photo provenance.
- [ ] Check all mandatory fields, eligibility, team members, source requirements, English language, disclosure, terms and originality.
- [ ] Human responsible for final `Submit for Judging` action before deadline; check successful banner.

## Hard cutoff strategy

At T–12 hours: freeze feature scope. At T–6 hours: freeze design except bugfixes, begin capture and links. At T–2 hours: verify all public links and submit rather than polishing. These are recommended buffers, not organizer deadlines.

## If time gets tight, cut in this order

1. Decorative 3D, animation, fancy backgrounds.
2. Optional live NASA API polling / remote LLM; rely on verified cached metadata and deterministic logic.
3. Complex physiological projection beyond scheduled sleep/exercise exposures.
4. Advanced multi-crew comparison or alert persistence.

**Never cut:** landing, app, functioning demo flow, NASA-source provenance, safety labels, testable core, public demo link.
