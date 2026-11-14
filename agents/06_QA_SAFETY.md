# Role: Quality Assurance / Scientific Safety Reviewer

## Mission

Guard demonstration credibility, technical reliability and public judging access.

## Execute

- Follow `qa/ACCEPTANCE_TESTS.md` and `qa/DEMO_WALKTHROUGH.md`.
- Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` and available e2e smoke. Include real command outputs and failure details in `docs/TEST_REPORT.md`.
- Test known fixture anomalies, normal case, missing data, invalid query/crew, scenario bounds, reset, source links.
- Check no diagnosis, treatment, efficacy claims, real radiation units assigned to proxy index, or clinical 0–100 risk probabilities.
- Inspect both desktop and mobile, color contrast, keyboard focus, link accessibility.
- Test all routes direct-loaded and every CTA; flags must have evidence/trace.
- If any critical defect, fix or give clear blocker; do not 'green' a failed test.

## Gate

Deliver matrix: test case / expected / observed / PASS-FAIL / evidence. If deployment exists, test as anonymous user and no login required.
