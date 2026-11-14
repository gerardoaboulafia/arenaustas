# ASTRA source verification

Verified at **2026-11-14 01:22:21 UTC**, equivalent to **2026-11-13 22:22:21 in Buenos Aires (UTC-03:00)**. This is the actual research date, not a backdated event build timestamp.

## Scope and result

Three official NASA research resources were read and paraphrased into [curated_evidence.json](../data/nasa/curated_evidence.json). [source_manifest.json](../data/nasa/source_manifest.json) records providers, retrieval time, source roles, guide fingerprint and verification boundaries. These are curated research-context entries, not downloaded NASA observations or study-level datasets. No accession was invented; each accession is null.

| Stable ID | Verified primary reference | Supported use |
| --- | --- | --- |
| nasa-sleep | [NASA sleep/circadian/workload risk article](https://www.nasa.gov/directorates/esdmd/hhp/risk-of-performance-decrements-and-adverse-health-outcomes-resulting-from-sleep-loss-circadian-desynchronization-and-work-overload/) | Sleep context in evidence cards; no personalized HRV cause or sleep treatment effect |
| nasa-human-risks | [Human System Risks](https://www.nasa.gov/hhp/human-system-risks/) | Risk-domain catalog; no calibration of the prototype rules |
| nasa-spaceflight | [Risks of Human Spaceflight](https://www.nasa.gov/hrp/risks/) | Mission hazards and sleep/fitness research context; no biological scenario coefficients |

The [Human Research Roadmap evidence index](https://humanresearchroadmap.nasa.gov/evidence/) was also read to cross-check the sleep-risk category. No full evidence report, OSDR study, omics file or real astronaut health record was imported. The included fixture remains fictional and separate.

## 2026 challenge Resources: unverified

The official search result for [Create Health Monitoring Software for Astronauts on Space Missions](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/) confirms the challenge title and its monitoring, evaluation and action brief. It does not establish the contents of its Resources tab.

Actual retrieval attempts:

1. Official challenge URL: web reader returned 502 Bad Gateway, including a retry through its indexed result.
2. [Resources tab URL](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/?tab=resources): web reader reported the URL inaccessible.
3. Official online submission guide and event root: web reader returned 502.
4. Python HTTPS and PowerShell Invoke-WebRequest fallbacks: local certificate-chain validation failed. TLS verification was not disabled.
5. [NASA Space Apps discussion 1772](https://github.com/nasa/spaceapps/discussions/1772): read the November 3 question, November 4 answer and organizer-selected answer marker. The thread reports prior Resources availability issues and an expected November 13 release; it does not enumerate accepted sources. A community answer is not an eligibility ruling.

Every evidence record therefore retains **is_challenge_listed: null**. This means unknown, not absent. Neither NASA hosting, a search snippet, a community reply nor a third-party challenge mirror establishes direct inclusion. No Global Award eligibility claim is made.

Resolution: a human reviewer should open the official Resources tab, record the exact listed source title and URL with a timestamp, match it against this catalog, and update flags only on direct evidence. If a different NASA resource is listed, verify and integrate it before claiming challenge-specific compliance.

## Supplied guide independently reviewed

The PDF skill was read in this task before extraction. All 16 pages of [the supplied guide](../source_documents/NASA_Space_Apps_Challenge_2026_Submission_Guide.pdf) were extracted in memory with pypdf. Its SHA-256 is:

`0038f842fc3680bab831fb8fb968d64e4cb702642f2203ac2936d71b00354761`

The guide identifies itself as a November 13, 2026 print of the [official Project Submission Guide](https://www.spaceappschallenge.org/resources/project-submission-guide/). The online version could not be independently compared. Text extraction establishes the requirements below; no PDF layout or screenshot QA is claimed.

| Printed page | Requirement verified in supplied text |
| --- | --- |
| 2-3 | Project submission opens November 14, 2026 at 09:00 and closes November 15 at 23:59 in the Local Event timezone; Universal Event uses Team Owner residence timezone. |
| 5-8 | Public external links for demo/final project; image uploads allowed but documents/videos must be hosted elsewhere; named form fields. |
| 9 | Disclose AI use; the guide restricts AI-originated solution ideas; mark generated images/video visibly and acknowledge generated audio/code/data; at least one NASA data/resource is required for Global Awards. |
| 10 | List external resources, tools and assets and obtain permissions where needed. |
| 11-12 | English project materials; video at most 30 seconds or deck at most seven slides including cover; English subtitles if narration uses another language. |
| 13 | Confirmed team/event membership, completed English form, terms/originality acceptance, Submit for Judging and confirmation; no likeness of under-18 persons in final project/demo. |

The supplied guide's NASA-resource requirement is verified. A subsequent direct read of [organizer discussion 1827](https://github.com/nasa/spaceapps/discussions/1827), Paula-GO-Team's November 5 answer, also explicitly requires a NASA source included in the challenge Resources for Global Awards. This corroborates the repository's challenge-list gate; whether ASTRA satisfies it remains unresolved.

## Actual timing and AI review

The user explicitly directed immediate local implementation on November 13, 2026 in Buenos Aires. Continue the authorized local work and retain accurate timestamps. That instruction does not establish competition eligibility or override organizer rules. The supplied guide's opening is still in the future in this timezone. The [organizer answer in discussion 1827](https://github.com/nasa/spaceapps/discussions/1827) permits advance topic/resource research and team formation, but says project work should start November 14 at 09:00 in the applicable timezone and that early work can lead to disqualification. The team must confirm its registered event and any approved exception. Do not call early implementation compliant or silently reset its start date.

Codex performed source research, evidence paraphrasing, JSON preparation and submission drafting in this task. The pre-existing [synthetic provenance](../data/synthetic/SYNTHETIC_PROVENANCE.json) explicitly credits an AI-assisted seeded Python generator. The human team must review prior brainstorming and idea origin, application code/test generation, media and final authorship before making an eligibility or originality declaration. Exclusively human ideation is **not established** by this audit.

## Integration and release boundaries

Static source inspection confirms integration: `src/app/about/science/page.tsx` imports and maps the catalog into evidence cards; `src/components/mission.tsx` and `src/components/scenarios.tsx` pass it into `getMissionView`; the orchestrator resolves the three stable IDs and `src/lib/agents/explanation.ts` formats catalog-backed context. This is source-level verification, not a browser or production execution result. No model-training, clinical-validation or causal efficacy claim follows from these references.

The current package manifest declares Next.js, React, TypeScript, Tailwind CSS, Recharts, lucide-react and Vitest. Primary upstream licenses were checked; see [the final source register](../submission/FINAL_SOURCE_REGISTER.md). This is not an exhaustive audit of resolved transitive dependencies.

This research task does not certify typecheck, lint, Vitest, production build, browser QA or deployment. The application release owner must execute the required commands and record actual results in the existing test report. No public upload, deployment, account action or official submission was performed or authorized.

## Reproduction

From the repository root, parse the two JSON files, confirm unique stable IDs and ISO UTC timestamps, and reopen the three source URLs. Compare the relevant article/catalog sections with each summary, then check the official Resources tab separately. To recheck the supplied PDF without changing it:

```powershell
@'
from pathlib import Path
from hashlib import sha256
from pypdf import PdfReader
p = Path("source_documents/NASA_Space_Apps_Challenge_2026_Submission_Guide.pdf")
print(sha256(p.read_bytes()).hexdigest())
reader = PdfReader(p)
for n, page in enumerate(reader.pages, 1):
    print(f"PAGE {n}")
    print(page.extract_text())
'@ | python -
```

## Executed artifact checks

At **2026-11-14 01:30:10 UTC**, an inline Python audit passed: all three records have exactly the requested eight fields; IDs are unique and stable; corresponding manifest fields agree; URLs use NASA HTTPS hosts; retrieval timestamps parse as UTC; every challenge flag remains null; and the original PDF hash still matches. The canonical fixture was also counted directly: 120 rows and four crew IDs.

The same audit confirmed exactly seven numbered slides, **45 narration words** and a **28-second storyboard target**, all relative Markdown links resolving, and no UTF-8 replacement characters. No final media file exists to measure. Only intentional human fields remain: team/member details, event/timezone, reviewer/date, AI history and public URLs. These checks do not constitute application tests or production-build verification.

## Human release blockers

- Challenge-specific source listing and award eligibility remain unverified.
- Event registration/timezone, early-build acceptability and AI idea-origin eligibility need human review.
- Team names and actual app/demo/repository URLs must be supplied by the team.
- Runtime integration, application release checks and media capture require their own evidence.
- Publication and official submission require a later human-controlled action; the requested deliverable is local.
