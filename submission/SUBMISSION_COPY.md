# ASTRA project submission copy

Prepared November 13, 2026 Buenos Aires / November 14 UTC. English copy is finalized for human review. Replace the explicit human fields below, verify the current release against the checklist, and remove any behavior the final app does not demonstrate. Source verification is complete for three NASA pages; challenge-list inclusion and competition eligibility are unresolved. No publication or submission has occurred.

## Project name

ASTRA - Astronaut System for Tracking Risk & Assessment

## High-level project summary

ASTRA is an independent astronaut health-awareness prototype that makes monitoring signals explainable. Four deterministic software agents process editable, fictional telemetry throughout a 180-day mission. Users start the mission, compare four crew members at 15-minute intervals, inspect activity-matched findings and explore transparent 30-day assumptions. The schedule includes exercise and weekly spacewalks by alternating pairs. A data editor supports new indicators and CSV corrections without rewriting the interface. NASA human-spaceflight research provides separately labeled context; readings and thresholds are demonstration-only. ASTRA keeps uncertainty, provenance and human judgment visible. It does not diagnose conditions or predict medical outcomes.

## Selected challenge

[Create Health Monitoring Software for Astronauts on Space Missions - 2026](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/).

ASTRA addresses the challenge's monitoring, evaluation and action workflow through trend review and scenario exploration. Its action step is a prototype review interaction, not a clinical order or an actual message to a medical officer.

## Link to Project Demo

`[[PUBLIC_DEMO_URL]]`

Use the recorded video of at most 30 seconds or a deck of at most seven English slides, including its cover. The local script and outline are prepared; neither is a hosted final media artifact. Test the final link without login after publication is separately authorized.

## Link to Final Project

`[[PUBLIC_APP_URL]]`

Optional public source repository: `[[PUBLIC_REPOSITORY_URL_OR_OMIT]]`.

Local development and a successful production build do not establish a public URL.

## Detailed project description

### What it does

ASTRA opens with a mission-focused landing page and a clearly labeled synthetic demonstration. The mission runs from day 0 to day 180: 36 hours outbound, 176 orbital days, then 60 hours returning. Users compare four fictional crew members, start or pause accelerated playback, and browse any completed day while the mission clock continues. The schedule drives exercise, alternating-pair EVA, support, sleep and routine activities; a clock-driven spacecraft schematic shows the current phase.

The four agents have distinct responsibilities. Monitoring compares observations against activity-matched personal baselines. Risk Assessment applies explicit per-indicator demo rules and produces review suggestions or insufficient-data states. Simulation builds independent constant-value assumptions over 30 days. Explanation exposes contributing values, rules and quality information. NASA evidence remains separately labeled research context.

A demonstration centers on Maya Torres: select the final mission day, inspect her sleep and HRV deviations, review the explanation, then explore a different hypothetical schedule. The user can see the difference between a calculated observation, a planning assumption and a supporting research reference.

### How it works

The default configuration generates 69,120 crew records: 180 days at 15-minute intervals for four invented crew members. Minute-level signals aggregate into interval averages or totals. JSON defines profiles, schedule, indicators and generation assumptions; CSV can override individual readings. New indicators automatically appear in the interface. Pure TypeScript modules require no LLM, NASA API, account or external database. The original 120-row daily fixture remains a separate regression asset.

The 30-day scenario page compares an explicit indicator target with the recent completed-day baseline. Summed indicators report planned totals; continuous indicators report assumed daily means. Changing a target never changes another indicator's physiology. These are not predictions of improved fitness, bone density or medical benefit. Missing or insufficient observations remain visible.

### Benefits and next steps

ASTRA demonstrates a reviewable monitoring workflow: people can inspect the data and rules behind a flag and understand the limits of a scenario. The intended benefit is clearer information for human discussion. No improvement in health, mission safety, diagnostic accuracy or operational performance has been measured.

Further work would require expert review, appropriately authorized data access, privacy and security design, and prospective validation. The current demonstration is not ready for clinical or operational use.

### Technology used

The completed implementation uses Next.js 16.4.6 App Router, React 19.3.1, TypeScript, Tailwind CSS 4, Recharts 3.10.1 and lucide-react. Its four typed deterministic agent modules form the implemented, ready pipeline over local CSV/JSON fixtures. Vitest supports module and component testing; React Testing Library and jsdom provide component interaction tests and the DOM test environment. ESLint and TypeScript support static checks, and Node.js/npm support the build. The core has no mandatory API key, authentication or external backend.

The application is delivered as a local static export in `out/`, ready for a separately authorized hosting step. No public URL or publication is claimed. **48 tests passed (40 domain and 8 component)**, along with typecheck, lint, the production build and production HTTP route/asset checks. Browser rendering, mobile layout and an anonymous public walkthrough remain unverified; see [the test report](../docs/TEST_REPORT.md) for the exact scope.

### Limitations

All crew identities and readings are fictional. Risk indicators are unitless prototype workflow signals calibrated only to the fixture, not clinical severity or disease probability. The radiation proxy is not radiation dose. Cabin CO2 is environmental context, not a diagnosis. Scenarios describe assumptions, not proven countermeasure efficacy. ASTRA is independent and is not NASA-approved, NASA-endorsed or a validated medical device.

## NASA Data

ASTRA uses official NASA research resources as contextual evidence, with stable source IDs in the checked-in evidence catalog:

- **nasa-sleep:** [NASA sleep/circadian/workload risk article](https://www.nasa.gov/directorates/esdmd/hhp/risk-of-performance-decrements-and-adverse-health-outcomes-resulting-from-sleep-loss-circadian-desynchronization-and-work-overload/). Supports the sleep context associated with review findings.
- **nasa-human-risks:** [Human System Risks](https://www.nasa.gov/hhp/human-system-risks/). Supplies the risk-domain reference taxonomy.
- **nasa-spaceflight:** [Risks of Human Spaceflight](https://www.nasa.gov/hrp/risks/). Supplies broader mission and sleep/fitness research context.

These resources are represented by attributed summaries and links in `data/nasa/curated_evidence.json`; `source_manifest.json` records retrieval and scope. No raw NASA telemetry, OSDR study, training dataset or personal astronaut record was imported. No source accession is claimed. The NASA material does not validate our thresholds or scenario effects.

**Challenge Resources status: UNVERIFIED.** The official challenge page/Resources tab could not be retrieved reliably during verification. All three listing flags are null. The team must verify challenge-specific acceptance before claiming Global Award eligibility. A NASA source is not automatically a verified challenge-listed source.

## Use of Super Intelligence / AI

AI assistance is part of this project's development record. OpenAI Codex assisted with the completed application code and tests, original procedural CSS/SVG interface visuals, source research, evidence paraphrasing, structured provenance records and submission drafting. The procedural visuals carry a visible AI-assisted label in the app. The supplied synthetic fixture records a deterministic seeded Python generator authored with AI assistance during the planning handoff. The human team must review the final code and claims.

Prior solution ideation is not independently established by this source audit. Human account of idea origin, brainstorming and any additional AI tools: `[[HUMAN_AI_IDEATION_AND_TOOL_HISTORY]]`. Do not replace this with an unsupported claim of exclusively human ideation. The supplied submission guide restricts AI-originated solution ideas, so eligibility requires an honest human review.

The runtime agents calculate deterministic results and template explanations; they do not use generative medical reasoning. The original procedural CSS/SVG visuals are AI-assisted application artwork with visible identification, while Lucide icons are separately credited library assets. No generated raster image, audio or video was produced by this research pass. Before upload, inventory any additional media and apply the guide's identification and attribution requirements. Never generate or modify NASA branding.

## Space Agency Partner Data and Other References

No Space Agency Partner dataset was imported in this research pass. Credit NASA through the sources above and list the actual software, licenses, synthetic fixture, AI contributions and media in [FINAL_SOURCE_REGISTER.md](FINAL_SOURCE_REGISTER.md). Do not list OSDR as a used dataset unless a specific record is actually retrieved and integrated later.

## Team and human release fields

- Team name: `[[TEAM_NAME]]`
- Team members: `[[ACTUAL_MEMBER_NAMES]]`
- Registered Local Event or Universal Event and controlling timezone: `[[EVENT_AND_TIMEZONE]]`
- Human reviewer and review date: `[[HUMAN_REVIEWER_AND_DATE]]`

## Timing disclosure for the team's eligibility review

The user ordered immediate local work on **November 13, 2026 in Buenos Aires**. Verification was recorded at **2026-11-14 01:22:21 UTC / 2026-11-13 22:22:21 UTC-03:00**. The supplied guide describes a November 14 09:00 opening and November 15 23:59 submission deadline in the applicable event timezone. Work was not paused, backdated or declared compliant. Confirm the registered event's permitted build window and AI idea-origin requirements with the organizer before accepting originality/eligibility declarations.

The [organizer's November 5 answer](https://github.com/nasa/spaceapps/discussions/1827) corroborates the challenge-listed NASA-resource requirement and warns that early project work can lead to disqualification; advance research and team formation are permitted. Human review must distinguish that preparation from the immediate implementation requested here.

This is a local submission package. Public deployment, upload and Submit for Judging remain human-controlled external actions.
