# ASTRA final source and asset register

Research snapshot: **2026-11-14 UTC / 2026-11-13 Buenos Aires**. Exact source retrieval time: **2026-11-14T01:22:21Z**. This register attributes the completed local implementation and submission package. Final automated results: 48 passing tests, typecheck, lint, production build and HTTP smoke. See [TEST_REPORT.md](../docs/TEST_REPORT.md) for actual evidence and browser limits. Human eligibility review and public release remain separate.

## NASA research records

| ID | Title / provider | Verified URL | Exact local use | Challenge-listed |
| --- | --- | --- | --- | --- |
| nasa-sleep | Risk of Performance Decrements and Adverse Health Outcomes Resulting from Sleep Loss, Circadian Desynchronization, and Work Overload / NASA Human Health and Performance | [Primary article](https://www.nasa.gov/directorates/esdmd/hhp/risk-of-performance-decrements-and-adverse-health-outcomes-resulting-from-sleep-loss-circadian-desynchronization-and-work-overload/) | Curated sleep-context summary and citation for science/finding evidence | Unknown (null) |
| nasa-human-risks | Human System Risks / NASA Human Health and Performance | [Primary catalog](https://www.nasa.gov/hhp/human-system-risks/) | Curated risk-domain context and citation | Unknown (null) |
| nasa-spaceflight | Risks of Human Spaceflight / NASA Human Research Program | [Primary overview](https://www.nasa.gov/hrp/risks/) | Curated mission and sleep/fitness context and citation | Unknown (null) |

All three primary pages were opened and their relevant text reviewed. Locally stored assets are attributed metadata and AI-assisted ASTRA paraphrases in [curated_evidence.json](../data/nasa/curated_evidence.json), with scope in [source_manifest.json](../data/nasa/source_manifest.json). They are not NASA-authored summaries, raw research datasets or full-page archives. The source URLs identify web resources; there are no study accessions.

**Integration verified in source:** the science page imports/maps the catalog; mission and scenario components pass it into the orchestrator; the explanation module resolves exact catalog IDs and formats attributed context. Files inspected: `src/app/about/science/page.tsx`, `src/components/mission.tsx`, `src/components/scenarios.tsx`, `src/lib/agents/orchestrator.ts` and `src/lib/agents/explanation.ts`. Browser rendering and production execution remain separate release checks.

**Scientific boundary:** no real astronaut readings, model training, validated risk thresholds or causal medical coefficients were imported. No OSDR study is claimed. NASA source use is contextual, not validation of the prototype.

## Challenge and submission references

| ID | Reference | What was actually verified / used |
| --- | --- | --- |
| C01 | [2026 health monitoring challenge](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/) | Official indexed title and brief; direct page retrieval failed. Used for challenge identification. |
| C02 | [Challenge Resources tab](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/?tab=resources) | Attempted but inaccessible. No listed source URL was verified. |
| C03 | [Supplied 16-page Project Submission Guide](../source_documents/NASA_Space_Apps_Challenge_2026_Submission_Guide.pdf) | Independently extracted using pypdf; pages 2-3 and 5-13 inform timing, fields, demo limits and disclosures. Original preserved. |
| C04 | [Human Research Roadmap evidence index](https://humanresearchroadmap.nasa.gov/evidence/) | Read as a taxonomy cross-check; no individual report downloaded or study imported. |
| C05 | [NASA Space Apps discussion 1772](https://github.com/nasa/spaceapps/discussions/1772) | Reports Resources availability issues; community context, not an accepted source list. |
| C06 | [NASA Space Apps organizer answer, discussion 1827](https://github.com/nasa/spaceapps/discussions/1827) | Paula-GO-Team's November 5 answer states the build-window restriction and challenge-listed NASA-resource requirement. Used for human eligibility review. |
| C07 | [NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) | Attribution, no implied endorsement and distinction between original NASA sources and AI-generated outputs. No NASA media downloaded. |

C03 SHA-256: `0038f842fc3680bab831fb8fb968d64e4cb702642f2203ac2936d71b00354761`. Its [online counterpart](https://www.spaceappschallenge.org/resources/project-submission-guide/) could not be compared directly. See [VERIFICATION.md](../research/VERIFICATION.md) for retrieval failures and exact scope.

## Software and licenses

Names were checked against the actual package manifest and lockfile, not just the planning brief. The final committed lockfile is authoritative for resolved versions. Upstream license texts for the seven main components were opened during this audit; retain the notices supplied with installed packages.

| Component | Role | License / primary attribution |
| --- | --- | --- |
| Next.js 16.4.6 | App Router, build-time rendering and static export to `out/` | MIT; [Vercel license](https://raw.githubusercontent.com/vercel/next.js/canary/license.md) |
| React / React DOM 19.3.1 | UI components and interactions | MIT; [Meta and contributors license](https://raw.githubusercontent.com/facebook/react/main/LICENSE) |
| TypeScript | Typed data contracts and agent modules | Apache-2.0; [Microsoft license](https://raw.githubusercontent.com/microsoft/TypeScript/main/LICENSE.txt) |
| Tailwind CSS 4 | Styling/build integration | MIT; [Tailwind Labs license](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/main/LICENSE) |
| Recharts 3.10.1 | Telemetry and scenario charts | MIT; [Recharts contributors license](https://raw.githubusercontent.com/recharts/recharts/main/LICENSE) |
| lucide-react | Interface icons, including the Orbit brand symbol | ISC; [Lucide license](https://raw.githubusercontent.com/lucide-icons/lucide/main/LICENSE), with MIT notices for Feather-derived icons |
| Vitest | Deterministic module, fixture and component testing | MIT; [Vitest contributors license](https://raw.githubusercontent.com/vitest-dev/vitest/main/LICENSE) |
| React Testing Library / jsdom | Component interaction tests and DOM test environment | Testing Library and jsdom contributors; retain the notices bundled with the installed packages |
| ESLint / eslint-config-next | Static code checks | MIT as recorded in the inspected lockfile; preserve distributed notices |
| @tailwindcss/postcss | CSS build adapter | MIT as recorded in the inspected lockfile |
| @types/node, @types/react, @types/react-dom | Development type declarations | MIT as recorded in the inspected lockfile |
| Node.js / npm | Local development and package/build tooling | Use the notices bundled with the installed runtimes; not a custom ASTRA dependency license claim |
| Python / pypdf 7.1.0 | Research-only extraction of the supplied PDF | pypdf installed metadata: BSD-3-Clause; not an application runtime dependency |

Pure Monitoring, Risk Assessment, Simulation and Explanation functions are application code, not four remote AI services. Generative inference is not required for the core demonstration.

This is a direct-component attribution inventory, not a complete transitive license audit. Preserve the lockfile and installed third-party notices when distributing a release. No unreviewed claim of a project-wide open-source license is made.

## Completed implementation and validation snapshot

The four-agent pipeline is implemented and ready. The completed application uses Next.js 16.4.6, React 19.3.1, Recharts 3.10.1, Tailwind CSS 4, TypeScript and lucide-react, with a static export in `out/`. Publication is not authorized by this local deliverable.

The implementation owner executed **48 passing tests: 40 domain and 8 component**, using Vitest and React Testing Library/jsdom. Typecheck, lint, production build and HTTP route/asset smoke checks also passed. Actual browser rendering and desktop/mobile inspection remain unverified because browser access was unavailable. See the [test report](../docs/TEST_REPORT.md).

## Data, copy and visual inventory

| ID | Asset / provider | Origin and change | Used where / review status |
| --- | --- | --- | --- |
| D01 | `data/synthetic/crew_telemetry.csv` / supplied ASTRA fixture | Seeded fictional data; [provenance](../data/synthetic/SYNTHETIC_PROVENANCE.json) credits AI-assisted Python generation, seed 20261114, 120 rows and no NASA measurements | Local mission calculations; never describe as astronaut measurements |
| D02 | `data/synthetic/crew_profiles.json` / supplied ASTRA fictional profiles | Invented crew, not actual people; original package retained | Crew selector; human reviews final profile/media claims |
| A01 | ASTRA application code, tests, layout and deterministic modules | Completed with OpenAI Codex assistance; AI-assisted code and test generation are explicitly disclosed | Human review before publication; no NASA marks or approval |
| A02 | Lucide interface icons | Library vector assets, not original ASTRA icon artwork; Orbit usage observed in shell component | Credit Lucide and retain ISC/Feather notices |
| A03 | NASA evidence summaries and submission text / OpenAI Codex assistance | New AI-assisted paraphrases and drafts grounded in inspected sources; not text authored or approved by NASA | This source package, evidence cards and submission drafts |
| A04 | Fonts | Inspected `src/app/globals.css`: Arial, Helvetica, sans-serif and generic monospace; `layout.tsx` does not import a web font | No font file acquired or redistributed in this audit; register any later change |
| A05 | Demo screenshots, deck, video and audio | Script and outline only; no media generated, captured or hosted by this task | Human media capture and provenance review pending |
| A06 | Original procedural CSS/SVG interface visuals | Created with AI assistance as application code; distinct from the credited Lucide library icons | Implemented in the app with a visible AI-assisted label; no NASA branding |

No NASA photograph, logo, mission patch, stock image, music track or generated raster/video/audio asset was acquired in this research pass. This is scoped to this pass; inventory any assets added elsewhere before publication. Generated media must carry the guide's required identification.

## Known AI contributions and unresolved history

OpenAI Codex assisted with the completed application code, tests and original procedural CSS/SVG visuals, as well as official-source lookup, source selection, summaries, JSON records, documentation and pitch drafting. The procedural visuals carry a visible AI-assisted label in the app. The supplied fixture explicitly records AI assistance in generation. The human team must still account for any earlier brainstorming; missing history does not establish exclusively human ideation.

Human idea-origin and additional tool history: `[[HUMAN_AI_IDEATION_AND_TOOL_HISTORY]]`. Human reviewer/date: `[[HUMAN_REVIEWER_AND_DATE]]`. No NASA permission, review or endorsement is implied by using NASA links.

## Remaining release checks

- [ ] Directly match at least one actually integrated resource to the official challenge Resources list.
- [ ] Verify the app consumes the evidence catalog and all three source links resolve for a judge.
- [ ] Confirm final dependency notices and any added font/media licenses.
- [ ] Resolve November 13 local build timing and AI idea-origin eligibility with a human review; the organizer answer warns that early work can lead to disqualification.
- [ ] Fill actual team and public-link fields after separate publication authorization.
- [x] Record final automated results in the main test report: 48 passing tests plus typecheck, lint, build and HTTP smoke.
- [ ] Complete browser visual/interaction and media review.

No publication was authorized and no external submission was made.
