# Hackathon Plan: Health Monitoring Software for Astronauts

NASA Space Apps Challenge 2026 · Challenge: **Create Health Monitoring Software for Astronauts on Space Missions**
(Intermediate · Human Exploration, Software, Space Exploration)
Challenge page: https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/

> **Status, Sun Nov 15, midday.** The two prototypes are combined ([docs/DESIGN.md](docs/DESIGN.md) §15). The product, the 7-slide demo and the Project page text are done. Every open decision is settled in [docs/CONCEPT.md](docs/CONCEPT.md). The site and repository are public. What is left is for the person who submits: paste the fields from [docs/SUBMISSION.md](docs/SUBMISSION.md), and press "Submit for Judging". The rest of this file is the plan as written on Friday; the build departed from it in places (no chart library, different data contract), described in [docs/DESIGN.md](docs/DESIGN.md) §11 to §14.

## 1. At a glance

| | |
|---|---|
| Submission window | Sat Nov 14, 09:00 → Sun Nov 15, 23:59, Local Event time |
| Our own deadlines | First "Submit for Judging" Sun 18:00 · final re-submit Sun 22:00 |
| What we ship | 1. Public website: landing page (`/`) that explains the solution, then the working tool (`/app`) · 2. Public GitHub repo · 3. Demo: 7-slide deck or a video of 30 s or less · 4. The Project page with all 8 fields filled, in English |
| Scored 1–5 on | Impact · Creativity · Validity · Relevance · Presentation |
| After the weekend | Global Nominees Dec 3, 2026 · Finalists Dec 17, 2026 · Winners Jan 26, 2027 |

## 2. Read this first: the idea has to be ours

The submission guide says, about AI tools (it calls them "SI"):

> "SI should not be used to (come up with your idea of how to solve the challenge)."

The guide defines SI tools as "machine learning, chatbots, image generation, and large language models", so the rule covers Claude and every other assistant we use. AI is allowed "to accelerate innovation and creativity", so using agents to research, code, test and write is fine. Inventing the concept is not. This plan is built around that line:

- **The concept is the team's.** The team came up with seven candidate ideas. Claude compared them against the judging criteria and recommended ASTRA, the team's digital-twin idea, then translated the team's notes into [docs/CONCEPT.md](docs/CONCEPT.md). Lines there marked "Suggested" are scoping suggestions for the weekend, and the team can change them. Lines marked "Team:" are for the team to answer.
- **The plan and the agents cover everything else**: process, architecture, research, implementation, QA, demo and submission text.
- Feature ideas listed in this plan are quoted from NASA's own challenge page, not invented here. Picking among them, and adding our own, is the team's job.
- Agents build what `docs/CONCEPT.md` says, never edit it, and leave its "Team:" lines for the team.

We also have to tick "I confirm that the submitted project represents my team's original work", so this matters beyond style.

## 3. Hard rules (any miss can make us ineligible)

- [ ] Every team member is registered, confirmed (not waitlisted) at the **same Local Event**, and shows on the team's Members tab. Max 6 members. Nobody can be added after submission closes.
- [ ] **English only** on the Project page and in everything linked from it: site, repo README, slides. A video may be spoken in another language only with English subtitles.
- [ ] Demo is **7 slides or fewer** (title and intro slides count) **or a video of 30 seconds or less**. Over the limit means no Global Judging.
- [ ] Slides name the **team**, the **team members** and the **challenge**, show an image of the project, describe the user experience, and say how NASA and partner data make the solution possible.
- [ ] Every link opens **without login, password or permission request**. Test each one in a private window.
- [ ] At least **one NASA data source or resource** is used (required for Global Awards), and it is a core part of the solution, not decoration.
- [ ] **All external resources are listed** in the References field: code libraries, text, images, data, fonts, icons, even when open source.
- [ ] **AI use is disclosed**: AI-generated images and video carry a visible watermark; AI-generated code, data and audio are acknowledged in descriptive text and in metadata.
- [ ] Generated content does not use or modify **NASA logos, flags or mission identifiers**.
- [ ] No image, video, audio or likeness of anyone **under 18**.
- [ ] No copyrighted material we lack permission for.
- [ ] All required form fields complete, both checkboxes ticked, **"Submit for Judging" pressed before Sun 23:59**, confirmation banner seen. Only the last saved submission is judged.

## 4. What the challenge asks for

The core sentence: build "a health monitoring software that **gathers** health indicators and enables astronauts to **evaluate** and **act** on the status of their health." The brief also asks for "a **visual** tool" that "provides guidance on treatments and health improvements". Those three verbs are the backbone every part of the product is checked against.

| Step | What NASA's brief says |
|---|---|
| Gather | Any input works: keyboard, mouse clicks, camera images. Indicators it names: blood pressure, heart rate, blood sugar, body temperature, daily sleep hours, mood. |
| Evaluate | Support "a quick assessment". Questions it raises: which measurements can be performed in space, why an exam is needed, how spaceflight hazards affect each indicator. |
| Act | "When might a result warrant attention from the crew or from flight surgeons on the ground? What actions can be taken to prevent a critical health condition?" |

Things the brief says we **may** consider (a menu, not requirements):

- different environments: spacecraft, space station, rover, base on another planet or moon
- prompting astronauts to take measurements or do actions as part of the mission routine
- a gamification system for health tasks
- dynamic charts of indicators over time
- color coding to read a status at a glance
- a human figure with clickable body parts showing function and health status
- simple instructions and explanations, because we should "not assume that astronauts know everything about how to assess their health"

**Team decisions (go in `docs/CONCEPT.md`):** the name and tagline, the mission setting, which indicators, which items from the menu, what "act" means in our tool, what makes our approach different, the look and feel, and who benefits beyond astronauts.

**Scope tiers**

1. **Core loop, must work end to end by Sat 18:30:** enter readings → see a status per indicator → see what to do about it, with the NASA source visible.
2. **The differentiator:** the 30-day projection and the what-if simulation, then the twin figure (see §4.1).
3. **Polish:** only after feature freeze (Sun 12:00).

### 4.1 Chosen concept: ASTRA

The full text is in `docs/CONCEPT.md`. In short: a digital twin of each astronaut that shows their state today and projects it 30 days ahead, with a what-if simulation where changing sleep, exercise or environmental exposure changes the projection.

| Step | In ASTRA |
|---|---|
| Gather | Readings and habits per astronaut, plus cabin conditions |
| Evaluate | The twin: status today by body system, and where each is heading in 30 days |
| Act | The what-if simulation shows the projected effect of a countermeasure before committing to it; the Medical Advisor explains results and suggests preventive actions |

**Build order:** 1. core loop on today's readings · 2. projection engine · 3. what-if controls · 4. twin figure. Steps 2 and 3 are what set ASTRA apart, so they come before the figure.

**Naming:** ASTRA's five "agents" (Biometric, Physiology, Environment, Prediction, Medical Advisor) are parts of the product. They are unrelated to the build agents in §8.

**The main risk is Validity.** A projection that looks like invented science would cost more than it earns. Every projection therefore comes from a simple, explicit, cited model and is labelled a simplified projection, not a prediction (§6.4, §6.5).

## 5. How we score on each criterion

| Criterion | What judges look for | What we do about it |
|---|---|---|
| Impact | A significant problem, wide reach | The landing page states the problem with cited NASA facts. CONCEPT §8 answers who else benefits. |
| Creativity | A novel concept or meaningful improvement | CONCEPT §3 "what is new about our approach". This cannot be delegated. |
| Validity | Scientifically sound, feasible, usable, complete | Every threshold and recommendation carries a citation. A human reviews the medical content. Deployed working tool, unit-tested logic, a clear "prototype, not a medical device" notice. |
| Relevance | Directly addresses the challenge, NASA data integral | Gather, evaluate and act are all present. Each indicator traces to an HRP hazard and source, visible in the UI. The NASA Data field names exactly what was used and where. |
| Presentation | Clear, engaging story in demo and project page | The landing page is the story. One person owns the demo from Saturday. Summary understandable with zero context. |

## 6. Product shape and architecture

### 6.1 Shape

One static web app, two parts:

- `/#/` **Landing page**: what the problem is, how our solution works, the science and data behind it, the team, a button into the tool.
- `/#/app` **The tool**: the solution itself.

No backend and no accounts. Data stays in the browser, so judges can use it instantly with no login. The tool starts with a clearly labelled **simulated** mission dataset so charts and statuses are not empty.

### 6.2 Stack

| Layer | Choice | Why |
|---|---|---|
| Build | Vite + React + TypeScript | Fast to scaffold, static output |
| Styling | Tailwind CSS | Quick, consistent UI |
| Routing | React Router with `HashRouter`, Vite `base: './'` | Deep links survive refresh on GitHub Pages |
| Charts | Recharts | Trend charts with little code |
| State and storage | React state + `localStorage` | No server needed |
| Tests | Vitest | Unit tests for the health logic |
| Hosting | GitHub Pages via GitHub Actions | The repo must be public anyway; one account, public by default |

Keep dependencies few: every one has to be listed in the References field.

### 6.3 Folders and ownership

Agents working at the same time must not touch each other's folders.

| Path | Owner agent |
|---|---|
| root config, `index.html`, `src/main.tsx`, `src/router.tsx`, `src/components/ui/`, `src/styles/`, `.github/workflows/`, `README.md` | `foundation-engineer` |
| `docs/research/`, `src/data/knowledge/*.json`, `docs/REFERENCES.md` (sources) | `hrp-researcher` |
| `src/domain/` | `health-engine-engineer` |
| `src/app/` | `app-ui-builder` |
| `src/landing/` | `landing-builder` |
| `docs/qa/` | `qa-verifier` |
| `docs/demo/` | `demo-storyteller` |
| `docs/SUBMISSION.md`, final pass on `docs/REFERENCES.md` and `docs/AI_USAGE.md` | `submission-writer` |
| `docs/CONCEPT.md` | **the team.** Agents never edit it. |

### 6.4 Data contract

The researcher writes JSON in this shape; the engine reads it. Agreeing on it up front lets both work in parallel.

```ts
type Status = 'nominal' | 'watch' | 'alert';   // always shown as color + icon + word
type Basis  = 'nasa' | 'partner' | 'clinical' | 'assumption';

interface Source { id: string; title: string; org: string; url: string; accessed: string } // YYYY-MM-DD
interface Hazard { id: string; name: string; summary: string; sourceIds: string[] }

interface Range  { status: Status; min?: number; max?: number; label: string;
                   basis: Basis; sourceId?: string; needsReview?: boolean }
interface Action { text: string; escalate: 'self' | 'crew' | 'ground';
                   basis: Basis; sourceId?: string }

interface Indicator {
  id: string; name: string; unit: string;
  group?: string;                       // systolic and diastolic share "blood-pressure"
  input: { kind: 'number' | 'scale'; min: number; max: number; step: number };
  cadence: 'daily' | 'weekly';
  ranges: Range[];                      // min inclusive, max exclusive, covering the input range
  whyItMatters: string;                 // plain language
  howToMeasure: string;                 // plain language
  hazardIds: string[];
  bodyRegion?: string;
  actions: Record<Status, Action[]>;
}

interface Reading { indicatorId: string; value: number; takenAt: string; // ISO
                    missionDay: number; simulated?: boolean }

// The explicit models behind the 30-day projection and the what-if simulation
interface ProjectionModel {
  id: string;
  output: string;                       // what is projected: an indicator id or a body-system measure
  inputs: string[];                     // habits or exposures the astronaut can change
  description: string;                  // the relationship, in plain language
  form: 'linear-rate' | 'threshold' | 'lookup';
  parameters: Record<string, number>;
  horizonDays: number;
  limits: string;                       // what the model leaves out; shown to the user
  basis: Basis; sourceId?: string; needsReview?: boolean;
}
```

Files: `src/data/knowledge/sources.json`, `hazards.json`, `indicators.json`, `models.json`.
`escalate` maps to the brief's question about results that need "attention from the crew or from flight surgeons on the ground". The team may rename the status levels in CONCEPT.

### 6.5 Rules for anything medical

- No number is invented. Every range and action has a `sourceId`, or is marked `basis: "assumption"` with `needsReview: true` and shown as such.
- Projections come only from the models in `models.json`. Each one shows its source and its limits and is labelled a simplified projection, not a prediction. A model without a source is marked illustrative.
- A team member reads `indicators.json` and `models.json` line by line before they ship.
- The tool informs and guides; it does not diagnose. The site says "Prototype. Not a medical device." and marks simulated data as simulated.

### 6.6 How AI use is acknowledged

- `docs/AI_USAGE.md`: a running log that every agent appends to (date, tool, what it did, who reviewed). It is the source for the form's SI field.
- `README.md`: a "Use of AI tools" section.
- Metadata: a `<meta name="ai-disclosure">` tag in `index.html`, a header comment on AI-written source files, and the `Co-Authored-By` trailer on commits.
- A visible line in the site footer.
- Images: prefer our own screenshots and code-drawn SVG. Any AI-generated image gets a visible watermark.

## 7. NASA and partner data

**Official challenge resources (use these first):**

| Resource | Link |
|---|---|
| NASA HRP: 5 Hazards of Human Spaceflight | https://www.nasa.gov/hrp/hazards/ |
| NASA HRP: Risks of Human Spaceflight | https://www.nasa.gov/hrp/risks/ |
| NASA HRP: Ongoing HRP Research in Space | https://www.nasa.gov/hrp/ongoing-hrp-research/ |
| CSA: Monitoring Radiation for Astronaut Health | https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp |
| CSA: Why Do We Conduct Science Experiments in Space? | https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp |

**Further candidates.** The researcher must confirm each link works and note its terms of use before anything depends on it:

- NASA Human Research Roadmap (risks and evidence reports): humanresearchroadmap.nasa.gov
- NASA-STD-3001, the spaceflight human-system standard (crew health): standards.nasa.gov
- NASA Technical Reports Server: ntrs.nasa.gov
- NASA Open Science Data Repository: osdr.nasa.gov
- NASA DONKI space weather API (solar flares, particle events; relates to the radiation hazard): api.nasa.gov
- NASA Life Sciences Portal: nlsp.nasa.gov
- Other 2026 Space Agency Partners with human spaceflight material, such as ESA and JAXA. Argentina's CONAE is a partner this year too; use it only if it truly adds something.

**Minimum bar for "integral":** the knowledge base that drives every explanation, status and recommendation is built from these sources, and each card in the tool shows where its content comes from. Anything deeper, such as live NASA data, is a concept decision for CONCEPT §6.

## 8. Agents

Claude Code subagents, in `.claude/agents/`. Open Claude Code in this folder and ask, for example: *"Use the foundation-engineer agent to scaffold the project."*

| # | Agent | Produces | Needs | Wave |
|---|---|---|---|---|
| 1 | `foundation-engineer` | Scaffold, shared UI, routing, live deploy pipeline, README skeleton | this plan | 1 |
| 2 | `hrp-researcher` | Evidence notes and the knowledge-base JSON with citations, including the projection models | this plan, CONCEPT §3–§6 | 1 |
| 3 | `health-engine-engineer` | Tested logic: evaluate, trends, projection and what-if, summary, storage, simulated data | knowledge JSON, CONCEPT | 2 |
| 4 | `app-ui-builder` | The tool's screens | engine, shared UI, CONCEPT | 2 |
| 5 | `landing-builder` | The landing page | CONCEPT, research, screenshots | 2–3 |
| 6 | `qa-verifier` | Test and compliance report | a running build | 3, then again Sunday |
| 7 | `demo-storyteller` | Slide-by-slide content or a 30 s script with subtitles | CONCEPT, shipped build | Sunday |
| 8 | `submission-writer` | All 8 form fields drafted, references and AI log finalized | everything | Sunday |

Agents 1 and 2 can start while the team settles the open decisions in `docs/CONCEPT.md`. The others work from the concept as written and mark anything still unanswered as a TODO for the team.

**Human hats** (one person can wear several): **Lead** runs agents, merges, owns the deploy · **Science** reviews research and every threshold · **Story** owns the landing copy and the demo · **Submission** owns the Project page, links and the rules in §3.

## 9. Timeline

Times are suggestions in Local Event time. Ask the Local Lead on Saturday morning whether the event has its own pitch session or an earlier local deadline, and shift the plan if so.

### Friday Nov 13, evening: get ready (reading and setup only)

- [ ] Confirm every member is registered at the same Local Event and on the team page.
- [ ] Everyone reads the challenge page and the three HRP resources.
- [ ] Move this folder out of iCloud Drive before installing anything (for example to `~/Developer/`). `node_modules` and `.git` inside iCloud cause sync conflicts and missing files.
- [ ] Install Node LTS. Create the public GitHub repo.
- [ ] Read `docs/CONCEPT.md` together, correct anything that does not match what we meant, and answer the open decisions at the top. Assign the four hats.

### Saturday Nov 14

| Time | What | Who |
|---|---|---|
| 09:00–10:00 | Kickoff. Settle every open decision in `docs/CONCEPT.md`. Open the Project page, enter the project name, "Save Progress". | Team |
| 09:00–12:30 | **Wave 1 in parallel:** `foundation-engineer` · `hrp-researcher` | Lead, Science |
| 12:30–13:30 | **Checkpoint 1:** live URL opens in a private window. Science reviews `indicators.json` and `models.json`. Send the URL to the FortiGuard classification form (see §10). | Team |
| 13:30–15:00 | `health-engine-engineer` (status logic and projection models) · `landing-builder` starts in parallel | Lead, Story |
| 15:00–18:30 | `app-ui-builder` builds the core loop, then the 30-day projection | Lead |
| 18:30–19:30 | **Checkpoint 2:** gather → evaluate → act works on the live URL. If not, apply the cut line in §11 now. | Team |
| 19:30–22:00 | What-if simulation, then the twin figure · `qa-verifier` pass 1 | Lead |
| 22:00 | Stop. Sleep is one of the indicators. | Team |

### Sunday Nov 15

| Time | What | Who |
|---|---|---|
| 09:00–12:00 | Fix QA blockers. Finish the what-if simulation and the twin figure. Finish the landing page with real screenshots. English copy pass. | Lead, Story |
| **12:00** | **Feature freeze.** Bug fixes and text only after this. | Team |
| 12:00–15:00 | `demo-storyteller` → build the deck or record the video · `submission-writer` drafts the form | Story, Submission |
| 15:00–17:00 | `qa-verifier` pass 2 (compliance, links in a private window). Paste the form fields, upload screenshots. | Submission |
| **18:00** | **First "Submit for Judging".** Check the confirmation banner. | Submission |
| 18:00–22:00 | Buffer: polish, fix, re-submit | Team |
| **22:00** | **Final re-submit**, then hands off. Hard deadline is 23:59. | Submission |

## 10. Submission map

| Form field | Source | Notes |
|---|---|---|
| Project Name | CONCEPT §1 | |
| High-Level Project Summary | `docs/SUBMISSION.md` | What we developed, how it addresses the challenge, why it matters |
| Link to Project Demo | public slides or video link | Count slides and seconds before pasting |
| Link to Final Project | live site URL | The landing page links to the repo |
| Detailed Project Description | `docs/SUBMISSION.md` | What it does, how it works, benefits, hopes, tools and languages |
| Use of Super Intelligence (SI) | `docs/AI_USAGE.md` | Honest and specific. Not shown to judges, but AI markers in the project are |
| NASA Data | `docs/SUBMISSION.md` | Each resource, its link, and exactly where the product uses it |
| Space Agency Partner Data and Other References | `docs/REFERENCES.md` | Everything external: libraries, data, text, images, fonts |

Also:

- Screenshots (JPG, PNG, GIF up to 10 MB) can be uploaded to the Project page; videos and documents cannot.
- Turn the edit **Lock** on while editing and press **Save Progress** often. Another member can still remove the lock and overwrite unsaved work, so only one person edits.
- FortiGuard Web Filter Classification: the guide recommends it for a new website so judges' networks do not block it. Submit the live URL, pick the closest category (for example web-based application or education), write "N/A" for company name.

## 11. Risks and cut lines

| Risk | Guard |
|---|---|
| Core loop not working Saturday evening | Checkpoint 2 cut line: go down to four indicators and show body systems as cards instead of a figure. Keep the what-if simulation; it is the differentiator. |
| Projections read as invented science | Explicit cited models only, limits shown, "simplified projection" label, human review of `models.json` |
| An agent invents medical numbers | §6.5: sources required, `needsReview` flag, human review |
| An agent adds to the concept | Agents implement what `docs/CONCEPT.md` says and leave "Team:" lines alone |
| Demo over 7 slides or 30 s | `qa-verifier` counts; Submission owner counts again |
| A link needs login | Private-window test at 15:00 and after every re-submit |
| Spanish text left in the site | English scan in `qa-verifier` |
| A library or image missing from References | QA compares `package.json` and assets against `docs/REFERENCES.md` |
| Two agents edit the same file | Ownership table in §6.3 |
| Deploy breaks late | Feature freeze at 12:00; never push untested changes after 18:00 |
| Last-minute submission failure | First submit at 18:00, six hours of margin |
