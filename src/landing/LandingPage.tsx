// AI-assisted: written with Claude Code, reviewed by the team.
// Landing page: explains how ASTRA works, then leads into the tool.
// Lines marked TODO(team) are the team's to write (docs/CONCEPT.md); do not fill them in.
import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { buildTwin, createDataset, format, hazards, indicators, models, sources, systems } from '../domain';
import team from '../data/team.json';
import { ChartLegend, ProjectionChart } from '../components/ui/charts';
import { TwinFigure } from '../components/ui/TwinFigure';
import { Logo, ProjectionNote, SimulatedBadge, StatusBadge, buttonPrimary, buttonSecondary } from '../components/ui/primitives';

const AGENTS = [
  ['Biometric Agent', 'Analyzes heart rate, sleep and other indicators.', 'Readings'],
  ['Physiology Agent', 'Tracks muscular, bone and cardiovascular changes.', 'Body systems'],
  ['Environment Agent', 'Evaluates radiation and spacecraft conditions.', 'Cabin'],
  ['Prediction Agent', 'Projects scenarios using explicit models.', '30 days'],
  ['Medical Advisor', 'Explains the results and suggests preventive actions, subject to protocols.', 'Actions'],
];

const STEPS = [
  ['01', 'Gather', 'Log today\'s readings by hand or let the simulated telemetry stream fill them in: heart rate, blood pressure, blood sugar, body temperature, sleep and mood, plus heart rate variability, blood oxygen, exercise, cabin CO2 and radiation dose.'],
  ['02', 'Evaluate', 'Your twin shows the status of muscle, bone, cardiovascular system and circadian rhythm today, each compared with your own baseline, and a simplified 30-day projection of where it is heading.'],
  ['03', 'Act', 'The Medical Advisor suggests preventive actions and says who to involve: you, the crew medical officer, or the flight surgeons on the ground. Run a what-if to see the projected effect of a countermeasure before you commit to it.'],
];

const go = (id: string) => (e: MouseEvent) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView();
};

const Eyebrow = ({ children }: { children: string }) => (
  <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{children}</p>
);

/** The real what-if, running on a simulated crew member, inside the landing page. */
function LiveDemo() {
  const data = useMemo(createDataset, []);
  const now = useMemo(() => buildTwin(data, 'c', data.lastDay).habits.sleepHours, [data]);
  const [sleep, setSleep] = useState(7.5);
  const twin = useMemo(() => buildTwin(data, 'c', data.lastDay, { sleepHours: sleep }), [data, sleep]);
  const system = twin.systems.find((s) => s.system.id === 'circadian')!;
  const future = Object.fromEntries(twin.systems.map((s) => [s.system.id, s.day30.scenario.status]));
  return (
    <div className="panel grid grid-cols-1 items-center gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)_auto]">
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">{twin.crew.label}, day {twin.missionDay}</span>
          <SimulatedBadge />
        </div>
        <label htmlFor="demo-sleep" className="mt-5 flex items-baseline justify-between">
          <span className="text-sm font-semibold">Sleep from tonight</span>
          <span className="font-mono text-3xl text-accent">{sleep}<span className="ml-1 text-xs text-muted">h per night</span></span>
        </label>
        <input id="demo-sleep" type="range" min={4} max={10} step={0.5} value={sleep} onChange={(e) => setSleep(Number(e.target.value))} className="mt-2 h-11 w-full" />
        <p className="text-xs text-muted">Now {format(now, 1)} h, the 7-day average. Drag the slider.</p>
        <dl className="mt-5 flex flex-col gap-2 text-sm">
          <div className="inset flex items-center justify-between gap-2 px-3 py-2"><dt className="text-muted">Circadian rhythm today</dt><dd><StatusBadge status={system.status} /></dd></div>
          <div className="inset flex items-center justify-between gap-2 px-3 py-2"><dt className="text-muted">Day +30 if nothing changes</dt><dd><StatusBadge status={system.day30.baseline.status} /></dd></div>
          <div className="inset glow-accent flex items-center justify-between gap-2 !border-accent px-3 py-2"><dt>Day +30 with this change</dt><dd><StatusBadge status={system.day30.scenario.status} /></dd></div>
        </dl>
      </div>
      <div className="min-w-0">
        <p className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-semibold">{system.system.measure.name}, {system.system.measure.unit}</span>
          <ProjectionNote />
        </p>
        <ProjectionChart projection={system.projection} measure={system.system.measure} unit={system.system.measure.unit} />
        <ChartLegend />
      </div>
      <div className="hidden flex-col items-center lg:flex">
        <TwinFigure statuses={future} projected height={330} animate={false} />
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Twin at day +30</p>
      </div>
    </div>
  );
}

export function LandingPage() {
  // The page shows the real components on the simulated crew, not pictures of them.
  const twin = useMemo(() => {
    const data = createDataset();
    return buildTwin(data, 'c', data.lastDay);
  }, []);
  const statuses = Object.fromEntries(twin.systems.map((s) => [s.system.id, s.status]));
  const float = [
    { s: twin.systems[0], cls: 'left-0 top-[9%]' },
    { s: twin.systems[1], cls: 'right-0 top-[24%]' },
    { s: twin.systems[2], cls: 'left-0 top-[46%]' },
    { s: twin.systems[3], cls: 'right-0 top-[66%]' },
  ];
  const columns = [...indicators.map((i) => ({ id: i.id, name: i.name, hazardIds: i.hazardIds })), ...systems.map((s) => ({ id: s.id, name: s.name, hazardIds: s.hazardIds }))];
  const facts: [string, string][] = [
    ['5', 'agents on one twin'], [String(indicators.length), 'health and cabin indicators'], [String(systems.length), 'body systems in the twin'],
    [String(models[0].horizonDays), 'days projected ahead'], ['0', 'network calls: it runs on board'],
  ];

  return (
    <div>
      <header className="sticky top-0 z-20 border-b border-line/70 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <Logo />
          <nav aria-label="Page" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
            <a href="#try" className="hover:text-ink" onClick={go('try')}>Try it</a>
            <a href="#how" className="hover:text-ink" onClick={go('how')}>How it works</a>
            <a href="#science" className="hover:text-ink" onClick={go('science')}>Science and data</a>
            <Link to="/app" className={buttonPrimary}>Open the tool</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-10 px-4 pt-12 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
        <div className="anim-rise">
          <Eyebrow>Astronaut health digital twin</Eyebrow>
          <h1 className="mt-5 text-[clamp(2.75rem,6.4vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-balance">
            How could you be <span className="text-accent">30 days</span> from now?
          </h1>
          <p className="mt-7 max-w-xl text-lg text-muted">
            ASTRA creates a digital twin of each astronaut that evolves during the mission and makes it possible to anticipate health risks.
          </p>
          {/* The tagline is the team's to write: set it in src/data/team.json. Nothing shows until then. */}
          {team.tagline && <p className="mt-4 text-lg font-medium">{team.tagline}</p>}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link to="/app" className={`${buttonPrimary} !min-h-13 !px-7 !text-base`}>Open the tool →</Link>
            <a href="#try" className={`${buttonSecondary} !min-h-13`} onClick={go('try')}>Try a what-if here</a>
          </div>
          <p className="mt-7 text-xs text-muted">Prototype for the NASA Space Apps Challenge 2026. Simulated data. Not a medical device.</p>
        </div>

        <div className="relative mx-auto h-[600px] w-full max-w-[540px]">
          <svg viewBox="0 0 540 600" className="absolute inset-0 h-full w-full" aria-hidden>
            <circle cx="270" cy="300" r="250" fill="none" stroke="#1e3449" />
            <circle cx="270" cy="300" r="196" fill="none" stroke="#58d8e8" strokeOpacity="0.28" strokeDasharray="2 10" className="anim-spin" />
            <circle cx="270" cy="300" r="140" fill="#58d8e8" fillOpacity="0.035" stroke="#1e3449" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center"><TwinFigure statuses={statuses} height={580} /></div>
          {float.map(({ s, cls }, i) => (
            <div key={s.system.id} className={`panel anim-drift absolute hidden w-[178px] p-3 sm:block ${cls}`} style={{ animationDelay: `${i * -1.7}s` }}>
              <p className="flex items-center justify-between gap-2 text-[13px] font-semibold">{s.system.name}</p>
              <p className="mt-1 font-mono text-xl leading-none">{format(s.value, s.system.measure.decimals)}<span className="ml-1.5 text-[10px] text-muted">{s.system.measure.unit}</span></p>
              <p className="mt-2"><StatusBadge status={s.status} /></p>
            </div>
          ))}
          <SimulatedBadge className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-bg/80" />
        </div>
      </section>

      <section className="border-y border-line bg-panel/50">
        <dl className="mx-auto grid max-w-[1240px] grid-cols-2 gap-x-6 gap-y-6 px-4 py-8 sm:px-8 md:grid-cols-5">
          {facts.map(([n, label]) => (
            <div key={label}>
              <dd className="font-display text-4xl font-semibold text-accent">{n}</dd>
              <dt className="mt-1 text-sm text-muted">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 px-4 py-24 sm:px-8 lg:grid-cols-2">
          <div>
            <Eyebrow>Why</Eyebrow>
            <h2 className="mt-4 text-5xl font-semibold tracking-tight">Not only anomaly detection.</h2>
            <p className="mt-6 max-w-lg text-lg text-muted">
              On Mars-class, long-duration missions, medical decisions have to be made with more autonomy. Instead of asking only how you are today, ASTRA asks how you could be 30 days from now if you continue with your current habits and conditions.
            </p>
          </div>
          <ol className="flex flex-col">
            {[
              ['Personalized monitoring', 'A twin per astronaut. Every reading is compared with your own baseline, and a model learned from that baseline notices when readings that each look fine are unusual together.'],
              ['Simulation', 'Change sleep hours, exercise or environmental exposure and watch the projected state change.'],
              ['Prevention', 'The Medical Advisor explains the results and suggests preventive actions, subject to protocols.'],
            ].map(([title, text], i) => (
              <li key={title} className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-4 border-t border-line py-6 last:border-b">
                <span className="font-mono text-sm text-accent">0{i + 1}</span>
                <div><h3 className="text-2xl font-semibold">{title}</h3><p className="mt-1.5 text-muted">{text}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="try" className="scroll-mt-20 border-t border-line">
        <div className="mx-auto max-w-[1240px] px-4 py-24 sm:px-8">
          <Eyebrow>Try it</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight">See the projected effect before you commit to it.</h2>
          <p className="mt-5 mb-10 max-w-2xl text-lg text-muted">This is the tool's real what-if, running on a simulated crew member whose circadian rhythm is on alert. Change the sleep plan and watch the next 30 days move.</p>
          <LiveDemo />
        </div>
      </section>

      <section id="how" className="scroll-mt-20 border-t border-line bg-panel/50">
        <div className="mx-auto max-w-[1240px] px-4 py-24 sm:px-8">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 text-5xl font-semibold tracking-tight">Gather, evaluate, act.</h2>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {STEPS.map(([n, title, text]) => (
              <article key={n} className="panel p-6">
                <p className="font-mono text-xs tracking-[0.14em] text-accent">{n}</p>
                <h3 className="mt-3 text-3xl font-semibold">{title}</h3>
                <p className="mt-3 text-muted">{text}</p>
              </article>
            ))}
          </div>

          <h3 className="mt-20 text-3xl font-semibold">Five agents</h3>
          <p className="mt-2 max-w-2xl text-muted">Rules, plus one small statistical model that learns each astronaut's own normal pattern. No language model. Every rule and model carries a source or is marked as an assumption that needs review, and the tool shows which.</p>
          <ol className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {AGENTS.map(([name, text, out], i) => (
              <li key={name} className="panel relative flex flex-col p-4">
                <span className="font-mono text-[11px] text-accent">0{i + 1}</span>
                <h4 className="mt-2 font-display text-lg font-semibold">{name}</h4>
                <p className="mt-2 flex-1 text-sm text-muted">{text}</p>
                <p className="mt-4 border-t border-line pt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Gives: <span className="text-ink">{out}</span></p>
                {i < 4 && <span aria-hidden className="absolute top-1/2 -right-[11px] z-[1] hidden -translate-y-1/2 text-lg text-accent lg:block">›</span>}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="science" className="scroll-mt-20 border-t border-line">
        <div className="mx-auto max-w-[1240px] px-4 py-24 sm:px-8">
          <Eyebrow>Science and data</Eyebrow>
          <h2 className="mt-4 text-5xl font-semibold tracking-tight">Where every number comes from.</h2>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            ASTRA is organized around the five hazards of human spaceflight described by NASA's Human Research Program. Each thing it watches is linked to the hazard it answers.
          </p>

          <div className="panel mt-10 overflow-x-auto p-5">
            <table className="w-full min-w-[820px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="w-[230px] pb-3 text-left font-mono text-[11px] font-normal uppercase tracking-[0.12em] text-muted">NASA hazard</th>
                  {columns.map((c, i) => (
                    <th key={c.id} className={`h-28 px-1 pb-3 align-bottom ${i === indicators.length ? 'border-l border-line' : ''}`}>
                      <span className="inline-block [writing-mode:vertical-rl] rotate-180 text-left text-xs font-medium whitespace-nowrap text-muted">{c.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hazards.map((h) => {
                  const any = columns.some((c) => c.hazardIds.includes(h.id));
                  return (
                    <tr key={h.id}>
                      <th scope="row" className="border-t border-line py-3 pr-4 text-left">
                        <span className="font-semibold">{h.name}</span>
                        <span className="mt-0.5 block text-xs font-normal text-muted">{h.summary}</span>
                      </th>
                      {any ? columns.map((c, i) => (
                        <td key={c.id} className={`border-t border-line text-center ${i === indicators.length ? 'border-l' : ''}`}>
                          {c.hazardIds.includes(h.id) && <span className="inline-block h-3 w-3 rounded-full bg-accent shadow-[0_0_10px_rgba(88,216,232,0.8)]" aria-label="linked" />}
                        </td>
                      )) : (
                        <td colSpan={columns.length} className="border-t border-line px-3 text-xs text-muted">Answered by design: the tool runs on board with no network call and no ground support.</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted">Left: the {indicators.length} indicators. Right: the {systems.length} body systems of the twin.</p>
          </div>

          <h3 className="mt-16 text-3xl font-semibold">Sources</h3>
          <ul className="mt-5 flex flex-col">
            {sources.map((s) => (
              <li key={s.id} className="grid grid-cols-1 gap-x-8 gap-y-1 border-t border-line py-4 last:border-b md:grid-cols-2">
                <div>
                  <a href={s.url} target="_blank" rel="noreferrer" className="font-semibold text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">{s.title}</a>
                  <p className="text-xs text-muted">{s.org}{s.challengeListed ? ' · listed in the challenge resources' : ''} · accessed {s.accessed}</p>
                </div>
                <p className="text-sm text-muted">{s.usedFor}</p>
              </li>
            ))}
          </ul>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              ['Simplified projection, not a prediction', 'The 30-day view applies simple, explicit models. Each chart shows its model, its source and what it leaves out.'],
              ['Simulated data, clearly labelled', 'No real astronaut data is used. The crew and every reading are generated from a fixed seed.'],
              ['Prototype, not a medical device', 'ASTRA explains signals and suggests actions subject to mission protocols. It does not diagnose.'],
            ].map(([title, text]) => (
              <article key={title} className="panel p-5">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-panel/50">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-8 px-4 py-20 sm:px-8">
          <div>
            {/* Team name and members are the team's to write: set them in src/data/team.json. */}
            {team.name ? (
              <>
                <Eyebrow>Team</Eyebrow>
                <p className="mt-4 font-display text-3xl font-semibold tracking-tight">{team.name}</p>
                {team.members.length > 0 && <p className="mt-2 text-muted">{(team.members as string[]).join(' · ')}</p>}
              </>
            ) : (
              <>
                <Eyebrow>Open the tool</Eyebrow>
                <p className="mt-4 max-w-xl font-display text-3xl font-semibold tracking-tight">Select a crew member, observe their twin, simulate a change.</p>
              </>
            )}
          </div>
          <Link to="/app" className={`${buttonPrimary} !min-h-13 !px-7 !text-base`}>Open the tool →</Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 px-4 py-8 text-xs text-muted sm:px-8">
          <p>Prototype. Not a medical device. All crew data is simulated.</p>
          <p>Built for the NASA Space Apps Challenge 2026. Not affiliated with or endorsed by NASA.</p>
          <p>Parts of this site's code and text were written with an AI assistant (Claude Code) and reviewed by the team. The solution concept is the team's.</p>
        </div>
      </footer>
    </div>
  );
}
