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
            Four fictional crew members. Thirty daily records each. Mission days
            120–149. The included CSV contains 120 synthetic observations
            generated with AI assistance using a fixed seed (20261114).
          </p>
          <p>
            Sleep (h), HRV (ms), resting heart rate (beats/min), exercise
            (min/day), and cabin CO₂ (ppm) are invented demo signals. The
            radiation proxy is a fictional unitless context value and is
            excluded from findings. It is not dosimetry.
          </p>
          <p>
            No real astronaut measurements, accounts, analytics, or external
            health services are used. Mission calculations run locally from the
            bundled fixture.
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
          <h2>From a daily observation to a reviewable finding.</h2>
          <ol className="method-list">
            <li>
              <strong>Build the personal baseline.</strong> Mean of valid
              readings within mission days 120–133, using only observations
              available on the selected day. Require at least 10 readings per
              metric.
            </li>
            <li>
              <strong>Compare recent observations.</strong> Calculate a mean
              over the last three calendar days; require at least two valid
              readings. Missing values remain unknown.
            </li>
            <li>
              <strong>Apply fixture-only rules.</strong> Sleep ≤ baseline − 1 h;
              HRV ≤ 0.80 × baseline; resting HR ≥ 1.12 × baseline; exercise ≤
              0.65 × baseline. Cabin CO₂ ≥ 1.40 × baseline produces habitat
              context only.
            </li>
            <li>
              <strong>Check persistence.</strong> A crossed rolling rule is
              persistent when at least two individual readings in the three-day
              window also cross the threshold. Two or more distinct persistent
              health signals suggest review; one suggests observation.
              Insufficient data prevents a reassuring overall status.
            </li>
            <li>
              <strong>Compare plans.</strong> Hold the recent seven-day
              synthetic mean constant, requiring three readings per metric.
              Compare 30 days with a chosen sleep opportunity (5–9 h) and
              additional exercise (0–30 min/day, total capped at 180). Planned
              sleep difference = 30 × (target − recent mean). Exercise
              difference = 30 × actual capped daily addition.
            </li>
            <li>
              <strong>Explain the result.</strong> Deterministic templates
              expose values, windows, quality, exact rules and allowed evidence
              IDs. Four agent traces are inspectable in the product. No
              generative model makes health decisions.
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
