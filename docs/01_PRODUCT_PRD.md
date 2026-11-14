# 01 — Product requirements (PRD)

## Problem

Long-duration space missions involve altered gravity, radiation, confinement, sleep disruption, workload and an increasingly autonomous crew. Astronauts need a simple way to review signals over time, notice meaningful deviations and understand what can be discussed or monitored further.

## ASTRA in one sentence

ASTRA is a **prototype multi-agent health-awareness dashboard** that turns synthetic crew telemetry into explainable monitoring insights and transparently illustrative what-if scenarios, grounded in NASA human-research references.

## Primary users and jobs

- **Crew member:** 'Is my recent trend different from my personal baseline, why was it flagged, and which observations should I review?'
- **Crew medical officer:** 'Which synthetic crew member needs review, what signals contributed, and is the input quality adequate?'
- **Judge:** 'What does the system do that is more useful than a static chart? What data are real vs simulated?'

## Must-have end-to-end user journey

1. Judge sees hero in 5 sec and understands **monitor → assess → explore → explain**.
2. Click **Launch Mission**; 4 crew cards and Mission Day selector appear.
3. Pick *Maya Torres* and replay days 24–30; sleep and HRV trend deviates from her own baseline.
4. Open a risk finding. See metric names, baseline comparison, timestamp, quality, provenance and explanation.
5. Open Scenario Explorer. Adjust planned sleep duration + exercise minutes. 30-day outlook visibly updates **only modeled lifestyle exposure/proxy values**, with assumptions and uncertainty clearly shown; never falsely infer bone density.
6. Open the **NASA Evidence** panel and see which source informed the risk category versus which values are demo-only.
7. User can acknowledge a flag and choose 'Review with medical officer' (a UI event; not a real clinical order).

## Pages and components

| Page | Required elements | Success condition |
| --- | --- | --- |
| `/` | hero, challenge, pipeline, mission preview, CTA, safety/data note, references | CTA opens `/mission` |
| `/mission` | crew cards, mission clock, sensor freshness, trend chart, flagged events | selecting astronaut works |
| `/mission/crew/[id]` | header, badges, metric charts, baseline comparison, explainable flags | at least one expected flag reproduced |
| `/mission/scenarios` | crew selector, sliders for target sleep and exercise, baseline vs illustrative trajectory, model disclosure | control changes output instantly and deterministically |
| `/about/science` | NASA research/data provenance, synthetic data explanation, model equations/assumptions, AI disclosure, limitations | source URLs work |

## Operational states

- Healthy / no notable deviation; early trend deviation; notable deviation requiring review; insufficient data. These are **demo workflow states**, not clinical severity classes.
- Demo timeline: mission days 120–149, 4 crew members, daily aggregate measures. Device readings are fictional and not live.
- On risk card: source metrics, compared dates, direction of change, magnitude, missingness, human-review CTA.

## Explicit non-goals

- Medical diagnosis, clinical triage, emergency response algorithms, treatment protocols.
- Claiming 30-day bone/muscle/radiation clinical outcome forecasts.
- Genuine biometric device integration, surveillance/voice analysis, 3D anatomy requiring precise modeling.
- Data collection from real people, account registration, EHR integration.
- Deep-learning training, streaming IoT, production security/compliance certification.

## Judge-facing message

- **Impact:** helps people notice trends early and prepare more informed conversations.
- **Creativity:** agents separate observation, signal evaluation, exploratory simulation and communication.
- **Validity:** reproducible calculations, clear synthetic provenance and NASA-supported risk taxonomy.
- **Relevance:** tracks health indicators and enables evaluation/action through review flows.
- **Presentation:** visually clear 30-sec story: alert → evidence → scenario → next step.

## Out-of-scope until P0/P1 done

3D body, multi-language product copy, browser notifications, cloud DB, login, hardware pairing, PDF medical records, live LLM actions, and social features.
