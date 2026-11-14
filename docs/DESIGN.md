# ASTRA: product design (proposal)

Drafted with Claude Code on 2026-11-14 from `docs/CONCEPT.md` and `PLAN.md`, for the team to compare with other proposals. It describes how to build the concept and adds no features to it. Where it had to choose something the concept does not settle, the line is marked **Proposed**. Nothing here is final until the team agrees.

## 1. This design in ten choices

| # | Question | This design |
|---|---|---|
| 1 | How many screens | Landing plus three tool screens: Twin, Projection, Log |
| 2 | First thing the astronaut sees in the tool | Their twin today: a 2D figure with four body systems, each with a status |
| 3 | Where the five agents show | Each agent owns one zone of the Twin screen, labelled with its name |
| 4 | How a status is decided | Indicators: ranges in `indicators.json`. Body systems: the status of the measure its model computes, with the indicators that feed it shown as drivers |
| 5 | What the projection shows | One chart per body system: 30 days, "if nothing changes" against "with your changes", drawn over status bands |
| 6 | What the what-if changes | Three inputs: sleep hours, resistive exercise minutes, radiation exposure |
| 7 | How "act" works | The Medical Advisor lists sourced actions for everything not nominal. An action tied to a what-if input opens the simulation with that change applied |
| 8 | Where readings come from | Typed in, or a seeded simulated stream, always labelled "Simulated data" |
| 9 | Crew in the demo | **Proposed:** three simulated crew members with generic labels, each in a different state |
| 10 | Look | **Proposed:** dark and monochrome; color is used only for status |

## 2. Path through the product

This is also the demo path. Steps 2 to 5 are the storyline in CONCEPT §9.

1. Landing: read what ASTRA is, press "Open the tool".
2. Select a crew member.
3. Twin: see the figure, notice a body system that is not nominal, select it.
4. The Medical Advisor explains why and suggests an action.
5. Open the what-if with that action applied. The projected line moves and the status at day 30 changes.
6. Log: enter a new reading and see the twin update.

## 3. Screens

### Landing, `/#/`

Sections in order:

1. **Hero.** Name, the concept's question as the headline ("How could you be 30 days from now?"), the team's tagline, one button: "Open the tool".
2. **Why.** Mars-class missions need more medical autonomy. Personalized monitoring, simulation and prevention, not only anomaly detection.
3. **How it works.** Gather, evaluate, act. The five agents with their one-line descriptions from CONCEPT §3, and the statement that they are rule-based modules whose rules and models carry a source.
4. **What-if example.** The concept's own example (15 more minutes of resistive exercise and the bone-density trajectory), shown with the real chart component from the tool, not a picture.
5. **Science and data.** Which sources are used and for what. Simplified projection, simulated data, not a medical device.
6. **Team.**
7. **Footer.** Disclaimers, AI disclosure, links to the repository and references.

No "Beyond astronauts" section until CONCEPT §8 is written.

### Twin, `/#/app`

Top bar on every tool screen: crew selector, mission day, "Simulated data" badge, links to the three screens.

| Zone | Agent label | Content |
|---|---|---|
| Left | Physiology Agent | 2D figure with four clickable systems: muscle, bone, cardiovascular, circadian rhythm. Each shows its status. Selecting one highlights its drivers in the other zones |
| Centre | Biometric Agent | One tile per indicator: heart rate, sleep hours, HRV, SpO2, skin temperature, exercise. Value, unit, status, 14-day sparkline |
| Centre, below | Environment Agent | Tiles for cabin CO2 and radiation dose |
| Right | Medical Advisor | A plain-language summary, then the actions for everything not nominal, alert first. Each action shows its source. An action tied to a what-if input has "See projected effect" |
| Bottom | Prediction Agent | 30-day outlook: for each system, status today and status at day 30 if nothing changes. Link to the Projection screen |

### Projection, `/#/app/projection`

- **What-if panel.** Three sliders: sleep hours, resistive exercise minutes, radiation exposure. Each shows the current habit and the scenario value. A "Reset to current habits" button.
- **Chart.** One body system at a time, chosen with tabs. History, the "if nothing changes" line and the "with your changes" line, over the status bands. A marker where a line enters a different band.
- **Day-30 summary.** All four systems: status if nothing changes, status with the changes.
- **Model card.** For the model on screen: its description, source, limits and basis, and a "needs review" flag when the basis is an assumption.
- A fixed label: "Simplified projection, not a prediction".

### Log, `/#/app/log`

- One row per indicator: label, input with its unit, and the status as soon as a value is typed.
- For the field in focus: "Why it matters" and "How to measure", from `indicators.json`.
- A switch for the simulated telemetry stream, which fills in today's readings, and "Reset to simulated data".
- Readings are saved in the browser, per crew member.

## 4. The five agents as code

Rule-based, pure TypeScript in `src/domain/`, no network. The same input always gives the same output. They map onto the files already listed in `PLAN.md`: `evaluate.ts` and `trend.ts` (Biometric, Environment), `project.ts` (Physiology, Prediction), `summary.ts` (Medical Advisor).

| Agent | Input | Rule | Output |
|---|---|---|---|
| Biometric | Today's readings and history | Each value against the `ranges` in `indicators.json`; trend from the last 14 days | Status and trend per indicator |
| Environment | Cabin CO2 and radiation readings | Same range rule | Status per indicator |
| Physiology | Readings history and `models.json` | Computes today's value of each body-system measure with the same models used for the projection | Status per body system and its drivers |
| Prediction | Current habits, what-if changes, `models.json` | Applies each model day by day for its `horizonDays`, once with current habits and once with the changes | Two series per system, a status per day, the first day the status changes |
| Medical Advisor | All statuses and the `actions` in `indicators.json` | Picks the actions for each status that is not nominal, alert first, and fills a sentence template. It never generates text | Ordered list: explanation, action, source, escalation level |

**Proposed:** "current habits" are the averages of the last 7 days of readings.

## 5. Projection models: what the researcher has to find

One model per row. A row gets numbers only when it has a source; until then it is a candidate, not a claim.

| Projected | What-if input that moves it | Where it comes from |
|---|---|---|
| Bone | Resistive exercise | The concept's own example |
| Circadian rhythm | Sleep hours | The concept's own example |
| Muscle | Resistive exercise | Candidate; drop if no source is found |
| Cardiovascular | Exercise | Candidate; drop if no source is found |
| Cumulative radiation dose | Radiation exposure | Sum of the daily dose; only its status bands need a source |

Rules:

- Parameters live only in `models.json`, never in code.
- A system with no sourced model by Checkpoint 1 (Saturday 12:30) shows today's status from its driver indicators and no projection line.
- Every chart shows the model's limits next to it.

**Gap found in `PLAN.md` §6.4:** a projected measure needs status bands, and `Range` exists only on `Indicator`. **Proposed:** declare each body-system measure as an entry in `indicators.json` with a `derived: true` flag, so it reuses the same ranges, sources and actions and is never typed in by hand.

## 6. Data

- **Flow.** Log screen or simulated stream → readings in `localStorage`, per crew member → evaluate → Twin and Medical Advisor. Current habits plus what-if changes → project → Projection screen.
- **Simulated crew. Proposed:** three, labelled "Crew member A", "B" and "C", with no real names or photos. Seeded, so every load gives the same data. One mostly nominal, one with a system on watch, one with an alert, so the demo can show all three statuses.
- Nothing leaves the browser.

## 7. Look

**Proposed.** CONCEPT §7 is still the team's to answer.

- Dark background, light text, neutral greys. Only status has color.
- Status is always color plus icon plus word (nominal, watch, alert), in colors that also differ in lightness so they hold for color-blind users.
- Numbers in a monospaced face.
- The figure is drawn in SVG: no images to license or watermark.
- Chart lines: history solid, "if nothing changes" grey and dashed, "with your changes" solid and bright.

## 8. Where NASA data can enter

Options for open decision 6 in CONCEPT.

- **A. Hazards and risks.** Each indicator links to the Human Research Program hazards it relates to, shown in the tool with the source. Needs only the challenge's official resources.
- **B. Ranges and models.** Thresholds and model parameters cite NASA documents wherever the researcher can verify one.
- **C. Space weather.** The Environment Agent shows solar particle events from NASA data, the idea from ChronoShield. To keep the site static it needs a snapshot saved at build time. It costs the most time.

A and B are the minimum in `PLAN.md` §7 and are assumed here. C is the team's call.

## 9. Cut order if time runs out

From `PLAN.md` §11:

1. The figure becomes four cards.
2. Indicators drop to four: sleep, exercise, heart rate, radiation.
3. The what-if stays.

## 10. What the team still has to decide

| Decision | What it blocks |
|---|---|
| Name and tagline | Landing hero, demo, Project page |
| Team name and members | Landing team section, first slide of the demo |
| Blood pressure, blood sugar, body temperature, mood: include any? | Log rows and Biometric tiles. Without mood, nothing covers behavioral health |
| When to involve a crewmate or the ground | The escalation label on each action |
| Where NASA data enters | §8 |
| Demo format | Sunday's work |
| Number of simulated crew members | Seed data (§6) |
| Look | §7 |
