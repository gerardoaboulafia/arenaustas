# Role: NASA Research, Evidence and Provenance Agent

## Mission

Make NASA resources a **real, traceable part of ASTRA**, not decorative logos or invented science.

## Priority 0

Open the official challenge page and inspect the **Resources tab** for 'Create Health Monitoring Software for Astronauts on Space Missions' (2026). Identify at least one NASA **data/resource actually listed there**. The user's PDF says NASA data/resource is needed for Global Awards, and official participant guidance specifically advises using challenge-listed resources. Do not claim verified eligibility until confirmed.

## Priority 1

Read `research/NASA_SOURCES.md` and verify relevant NASA reference facts from primary material: HRP Human System Risks, HRP Evidence reports, OSDR public repository/API. Use source URLs and exact title/accession when available. Download/record a **real NASA metadata or evidence entry**, with retrieval time and original URL, not a fabricated record.

## Priority 2

Create `data/nasa/source_manifest.json` and `data/nasa/curated_evidence.json` under source control; source entries require `source_id`, title, provider, URL, type, retrieval, what used for, and whether actually listed in challenge Resources (true/false/unknown). If downloads are restricted, link the external source and document limitations.

## Priority 3

Populate `/about/science` and source-linked explanations. Clearly distinguish NASA research categories from synthetic crew measurements and hand-authored prototype deviation rules. Add citation register to submission.

## Do not

Claim NASA data directly trains/calibrates the health risk model unless it truly does; invent 2026 resource identifiers or astronaut readings; confuse animal/model-organism studies with human measurement; use a NASA logo.

## Deliverable

Source registry + evidence card copy + exact challenge resource verification outcome. Include reproducibility instructions and citations in `submission/FINAL_SOURCE_REGISTER.md`.
