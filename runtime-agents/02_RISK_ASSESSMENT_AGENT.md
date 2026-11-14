# Runtime Risk Assessment Agent — specification

**Purpose:** turn signal deviations into a *prototype workflow state*, not a medical risk estimate.

**Module:** `src/lib/agents/riskAssessment.ts` (pure TypeScript).

## Inputs

`Deviation[]` from Monitoring plus metric-specific quality status for a crew member/day.

## Rules

- 0 persistent health deviations -> `normal`.
- Exactly 1 persistent health deviation -> `observe`.
- 2 or more distinct persistent health deviations -> `review`.
- Missing baseline or insufficient recent data for the evaluated metric -> `insufficient_data` for that metric; overall status must not falsely assert normality for unavailable data.
- CO2 alone -> `observe` with environmental context, no medical cause/effect claims.
- Radiation proxy does not participate in classification.

Findings must expose contributing metric keys, exact rule IDs, observed vs baseline values, timeframe and workflow action `review_measurements` / `discuss_with_medical_officer` / `continue_observing`.

## Constraints

Never output a numeric clinical severity score, disease diagnosis, probability of adverse event, evacuation order, exercise prescription, or medication plan. Clear 'review suggested' is fine.

## Tests

Two persistent health signals yield `review`; a stable Eli day149 yields `normal`; environmental-only flag does not become a clinical state; missingness is not silently benign.

## Handoff

Send structured Finding(s) with reason codes to Explanation Agent. UI uses structured object for expandable audit card.
