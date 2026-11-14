# ASTRA — working mission intelligence prototype

The application is implemented directly in this `nasa` directory. The original planning documents and supplied PDF remain below and alongside the app.

## Run the application

Requires Node.js 24 LTS and npm. Tested with Node 24.11.1 and npm 11.6.2. No environment file or API key is required.

```powershell
cd C:\Users\santi\Downloads\nasa
npm ci
npm run dev
```

Open http://127.0.0.1:3000. For the production build:

```powershell
npm run build
npm start
```

`npm start` serves the static `out/` release on loopback port 3000. Stop it with Ctrl+C before starting the development server. To use a different production port: `$env:PORT=3001; npm start`.

## Working features

- Landing page, four crew profiles, mission dashboard, science/source catalog and 30-day scenario explorer.
- Synthetic timeline replay, five selectable telemetry charts, personal baselines, exact-reading tables, and expandable findings.
- Four typed deterministic agents, inspectable audit traces, session-only acknowledgements and human-review demo actions.
- Live scenario sliders, reset, source-linked explanations, quality/missingness handling and graceful invalid routes.
- English submission copy, seven-slide outline, 28-second video script, source/AI disclosure and release checklist in `submission/`.

Try Maya at day 149 for sleep/HRV/resting-heart-rate deviations, Eli at day 149 for the stable comparison, Sofia at day 140 for habitat context, and Noah at day 149 for the activity trend. Scenario defaults (8 h / +15 min) are hypothetical interface values, not recommendations.

## Verify and deploy

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

`npm test` includes behavioral domain and React/jsdom interaction tests. `test:e2e` is a production **HTTP smoke check**, not a browser automation suite. Browser visual/mobile inspection was blocked by unavailable browser access; see `docs/TEST_REPORT.md` for the actual evidence and limits.

The build produces portable static files in `out/`. Deploy that directory to a static host with directory-index support; serve `404.html` for unavailable routes. Keep the `_next/` assets. Build command: `npm ci && npm run build`; output directory: `out`. Detailed instructions: [local and deployment operations](docs/07_DEPLOYMENT_OPERATIONS.md).

No public deployment or official submission has occurred. Team details, public URLs, actual demo recording/deck export, resource eligibility, and human review remain handoff tasks. Actual implementation began November 13, 2026 Buenos Aires after the user's explicit instruction to build immediately; no claim of event-window compliance is made. See [implementation status](docs/IMPLEMENTATION_STATUS.md).

## Source structure

`src/app/` defines routes, `src/components/` the interactive interface, and `src/lib/` the pure data/agent pipeline. `src/lib/repository.ts` reads the original CSV only at build/server time. Client calculations receive serialized fixture data and the curated NASA catalog. Charts and scenario changes make no external API calls. Review actions are resettable in-session state and disappear on refresh.

## Original planning handoff

The following section records the original pre-implementation package. Its references to a blueprint and pending build describe that earlier package, not the current application.

**ASTRA = Astronaut System for Tracking Risk & Assessment**  
**Tagline:** Your health today. Your risks tomorrow. Your decisions in control.

This ZIP is a **comprehensive build-and-submission blueprint**, not a claim that the production app has already been built. Unzip into an empty repository and hand the folder to Codex. It contains an automatically discovered root `AGENTS.md`, specialist `.md` playbooks, deterministic demo data, interface contracts, acceptance criteria, design guidance, research/source instructions, test scenarios, pitch drafts, and the supplied NASA submission PDF.

## Start in 3 steps

1. Open this directory as the root of a **new** Codex workspace. Read `START_HERE_CODEX.md` and `AGENTS.md`.
2. Once the official hackathon build window opens, paste the contents of `CODEX_START_PROMPT.md` into Codex (or use `codex` in this directory and paste that prompt). Codex should build the app, validate, and prepare the submission **without stopping for optional preferences**.
3. Before submission, provide your **team name / members**, deployment credentials/public URL, and the project page upload. Codex cannot autonomously operate accounts it has no credentials for, and the human team must check originality, data attribution and the final submission.

> **Fairness:** NASA Space Apps guidance allows research and planning before the start, but warns against starting project implementation before the official build window. The starter intentionally includes planning documents and **synthetic example data**, not a finished app. The CSV generation itself is AI-assisted and must be disclosed accurately. Respect your local event rules.

## The app to build

- `/` — striking English-language public landing page explaining the challenge, the data-to-action loop, the four functional agents, NASA resource provenance, and a **Launch Mission** CTA.
- `/mission` — responsive crew dashboard with charts, 4 fictional astronauts, data-quality badges, mission selector and timeline replay.
- `/mission/crew/[id]` — individual trends, risk explanations, reviewable alerts and personal baseline comparison.
- `/mission/scenarios` — interactive **30-day illustrative outlook**, with adjustable sleep/exercise *assumptions*. Never present simulated values as clinically validated predictions or proven treatment outcomes.
- `/about/science` — evidence, NASA source provenance, method, assumptions, limitations and AI disclosure.

## Read order

1. `START_HERE_CODEX.md` (how to run Codex)
2. `AGENTS.md` (binding execution policy)
3. `docs/01_PRODUCT_PRD.md`, `docs/02_ARCHITECTURE.md`, `docs/03_UI_UX.md`
4. `docs/04_DATA_SCIENCE_AND_SAFETY.md`, `docs/05_API_AND_SCHEMAS.md`, `docs/06_IMPLEMENTATION_ROADMAP.md`
5. `agents/*.md` (Codex development role contracts) and `runtime-agents/*.md` (software agents ASTRA implements)
6. `submission/*`, `research/*`, `qa/*`, and `assets/*`

## Recommended stack

Next.js App Router, TypeScript, React, Tailwind CSS, Recharts, Lucide icons, Vitest + React Testing Library; Playwright for a smoke walkthrough if practical. **No database, auth, paid API, real patient data or LLM key is needed for the MVP.** Persist local UI preferences only if useful. Prefer static typed JSON and deterministic pure functions. The optional LLM explanation is a later stretch enhancement, strictly grounded and safely replaceable.

## Source-of-truth hierarchy

`AGENTS.md` > `docs/04_DATA_SCIENCE_AND_SAFETY.md` > `docs/05_API_AND_SCHEMAS.md` > `docs/06_IMPLEMENTATION_ROADMAP.md` > other docs. Scientific claims require NASA sources and attribution; the included telemetry is synthetic and **is not NASA astronaut telemetry**.

## Known outside dependencies

Codex will need an execution environment with Node.js, npm and package network access (or cached packages). Public deployment requires a hosting service account/permission. A NASA source must be checked against the **2026 challenge Resources tab**, since not every NASA URL necessarily satisfies the Global Award source requirement.
