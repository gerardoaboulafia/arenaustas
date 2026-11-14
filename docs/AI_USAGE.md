# AI usage log

The NASA Space Apps submission guide requires teams to say where and how AI tools were used. Every agent and every team member using an AI tool adds a row here. This log is the source for the "Use of Super Intelligence (SI)" field on the Project page.

The solution ideas are the team's. An AI tool helped compare them and write the chosen one down, as logged below.

| Date | Tool | What it did | Output | Reviewed by |
|---|---|---|---|---|
| 2026-11-13 | Claude Code (Claude) | Read the submission guide, judging guide and challenge page; drafted the project plan, the empty concept template, the project rules file and eight agent definitions | `PLAN.md`, `docs/CONCEPT.md` (template only), `CLAUDE.md`, `.claude/agents/*.md` | |
| 2026-11-13 | Claude Code (Claude) | Compared the team's seven candidate concepts against the judging criteria and recommended one (ASTRA); translated the team's notes on it from Spanish and merged two overlapping write-ups into the concept file; added scoping suggestions for the weekend, each marked "Suggested"; updated the plan and agents for the projection and what-if features | `docs/CONCEPT.md`, `PLAN.md`, `CLAUDE.md`, `.claude/agents/*.md` | |
| 2026-11-14 | Claude Code (Claude) | Drafted a product design proposal from the team's concept and plan, for the team to compare with a teammate's proposal: screens, path through the product, how the five rule-based agents map to code, what the researcher must source for the projection models, and the decisions still open. Choices the concept does not settle are marked "Proposed" | `docs/DESIGN.md` | |
| 2026-11-14 | Claude Code (Claude) | Ran a subagent to compare `docs/DESIGN.md` with the teammate's `astra` branch (read-only) and reported the differences | Report in the session; no files | |
| 2026-11-14 | Claude Code (Claude) | Built the first working version of the site from `docs/DESIGN.md`, reusing patterns (not code) from the `astra` branch: project setup, knowledge files with five NASA sources fetched and checked, the five rule-based agents with 22 tests, the landing page and the Twin, Projection and Log screens, deploy workflow, README and references. Thresholds, actions and model parameters without a source are marked as assumptions that need review | `package.json`, `vite.config.ts`, `index.html`, `src/**`, `.github/workflows/deploy.yml`, `README.md`, `docs/REFERENCES.md`, `docs/DESIGN.md` §11 | |
