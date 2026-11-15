# Project page text

One section per field of the NASA Space Apps Project page, ready to paste. Written with Claude Code from the facts in this repository.

The site and the repository are public since 2026-11-15. Both links below were opened signed out and work.

## 1. Project Name

ASTRA

## 2. High-Level Project Summary

ASTRA is a health monitoring tool that gives each astronaut a digital twin. The astronaut logs daily readings such as heart rate, blood pressure, sleep and mood. The twin compares every reading with that astronaut's own baseline, shows the state of four body systems on a clickable figure, and lists what to do and who to involve: the astronaut, the crew medical officer, or the flight surgeons on the ground.

It then asks the next question: how could you be 30 days from now if your current habits and conditions continue? A what-if simulation lets the astronaut change sleep, exercise or radiation exposure and see the projected effect before committing to a countermeasure.

On a Mars-class mission the crew is far from medical help and has to notice a problem early and act on it alone. ASTRA is built for that: it runs entirely in the browser with no network call, explains every signal in plain language, and shows the source or the assumption behind every number.

## 3. Link to Project Demo

https://gerardoaboulafia.github.io/arenaustas/ASTRA-demo.pdf

Seven slides. The same deck as a web page: https://gerardoaboulafia.github.io/arenaustas/#/demo

## 4. Link to Final Project

https://gerardoaboulafia.github.io/arenaustas/

## 5. Detailed Project Description

**What it does**

ASTRA follows the three steps of the challenge.

- Gather. The Log screen takes 13 indicators: heart rate, blood pressure (systolic and diastolic), blood sugar, body temperature, sleep hours, mood, heart rate variability, blood oxygen, skin temperature, resistive exercise, cabin CO2 and radiation dose. Readings are typed in over a simulated telemetry stream, or imported from a CSV file; they can be exported the same way, for example to send to the ground. Every row of an imported file is checked, and a file with any wrong row changes nothing. Each field explains why the measurement matters, how to take it, and which spaceflight hazard it relates to.
- Evaluate. The Twin screen compares the mean of the last three days of each indicator with the mean of the astronaut's own first 14 days, so a status reflects a change in that person and not a population average. One odd reading does not change a status. Four body systems (circadian rhythm, cardiovascular, muscle, bone) are drawn on a figure and can be selected. Every status is shown as a color, an icon and a word: nominal, watch or alert.
- Act. The Medical Advisor lists an action for everything that is not nominal and says who to involve. A watch stays with the astronaut. An alert goes to the crew medical officer. An alert that lasts four days or more is reported to the flight surgeons in the next scheduled message to the ground, because a Mars-class mission cannot count on a live conversation with Earth. The Crew screen gives the crew medical officer everyone on one page: who needs attention, why, and one indicator compared across the crew, either as recorded or as the change from each person's own baseline.

**The 30-day projection and the what-if**

The Projection screen shows where each body system and the mission radiation dose are heading over the next 30 days if the last week's habits continue. Three sliders (sleep, resistive exercise, radiation exposure) change the scenario, and the chart shows both lines with their status day by day. An action from the Medical Advisor can open the projection with that change already applied.

The projection is a simplified projection, not a prediction. It applies five small, explicit models kept in one file, and each chart shows its model, its parameters, its source and what it leaves out.

**How it works**

ASTRA is organized as five agents, each a tested TypeScript module: the Biometric Agent (indicator statuses), the Environment Agent (cabin CO2 and radiation), the Physiology Agent (body systems), the Prediction Agent (the 30-day models) and the Medical Advisor (actions and escalation). They are rules and explicit models. The same input always gives the same result, and the tool shows a trace of what each agent received, which rule it applied and what it returned.

The Biometric Agent also runs one small machine-learning model, the pattern check. It learns each astronaut's normal from their own 14 baseline days (the mean of six indicators and how they move together) and measures how far each new day is from that normal. It flags a day that is farther than any baseline day, three days running, and names the indicators that explain it. This catches several small shifts that are each inside their own limit. It has only seen simulated data, so it can raise a watch and never an alert.

No language model runs in the product. Every threshold, action and model parameter is in JSON files, not in code, and carries a source or the tag "Assumption".

**What is real and what is not**

- All crew data is simulated from a fixed seed. The four crew members are fictional; their call signs (Stokes, Green, Gauss, Riemann) are surnames from calculus. No real astronaut data is used.
- Sourced from NASA and the Canadian Space Agency: the five hazards, the base rate of the bone model, the cabin CO2 limit, the career radiation limit, and the neutron share of the radiation dose.
- Every other threshold, action text and model parameter is an assumption chosen to make the prototype work. The tool tags each one. No clinician has reviewed them.
- The projected mission radiation dose is compared with NASA's career limit of 600 mSv. The tool sets no lower watch level, because none was taken from a source.
- ASTRA is a prototype, not a medical device. It explains signals and suggests actions subject to mission protocols. It does not diagnose.

**Benefits**

- The astronaut sees a change against their own normal early, with a plain explanation and a next step.
- The what-if shows the projected effect of a countermeasure before the astronaut commits time to it.
- The tool works with no connection to Earth and no account, and nothing leaves the device.
- Every number can be traced to a source or to a visible assumption.

**What we hope to achieve**

Next steps are a review of every threshold and model by flight surgeons, readings from wearables and cabin sensors instead of typed values, and space weather data for the Environment Agent. The same loop (a personal baseline, a simple projection, a what-if before changing a habit) could also serve people who are far from a doctor for long periods: crews of polar stations, ships and remote work sites, and patients followed at home between visits. The prototype has not tested this.

**Tools and languages**

TypeScript, React, Vite, Tailwind CSS, React Router and Vitest (46 unit tests on the health logic, the sourced limits and the data import). Charts and the body figure are SVG drawn by the project's own code. The site is static and is published with GitHub Actions and GitHub Pages. Source code: https://github.com/gerardoaboulafia/arenaustas

## 6. Use of Super Intelligence (SI)

We used an AI assistant, Claude Code (Anthropic's Claude models), throughout the project, and the product contains one machine-learning component.

What the team did. The team wrote seven candidate concepts for this challenge, including the digital twin with a 30-day projection, the what-if simulation and the five agents. The team chose the stack direction, asked for the changes during the weekend (a richer interface, machine learning where possible) and delegated a set of scoping decisions to the assistant.

What the AI assistant did:

- Read the submission guide and the challenge page and drafted the project plan.
- Compared the team's seven concepts against the judging criteria and recommended one of them, ASTRA. Translated the team's notes on it from Spanish into the concept file.
- Made scoping decisions that a team member delegated to it, recorded as such in `docs/CONCEPT.md`: including the four indicators from NASA's brief that the notes did not list, the escalation ladder, where NASA and partner data enter the product, the demo format, the tagline (the team's own question, shortened) and the paragraph on who else could benefit.
- Fetched and read the NASA and Canadian Space Agency pages listed below and wrote the knowledge files from them.
- Wrote the source code, the tests, the simulated dataset, the site text, the demo slides and this Project page text.
- Compared the team's two prototypes and combined them into the submitted build.

A teammate built a second prototype with another AI coding assistant (OpenAI Codex). The crew view, the idea of a named crew with roles and the export and import of readings come from that prototype and were written again for the submitted build.

Machine learning inside the product: the pattern check described above, an unsupervised statistical model (mean and covariance of the baseline days, Mahalanobis distance) fitted in the browser on each simulated astronaut's own readings.

Not used: no AI-generated images, video or audio. The figure, icons and charts are SVG drawn by code, and the slides use screenshots of the tool.

Where it is acknowledged: the `ai-disclosure` meta tag in the site's HTML, a comment at the top of each AI-written source file, the site footer, the last slide of the demo, the README, the commit trailers, and the full log in `docs/AI_USAGE.md`.

## 7. NASA Data

- **5 Hazards of Human Spaceflight**, NASA Human Research Program (challenge resource). https://www.nasa.gov/hrp/hazards/ The five hazards are the backbone of the knowledge base (`src/data/knowledge/hazards.json`). Every indicator and body system links to the hazards behind it, shown in the Log screen and in the hazard map on the landing page.
- **Risks of Human Spaceflight**, NASA Human Research Program (challenge resource). https://www.nasa.gov/hrp/risks/ Context for which indicators the tool follows; cited next to the advice for heart rate variability and other indicators.
- **Counteracting Bone and Muscle Loss in Microgravity**, NASA International Space Station research. https://www.nasa.gov/missions/station/iss-research/counteracting-bone-and-muscle-loss-in-microgravity/ Its figure of roughly 1% bone density lost per month without countermeasures is the base rate of the bone projection model (`models.json`). Its note that crews exercise about two hours a day is the context for the exercise indicator.
- **Risk of Performance Decrements and Adverse Health Outcomes Resulting from Sleep Loss, Circadian Desynchronization, and Work Overload**, NASA Human Health and Performance. https://www.nasa.gov/directorates/esdmd/hhp/risk-of-performance-decrements-and-adverse-health-outcomes-resulting-from-sleep-loss-circadian-desynchronization-and-work-overload/ Context for the sleep indicator and the circadian rhythm system. It sets no threshold in the tool.
- **Space Radiation**, NASA Human Health and Performance. https://www.nasa.gov/directorates/esdmd/hhp/space-radiation/ Context for the radiation dose indicator. It sets no threshold in the tool.
- **NASA-STD-3001 Technical Brief: Carbon Dioxide (OCHMO-TB-004)**, NASA Office of the Chief Health and Medical Officer. https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf The standard's limit of 3 mmHg for the 1-hour average CO2 partial pressure is the alert line of the cabin CO2 indicator (`indicators.json`). In the simulated mission it is what turns one crew member's cabin CO2 into an alert.
- **NASA-STD-3001 Technical Brief: Radiation Protection (OCHMO-TB-020)**, NASA Office of the Chief Health and Medical Officer. https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-020-radiation-protection.pdf The career limit of 600 mSv is a parameter of the radiation model (`models.json`); the Projection screen shows the projected mission dose as a share of it.

## 8. Space Agency Partner Data and Other References

Space agency partner:

- **Monitoring radiation for astronaut health**, Canadian Space Agency (challenge resource). https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp Its figure that neutron radiation is about 30% of the total radiation on the International Space Station is the `neutronShare` parameter of the radiation model, used to split the projected mission dose.

Software (all open source):

- React and React DOM, MIT. https://react.dev
- React Router, MIT. https://reactrouter.com
- Vite and @vitejs/plugin-react, MIT. https://vite.dev
- TypeScript, Apache-2.0. https://www.typescriptlang.org
- Tailwind CSS and @tailwindcss/vite, MIT. https://tailwindcss.com
- Vitest, MIT. https://vitest.dev
- GitHub Actions (checkout, setup-node, upload-pages-artifact, deploy-pages), MIT. https://github.com/actions

Fonts, bundled with the site through the Fontsource packages, each under the SIL Open Font License 1.1 (https://fontsource.org): Inter, Space Grotesk, JetBrains Mono.

Images: none from outside the project. The figure, logo mark, icons and charts are SVG drawn by the project's code. The slides use screenshots of the tool.

Data: no external dataset. All crew readings are simulated by the project's own code.

Tools used to make it: Claude Code (AI assistant, see the SI field), Google Chrome (screenshots and PDF export of the slides).

## Screenshots to upload

In `docs/demo/shots/`, PNG, each about 1 MB or less:

1. `twin.png`: the Twin screen with the figure and the Medical Advisor.
2. `projection.png`: the what-if and the 30-day projection.
3. `log.png`: the Log readings screen.
4. `crew.png`: the Crew screen.
5. `pattern.png`: the pattern check card.
6. `landing.png`: the landing page.

## Checklist

Done in the repository:

- [x] English only in the site, README, slides and this text.
- [x] Demo is 7 slides (the PDF has 7 pages; the slide footer counts them).
- [x] Slides name the team, the members and the challenge, show the project, describe the user experience, and say how NASA and partner data are used.
- [x] NASA resources are part of the product, not only citations (hazards, bone model rate), plus one partner resource (radiation model).
- [x] Every external resource is listed in `docs/REFERENCES.md` and in field 8.
- [x] AI use is disclosed in the site, the code, the slides, the README and field 6. No AI-generated images.
- [x] No NASA logos, insignia, flags or mission identifiers. Nobody is pictured.
- [x] 46 unit tests pass and the site builds.

For the person who submits:

- [ ] Check the team name and the four members on slide 1 against the team page on the Space Apps site. They come from `src/data/team.json`.
- [x] Site and repository published on 2026-11-15; every page and the demo PDF were opened signed out.
- [ ] Open both links yourself in a private window just before submitting.
- [ ] Turn the edit Lock on, paste fields 1 to 8, upload the screenshots, Save Progress.
- [ ] Tick the Terms and Conditions box and the original-work box, press "Submit for Judging", and confirm the banner. The deadline is Sunday Nov 15, 23:59 Local Event time.

## Publish

Published on 2026-11-15. GitHub Pages serves the `gh-pages` branch at https://gerardoaboulafia.github.io/arenaustas/.

After any change to the site, publish it again from the project folder:

```bash
npm run publish:site
```

The command tests, builds and replaces the `gh-pages` branch. The live site updates about a minute later.

The public repository includes the `astra` branch, the team's second prototype. Its README says its implementation began on November 13 and makes no claim of event-window compliance; decide with the team whether that branch stays.
