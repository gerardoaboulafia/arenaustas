# ASTRA: product design (proposal)

Drafted with Claude Code on 2026-11-14 from `docs/CONCEPT.md` and `PLAN.md`, for the team to compare with other proposals. It describes how to build the concept and adds no features to it. §1 to §10 are the original proposal, kept as written; lines marked **Proposed** there were all adopted or replaced, and §11 to §14 say what was built. No decision in this file is still open.

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

The options considered for decision 6 in CONCEPT. Settled: A and B are built, C is a next step (§14).

- **A. Hazards and risks.** Each indicator links to the Human Research Program hazards it relates to, shown in the tool with the source. Needs only the challenge's official resources.
- **B. Ranges and models.** Thresholds and model parameters cite NASA documents wherever the researcher can verify one.
- **C. Space weather.** The Environment Agent shows solar particle events from NASA data, the idea from ChronoShield. To keep the site static it needs a snapshot saved at build time. It costs the most time.

A and B are the minimum in `PLAN.md` §7 and were built. C was left out.

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

## 11. What the first build changed

Recorded on 2026-11-14 after comparing this design with the `astra` branch and building it.

Taken from the `astra` branch (re-implemented, no code copied):

- **Personal baseline.** An indicator's status compares the mean of the last 3 days with the mean of the astronaut's first 14 days on record, instead of fixed ranges. One odd reading does not change a status. This replaces the `ranges` in `PLAN.md` §6.4 with a `rule` per indicator.
- **No-data state.** Too few readings gives "No data", not a guess.
- **Agent trace.** "How this was decided" on the Twin screen lists each agent's input, rule and result.
- **Mission-day replay.** A day slider and a Replay button in the top bar.
- **Palette.** Deep navy, blue panels and one cyan accent. Status colors stay reserved for status.

Different from §1 to §8 above:

- Body-system measures live in their own file, `systems.json`, instead of `derived` entries in `indicators.json`.
- Charts are plain SVG; no chart library.
- The Log screen has no telemetry switch. Simulated readings are always filled in and can be typed over or reset.
- Radiation dose is projected but has no status bands: no dose limit has been verified from a source yet.
- No escalation label was shown on actions in that first build. It was added later (§13).

Still assumptions that need review (the tool tags each one): every indicator threshold, every action text, the status bands of the four body-system measures, the exercise effect in the bone model, and all parameters of the muscle, cardiovascular and circadian models.

## 12. Machine learning and partner data

Added on 2026-11-14 at a team member's request.

- **Pattern check (machine learning).** Inside the Biometric Agent, `src/domain/anomaly.ts` learns each astronaut's normal from their own 14 baseline days: the mean of the six biometric indicators and how they move together (a covariance matrix, shrunk toward its diagonal because the baseline is short). Each day is scored by its Mahalanobis distance from that normal. The score is calibrated on the astronaut's own data by leave-one-out: a day is unusual when it is farther than the farthest baseline day, three days running.
- **Why it earns its place.** It catches what single-indicator rules miss. Crew member D has four small shifts, each inside its own limit; no rule fires, and the pattern check raises a watch and names the contributors.
- **Its limits, stated in the tool.** It has only seen simulated data, so it can raise a watch and never an alert. It is unsupervised, fitted in the browser, and deterministic. Its settings are in `rules.json` and marked as assumptions.
- **Disclosure.** The submission guide counts machine learning as an SI tool, so this component has to be named in the "Use of Super Intelligence (SI)" field of the Project page.
- **Partner data.** The radiation model now splits the projected mission dose with the Canadian Space Agency's figure for the neutron share on the International Space Station (about 30%). The parameter is tagged "Partner source" in the model card.
- A fourth simulated crew member, D, was added for the case above.

## 13. Indicators from the brief and the escalation ladder

Added on 2026-11-14, decided by Claude after a team member delegated the open decisions.

- **Indicators.** Blood pressure (systolic and diastolic), blood sugar, body temperature and mood join the first eight, so every indicator NASA's brief names is covered: 13 in total. Each uses the personal-baseline rule; every threshold is an assumption that needs review.
- **Escalation ladder.** Each finding of the Medical Advisor says who to involve: the astronaut (watch), the crew medical officer (alert), or the flight surgeons on the ground (an alert lasting four days or more, sent in a scheduled message because a Mars-class mission cannot count on a live conversation with Earth). The rule is in `rules.json`.
- **No placeholders on the site.** Tagline, team name and members come from `src/data/team.json` and are hidden while empty.

## 14. Closing the open decisions and the demo

Added on 2026-11-14 after a team member asked Claude to settle everything still open and make the project deliverable.

- **Every decision is settled** in `docs/CONCEPT.md`: name ASTRA, the tagline taken from the team's own question, team Arenaustas, NASA and partner data entering through the knowledge base (option A and B of §8; space weather, option C, is a next step), and a 7-slide deck as the demo.
- **Demo deck.** `src/demo/DemoDeck.tsx`, at `/#/demo`: seven slides drawn at 1280 x 720, scaled on screen and printed one per page. Exported to `public/ASTRA-demo.pdf`. The slides use screenshots of the tool from `docs/demo/shots/`.
- **Deep links.** The tool reads `crew`, `day`, `sleep`, `exercise`, `radiation` and `system` from the link once, on load, so a link can open a prepared frame.
- **Twin screen layout.** Two columns on wide screens (twin and readings; advisor and cabin), so a long list of advice no longer leaves an empty area under the figure.
- **Tags.** The tool shows "Assumption" where it used to show "Assumption · needs review". The data files keep `needsReview: true`, and the landing page says that no clinician has reviewed those values.
- **Project page text** is in `docs/SUBMISSION.md`.

## 15. Combining the two prototypes

Added on 2026-11-15 after a team member asked to evaluate both branches and build one solution from the best of each.

What the `astra` branch (Santiago Arena) does well: it treats the mission as a whole, with a crew-wide chart of one indicator and show/hide per person; its data can be exported, edited and imported again, with strict validation that rejects a wrong file and never leaks the future; its crew are named people with roles; and it is heavily tested. What it does not have: the twin and body systems, sourced models, advice on what to do and who to involve, the indicators NASA's brief names, a landing page or a finished demo. It is also a different stack (Next.js), so nothing could be merged as code.

What this branch does well: the twin figure and four body systems, the 30-day projection from sourced models with the what-if, the Medical Advisor and its escalation ladder, the learned pattern check, 13 indicators, the landing page, the demo and the Project page text.

What was combined, re-implemented here with no code copied:

- **Crew screen** (`/#/app/crew`, `src/app/CrewPage.tsx`). A table of who needs attention, worst first, with each body system, the pattern check and who to involve; and one indicator compared across the crew. The comparison can be drawn as recorded values or as the change from each person's own baseline, which joins his crew-wide chart with this branch's personal baseline. Each line has its own dash pattern and none uses a status color.
- **Named fictional crew.** Four named crew members with roles replace "Crew member A to D". The names first came from the `astra` branch; the team then changed them to call signs from calculus: Stokes, Green, Gauss and Riemann. The roles are still the ones from `astra`.
- **Export and import of readings** (`src/domain/csv.ts`, Log screen). One row per day, crew member and indicator. Import checks every row and applies nothing if any is wrong; an empty value stays "no reading"; days after the current mission day are neither exported nor accepted.
- **Tests carried over as ideas:** CSV round trip, atomic rejection, missing values, and a check that nothing recorded after a day changes that day's twin.

Left out on purpose: the 180-day schedule with activities and 15-minute telemetry, the editable configuration and the add-indicator form. They belong to a different mission model (an orbital mission with EVAs) from the concept's Mars-class setting and daily readings, and they could not be finished and verified before the deadline.

## 16. Two limits taken from NASA's standard

Added on 2026-11-15, before the feature freeze, to answer the main weakness of the build: almost every threshold was an assumption.

- **Cabin CO2.** NASA-STD-3001 limits the 1-hour average CO2 partial pressure in the habitable volume to 3 mmHg (technical brief OCHMO-TB-004). The indicator now has that limit on top of the personal-baseline rule: at or above it, the status is an alert whatever the baseline. The tool compares the limit with the mean of the last three daily readings and says that this is a simplification. In the simulated mission this turns one crew member's cabin CO2 (Gauss) from a watch into an alert.
- **Radiation.** The career limit of 600 mSv (technical brief OCHMO-TB-020) is a parameter of the radiation model. The Projection screen shows the projected mission dose as a share of it. No lower watch level was invented.
- Both numbers were read in NASA's own documents, and tests check that a sourced limit is never marked as an assumption.
- Looked for and not found on the NASA pages already cited: a number for sleep need and a dose limit on the Space Radiation page. Those values stay assumptions.

