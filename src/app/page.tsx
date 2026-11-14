import Link from "next/link";
import defaultConfig from "../../public/mission-data/config.json";
import { generateTelemetry, validateConfig } from "@/lib/mission";
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
        <span className="live-dot" /> EXPLORATION MISSION / 180 DAYS
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
    text: "Read 15-minute synthetic observations with their activity context and personal baseline.",
  },
  {
    icon: ShieldCheck,
    name: "Assess",
    verb: "Notice the change.",
    text: "Compare activity-matched signals and expose the configured demo rules.",
  },
  {
    icon: SlidersHorizontal,
    name: "Explore",
    verb: "Consider what if.",
    text: "Compare 30-day assumptions using the active mission’s editable indicators.",
  },
  {
    icon: FileSearch,
    name: "Explain",
    verb: "Understand why.",
    text: "Trace findings to measurements, rules and NASA research context.",
  },
];
export default function Home() {
  const config = validateConfig(defaultConfig).value!;
  const previewMetric =
    config.metrics.find(
      (metric) => metric.scope === "crew" && metric.aggregation === "mean",
    ) ?? config.metrics[0];
  const previewCrew = config.crew[0];
  const rows = generateTelemetry(config).filter(
    (row) =>
      row.crewId === config.crew[0].id &&
      row.endMinute > 1440 &&
      row.endMinute <= 2880,
  );
  const baseline =
    previewCrew.baselines[previewMetric.id] ?? previewMetric.generator.baseline;
  const values = rows
    .map((row) => row.values[previewMetric.id])
    .filter((value): value is number => typeof value === "number");
  const minimum = values.length ? Math.min(...values) - 5 : 0;
  const maximum = values.length ? Math.max(...values) + 5 : 1;
  const path = rows
    .map((row, index) =>
      row.values[previewMetric.id] === null
        ? ""
        : `${index === 0 || rows[index - 1].values[previewMetric.id] === null ? "M" : "L"}${((index / Math.max(1, rows.length - 1)) * 650).toFixed(1)} ${(((maximum - row.values[previewMetric.id]!) / (maximum - minimum)) * 170).toFixed(1)}`,
    )
    .join(" ");
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
          <strong>{String(config.crew.length).padStart(2, "0")}</strong>
          <span>Fictional crew members</span>
        </div>
        <div>
          <strong>{config.timeline.durationDays}</strong>
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
          <Link
            className="text-link"
            href={`/mission?crew=${encodeURIComponent(previewCrew.id)}`}
          >
            Open {previewCrew.name}’s profile <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="demo-preview">
          <div className="preview-chart">
            <div className="section-heading">
              <span>
                <Activity size={16} /> {previewCrew.name.toUpperCase()} /{" "}
                {previewMetric.label.toUpperCase()}
              </span>
              <span className="tag">ACTIVITY IN CONTEXT</span>
            </div>
            <div className="mini-chart">
              <div className="chart-guide">
                {baseline} {previewMetric.unit} configured baseline
              </div>
              <svg
                viewBox="0 0 650 170"
                role="img"
                aria-label={`Bundled example: ${previewCrew.name}'s fictional ${previewMetric.label} during mission day 1. Open mission for current configuration and exact values.`}
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
                <path d={path} fill="none" stroke="#58d8e8" strokeWidth="3" />
              </svg>
              <div className="axis-labels">
                <span>DAY 1 / 00:15</span>
                <span>12:00 / ORBIT ENTRY</span>
                <span>24:00</span>
              </div>
            </div>
            <small>
              Synthetic data · Bundled example · {previewMetric.label} (
              {previewMetric.unit})
            </small>
          </div>
          <div className="preview-story">
            <span className="eyebrow">THE OBSERVATION</span>
            <h3>The activity explains the change.</h3>
            <p>
              Sleep, rest, exercise and spacewalks shape the fictional signals.
              Start the mission, follow all four crew members, and inspect any
              completed day. Modify the source data to explore your own
              assumptions.
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
                {(
                  config.timeline.durationDays *
                  96 *
                  config.crew.length
                ).toLocaleString("en-US")}{" "}
                crew intervals cover the bundled {config.timeline.durationDays}
                -day mission. Editable configuration and CSV corrections. No
                real astronaut health data.
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
