import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import evidence from "../../../../data/nasa/curated_evidence.json";
import { MissionTabs } from "@/components/mission-shared";
import { Disclaimer } from "@/components/shell";
export default function Science() {
  return (
    <main id="main" className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ASTRA / SCIENCE & PROVENANCE</span>
          <h1>Every signal has a source.</h1>
          <p>
            Here is what comes from NASA, what we invented, and what the model
            can tell you.
          </p>
        </div>
        <span className="tag">METHODS IN THE OPEN</span>
      </div>
      <MissionTabs active="science" />
      <div className="science-layout">
        <section className="panel">
          <span className="eyebrow">01 / OBSERVATIONS</span>
          <h2>A fictional mission.</h2>
          <p>
            Four fictional crew members follow an editable 180-day mission: 36
            hours outbound, 176 days in orbit, and 60 hours returning. The
            default seed (20261114) generates 69,120 crew intervals, one every
            15 minutes. Day 0 begins at launch; day 180 at 00:00 ends the
            mission.
          </p>
          <p>
            Heart rate (bpm), resting HRV (ms), scheduled sleep and exercise
            minutes, and shared cabin CO₂ (ppm) are invented signals. A metric
            registry defines units, bounds, aggregation and optional review
            rules. User-defined indicators use the same pipeline. The original
            30-day CSV is preserved as a legacy regression fixture, separate
            from the active mission.
          </p>
          <p>
            No real astronaut measurements, accounts, analytics, or external
            health services are used. Mission calculations run locally from the
            editable local configuration and optional CSV corrections. Browser
            customizations are stored on this device; no personal data is sent
            to an external service.
          </p>
        </section>
        <section className="panel">
          <span className="eyebrow">02 / RESEARCH CONTEXT</span>
          <h2>Real research. Bounded use.</h2>
          <p>
            NASA research resources inform the categories and contextual
            evidence cards shown in ASTRA. Curated source metadata is bundled
            with the application.
          </p>
          <p>
            NASA sources do not calibrate our thresholds, validate our scores,
            or prove the effectiveness of our scenario assumptions. No NASA
            study data is substituted for individual measurements.
          </p>
          <p>
            Challenge Resources listing and award eligibility require human
            verification wherever a source below is marked unverified.
          </p>
          <a
            className="text-link"
            href="https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/"
            target="_blank"
            rel="noreferrer"
          >
            Official challenge page <ArrowUpRight size={15} />
          </a>
        </section>
        <section className="panel full-width">
          <span className="eyebrow">03 / REPRODUCIBLE METHOD</span>
          <h2>From scheduled activity to a reviewable signal.</h2>
          <ol className="method-list">
            <li>
              <strong>Build the schedule first.</strong> Three exercise days per
              full orbital week. One weekly EVA by alternating pairs: Maya and
              Eli in odd weeks, Sofia and Noah in even weeks. The other pair
              supports onboard. The final partial week closes operations.
            </li>
            <li>
              <strong>Aggregate minute samples.</strong> A timestamp of 13:15
              summarizes [13:00, 13:15). Continuous signals are means; scheduled
              activity minutes are totals. Activity offsets, noise, trends and
              individual baselines are editable synthetic assumptions. HRV is
              unavailable outside its configured rest/sleep activities. A window
              with an ineligible minute remains missing.
            </li>
            <li>
              <strong>Compare matching activity.</strong> Use the first 14
              orbital days as the baseline, capped at the inspection time.
              Compare the last three days against baseline means weighted to the
              same activity mix. Mixed-activity windows are excluded from
              review. Per-metric minimum sample counts apply to both windows.
            </li>
            <li>
              <strong>Apply explicit demo rules.</strong> A configured absolute
              relative deviation can suggest review. Missing latest eligible
              observations or stale endpoints prevent reassurance. Metrics
              without a rule remain unclassified. Shared cabin readings are
              assessed once as habitat context. These are not clinical
              thresholds.
            </li>
            <li>
              <strong>Compare assumptions.</strong> The scenario page uses the
              last seven completed days, requiring three usable days. It holds a
              recent daily mean or total constant for 30 days alongside an
              explicit target. Summed indicators require complete daily
              coverage; mean indicators require four valid intervals. No other
              indicator changes as a consequence of the target.
            </li>
            <li>
              <strong>Explain the result.</strong> Deterministic templates
              expose values, windows, quality and exact rules. Four agent traces
              are inspectable in the product. NASA links provide research
              context separately from the fictional measurements. No generative
              model makes health decisions.
            </li>
          </ol>
        </section>
      </div>
      <section className="section" style={{ paddingBottom: 30 }}>
        <span className="eyebrow">04 / NASA EVIDENCE CATALOG</span>
        <h2>Sources you can follow.</h2>
        {evidence.map((s) => (
          <article className="evidence-card" id={s.source_id} key={s.source_id}>
            <span className="eyebrow">
              {s.provider} / {s.source_id}
            </span>
            <h3>{s.title}</h3>
            <p>{s.summary}</p>
            <dl>
              <dt>Used in ASTRA for</dt>
              <dd>{s.used_for}</dd>
              <dt>Retrieved</dt>
              <dd>{s.retrieved_utc ?? "Not recorded"}</dd>
              <dt>Challenge listed</dt>
              <dd>
                {s.is_challenge_listed === true
                  ? "Verified"
                  : s.is_challenge_listed === false
                    ? "Not listed"
                    : "Unverified — human check required"}
              </dd>
              <dt>Resource type</dt>
              <dd>
                Research context / curated source metadata; no individual
                measurements
              </dd>
            </dl>
            <a
              className="text-link"
              href={s.url}
              target="_blank"
              rel="noreferrer"
            >
              Read the NASA source <ArrowUpRight size={15} />
            </a>
          </article>
        ))}
      </section>
      <div className="science-layout">
        <section className="panel">
          <h2>Limits & uncertainty</h2>
          <p>
            ASTRA is an educational research demonstration. It cannot diagnose
            conditions, predict disease, authorize activities, or prescribe
            treatment. Findings are nonclinical workflow states calibrated only
            to this fixture.
          </p>
          <p>
            Planned sleep opportunity and activity are assumptions; adherence
            and health effects are unknown. Missing or noisy data can prevent
            assessment. No population clinical thresholds or numerical disease
            probabilities are used.
          </p>
        </section>
        <section className="panel">
          <h2>AI & independent branding</h2>
          <p>
            Codex assisted with implementation, tests, interface visuals, and
            documentation. The supplied planning package and synthetic fixture
            also disclose AI assistance. Human review of earlier idea
            development and competition compliance is still required.
          </p>
          <p>
            The original orbital interface is procedural and AI-assisted,
            labeled visibly on the landing page. No NASA logos, astronaut
            photographs, generated raster portraits, audio, or video are
            included. ASTRA is independent and has no NASA endorsement.
          </p>
          <Link className="text-link" href="/mission">
            Explore the working demonstration <ArrowUpRight size={15} />
          </Link>
        </section>
      </div>
      <Disclaimer />
    </main>
  );
}
