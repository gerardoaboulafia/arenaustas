# ASTRA test report

## Current local revision — November 14, 2026

The active product now implements the editable 180-day mission. The older report below is historical evidence for the original daily fixture; its 48-test count and release ZIP do not describe the current build.

| Check | Executed result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS; an intermediate unused test variable was removed |
| `npm test` | PASS: 143 tests across 5 files, final full run 20.15 seconds |
| `npm run build` | PASS: production static export including `/mission/data` |
| `npm run test:e2e` | PASS: 9 product routes, 2 expected 404s, 16 JS/CSS assets, source isolation, runtime config/CSV endpoints and no-store caching |
| Local preview | Production server running at `http://127.0.0.1:3000`; updated interface and public data available |
| Browser visual inspection | NOT RUN: `cua.getState()` again returned “The browser access host is unavailable”. No alternative browser-control bypass or screenshot claim |

Coverage: 40 original domain tests and 8 original component regressions; 74 new mission domain cases; 8 runtime/scenario tests; 13 dashboard/schedule/position interaction cases. The new tests verify exact phase boundaries, 25 alternating EVAs, weekly exercise, collision rejection, 69,120 samples, interval-end semantics, seeds, generic new indicators, shared habitat, strict CSV overrides including a 293,760-value full export, missingness, activity-matched findings, audit stages, no future leakage, independent history/playback, persistence, atomic validation, input reload, crew filters and zoom/table alignment.

jsdom chart tests preserve the real chart data contracts and test accessible controls while mocking SVG layout primitives. They do not establish actual Recharts browser geometry, mobile layout or browser hydration. HTTP smoke verifies delivery, not a browser interaction journey.

No dependency was added for this revision. Checks were completed at the local implementation handoff. The user subsequently authorized a GitHub delivery to `astra` only; no hosted deployment or official submission is included. Source data and instructions: `EDITABLE_MISSION.md`.

## Original release evidence (historical)

Release: `astra-mission` 1.0.0. Executed November 13, 2026 America/Buenos_Aires (November 14 UTC), Windows PowerShell, Node 24.11.1, npm 11.6.2. Git initialized locally; no commit or remote publication claimed.

## Executed checks

| Command | Actual result |
| --- | --- |
| `npm install` | Completed; lockfile created. Later test dependencies installed and one unused dependency removed. |
| `npm ci --ignore-scripts` | PASS: clean reinstall from the final lockfile, 483 packages installed; lifecycle scripts intentionally skipped for this dependency-resolution check. |
| `npm run typecheck` | PASS, exit 0 on final code. |
| `npm run lint` | PASS, exit 0, no warnings on final code. |
| `npm test` | PASS: 2 test files, 48 tests (40 domain + 8 component). Vitest 4.1.12; recorded full run 5.27 seconds. |
| `npm run build` | PASS: Next.js 16.4.6 production static export, all 8 product routes and generated not-found pages. |
| `npm start` | PASS: production loopback server started at http://127.0.0.1:3000. |
| `npm run test:e2e` | PASS: 8 HTTP routes, 2 expected 404s, 12 referenced JS/CSS assets, landing CTA, NASA/synthetic science content and source-file isolation. |
| `npm audit --omit=dev` | PASS: 0 production vulnerabilities. |
| `npm audit` / `npm audit fix` | 7 moderate development-only advisories remain through TypeScript ESLint's minimatch dependency. No forced major dependency override was applied. |

The `test:e2e` script is deliberately described as an **HTTP smoke test**, not a full browser E2E suite. Component tests use React Testing Library/jsdom, mocked Next navigation and mocked chart rendering. They test state changes and semantic content; they do not prove browser hydration, SVG layout, keyboard-native range behavior or mobile geometry.

## Acceptance evidence

| ID | Observed | Result / evidence |
| --- | --- | --- |
| T01 | 120 rows, 4 allowed crew IDs, exact days 120–149, synthetic origins | PASS, domain tests |
| T02 | Invalid numeric/structural input, duplicate days/headers and broken quoting surfaced; no fabricated replacements | PASS, domain tests |
| T03 | 14 samples/metric; Maya sleep baseline 7.545 h; HRV 55.0642857 ms | PASS, independently specified fixture assertions |
| T04 | Maya 149: sleep 5.9066667 h, HRV 39.9533333 ms, resting HR 72.8333333 bpm; all persistent | PASS, domain tests |
| T05 | Eli 149 normal; zero deviations | PASS, domain tests |
| T06 | Sofia 140 observe; CO2 only, zero health signal count, habitat-context wording | PASS, domain tests |
| T07 | Noah 149 exercise 33.3 versus baseline 71.6571429 min/day; observe | PASS, domain tests |
| T08 | Missing recent sleep produces insufficient_data; available other deviations retained | PASS, domain tests |
| T09 | Maya has 3 distinct persistent health signals → review; duplicate deviations do not double-count | PASS, domain tests |
| T10 | Repeated scenario arrays and serialized trace identical; shuffled input equivalent | PASS, domain tests |
| T11 | Maya recent sleep plan 5.9657143 h; 8 h/+15 min scenario yields +61.0285714 planned hours, +450 planned minutes | PASS, domain tests |
| T12 | Input ranges/steps, NaN/infinity handling and actual capped exercise delta checked | PASS, domain tests |
| T13 | All Launch Mission links target /mission; exported route responds 200 | PASS component + HTTP; browser navigation pending |
| T14 | Four crew links; Maya computed values, rules and NASA evidence link render | PASS component; chart pixels/hydration not verified |
| T15 | Sliders update +61.0 → +91.0 h and +450 → +900 min; reset restores defaults and chart tab | PASS component |
| T16 | Science export contains real NASA links, provenance, model and limitations | PASS HTTP/source audit |
| T17 | Responsive CSS breakpoints, focus styles, labels, exact-data alternatives and reduced motion implemented | UNVERIFIED visually: desktop/mobile/keyboard browser walkthrough blocked |
| T18 | Production export completes without secrets or private services | PASS build |
| T19 | Source copy checked for synthetic labeling, bounded plan differences, no disease probabilities or efficacy model | PASS engineering review; human scientific/submission review remains |
| T20 | No public deployment performed | NOT RUN; human publishing and anonymous route checks required |

Additional passing domain cases: no future-data leakage; 10-baseline/2-recent minimums; calendar-window gaps; transient versus persistent deviations; unknown crew rejection; environmental/radiation exclusion; missing scenario comparisons remain null; unsafe/ambiguous citation IDs omitted; four trace stages; input immutability; scenarios cannot change risk findings.

## Browser limit

`cua.getState()` reported `The browser access host is unavailable`. Selecting the existing Edge window returned `Computer Use was not approved to use Microsoft Edge`. No browser screenshots, visual/mobile inspection or actual end-to-end browser run is claimed. The tool denial was respected. Complete `qa/DEMO_WALKTHROUGH.md` manually before public release.

## Resolved integration failures

An early typecheck caught a ScenarioControls/ScenarioInput call mismatch; UI calls were corrected. Initial component tests corrected a rounding expectation (HRV 40.0 at one decimal) and ambiguous selectors for associated outputs/duplicate rule text. A Testing Library option type error was removed. All final checks above passed after those changes. The earliest `npm test` ran before the test files had been created and correctly failed; it is not the reported final result.

## Artifact integrity

Original telemetry SHA-256 remains `5c4f71bb6f4673955a734d95da0679c835ec09215e4c19db839aa26956ad410f`.

Original supplied PDF SHA-256 remains `0038f842fc3680bab831fb8fb968d64e4cb702642f2203ac2936d71b00354761`.

Both match the supplied `SHA256SUMS.txt`. That file and `PACKAGE_MANIFEST.json` describe the original handoff kit; they are not a manifest of the new implementation.

Static deployment package: `release/astra-static.zip`, 498,855 bytes; SHA-256 `9d5919bbae6dc1a54766b919962358f96ac19e35cd284ceefbd21d118196a9e3`. Source and documentation remain in the project root; the ZIP contains the web release only.
