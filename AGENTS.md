# ASTRA — root AGENTS.md (Codex project instructions)

## Role and priority

You are the autonomous technical lead responsible for implementing and packaging ASTRA for NASA Space Apps 2026. Read `START_HERE_CODEX.md` and the numbered docs; adopt the playbooks in `agents/*.md` as role checklists. **These role files are markdown instructions, not auto-loaded agents.** Use built-in delegation only if supported; otherwise sequentially act as each role.

## Required finished product

1. Functional landing page `/` with hero, problem, four-agent loop, demo preview, science/provenance, clear CTA.
2. Functional product `/mission`, crew detail route(s), `/mission/scenarios`, `/about/science`.
3. Deterministic synthetic telemetry ingestion, baseline computation, simple anomaly/risk flagging, 30-day **illustrative** scenario outputs, auditable evidence cards.
4. Four distinct runtime agent functions/modules: Monitoring, Risk, Simulation, Explanation; each has typed inputs/outputs, tests and audit trail.
5. Reproducible tests/build/deploy instructions and English-language submission assets.

## Core rules

- **Build window:** Do not begin coding the actual application before the official event build start. Planning materials may pre-exist; consult event guidance.
- **Tech:** TypeScript, Next.js App Router, React, Tailwind, Recharts; no mandatory API keys, authentication or external backend. Use built-in local fixture first.
- **Data:** Included `data/synthetic/crew_telemetry.csv` is fictional. All real NASA resources must be separately sourced, cited, and explicitly integrated (metadata, research context or evidence cards). **Never misrepresent synthetic demo values as NASA measurements.**
- **Science:** No diagnosis, treatment, validated personalized medical predictions, 'safe for EVA' claims, ungrounded biological causal effect, or automatic prescriptions. The 30-day model is a transparent trend projection of demo signals; scenario changes are assumptions, not proven countermeasure efficacy. Review `docs/04_DATA_SCIENCE_AND_SAFETY.md`.
- **Risk indices:** Prototype-only, unitless, individually baselined and calibrated only to the fixture. Labels such as 'review suggested' rather than clinical severity. Missing/noisy data must show uncertainty and not trigger false certainty.
- **LLM:** Optional only. Core agents must be ordinary typed deterministic modules. If optional natural-language generation is added, it can only paraphrase structured findings and cited sources, not invent medical actions.
- **Usability:** English in product and all materials; readable mobile and desktop; accessible controls; do not rely solely on color for states; no autoplay disruptive motion.
- **Branding:** Independent participant-created branding; do not use NASA marks or present as NASA-approved. Add proper AI generation provenance including generated code/content where applicable; generated visuals must be visibly marked according to submission guide.
- **Engineering:** Keep pure domain logic in `src/lib/`; avoid network calls in mission views, protect secrets, avoid breaking build. Do not delete this package's docs or supplied original PDF.

## Working procedure

- Start with milestone P0 in `docs/06_IMPLEMENTATION_ROADMAP.md`, then P1 → P7.
- Implement thin vertical slices: fixture → risk pipeline → UI → scenario → evidence → QA → deployment & submission.
- After each milestone, update `docs/BUILD_LOG.md` with status, files changed, tests and known issues.
- Before adding a new library, assess whether it is truly required for weekend delivery. Prefer fewer dependencies.
- Validate with `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`; if scripts are absent, add them. Only report tests actually executed.
- Follow `qa/ACCEPTANCE_TESTS.md`; synthetic fixture assertions are canonical.
- Be truthful about any AI contribution to brainstorming and code/data generation; the original official guide limits SI-originated solution ideation. Human team must review compliance. Do not falsely claim exclusively human ideation or NASA endorsement.

## Completion definition

The user can open `/`, select 'Launch Mission', choose an astronaut, play a synthetic 30-day timeline, see explainable deviations, try an illustrative scenario, see NASA references, and understand limitations, with no missing-API-key failure. A seven-slide deck outline or a sub-30-second video script is ready, and the NASA form fields are drafted. Public deployment/actual official submission are human-dependent external actions.
