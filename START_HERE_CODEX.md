# START HERE — handoff to Codex

This is a **single-repository autonomous build brief**. Codex can read this file and the root `AGENTS.md`. The markdown files under `agents/` are **role playbooks** and do not themselves instantiate Codex subagents. Codex should consult them as specialized instructions; it may delegate where its runtime supports that, but one Codex instance can implement every phase sequentially.

## Your mission

Build and validate ASTRA as a polished, functional English-language website plus simulated astronaut health application. Complete in scope order. Do not ask the user about minor design, naming, frameworks, package choices, or optional scope. Make reasonable decisions and record them in `docs/DECISIONS_LOG.md`. Only stop for true blocking issues such as missing access to deploy accounts, a new legal/licensing restriction, or missing official resources that cannot be verified through permitted access.

## Automated workflow

1. Read and follow root `AGENTS.md` plus `docs/06_IMPLEMENTATION_ROADMAP.md`.
2. Inspect existing files, check Node/npm availability, init Git if needed, scaffold Next.js in **this folder** without deleting documentation.
3. Execute phases P0–P7; test at each gate; prioritize a usable end-to-end demo over feature count.
4. Write `docs/BUILD_LOG.md`, `docs/TEST_REPORT.md`, `submission/FINAL_SOURCE_REGISTER.md`, and update actual links in `submission/SUBMISSION_COPY.md` when available.
5. Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` and, where feasible, `npm run test:e2e`. Report actual pass/fail results; do not fabricate them.
6. If deploying is blocked by credentials, deliver a **buildable local app and exact deployment instructions**; never invent a deployment URL.

## Crucial non-negotiables

- Both landing page AND application must work.
- Live health data and a validated medical digital twin are **out of scope**. Say 'synthetic demonstration' clearly.
- All displayed scores must be visibly labeled 'Prototype signal / not a clinical assessment'; never imply NASA approval, endorsement or certification.
- The deterministic monitoring, risk, scenario and explanation pipeline must run without an LLM key.
- Visual alerts must be reviewable and explainable; no automated clinical instructions.
- NASA evidence must be cited correctly and integrated meaningfully into the science page and relevant context cards. Check source against the challenge-specific resources list before claiming Global Award eligibility.
- No generated NASA logo, official patches, flags, trademarks, or unauthorized branding. The app is an independent hackathon prototype.

## Human handoff points (not optional questions to block development)

- Verify event-specific project submission deadline and member eligibility.
- Validate NASA source URL is actually accepted under the selected challenge Resources.
- Add team name/member names and review the AI disclosure.
- Connect deployment account; inspect deployed app without login.
- Record/publish the demo (30 seconds maximum) or host the seven-slide deck.
- Click `Submit for Judging` before deadline; check confirmation.
