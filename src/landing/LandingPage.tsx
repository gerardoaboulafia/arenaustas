// AI-assisted: written with Claude Code, reviewed by the team.
// Landing page: explains how ASTRA works, then leads into the tool.
// Lines marked TODO(team) are the team's to write (docs/CONCEPT.md); do not fill them in.
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { buildTwin, createDataset, hazards, sources } from '../domain';
import { ChartLegend, ProjectionChart } from '../components/ui/charts';
import { TwinFigure } from '../components/ui/TwinFigure';
import { Logo, ProjectionNote, SimulatedBadge, buttonPrimary, buttonSecondary } from '../components/ui/primitives';

const AGENTS = [
  ['Biometric Agent', 'Analyzes heart rate, sleep and other indicators.'],
  ['Physiology Agent', 'Tracks muscular, bone and cardiovascular changes.'],
  ['Environment Agent', 'Evaluates radiation and spacecraft conditions.'],
  ['Prediction Agent', 'Projects scenarios using explicit models.'],
  ['Medical Advisor', 'Explains the results and suggests preventive actions, subject to protocols.'],
];

const STEPS = [
  ['01', 'Gather', 'Log today\'s readings by hand or let the simulated telemetry stream fill them in: heart rate, sleep, heart rate variability, blood oxygen, skin temperature, exercise, cabin CO2 and radiation dose.'],
  ['02', 'Evaluate', 'Your twin shows the status of muscle, bone, cardiovascular system and circadian rhythm today, each compared with your own baseline, and a simplified 30-day projection of where it is heading.'],
  ['03', 'Act', 'The Medical Advisor suggests preventive actions. Run a what-if to see the projected effect of a countermeasure before you commit to it.'],
];

const Placeholder = ({ children }: { children: string }) => (
  <span className="inline-flex rounded-md border border-dashed border-watch/60 px-2 py-1 font-mono text-xs text-watch">[{children}]</span>
);

const Eyebrow = ({ children }: { children: string }) => (
  <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">{children}</p>
);

export function LandingPage() {
  // The page shows the real components on the simulated crew, not pictures of them.
  const { alertTwin, exampleTwin } = useMemo(() => {
    const data = createDataset();
    const base = buildTwin(data, 'b', data.lastDay);
    return {
      alertTwin: buildTwin(data, 'c', data.lastDay),
      exampleTwin: buildTwin(data, 'b', data.lastDay, { exerciseMin: Math.round(base.habits.exerciseMin) + 15 }),
    };
  }, []);
  const bone = exampleTwin.systems.find((s) => s.system.id === 'bone')!;

  return (
    <div>
      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Logo />
        <nav aria-label="Page" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
          <a href="#how" className="hover:text-ink" onClick={(e) => { e.preventDefault(); document.getElementById('how')?.scrollIntoView(); }}>How it works</a>
          <a href="#science" className="hover:text-ink" onClick={(e) => { e.preventDefault(); document.getElementById('science')?.scrollIntoView(); }}>Science and data</a>
          <Link to="/app" className={buttonPrimary}>Open the tool</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 pt-10 pb-20 sm:px-8 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
        <div>
          <Eyebrow>Astronaut health digital twin</Eyebrow>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl">How could you be 30 days from now?</h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            ASTRA creates a digital twin of each astronaut that evolves during the mission and makes it possible to anticipate health risks.
          </p>
          {/* TODO(team): tagline, docs/CONCEPT.md §1 */}
          <p className="mt-4"><Placeholder>Tagline: team to write</Placeholder></p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/app" className={`${buttonPrimary} !min-h-12 !px-6 !text-base`}>Open the tool</Link>
            <a href="#how" className={buttonSecondary} onClick={(e) => { e.preventDefault(); document.getElementById('how')?.scrollIntoView(); }}>See how it works</a>
          </div>
          <p className="mt-6 text-xs text-muted">Prototype for the NASA Space Apps Challenge 2026. Simulated data. Not a medical device.</p>
        </div>
        <div className="min-w-0 rounded-3xl border border-line bg-panel p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">{alertTwin.crew.label}, mission day {alertTwin.missionDay}</span>
            <SimulatedBadge />
          </div>
          <TwinFigure systems={alertTwin.systems} />
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-20 sm:px-8 lg:grid-cols-2">
          <div>
            <Eyebrow>Why</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">Not only anomaly detection.</h2>
            <p className="mt-5 max-w-lg text-muted">
              On Mars-class, long-duration missions, medical decisions have to be made with more autonomy. Instead of asking only how you are today, ASTRA asks how you could be 30 days from now if you continue with your current habits and conditions.
            </p>
          </div>
          <ol className="flex flex-col">
            {[
              ['Personalized monitoring', 'A twin per astronaut. Every reading is compared with your own baseline, not with a population average.'],
              ['Simulation', 'Change sleep hours, exercise or environmental exposure and watch the projected state change.'],
              ['Prevention', 'The Medical Advisor explains the results and suggests preventive actions, subject to protocols.'],
            ].map(([title, text], i) => (
              <li key={title} className="grid grid-cols-[48px_minmax(0,1fr)] gap-x-4 border-t border-line py-5 last:border-b">
                <span className="font-mono text-sm text-accent">0{i + 1}</span>
                <div><h3 className="text-xl font-semibold">{title}</h3><p className="mt-1 text-muted">{text}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="how" className="border-t border-line bg-panel/60">
        <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-8">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">Gather, evaluate, act.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map(([n, title, text]) => (
              <article key={n} className="rounded-2xl border border-line bg-panel p-6">
                <p className="font-mono text-xs tracking-[0.14em] text-accent">{n}</p>
                <h3 className="mt-3 text-2xl font-semibold">{title}</h3>
                <p className="mt-3 text-muted">{text}</p>
              </article>
            ))}
          </div>
          <h3 className="mt-16 text-2xl font-semibold">Five agents</h3>
          <p className="mt-2 max-w-2xl text-muted">Rule-based modules, not language models. Every rule and model carries a source or is marked as an assumption that needs review, and the tool shows which.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {AGENTS.map(([name, text]) => (
              <article key={name} className="rounded-2xl border border-line bg-panel p-4">
                <h4 className="font-mono text-xs uppercase tracking-[0.1em] text-accent">{name}</h4>
                <p className="mt-2 text-sm text-muted">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-20 sm:px-8 grid-cols-1 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <div>
            <Eyebrow>What-if</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">See the projected effect before you commit to it.</h2>
            <p className="mt-5 text-muted">For example: how 15 more minutes of resistive exercise shifts a bone-density trajectory. The chart is the real one from the tool, on a simulated crew member.</p>
            <p className="mt-5"><ProjectionNote /></p>
            <Link to="/app/projection" className={`${buttonPrimary} mt-8`}>Try a what-if</Link>
          </div>
          <div className="min-w-0 rounded-2xl border border-line bg-panel p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold">{bone.system.measure.name}, {bone.system.measure.unit}</span>
              <span className="font-mono text-xs text-muted">Resistive exercise {Math.round(bone.projection.habit)} → {bone.projection.scenarioInput} min per day</span>
            </div>
            <ProjectionChart projection={bone.projection} measure={bone.system.measure} unit={bone.system.measure.unit} />
            <div className="mt-2"><ChartLegend /></div>
          </div>
        </div>
      </section>

      <section id="science" className="border-t border-line bg-panel/60">
        <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-8">
          <Eyebrow>Science and data</Eyebrow>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">Where every number comes from.</h2>
          <p className="mt-5 max-w-2xl text-muted">
            The tool links each indicator and body system to the hazards of human spaceflight described by NASA's Human Research Program, and shows next to every threshold, action and model whether it comes from a source or is our assumption.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {hazards.map((h) => (
              <article key={h.id} className="rounded-2xl border border-line bg-panel p-4">
                <h3 className="text-sm font-semibold">{h.name}</h3>
                <p className="mt-2 text-xs text-muted">{h.summary}</p>
              </article>
            ))}
          </div>
          <h3 className="mt-12 text-2xl font-semibold">Sources</h3>
          <ul className="mt-4 flex flex-col">
            {sources.map((s) => (
              <li key={s.id} className="grid gap-x-6 gap-y-1 border-t border-line py-4 last:border-b md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div>
                  <a href={s.url} target="_blank" rel="noreferrer" className="font-semibold text-accent underline decoration-accent/40 underline-offset-2">{s.title}</a>
                  <p className="text-xs text-muted">{s.org}{s.challengeListed ? ' · listed in the challenge resources' : ''} · accessed {s.accessed}</p>
                </div>
                <p className="text-sm text-muted">{s.usedFor}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ['Simplified projection, not a prediction', 'The 30-day view applies simple, explicit models. Each chart shows its model, its source and what it leaves out.'],
              ['Simulated data, clearly labelled', 'No real astronaut data is used. The crew and every reading are generated from a fixed seed.'],
              ['Prototype, not a medical device', 'ASTRA explains signals and suggests actions subject to mission protocols. It does not diagnose.'],
            ].map(([title, text]) => (
              <article key={title} className="rounded-2xl border border-line bg-panel p-5">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-8">
          <Eyebrow>Team</Eyebrow>
          {/* TODO(team): team name and members, docs/CONCEPT.md §1 */}
          <div className="mt-4 flex flex-wrap gap-3"><Placeholder>Team name</Placeholder><Placeholder>Team members</Placeholder></div>
          <Link to="/app" className={`${buttonPrimary} mt-8`}>Open the tool</Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-8 text-xs text-muted sm:px-8">
          <p>Prototype. Not a medical device. All crew data is simulated.</p>
          <p>Built for the NASA Space Apps Challenge 2026. Not affiliated with or endorsed by NASA.</p>
          <p>Parts of this site's code and text were written with an AI assistant (Claude Code) and reviewed by the team. The solution concept is the team's.</p>
        </div>
      </footer>
    </div>
  );
}
