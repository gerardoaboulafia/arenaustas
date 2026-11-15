# Concept: ASTRA

The ideas in this file are the team's. On 2026-11-13 the team shared seven candidate concepts; Claude compared them against the judging criteria, recommended this one, and translated the team's notes into this template. Two of the seven, "ASTRA" and "Aegis-Bio", describe the same idea and are merged here.

- Lines marked **Suggested** are Claude's scoping suggestions for the weekend, not new ideas. The team kept all of them.
- Lines marked **Decided** were open in the team's notes. On 2026-11-14 a team member delegated them to Claude ("you are in charge, you make the decisions", then "make all the pending decisions"). They are scoping choices inside the team's concept, taken from the team's own notes and from what the build already does. No line in this file is still open.

## Decisions

| # | Question | Decision | Decided by |
|---|---|---|---|
| 1 | Final name and tagline | **ASTRA**, Astronaut Health Digital Twin. The tagline is the question the team wrote in its notes (§3), shortened: "How could you be 30 days from now?" | Team's words; chosen by Claude under delegation, 2026-11-14 |
| 2 | Team name and members | Team **Arenaustas**: Gerardo Aboulafia, Santiago Arena, Álvaro Hernández and Nicolás Masino. The name and the first two were taken from the repository and its commit authors; a team member added the other two on 2026-11-15 | Recorded by Claude, 2026-11-14 and 2026-11-15 |
| 3 | Are the agents LLM-powered? | No. The five agents are rule-based modules (team, 2026-11-13). A team member then asked for machine learning where possible: the Biometric Agent also runs a small statistical model learned from each astronaut's own baseline readings. The Medical Advisor stays rule-based and no LLM is used | Team |
| 4 | Indicators named in NASA's brief but not in the notes | All four are included: blood pressure, blood sugar, body temperature and mood. Mood covers behavioral health | Claude under delegation, 2026-11-14 |
| 5 | When to involve a crewmate or the flight surgeons | Escalation ladder. Watch: the astronaut acts alone. Alert: the crew medical officer is involved. An alert lasting four days or more: reported to the flight surgeons in the next scheduled message to the ground. The day count is an assumption that needs review | Claude under delegation, 2026-11-14 |
| 6 | Where NASA and partner data enter the product | In the knowledge base that drives every status, action and projection: the five hazards and the bone-loss rate come from NASA's Human Research Program and station research pages, and the neutron share of the radiation model comes from the Canadian Space Agency. Since 2026-11-15 two limits from NASA's standard are also used: 3 mmHg for cabin CO2 and the 600 mSv career radiation limit. Each card in the tool shows its source. Live space weather (the ChronoShield idea) is not built this weekend and is named as a next step | Claude under delegation, 2026-11-14 |
| 7 | Demo format | A 7-slide deck (`/#/demo` on the site, exported to `docs/demo/ASTRA-demo.pdf`). No video | Claude under delegation, 2026-11-14 |

## 1. Identity (required)

- Project name: ASTRA, Astronaut Health Digital Twin
- Tagline (one sentence): How could you be 30 days from now?
- Team name: Arenaustas
- Team members: Gerardo Aboulafia, Santiago Arena, Álvaro Hernández, Nicolás Masino

## 2. User and setting

- Who is using the tool: an astronaut looking at their own digital twin. The demo starts by selecting an astronaut.
- Mission setting: Mars-class, long-duration missions, where medical decisions have to be made with more autonomy.
- Horizon we design for: projections 30 days ahead.
- In what moment of their day: **Decided:** a short daily check. The astronaut logs or confirms the day's readings, looks at the twin, and acts on what the Medical Advisor lists.

## 3. Our idea (required)

ASTRA creates a digital twin of each astronaut that evolves during the mission and makes it possible to anticipate health risks. Instead of asking only how the astronaut is today, ASTRA tries to answer: how could they be 30 days from now if they continue with their current habits and conditions?

What is different: personalized monitoring, simulation and prevention, not only anomaly detection. Instead of static alerts, the astronaut runs "what-if" countermeasure simulations, for example seeing how 15 more minutes of resistive exercise or an adjustment to light therapy shifts their bone-density and circadian trajectories.

ASTRA is organized as five agents:

- **Biometric Agent:** analyzes heart rate, sleep and other indicators.
- **Physiology Agent:** tracks muscular, bone and cardiovascular changes.
- **Environment Agent:** evaluates radiation and spacecraft conditions.
- **Prediction Agent:** projects scenarios using explicit models.
- **Medical Advisor:** explains the results and suggests preventive actions, subject to protocols.

Why we chose it: it follows the direction of NASA's Human Research Program toward proactive, autonomous medical decision support for Mars-class missions. (This sentence is the team's reason for choosing the idea. It is not shown on the site as a fact because no citation was verified for it.)

## 4. Indicators we track

From our notes:

- [x] Heart rate
- [x] Daily sleep hours (sleep and activity from actigraphy)
- [x] Heart rate variability (HRV)
- [x] Blood oxygen (SpO2)
- [x] Skin temperature
- [x] Exercise (minutes of resistive exercise)
- [x] Cabin CO2
- [x] Radiation dose

Body systems the twin follows: muscle, bone, cardiovascular, circadian rhythm.

Named in NASA's brief and added (decision 4):

- [x] Blood pressure
- [x] Blood sugar
- [x] Body temperature
- [x] Mood

How readings come in: our notes describe wearable telemetry and cabin sensors.
For the prototype: manual entry over simulated telemetry, clearly labelled. No hardware. All thirteen indicators are built.

## 5. Features

The core loop is fixed by the challenge: enter readings → see status → see what to do.

Optional items listed in NASA's brief.

Lighter ones:

- [x] Charts of indicators over time (the trajectories)
- [x] Color coding of status, always with an icon and a word.
- [x] Simple instructions and explanations for each measurement: why it matters, how to measure it, which hazard it relates to.

Bigger ones. **Decided:** only the figure; the other three are out of scope (§10).

- [ ] Different environments (spacecraft, station, rover, surface base)
- [ ] Prompts to take measurements or do actions as part of the mission routine
- [ ] Gamification of health tasks
- [x] Clickable human figure showing status by body part (the digital twin view)

Our own features:

1. **Digital twin per astronaut.** Select an astronaut and see their twin; it evolves as the mission goes on.
2. **30-day projection.** Where each body system is heading if current habits and conditions continue.
3. **What-if simulation.** Change sleep hours, exercise or environmental exposure and watch the projected state change.
4. **Five agents**, as listed in §3, each contributing its part of the picture.
5. **Medical Advisor.** Explains the results and suggests preventive actions, subject to protocols.

Added on 2026-11-15 from a teammate's prototype (the `astra` branch), when a team member asked to combine the best of both builds:

6. **Crew view.** The whole crew on one screen for the crew medical officer, with one indicator compared across everyone.
7. **Named fictional crew.** Maya Torres, Eli Chen, Sofia Okafor and Noah Patel, each with a role.
8. **Export and import of readings** as a CSV file. Every row is checked, a wrong file changes nothing, and the future is never exported.

## 6. What "act" means in our tool

- Guidance: the Medical Advisor suggests preventive actions, subject to protocols. The what-if simulation lets the astronaut see the projected effect of a countermeasure before committing to it.
- When to involve a crewmate or the flight surgeons on the ground: **Decided:** the escalation ladder in decision 5. Every finding of the Medical Advisor says who to involve.
- How NASA or partner data show up beyond citations: **Decided:** as parameters and content of the knowledge base (decision 6). NASA's bone-loss rate drives the bone projection, the Canadian Space Agency's neutron share splits the projected radiation dose, and NASA's five hazards are linked from every indicator and body system. One of our own other ideas, ChronoShield, cross-referenced space weather and solar particle events; feeding it to the Environment Agent is a next step, not part of this build.

## 7. Look and feel

- Our notes describe an interactive 3D anatomical twin.
  **Suggested:** a 2D figure for the weekend (see §10).
- Three words for the mood: **Decided:** calm, precise, readable.
- Colors, fonts or references we like: **Decided:** what the build uses. Deep navy background, one cyan accent, and green, amber and red reserved for status. Fonts: Inter, Space Grotesk and JetBrains Mono. The palette comes from the team's first prototype.

## 8. Beyond astronauts

**Decided:** the same loop (a personal baseline, a simple projection, a what-if before changing a habit) could serve people who are far from a doctor for long periods: crews of polar stations, ships and remote work sites, and patients followed at home between visits. This is a hope stated in the Project page, not something the prototype has tested.

## 9. Demo

Storyline from our notes: select an astronaut, observe their digital twin, and simulate how their projected state changes when sleep hours, exercise or environmental exposure are modified.

Format:

- [x] 7-slide deck
- [ ] Video, 30 seconds or less (English subtitles if not spoken in English)

Who owns the demo: **Decided:** the team member who submits the Project page. The deck is built from the site (`/#/demo`).

## 10. Out of scope this weekend

Decided by the team:

- LLM-generated medical advice. The five agents are rule-based modules whose rules and models carry a source. This keeps the site static, working offline, repeatable in a demo, and free of machine-written medical claims.

Kept from the suggestions, all three:

- Real wearable or cabin-sensor integration. Readings are typed in or simulated.
- A 3D anatomical model. The twin is a 2D figure with clickable body systems.
- Validated clinical prediction. Projections come from simple explicit models and are labelled as simplified projections, not predictions.

Also out: different environments, measurement prompts, gamification, live space weather, and the team's other five concepts (NeuroVitals, ChronoShield, OsteoCardio Loop, CrewPulse, EVA Guardian).
