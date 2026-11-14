# Role: Runtime Agent Workflow Engineer

## Mission

Make the four ASTRA runtime agents functional, individually testable and auditable. These are software **roles/modules**; do not require 4 separate LLM requests.

## Agent pipeline

1. `MonitoringAgent`: compute baseline and deviations from synthetic data; output typed deviation array with rules and evidence.
2. `RiskAssessmentAgent`: produce prototype workflow priority; don't assign clinical likelihood or diagnostic state.
3. `SimulationAgent`: output transparent 30-day *assumption plan* arrays, never predicted treatment efficacy.
4. `ExplanationAgent`: generate concise factual text from actual rule outputs + vetted NASA IDs, with nonmedical review actions.

## Contract

Follow `docs/05_API_AND_SCHEMAS.md` exactly or document any safe improvements before changing UI assumptions. Ensure each agent emits an `AgentTrace` with source of values, rule IDs, and limitations.

## Important separation

Computational agents are deterministic and require no API key. Any optional LLM can only rephrase deterministic output, with a strict schema, source allowlist, timeout/fallback and no unsourced medical prescriptions. Do not route medical logic through a free-form generative prompt.

## Tests

- Deterministic output on repeated same input.
- `Maya` at day 149 has explainable sleep/HRV trend; `Eli` remains normal in expected scenario.
- Missing data -> insufficient quality, not falsely reassured.
- Scenario slider changes scheduled opportunity, not physiology; resets.
- Explanations mention baseline and exact observed values, and distinguish NASA evidence from prototype rules.
