# Concept: ASTRA

The ideas in this file are the team's. On 2026-11-13 the team shared seven candidate concepts; Claude compared them against the judging criteria, recommended this one, and translated the team's notes into this template. Two of the seven, "ASTRA" and "Aegis-Bio", describe the same idea and are merged here.

- Lines marked **Suggested** are Claude's scoping suggestions for the weekend, not new ideas. They stand unless the team changes them.
- Lines marked **Team:** are not covered by the team's notes and are still unanswered. Agents must not fill them in.

## Open decisions for the team

1. Final name (ASTRA or Aegis-Bio) and a tagline.
2. Team name and members.
3. Decided by the team on 2026-11-13: ASTRA's five agents are rule-based modules, not LLM-powered (see §10).
4. NASA's brief names blood pressure, blood sugar, body temperature and mood. Our notes do not. Include any? Without mood, behavioral health is not covered.
5. When does ASTRA tell the astronaut to involve a crewmate or the flight surgeons on the ground? The brief asks this and our notes do not answer it.
6. Where does NASA data enter the product (§6)?
7. Demo format (§9).

## 1. Identity (required)

- Project name: ASTRA, Astronaut Health Digital Twin (working name)
- Tagline (one sentence): **Team:**
- Team name: **Team:**
- Team members: **Team:**

## 2. User and setting

- Who is using the tool: an astronaut looking at their own digital twin. The demo starts by selecting an astronaut.
- Mission setting: Mars-class, long-duration missions, where medical decisions have to be made with more autonomy.
- Horizon we design for: projections 30 days ahead.
- In what moment of their day: **Team:**

## 3. Our idea (required)

ASTRA creates a digital twin of each astronaut that evolves during the mission and makes it possible to anticipate health risks. Instead of asking only how the astronaut is today, ASTRA tries to answer: how could they be 30 days from now if they continue with their current habits and conditions?

What is different: personalized monitoring, simulation and prevention, not only anomaly detection. Instead of static alerts, the astronaut runs "what-if" countermeasure simulations, for example seeing how 15 more minutes of resistive exercise or an adjustment to light therapy shifts their bone-density and circadian trajectories.

ASTRA is organized as five agents:

- **Biometric Agent:** analyzes heart rate, sleep and other indicators.
- **Physiology Agent:** tracks muscular, bone and cardiovascular changes.
- **Environment Agent:** evaluates radiation and spacecraft conditions.
- **Prediction Agent:** projects scenarios using explicit models.
- **Medical Advisor:** explains the results and suggests preventive actions, subject to protocols.

Why we chose it: it follows the direction of NASA's Human Research Program toward proactive, autonomous medical decision support for Mars-class missions. (The researcher must back this sentence with a citation before it appears on the site.)

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

Named in NASA's brief but not in our notes (open decision 4):

- [ ] Blood pressure
- [ ] Blood sugar
- [ ] Body temperature
- [ ] Mood

How readings come in: our notes describe wearable telemetry and cabin sensors.
**Suggested:** for the prototype, manual entry plus a simulated telemetry stream, clearly labelled. No hardware.
**Suggested:** build first the inputs the what-if simulation needs (sleep, exercise, heart rate, radiation exposure); add the rest if time allows.

## 5. Features

The core loop is fixed by the challenge: enter readings → see status → see what to do.

Optional items listed in NASA's brief.

Lighter ones:

- [x] Charts of indicators over time (the trajectories)
- [ ] Color coding of status. **Suggested:** yes; the shared status badge already does it.
- [ ] Simple instructions and explanations for each measurement. **Suggested:** yes; this is the Medical Advisor's "explains the results".

Bigger ones, two at most for the weekend:

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

## 6. What "act" means in our tool

- Guidance: the Medical Advisor suggests preventive actions, subject to protocols. The what-if simulation lets the astronaut see the projected effect of a countermeasure before committing to it.
- When to involve a crewmate or the flight surgeons on the ground: **Team:** (open decision 5)
- How NASA or partner data show up beyond citations: **Team:** (open decision 6). One of our own other ideas, ChronoShield, cross-referenced space weather and solar particle events; that could feed the Environment Agent.

## 7. Look and feel

- Our notes describe an interactive 3D anatomical twin.
  **Suggested:** a 2D figure for the weekend (see §10).
- Three words for the mood: **Team:**
- Colors, fonts or references we like: **Team:**

## 8. Beyond astronauts

**Team:**

## 9. Demo

Storyline from our notes: select an astronaut, observe their digital twin, and simulate how their projected state changes when sleep hours, exercise or environmental exposure are modified.

Format:

- [ ] 7-slide deck
- [ ] Video, 30 seconds or less (English subtitles if not spoken in English)

Who owns the demo: **Team:**

## 10. Out of scope this weekend

Decided by the team:

- LLM-generated medical advice. The five agents are rule-based modules whose rules and models carry a source. This keeps the site static, working offline, repeatable in a demo, and free of machine-written medical claims.

**Suggested**, all three:

- Real wearable or cabin-sensor integration. Readings are typed in or simulated.
- A 3D anatomical model. The twin is a 2D figure with clickable body systems.
- Validated clinical prediction. Projections come from simple explicit models and are labelled as simplified projections, not predictions.

Also out: the team's other five concepts (NeuroVitals, ChronoShield, OsteoCardio Loop, CrewPulse, EVA Guardian), except any piece the team decides to fold in under §6.
