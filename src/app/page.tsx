import Link from "next/link";
import { getTelemetry } from "@/lib/repository";
import { calculateBaselines } from "@/lib/agents/monitoring";
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  FileSearch,
  ChevronDown,
} from "lucide-react";

function Planet() {
  return (
    <div
      className="planet-scene"
      aria-label="Original procedural orbital illustration"
    >
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="planet">
        <div className="planet-grid" />
        <span className="planet-dot" />
      </div>
      <div className="orbital-label">
        <span className="live-dot" /> EXPLORATION MISSION / 0149
      </div>
      <div className="signal-overlay">
        <span className="eyebrow">SIGNAL ACQUIRED</span>
        <div className="pulse-line">
          <svg viewBox="0 0 240 40" aria-hidden="true">
            <path d="M0 22h40l10-6 8 12 12-25 10 36 9-17h45l10-7 8 12 12-25 10 36 9-17h57" />
          </svg>
        </div>
        <small>Fictional crew · Personal baselines</small>
      </div>
      <span className="visual-credit">
        Procedural illustration · AI-assisted
      </span>
    </div>
  );
}
const steps = [
  {
    icon: ScanLine,
    name: "Monitor",
    verb: "Read the signal.",
    text: "Quality-check daily observations against each crew member’s own baseline.",
  },
  {
    icon: ShieldCheck,
    name: "Assess",
    verb: "Notice the change.",
    text: "Identify persistent deviations and show exactly which rules they cross.",
  },
  {
    icon: SlidersHorizontal,
    name: "Explore",
    verb: "Consider what if.",
    text: "Compare 30-day sleep and activity plans with transparent assumptions.",
  },
  {
    icon: FileSearch,
    name: "Explain",
    verb: "Understand why.",
    text: "Trace findings to measurements, rules and NASA research context.",
  },
];
export default function Home() {
  const rows = getTelemetry().filter(row => row.crewId === 'maya-torres');
  const baseline = calculateBaselines(rows, 'maya-torres').sleepHours;
  const path = rows.map((row, index) => `${index === 0 ? 'M' : 'L'}${(index / 29 * 650).toFixed(1)} ${((8.2 - (row.sleepHours ?? 8.2)) / 3 * 170).toFixed(1)}`).join(' ');
  return (
    <main id="main">
      <section className="hero wrap">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="live-dot" /> HUMAN EXPLORATION / HEALTH AWARENESS
          </span>
          <h1>
            Farther from Earth.
            <br />
            Closer to the
            <br />
            <em>signal.</em>
          </h1>
          <p>
            Every mission tells a story. ASTRA makes crew health trends
            understandable—with personal baselines, explainable signals, and a
            clear view of what comes next.
          </p>
          <div className="actions">
            <Link href="/mission" className="button">
              Launch Mission <ArrowUpRight size={18} />
            </Link>
            <Link href="/about/science" className="text-link">
              Explore the science <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hero-note">
            <span className="tag">SYNTHETIC DEMONSTRATION</span>
            <span>No keys. No accounts. Ready to explore.</span>
          </div>
        </div>
        <Planet />
      </section>
      <div className="mission-strip wrap">
        <div>
          <strong>04</strong>
          <span>Fictional crew members</span>
        </div>
        <div>
          <strong>30</strong>
          <span>Days of synthetic telemetry</span>
        </div>
        <div>
          <strong>04</strong>
          <span>Traceable software agents</span>
        </div>
        <a href="#how-it-works">
          From observation to understanding <ChevronDown size={17} />
        </a>
      </div>
      <section className="section wrap split">
        <div>
          <span className="eyebrow">01 / THE CHALLENGE</span>
          <h2>
            Distance grows.
            <br />
            Understanding shouldn’t.
          </h2>
        </div>
        <div className="prose">
          <p>
            Far from Earth, crews need to make sense of changes over time.
            Sleep, workload and a closed habitat create a complex picture; an
            isolated reading rarely tells the whole story.
          </p>
          <p>
            ASTRA puts trends in context. Compare a fictional astronaut with
            their own baseline, inspect the evidence, and prepare a more
            informed human review.
          </p>
          <a
            href="https://www.nasa.gov/hrp/risks/"
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            NASA: Risks of Human Spaceflight <ArrowUpRight size={15} />
          </a>
        </div>
      </section>
      <section className="section pipeline-section" id="how-it-works">
        <div className="wrap">
          <span className="eyebrow">02 / THE INTELLIGENCE LOOP</span>
          <div className="section-heading">
            <h2>
              Four agents.
              <br />
              One traceable story.
            </h2>
            <p>
              Specialized, deterministic modules.
              <br />
              Every finding has a path back to its inputs.
            </p>
          </div>
          <div className="pipeline">
            {steps.map((s, i) => (
              <article key={s.name}>
                <div className="step-top">
                  <s.icon size={24} />
                  <span>0{i + 1}</span>
                </div>
                <h3>{s.name}</h3>
                <strong>{s.verb}</strong>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">03 / INSIDE THE MISSION</span>
            <h2>A signal worth a closer look.</h2>
          </div>
          <Link className="text-link" href="/mission/crew/maya-torres?day=149">
            Open Maya’s profile <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="demo-preview">
          <div className="preview-chart">
            <div className="section-heading">
              <span>
                <Activity size={16} /> MAYA TORRES / SLEEP
              </span>
              <span className="tag amber">REVIEW SUGGESTED</span>
            </div>
            <div className="mini-chart">
              <div className="chart-guide">{baseline?.toFixed(2)} h baseline</div>
              <svg
                viewBox="0 0 650 170"
                role="img"
                aria-label="Maya's 30 synthetic daily sleep readings, days 120 to 149, plotted from the included fixture. Open mission for exact values."
              >
                <defs>
                  <linearGradient id="previewFade" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#58d8e8" stopOpacity=".22" />
                    <stop offset="1" stopColor="#58d8e8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`${path} L650 170 L0 170 Z`}
                  fill="url(#previewFade)"
                />
                <path
                  d={path}
                  fill="none"
                  stroke="#58d8e8"
                  strokeWidth="3"
                />
              </svg>
              <div className="axis-labels">
                <span>DAY 120</span>
                <span>DAY 133</span>
                <span>DAY 149</span>
              </div>
            </div>
            <small>Synthetic data · Illustrative preview · Sleep (hours)</small>
          </div>
          <div className="preview-story">
            <span className="eyebrow">THE OBSERVATION</span>
            <h3>A change from her usual.</h3>
            <p>
              Maya’s late-mission sleep and HRV trends cross her personal demo
              rules. Open the finding to see the numbers, data quality, and
              reasoning.
            </p>
            <Link href="/mission" className="text-link">
              Investigate the signal <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section wrap split science-preview">
        <div>
          <span className="eyebrow">04 / BUILT ON TRANSPARENCY</span>
          <h2>
            Research in context.
            <br />
            Assumptions in the open.
          </h2>
          <Link className="text-link" href="/about/science">
            Read our methods & sources <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="prose">
          <div className="source-line">
            <span>01</span>
            <div>
              <h3>NASA research context</h3>
              <p>
                Official human-spaceflight resources explain why these signal
                categories matter.
              </p>
            </div>
          </div>
          <div className="source-line">
            <span>02</span>
            <div>
              <h3>Clearly synthetic observations</h3>
              <p>
                120 invented daily records power the demonstration. No real
                astronaut health data.
              </p>
            </div>
          </div>
          <div className="source-line">
            <span>03</span>
            <div>
              <h3>Transparent limits</h3>
              <p>
                Fixture-specific flags and assumed schedules. No diagnosis or
                validated medical prediction.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="closing wrap">
        <span className="eyebrow">YOUR NEXT OBSERVATION STARTS HERE</span>
        <h2>Get a clearer view of the mission.</h2>
        <Link className="button" href="/mission">
          Launch Mission <ArrowUpRight size={18} />
        </Link>
        <p>
          Independent prototype · AI-assisted code and original interface
          visuals · No NASA endorsement
        </p>
      </section>
    </main>
  );
}
