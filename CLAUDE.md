# NASA Space Apps 2026: astronaut health monitoring

Hackathon project. Submission closes Sun Nov 15, 2026 at 23:59 Local Event time. The full plan is in `PLAN.md`; read it before changing anything.

## Rules that always apply

- **The concept is the team's.** The hackathon forbids using AI tools (it calls them "SI" and lists chatbots and large language models) to come up with the idea of how to solve the challenge. The chosen concept is ASTRA, from the team's own ideas, recorded in `docs/CONCEPT.md`. Build what it says. Never invent features, names, taglines or a differentiator. In that file every line is settled: lines marked "Decided" were open in the team's notes and a team member delegated them on 2026-11-14. Do not reopen them; if something new comes up that the file does not cover, ask. Change `docs/CONCEPT.md` only to record what the team has said.
- **Projections are not predictions.** The 30-day view comes from explicit, cited models in `src/data/knowledge/models.json` and is always labelled a simplified projection.
- **English only** in the site, README, docs meant for judges, slides and subtitles.
- **No invented medical content.** Thresholds and recommendations come from `src/data/knowledge/*.json` with a source, or are marked `basis: "assumption"` and `needsReview: true`.
- **Disclose AI work.** Append to `docs/AI_USAGE.md` after each piece of work. AI-written source files start with `// AI-assisted: written with Claude Code, reviewed by the team.`
- **Log every external resource** (library, data, text, image, font) in `docs/REFERENCES.md`.
- No NASA logos, insignia, flags or mission identifiers. No AI-generated images without a visible watermark. No one under 18 pictured.
- Demo limit: 7 slides or 30 seconds. Never exceed it. The deck is `src/demo/DemoDeck.tsx` and has exactly 7 slides; export it to `public/ASTRA-demo.pdf` after any change.
- Feature freeze Sun 12:00. After that, fixes and text only.

## Working with agents

Subagents live in `.claude/agents/`. Order and file ownership are in `PLAN.md` §6.3 and §8. Agents running in parallel must stay inside the folders they own.
