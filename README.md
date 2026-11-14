# ASTRA: astronaut health digital twin

Prototype for the NASA Space Apps Challenge 2026, challenge "Create Health Monitoring Software for Astronauts on Space Missions".

ASTRA creates a digital twin of each astronaut that evolves during the mission. Instead of asking only how the astronaut is today, it asks how they could be 30 days from now if they continue with their current habits and conditions, and lets them run a what-if before committing to a countermeasure.

**Prototype. Not a medical device. All crew data is simulated.**

- Team: TODO(team): team name and members
- Live site: TODO(team): link once the repository is public and the site is deployed
- Concept: [docs/CONCEPT.md](docs/CONCEPT.md) · Design: [docs/DESIGN.md](docs/DESIGN.md) · Plan: [PLAN.md](PLAN.md)

## What it does

| Step | Screen | What happens |
|---|---|---|
| Gather | Log readings (`/#/app/log`) | Type today's readings over the simulated telemetry. Each field explains why it matters, how to measure it and which spaceflight hazard it relates to. |
| Evaluate | Twin (`/#/app`) | A 2D figure shows muscle, bone, cardiovascular system and circadian rhythm. Every reading is compared with the astronaut's own baseline. |
| Act | Twin and Projection (`/#/app/projection`) | The Medical Advisor lists actions for everything that is not nominal. "See projected effect" opens the 30-day projection with that change applied. |

The landing page (`/#/`) explains the solution and leads into the tool.

The five agents (Biometric, Physiology, Environment, Prediction, Medical Advisor) are rule-based TypeScript modules in `src/domain/`. No language model runs in the product and nothing leaves the browser.

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
- Each one carries a source from `sources.json`, or is marked `"basis": "assumption"` with `"needsReview": true`. The tool shows that tag next to it.
- The 30-day view applies the explicit models in `models.json`. It is a simplified projection, not a prediction, and each chart shows its model, source and limits.
- The crew and all readings are generated from a fixed seed in `src/domain/seed.ts`.

Sourced so far: the five hazards (NASA Human Research Program) and the base rate of the bone model (NASA: weight-bearing bones become roughly 1% less dense per month without countermeasures). Everything else is an assumption waiting for review. See [docs/REFERENCES.md](docs/REFERENCES.md).

## Structure

```
src/data/knowledge/   sources, hazards, indicators, body systems, models, rules
src/domain/           the five agents: evaluate, project, twin, seed, storage, tests
src/components/ui/    status badge, charts, twin figure
src/app/              Twin, Projection and Log screens
src/landing/          landing page
```

## Deploy

`.github/workflows/deploy.yml` tests and builds on every push. To publish to GitHub Pages, make the repository public, set Pages to "GitHub Actions" in the repository settings, and run the workflow by hand from the Actions tab.

## Use of AI

Parts of the code, tests and text were written with an AI assistant (Claude Code) and reviewed by the team. The solution concept is the team's. Every use is logged in [docs/AI_USAGE.md](docs/AI_USAGE.md). AI-written source files start with a comment saying so. No AI-generated images are used: the figure and charts are drawn in SVG by code.

## Credits

Several patterns come from the team's first prototype on the `astra` branch: comparing each astronaut with their own baseline, requiring a deviation to persist before it changes a status, the no-data state, the agent trace, the mission-day replay and the color palette.

Not affiliated with or endorsed by NASA.
