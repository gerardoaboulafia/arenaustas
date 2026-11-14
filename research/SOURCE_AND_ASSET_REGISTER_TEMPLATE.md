# Source and asset register — complete during build

Record every externally sourced image, icon, dataset, research text, code, font, audio asset and model-generated artifact. Public-source data may require attribution even when free; licensed material requires permission. Never copy NASA logos/insignia.

| ID | Type | Author/provider | Title | URL or original path | License/permission | Modification | Used where | AI generation? |
|---|---|---|---|---|---|---|---|---|
| R01 | challenge prompt | NASA Space Apps | Health Monitoring Software challenge | https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/ | attribution | summarized | landing | no |
| R02 | spaceflight evidence | NASA HRP | Human Research Roadmap Evidence | https://humanresearchroadmap.nasa.gov/evidence/ | attribution; verify reuse | summary | science | no |
| D01 | fictional demo data | ASTRA team (generated) | crew_telemetry.csv | data/synthetic/crew_telemetry.csv | team-owned | original | dashboard | seeded synthetic fixture generated with AI-assisted Python |
| A01 | app icon | ASTRA team | original icon | public/app-icon.svg (to create) | original | original | site | record generation if applicable |

## AI use text template

The team made the final project decisions. Describe any AI involvement in brainstorming truthfully; AI-assisted work included [actual tasks], including [frontend implementation / unit tests / documentation]. Any generated visual material is visibly labeled; source files and generated code are acknowledged in metadata/documentation. AI was not treated as a clinical authority, and the prototype's signals come from deterministic rules over synthetic data.

Replace brackets with facts. Do not claim AI use categories or lack of use without reviewing actual development history.
