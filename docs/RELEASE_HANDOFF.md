# ASTRA release handoff

All application code is in this folder. No required API key, authentication, backend, external font or live NASA request. The original fixture and PDF are preserved.

## Start

From this folder run `npm ci` then `npm run dev`; visit http://127.0.0.1:3000. For production run `npm run build` then `npm start`. Do not run both servers on the same port. The local preview binds loopback only.

## Judge path

1. Open `/` and select Launch Mission.
2. Maya/day 149 shows sleep, HRV and resting-heart-rate deviations. Select Why this finding? to inspect baseline, exact rules and source context.
3. Try Acknowledge and Review with medical officer. These are session-only events; Reset review actions clears them.
4. Expand the four-stage agent trace. Replay the mission or move to early days to see baseline uncertainty.
5. Explore scenario. Change sleep or exercise and see the schedule deltas; Reset assumptions restores 8 h / +15 min.
6. Read Science & sources. Follow each NASA source and note the separation between research context, synthetic observations and assumptions.
7. Select Eli/day149, Sofia/day140 and Noah/day149 for comparison cases.

## Release contents

`out/` contains the complete static release. `release/astra-static.zip`, when generated, is the same directory packaged for transfer. Publish its contents at a domain root with directory-index resolution and a 404 handler; no SPA catch-all is needed. Static hosts need build command `npm run build` and publish directory `out`. No secrets are required.

The GitHub Actions workflow is supplied but has not run remotely. No remote repository, public deployment, domain, account, demo media upload or judging submission was created. Do not treat the loopback URL as a public submission link.

## Remaining human actions

- Inspect the actual browser at desktop and 390px width; use keyboard only, verify charts, console/hydration and absence of overflow. Browser automation was unavailable in this session.
- Review event timing and AI idea-origin eligibility against the registered event. Implementation started November 13 in Buenos Aires following the user's immediate-build instruction; the timestamp is not an eligibility certification.
- Verify a source against the official challenge Resources tab and update the manifest only with direct evidence.
- Add the real team roster, event/timezone and public app/repository links to `submission/SUBMISSION_COPY.md`.
- Record the supplied 28-second script or create/export the seven-slide outline, preserve credits, and host it publicly.
- Check every public link logged out, review claims, and complete Submit for Judging personally.

See `docs/TEST_REPORT.md` for exact executed checks and verification limits.
