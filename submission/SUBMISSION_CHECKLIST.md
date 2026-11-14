# ASTRA submission and local release checklist

Prepared November 13, 2026 Buenos Aires / November 14 UTC. Checked items below describe completed research/documentation only. Application tests, public access, timing compliance and eligibility must not be inferred from them.

## Completed locally

- [x] Independently read the PDF skill and extract all 16 pages of the supplied submission guide with pypdf.
- [x] Verify three official NASA source pages and save stable-ID evidence records and a scoped manifest.
- [x] Attempt the 2026 challenge Resources tab and document failures; leave listing flags null.
- [x] Complete English project copy, seven-slide outline, video script and source/asset register.
- [x] Confirm the declared stack: Next.js, React, TypeScript, Tailwind CSS, Recharts, lucide-react, deterministic modules and Vitest.
- [x] Inspect source-level catalog imports and exact-ID resolution in the science, mission, scenario and explanation paths.
- [x] Record actual UTC/local dates, known AI assistance and human review requirements.
- [x] Keep the work local; no publication or official submission.

## Required local application release gate

These are executable release requirements, not results from this research task. The release owner must record actual output in the project's test report.

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run start
```

Run from the repository root with the committed lockfile and the Node version documented by the application owner. Run the smoke/e2e script as documented by that owner when available.

- [ ] Installation is reproducible; no required private API keys.
- [ ] Typecheck, lint, Vitest and production build all pass.
- [ ] Landing, mission, Maya detail, scenarios and science routes work when loaded directly.
- [ ] Timeline and crew controls update real deterministic results; missing data is explicit.
- [ ] Scenario control and reset behavior match the 30-day planning equations.
- [ ] The science page and explanations actually consume the checked-in source IDs and display source roles.
- [ ] Mobile, keyboard and reduced-motion behavior pass the acceptance walkthrough.
- [ ] No diagnosis, clinical severity/probability, medical orders, EVA clearance or assumed efficacy claims.
- [ ] Production runtime starts locally; retained docs, fixture and original PDF are intact.

## Event timing and eligibility - human gate

Guide pages 2-3 and 13 give November 14, 2026 09:00 opening and November 15 23:59 submission cutoff in the registered Local Event timezone; Universal Event uses Team Owner residence timezone. These times do not prove the team's registration or permission to build early.

- [ ] Confirm actual team registration, event and controlling timezone.
- [ ] Confirm local judging times with the Local Lead; they may differ from submission times.
- [ ] Review work performed November 13 in Buenos Aires before the guide's opening. The user requested immediate work; no compliance or approved exception is assumed.
- [ ] Review solution idea origin and all AI brainstorming honestly against the guide's AI restriction. Do not claim exclusively human ideation without evidence.
- [ ] Resolve the selected challenge's Resources listing and award eligibility; do not treat null as verified.
- [ ] Confirm team members meet the same-event participation requirement.
- [ ] Human reviewer accepts terms and originality only after resolving the above.

The [organizer answer in discussion 1827](https://github.com/nasa/spaceapps/discussions/1827) corroborates the challenge-listed NASA-source requirement and warns that early project work can lead to disqualification. It permits advance research and team formation. These review items do not pause authorized local implementation. They do prevent an unsupported statement that the entry is eligible.

## Project page fields

- [ ] Project name and high-level summary.
- [ ] Link to Project Demo: actual accessible video or deck.
- [ ] Link to Final Project: actual accessible app/project.
- [ ] Detailed description matches the released behavior.
- [ ] AI/SI usage accurately identifies tools, generated code/data and idea-origin history.
- [ ] NASA Data lists the three actual contextual resources and their precise role; add any verified challenge-listed resource actually used.
- [ ] Space Agency Partner Data / Other References lists only resources actually used, with licenses and credits.
- [ ] Team name, member roster, event/timezone and human reviewer filled.
- [ ] All required fields and linked materials are English; remove drafting instructions and unfilled human markers.

## Demo limits and presentation

- [ ] Choose one final demo: video at most 30 seconds OR at most seven slides including cover and intro.
- [ ] Capture the actual product, identifiable team and selected challenge.
- [ ] Readable research source attribution and synthetic-data distinction.
- [ ] Measure the final video duration or count exported slides; an outline/script alone is not the final demo.
- [ ] If narration is not English, add English subtitles.
- [ ] No under-18 likenesses in final project/demo; verify final media.
- [ ] Generated images/video have visible AI identification; generated audio/code/data are disclosed.
- [ ] No NASA brand elements generated, copied into branding or presented as endorsement.

## Publication and final submission - not authorized in this task

- [ ] Obtain separate authorization to publish the app, repository or demo.
- [ ] Supply real public URLs; do not substitute localhost.
- [ ] Test every submitted URL without login, permission or registration.
- [ ] Check application deep links, source links and downloadable materials.
- [ ] Host video/deck externally: guide pages 5-6 say project-page uploads accept images, not documents/videos.
- [ ] Optionally request FortiGuard classification if appropriate; the guide describes this as recommended, not mandatory.
- [ ] Human clicks Submit for Judging before the applicable deadline; saving is not submitting.
- [ ] Human verifies the success banner and the final resubmission state.

## Reference trail

See [VERIFICATION.md](../research/VERIFICATION.md), [the source manifest](../data/nasa/source_manifest.json), [FINAL_SOURCE_REGISTER.md](FINAL_SOURCE_REGISTER.md) and [the supplied guide](../source_documents/NASA_Space_Apps_Challenge_2026_Submission_Guide.pdf), especially pages 2-3, 5-13. The online guide could not be independently compared during this audit.
