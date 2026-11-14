# ASTRA judging alignment and rehearsal notes

The supplied submission guide names Impact, Creativity, Validity, Relevance and Presentation (page 11). This is ASTRA's evidence plan, not an official rubric score or a claim of measured benefit. The source package is prepared; runtime demonstrations and human eligibility checks must be completed separately.

| Criterion | Concrete demonstration | Evidence and boundary |
| --- | --- | --- |
| Impact | A crew member can inspect a changing signal and prepare a human review | Landing-to-finding workflow; no measured health or mission-performance improvement claimed |
| Creativity | Monitoring, Risk Assessment, Simulation and Explanation exchange typed records | Actual agent trace and pure modules; no invented claim that four LLMs operate autonomously |
| Validity | Reproducible fixture, explicit baselines/rules, quality indicators and source roles | Actual Vitest/build output from release owner, checked-in NASA evidence catalog and clear limits; no clinical validation |
| Relevance | Gather indicators, evaluate a change and explore a review step | Timeline, crew detail and planning controls; prototype actions do not send medical orders |
| Presentation | Show the actual product and one understandable journey | 28-second target script or exactly seven slides; final export must meet the guide's hard cap |

## Judge questions

**Is this real astronaut telemetry?**  
No. Four fictional crew members have 30 days each of seeded synthetic data. NASA web resources provide research context and do not supply these readings.

**What do the four agents do?**  
Monitoring checks observations and compares them with an individual baseline. Risk Assessment assigns fixture-specific review states. Simulation compares assumed schedules. Explanation shows contributing inputs, rules, quality and contextual citations. They are ordinary deterministic functions.

**What does the 30-day view predict?**  
It compares assumed sleep opportunities and exercise minutes. It does not predict an individual's health, bone density, recovery or treatment benefit.

**Why show sleep and HRV together?**  
They are separate synthetic signals compared with their own baselines. Co-occurrence is a fixture pattern, not proof that one caused the other. The sleep source does not validate an HRV causal model or the thresholds.

**What NASA resources did you use?**  
The checked-in catalog contains the sleep/circadian/workload risk article (`nasa-sleep`), Human System Risks (`nasa-human-risks`) and Risks of Human Spaceflight (`nasa-spaceflight`). Their role is contextual evidence. Show the actual catalog-fed UI and the [source register](FINAL_SOURCE_REGISTER.md).

**Are these challenge-listed sources and is the project eligible?**  
The pages themselves were verified, but the official challenge Resources tab was inaccessible. Every listing flag remains null. Award eligibility, event timing and AI idea-origin compliance need human review; do not answer yes before resolving them.

**Was AI involved?**  
Yes. Codex assisted with research, evidence records and submission drafting, and the supplied fixture credits AI-assisted generation. Include code/test generation and all prior ideation assistance in the team's complete account. Do not make an unsupported human-only originality claim.

**What happens if data is missing?**  
The quality assessment must expose the gap and avoid treating insufficient observations as a confident normal state. Demonstrate the actual behavior against the acceptance tests.

**What does Review with medical officer do?**  
It is a prototype workflow action. It is not a diagnosis, clinical order or actual notification to another person.

**What comes next?**  
Expert review, authorized data access, privacy/security design and prospective testing. These are future requirements, not completed validations.

## Rehearsal sequence

1. Launch Mission and identify the synthetic-data label.
2. Open Maya at mission day 149 and inspect the baseline comparison and rule.
3. Show the contributing readings and quality/agent trace.
4. Change the scenario assumptions and explain the planned-minute arithmetic.
5. Open a NASA evidence card and distinguish research context from fictional readings.
6. Close with limitations, actual team and a real app URL only when available.

Use [VIDEO_SCRIPT_30S.md](VIDEO_SCRIPT_30S.md) for a short capture or [SLIDES_7_OUTLINE.md](SLIDES_7_OUTLINE.md) for the seven-slide alternative. No hosted media, public link, test result or eligibility signoff is implied by this rehearsal plan.
