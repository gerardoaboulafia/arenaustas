# ASTRA: astronaut health digital twin

Prototype for the NASA Space Apps Challenge 2026, challenge "Create Health Monitoring Software for Astronauts on Space Missions".

ASTRA creates a digital twin of each astronaut that evolves during the mission. Instead of asking only how the astronaut is today, it asks how they could be 30 days from now if they continue with their current habits and conditions, and lets them run a what-if before committing to a countermeasure.

**Prototype. Not a medical device. All crew data is simulated.**

- Team Arenaustas: Gerardo Aboulafia, Santiago Arena, Álvaro Hernández, Nicolás Masino
- Site: https://gerardoaboulafia.github.io/arenaustas/
- Demo, 7 slides: [public/ASTRA-demo.pdf](public/ASTRA-demo.pdf), or `/#/demo` on the site
- Project page text: [docs/SUBMISSION.md](docs/SUBMISSION.md)
- Concept: [docs/CONCEPT.md](docs/CONCEPT.md) · Design: [docs/DESIGN.md](docs/DESIGN.md) · Plan: [PLAN.md](PLAN.md)

## What it does

| Step | Screen | What happens |
|---|---|---|
| Gather | Log readings (`/#/app/log`) | Type today's readings over the simulated telemetry, or export and import them as a CSV file (every row is checked; a wrong file changes nothing). Each field explains why it matters, how to measure it and which spaceflight hazard it relates to. |
| Evaluate | Twin (`/#/app`) | A 2D figure shows muscle, bone, cardiovascular system and circadian rhythm. Every reading is compared with the astronaut's own baseline. |
| Act | Twin, Projection (`/#/app/projection`) and Crew (`/#/app/crew`) | The Medical Advisor lists actions for everything that is not nominal and says who to involve: the astronaut, the crew medical officer, or the flight surgeons on the ground. "See projected effect" opens the 30-day projection with that change applied. The Crew screen puts everyone on one page for the crew medical officer and compares one indicator across the crew, as recorded or as the change from each person's own baseline. |

The landing page (`/#/`) explains the solution and leads into the tool. `/#/demo` is the 7-slide demo.

Links can open the tool on a given frame: `/#/app/projection?crew=c&sleep=8` selects the third crew member and applies a what-if of 8 hours of sleep. Parameters: `crew` (a to d), `day`, `sleep`, `exercise`, `radiation`, `system`.

The five agents (Biometric, Physiology, Environment, Prediction, Medical Advisor) are TypeScript modules in `src/domain/`. They apply rules from sourced files. The Biometric Agent also runs one small machine-learning model, the pattern check: it learns each astronaut's normal from their own baseline days and flags days when readings that each look fine are unusual together. No language model runs in the product and nothing leaves the browser.

## Run it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

```bash
npm run build
```

The build in `dist/` is a static site. It uses hash routes and relative paths, so it works from any folder or GitHub Pages subpath.

## Where the numbers come from

- Every threshold, action and model parameter is in `src/data/knowledge/*.json`. None is written in code.
- Each one carries a source from `sources.json`, or is marked `"basis": "assumption"` with `"needsReview": true`. The tool shows an "Assumption" tag next to it.
- The 30-day view applies the explicit models in `models.json`. It is a simplified projection, not a prediction, and each chart shows its model, source and limits.
- The crew and all readings are generated from a fixed seed in `src/domain/seed.ts`.

Sourced: the five hazards (NASA Human Research Program), the base rate of the bone model (NASA: weight-bearing bones become roughly 1% less dense per month without countermeasures), the cabin CO2 alert limit of 3 mmHg and the 600 mSv career radiation limit (NASA-STD-3001 technical briefs), and the neutron share of the radiation dose (Canadian Space Agency). Everything else is an assumption chosen to make the prototype work; no clinician has reviewed it. See [docs/REFERENCES.md](docs/REFERENCES.md).

## Structure

```
src/data/knowledge/   sources, hazards, indicators, body systems, models, rules
src/domain/           the five agents: evaluate, project, twin, seed, storage, tests
src/components/ui/    status badge, charts, twin figure
src/app/              Twin, Projection and Log screens
src/landing/          landing page
src/demo/             the 7-slide demo deck
docs/demo/shots/      screenshots used in the deck and on the Project page
```

## Deploy

`npm run publish:site` tests, builds and pushes the site to the `gh-pages` branch, which GitHub Pages serves once the repository is public. The exact commands are at the end of [docs/SUBMISSION.md](docs/SUBMISSION.md). `.github/workflows/deploy.yml` also tests and builds on every push when GitHub Actions is available for the account.

After changing a slide, export the PDF again: open `/#/demo`, press "Save as PDF", and save it as `public/ASTRA-demo.pdf`.

If the project folder is inside iCloud Drive, keep dependencies in `node_modules.nosync` with a `node_modules` link to it, as this checkout does. iCloud otherwise evicts files from `node_modules` and the dev server hangs.

## Use of AI

Parts of the code, tests and text were written with an AI assistant (Claude Code) and reviewed by the team. The solution concept is the team's. Every use is logged in [docs/AI_USAGE.md](docs/AI_USAGE.md). AI-written source files start with a comment saying so. No AI-generated images are used: the figure and charts are drawn in SVG by code. The product itself contains one machine-learning component, the pattern check described above; it is trained only on simulated data and is disclosed as such.

## Credits

This build combines the two prototypes the team made. From Santiago Arena's `astra` branch: comparing each astronaut with their own baseline, requiring a deviation to persist before it changes a status, the no-data state, the agent trace, the mission-day replay, the color palette, the crew-wide view with one indicator compared across the crew, a named crew with roles, and the export and import of readings with validation. The crew's call signs (Stokes, Green, Gauss, Riemann) are surnames from calculus, chosen by the team. From this branch: the twin figure and its four body systems, the sourced projection models and the what-if, the Medical Advisor with its escalation ladder, the learned pattern check, the indicators named in NASA's brief, the landing page and the demo. The `astra` features were written again for this code base; no code was copied.

Not affiliated with or endorsed by NASA.
