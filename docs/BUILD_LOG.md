# Build log

## 2026-11-14 — editable 180-day mission

Implemented locally on branch `astra` at the user's request. At implementation handoff, no new commit or push had been performed. The user subsequently authorized committing and pushing this revision to the existing `astra` branch only; `main` is excluded from the push. No hosted deployment or official submission is part of this delivery.

| Milestone | Status | Files / behavior | Evidence |
|---|---|---|---|
| Schedule | Complete | `src/lib/mission/schedule.ts`, editable public config; exact 36h / 176d / 60h phases, three exercise days, 25 alternating-pair EVAs and closeout | Domain tests cover boundaries, rotation, duration and gap-free activities |
| Data pipeline | Complete | Generic metric registry, seeded minute synthesis, 15-minute means/totals, shared habitat, strict JSON/CSV validation and overrides | 69,120 records; CSV full-fixture round-trip; added metric and profile/seed changes tested |
| Runtime | Complete | Provider, local sources, persisted clock keyed to input fingerprint, history cursor, speed/pause/reset/completion | Eight runtime/scenario tests; no future data; reload restores paused |
| Product | Complete automated gate | Central crew comparison, filters/zoom/table, activity tracks, full schedule, SVG position, editable data route, generic scenarios, updated landing/science | Thirteen dashboard tests plus legacy regression suite |
| QA / local release | Automated checks complete | Typecheck, lint, 143 tests, production build, 9-route HTTP smoke with public data endpoints | Browser host still unavailable; visual desktop/mobile inspection not claimed |

Sources: `public/mission-data/config.json`, `public/mission-data/overrides.csv`. Local production server reads these allowlisted files directly, so reload applies edits without rebuilding. Original fixture and supplied PDF are preserved. Usage and data semantics are documented in `EDITABLE_MISSION.md`; current results in `TEST_REPORT.md`.

## Original implementation history

Implementation began 2026-11-13 America/Buenos_Aires after the user explicitly repeated the instruction to build immediately. See `IMPLEMENTATION_STATUS.md`; competition timing compliance requires organizer review.

| UTC | Milestone | Status | Implemented | Test result | Remaining |
|---|---|---|---|---|---|
| pre-build | Planning/handoff kit assembled | ready | docs, role playbooks, synthetic demo fixture | kit checks only | app implementation P0–P7 |
| 2026-11-14 UTC (Nov 13 local) | P0 | implemented | package/configuration, app shell, all route scaffolds, fixture parser/repository | first production build: all routes generated | final validation after integration |
| same session | P1 | complete | src/lib types, data, metrics, four agents, orchestrator; tests/domain.test.ts | 40 domain cases pass; canonical fixture outcomes confirmed | none in deterministic core scope |
| same session | P2 | implemented | landing, mission control, crew detail, timeline, exact-reading table, metric tabs | landing/crew links, timeline, review actions tested in jsdom; production HTTP routes pass | visual desktop/mobile inspection blocked by browser permissions |
| same session | P3 | complete automated gate | scenario controls, plan charts, deterministic explanations, four-stage trace | 8 component tests pass, including sliders/reset and trace; 48 total tests pass | browser chart rendering unverified |
| same session | P4 | implemented | NASA curated evidence, science page, source manifest | official NASA sources verified by research audit | challenge Resources eligibility unverified |
| same session | P5 | automated QA passed; visual QA blocked | 48 tests, typecheck, lint, production build, scripts/smoke.mjs, CI workflow | all required automated checks pass; production audit zero vulnerabilities | browser host unavailable and Edge access denied; 7 moderate dev-tool advisories remain |
| same session | P6 | local release packaged; external deployment pending | static out/, release/astra-static.zip, production preview server, deployment recipe | 8 routes + 2 expected 404s + 12 assets pass HTTP smoke | no public host/account action; anonymous public test pending |
| same session | P7 | local submission pack complete | English form copy, 7-slide outline, 28-second script, source register, AI disclosure, checklist | source-document/JSON/links audit completed | human team fields, media capture/export, hosting, eligibility review and Submit for Judging |

Final release is buildable and runnable in this directory. Original CSV and supplied PDF hashes match the planning package. No external publication or official submission has occurred. Full evidence and limitations: `TEST_REPORT.md`; human handoff: `RELEASE_HANDOFF.md`.
