# References

Every external resource used by the project. Add a row whenever a library, dataset, text, image or font is added.

## NASA and partner resources

| Resource | Organization | Link | How the product uses it | Accessed |
|---|---|---|---|---|
| 5 Hazards of Human Spaceflight (challenge resource) | NASA Human Research Program | https://www.nasa.gov/hrp/hazards/ | The five hazards in `hazards.json`; each indicator and body system links to them; shown on the landing page and in the Log screen | 2026-11-14 |
| Risks of Human Spaceflight (challenge resource) | NASA Human Research Program | https://www.nasa.gov/hrp/risks/ | Context for which indicators the tool follows | 2026-11-14 |
| Counteracting Bone and Muscle Loss in Microgravity | NASA, International Space Station research | https://www.nasa.gov/missions/station/iss-research/counteracting-bone-and-muscle-loss-in-microgravity/ | Base rate of the bone model in `models.json` (roughly 1% per month without countermeasures); context for the exercise indicator (crews exercise about two hours a day) | 2026-11-14 |
| Risk of Performance Decrements and Adverse Health Outcomes Resulting from Sleep Loss, Circadian Desynchronization, and Work Overload | NASA Human Health and Performance | https://www.nasa.gov/directorates/esdmd/hhp/risk-of-performance-decrements-and-adverse-health-outcomes-resulting-from-sleep-loss-circadian-desynchronization-and-work-overload/ | Context for the sleep indicator and the circadian rhythm system. Sets no threshold | 2026-11-14 |
| Space Radiation | NASA Human Health and Performance | https://www.nasa.gov/directorates/esdmd/hhp/space-radiation/ | Context for the radiation dose indicator. Sets no threshold | 2026-11-14 |
| NASA-STD-3001 Technical Brief: Carbon Dioxide (OCHMO-TB-004) | NASA Office of the Chief Health and Medical Officer | https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf | The alert limit of the cabin CO2 indicator in `indicators.json`: 3 mmHg, 1-hour average in the habitable volume. Also the 7-day figure quoted in the indicator's explanation | 2026-11-15 |
| NASA-STD-3001 Technical Brief: Radiation Protection (OCHMO-TB-020) | NASA Office of the Chief Health and Medical Officer | https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-020-radiation-protection.pdf | The `careerLimitMsv` parameter of the radiation model in `models.json`: career effective dose below 600 mSv | 2026-11-15 |
| Monitoring radiation for astronaut health (challenge resource, space agency partner) | Canadian Space Agency | https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp | The neutron share parameter of the radiation model in `models.json` (about 30% of total radiation on the International Space Station), used to split the projected mission dose; linked from the radiation hazard | 2026-11-14 |

## Software

| Resource | Use | License | Link |
|---|---|---|---|
| React, React DOM | User interface | MIT | https://react.dev |
| React Router | Hash routes | MIT | https://reactrouter.com |
| Vite, @vitejs/plugin-react | Build and dev server | MIT | https://vite.dev |
| TypeScript | Language and type check | Apache-2.0 | https://www.typescriptlang.org |
| Tailwind CSS, @tailwindcss/vite | Styling | MIT | https://tailwindcss.com |
| Vitest | Tests | MIT | https://vitest.dev |
| @fontsource-variable/inter, @fontsource-variable/space-grotesk, @fontsource-variable/jetbrains-mono | Self-hosted fonts | OFL-1.1 | https://fontsource.org |
| GitHub Actions: checkout, setup-node, upload-pages-artifact, deploy-pages | Build and deploy | MIT | https://github.com/actions |

## Fonts, images, icons, data

- Fonts, bundled with the site through the Fontsource packages (no request to a font service): Inter, Space Grotesk and JetBrains Mono, each under the SIL Open Font License 1.1. https://fontsource.org
- Images: none from outside the project. The body figure, logo mark, icons and charts are SVG drawn by the project's own code. The demo slides and `docs/demo/shots/` hold screenshots of the tool itself, taken with headless Google Chrome, which also exported `public/ASTRA-demo.pdf`.
- Data: no external dataset. All crew readings are simulated by `src/domain/seed.ts`.

## Team's own earlier work

From the team's `astra` branch, written by a teammate with an AI coding assistant: the personal baseline with a persistence check, the no-data state, the agent trace, the mission-day replay, the color palette, the crew-wide comparison view, the export and import of readings with validation, and the names and roles of the four fictional crew members. The features were re-implemented here; no code was copied. The crew names and roles were taken as written.
