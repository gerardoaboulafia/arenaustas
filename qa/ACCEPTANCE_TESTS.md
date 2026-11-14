# Acceptance tests — executable intentions

Implement using Vitest/React Testing Library and optional Playwright. All numeric demo rules are fixture-specific, **not clinical thresholds**.

| ID | Type | Given / action | Expected |
|---|---|---|---|
| T01 | data | Parse CSV | exactly 120 rows, 4 allowed crew IDs, 30 mission days each, origin=synthetic |
| T02 | data | Parse malformed row | validation error surfaced; no silent fabricated replacement |
| T03 | data | Baseline on days 120–133 | 14 baseline samples/crew per metric unless missing; stable correct means |
| T04 | monitoring | Maya day 149 | sleep and HRV show persistent lower-than-baseline signal (verify fixture) |
| T05 | monitoring | Eli day 149 | `normal` or no review-required health finding (stable fixture) |
| T06 | environment | Sofia's high cabin CO2 days | environmental context alert, not clinical illness claim |
| T07 | exercise | Noah late mission reduced activity | reduced activity adherence trend observed |
| T08 | missing | all recent days missing for a metric | `insufficient_data` for metric; avoid false normality |
| T09 | risk | 2 persistent health signal deviations | state `review`, reasons cite contributing rule IDs |
| T10 | scenario | same input twice | identical 30-day output arrays |
| T11 | scenario | target sleep 8.0 and extra exercise 15 | 30-day modeled sleep opportunity delta = 30 × (8.0 − recent baseline sleep); exercise delta = 450 minutes; NOT a health-outcome claim |
| T12 | scenario | slider out of range | clamp/reject according to documented contract |
| T13 | UX | Click Launch Mission | opens `/mission` and displays crew cards |
| T14 | UX | Select Maya and day 149 | her trend and finding appear with units and synthetic provenance |
| T15 | UX | Click View Scenario, change slider, reset | scenario updates deterministically, reset restores initial value |
| T16 | UX | Open Science | NASA reference title/URL appears; demo data clearly separated |
| T17 | UX | Narrow mobile viewport / keyboard nav | no horizontal overflow, all controls reachable, clear focus |
| T18 | build | production build | completes without requiring private API keys |
| T19 | claims | inspect all text | no NASA endorsement/clinical diagnosis/fake treatment efficacy |
| T20 | public | open deployed demo in private tab | no login, no broken links, direct routes resolve |

## Further tests (if time)

- Empty/unknown crew slug gives graceful not-found view.
- Query `day=999` clamps to last day and announces display context.
- Two identical calls return byte-equivalent trace and arrays.
- Refresh deep route preserves valid selected day.
- Missing NASA API at runtime cannot break demo because evidence is checked-in/cached.

## Test evidence format

```text
T04 / Maya sleep & HRV
Observed: <actual mean/baseline and reason code>
Result: PASS/FAIL
File: <test path>
Command: <exact executed test command>
```

Do not assert tests pass until executed. Add date and version/hash in `docs/TEST_REPORT.md`.
