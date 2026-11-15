// AI-assisted: written with Claude Code, reviewed by the team.
// The project demo: exactly seven slides. The hackathon limit is seven, so SLIDES must never grow.
// Each slide is drawn at 1280 x 720 and scaled to the window; printing gives one slide per page.
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LAST_DAY, buildTwin, createDataset, hazards, indicators, sourceById, systems } from '../domain';
import team from '../data/team.json';
import { TwinFigure } from '../components/ui/TwinFigure';
import { Logo, StatusBadge } from '../components/ui/primitives';
import twinShot from '../../docs/demo/shots/twin.png';
import projectionShot from '../../docs/demo/shots/projection.png';
import patternShot from '../../docs/demo/shots/pattern.png';

const W = 1280;
const H = 720;

function useScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, (window.innerHeight - 56) / H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return scale;
}

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-accent">{children}</p>
);

const Title = ({ children }: { children: ReactNode }) => (
  <h2 className="mt-3 text-[44px] font-semibold leading-[1.06] tracking-[-0.02em] text-balance">{children}</h2>
);

const Box = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-line bg-panel p-5 ${className}`}>{children}</div>
);

const Shot = ({ src, alt, className = '' }: { src: string; alt: string; className?: string }) => (
  <img src={src} alt={alt} className={`block rounded-xl border border-line object-cover object-top ${className}`} />
);

const Cite = ({ id }: { id: string }) => {
  const source = sourceById(id);
  return source ? <span className="mt-3 block text-[12px] text-muted">Source: {source.org}, “{source.title}”</span> : null;
};

const AGENTS = [
  ['Biometric Agent', 'Analyzes heart rate, sleep and other indicators'],
  ['Physiology Agent', 'Tracks muscular, bone and cardiovascular changes'],
  ['Environment Agent', 'Evaluates radiation and spacecraft conditions'],
  ['Prediction Agent', 'Projects scenarios using explicit models'],
  ['Medical Advisor', 'Explains the results and suggests preventive actions'],
];

function useSlides(): { name: string; body: ReactNode }[] {
  const twin = useMemo(() => buildTwin(createDataset(), 'c', LAST_DAY), []);
  const statuses = Object.fromEntries(twin.systems.map((s) => [s.system.id, s.status]));
  const site = team.site.replace('https://', '');
  const repo = team.repo.replace('https://', '');

  return [
    {
      name: 'Who we are',
      body: (
        <div className="grid h-full grid-cols-[minmax(0,1fr)_400px] items-center gap-10">
          <div>
            <Eyebrow>{team.event}</Eyebrow>
            <p className="mt-2 text-[17px] text-muted">Challenge: {team.challenge}</p>
            <div className="mt-10 flex items-baseline gap-5">
              <span className="font-display text-[84px] font-bold leading-none tracking-[0.14em]">ASTRA</span>
            </div>
            <p className="mt-3 text-[22px] text-muted">Astronaut health digital twin</p>
            <p className="mt-9 max-w-[640px] font-display text-[46px] font-semibold leading-[1.05] tracking-[-0.02em]">
              How could you be <span className="text-accent">30 days</span> from now?
            </p>
            <div className="mt-11 border-t border-line pt-5">
              <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-muted">Team {team.name}</p>
              <p className="mt-1.5 text-[22px] font-semibold">{team.members.join(' · ')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <TwinFigure statuses={statuses} height={520} animate={false} />
            <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.14em] text-muted">The twin, drawn by the tool · simulated data</p>
          </div>
        </div>
      ),
    },
    {
      name: 'The challenge',
      body: (
        <div className="flex h-full flex-col">
          <Eyebrow>The challenge and why it matters</Eyebrow>
          <Title>Far from Earth, a crew has to notice a health problem early, and act on it alone.</Title>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <Box>
              <p className="font-display text-[40px] font-semibold leading-none text-accent">≈ 3 years</p>
              <p className="mt-3 text-[17px]">away from Earth on a Mars mission, so planning and self-sufficiency are key.</p>
              <Cite id="nasa-hazards" />
            </Box>
            <Box>
              <p className="font-display text-[40px] font-semibold leading-none text-accent">≈ 1% a month</p>
              <p className="mt-3 text-[17px]">of density lost by weight-bearing bones in microgravity without countermeasures.</p>
              <Cite id="nasa-bone-muscle" />
            </Box>
            <Box>
              <p className="font-display text-[40px] font-semibold leading-none text-accent">5 hazards</p>
              <p className="mt-3 text-[17px]">{hazards.map((h) => h.name).join(' · ')}</p>
              <Cite id="nasa-hazards" />
            </Box>
          </div>
          <Box className="mt-auto">
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted">What NASA's brief asks for</p>
            <p className="mt-2 text-[22px] leading-snug">
              Software that <span className="font-semibold text-accent">gathers</span> health indicators and lets astronauts{' '}
              <span className="font-semibold text-accent">evaluate</span> and <span className="font-semibold text-accent">act</span> on the status of their health.
            </p>
          </Box>
        </div>
      ),
    },
    {
      name: 'Our idea',
      body: (
        <div className="flex h-full flex-col">
          <Eyebrow>Our idea</Eyebrow>
          <Title>A digital twin of each astronaut that evolves during the mission.</Title>
          <div className="mt-7 grid grid-cols-2 gap-4">
            <Box>
              <p className="text-[19px] leading-snug">
                Instead of asking only how the astronaut is today, ASTRA asks how they could be 30 days from now if they continue with their current habits and conditions.
              </p>
            </Box>
            <Box>
              <p className="text-[19px] leading-snug">
                Personalized monitoring, simulation and prevention. Before committing to a countermeasure, the astronaut runs a <span className="text-accent">what-if</span> and sees the projected effect.
              </p>
            </Box>
          </div>
          <p className="mt-8 font-mono text-[13px] uppercase tracking-[0.18em] text-muted">Five agents build the twin</p>
          <ol className="mt-3 grid grid-cols-5 gap-3">
            {AGENTS.map(([name, role], i) => (
              <li key={name} className="rounded-2xl border border-line bg-panel p-4">
                <span className="font-mono text-[12px] text-accent">0{i + 1}</span>
                <p className="mt-1 text-[17px] font-semibold leading-tight">{name}</p>
                <p className="mt-2 text-[14px] leading-snug text-muted">{role}</p>
              </li>
            ))}
          </ol>
          <p className="mt-auto text-[15px] text-muted">
            The agents are rules and explicit models that run in the browser. No language model writes medical advice, and nothing leaves the device.
          </p>
        </div>
      ),
    },
    {
      name: 'How it works: gather and evaluate',
      body: (
        <div className="grid h-full grid-cols-[330px_minmax(0,1fr)] gap-8">
          <div className="flex flex-col">
            <Eyebrow>How it works · 1 of 2</Eyebrow>
            <Title>Gather, then evaluate.</Title>
            <ul className="mt-7 flex flex-col gap-5 text-[16px] leading-snug">
              <li>
                <p className="font-semibold text-accent">Gather</p>
                <p className="mt-1">{indicators.length} indicators, typed in, imported as a file or filled by simulated telemetry. Each one says why it matters and how to measure it.</p>
              </li>
              <li>
                <p className="font-semibold text-accent">Evaluate</p>
                <p className="mt-1">Every reading is compared with the astronaut's own baseline. The figure shows {systems.map((s) => s.name.toLowerCase()).join(', ')}.</p>
              </li>
              <li className="flex flex-wrap items-center gap-2">
                <StatusBadge status="nominal" />
                <StatusBadge status="watch" />
                <StatusBadge status="alert" />
              </li>
            </ul>
            <p className="mt-auto text-[13px] text-muted">Screenshot of the tool. Crew and readings are simulated.</p>
          </div>
          <Shot src={twinShot} alt="The Twin screen: a body figure with four body systems, and the Medical Advisor's list of actions" className="h-full w-full" />
        </div>
      ),
    },
    {
      name: 'How it works: act',
      body: (
        <div className="grid h-full grid-cols-[330px_minmax(0,1fr)] gap-8">
          <div className="flex flex-col">
            <Eyebrow>How it works · 2 of 2</Eyebrow>
            <Title>Act, after seeing the effect.</Title>
            <ul className="mt-7 flex flex-col gap-5 text-[16px] leading-snug">
              <li>
                <p className="font-semibold text-accent">Who to involve</p>
                <p className="mt-1">Watch: you. Alert: the crew medical officer, who sees the whole crew on one screen. An alert that lasts: the flight surgeons on the ground.</p>
              </li>
              <li>
                <p className="font-semibold text-accent">What-if</p>
                <p className="mt-1">Here Sofia has slept about 5 hours a night. With 8 hours, the projected sleep debt goes from 19.8 h to 0, and from alert to nominal.</p>
              </li>
            </ul>
            <p className="mt-auto text-[13px] text-muted">A simplified projection from explicit models, not a prediction. Each chart shows its model, its source and its limits.</p>
          </div>
          <Shot src={projectionShot} alt="The Projection screen: what-if sliders and a 30-day chart of sleep debt with and without the change" className="h-full w-full" />
        </div>
      ),
    },
    {
      name: 'NASA and partner data',
      body: (
        <div className="flex h-full flex-col">
          <Eyebrow>What makes it possible</Eyebrow>
          <Title>NASA and partner data drive every status, action and projection.</Title>
          <div className="mt-6 grid grid-cols-4 gap-3">
            <Box className="!p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">NASA Human Research Program</p>
              <p className="mt-2 text-[14.5px] leading-snug">The five hazards of human spaceflight. Every indicator and body system links to the hazards behind it.</p>
            </Box>
            <Box className="!p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">NASA station research</p>
              <p className="mt-2 text-[14.5px] leading-snug">Bone loss of roughly 1% a month without countermeasures is the base rate of the bone projection.</p>
            </Box>
            <Box className="!p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">NASA-STD-3001 briefs</p>
              <p className="mt-2 text-[14.5px] leading-snug">Cabin CO2 at 3 mmHg raises an alert. The projected dose is shown against the 600 mSv career limit.</p>
            </Box>
            <Box className="!p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">Canadian Space Agency</p>
              <p className="mt-2 text-[14.5px] leading-snug">Neutrons are about 30% of the radiation on the space station. That share splits the projected dose.</p>
            </Box>
          </div>
          <div className="mt-5 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_330px] items-stretch gap-5">
            <div className="flex min-h-0 flex-col">
              <Shot src={patternShot} alt="The pattern check card: a small machine-learning model that flags readings that are unusual together" className="min-h-0 w-full flex-1" />
              <p className="mt-2 text-[13px] text-muted">
                One small machine-learning model learns each astronaut's own normal and flags readings that are unusual together. It can raise a watch, never an alert.
              </p>
            </div>
            <Box className="flex flex-col justify-center gap-2.5 text-[15px] leading-snug">
              <p className="font-semibold">Stated in the tool</p>
              <p className="text-muted">Values without a source are tagged as assumptions.</p>
              <p className="text-muted">All crew data is simulated.</p>
              <p className="text-muted">Prototype, not a medical device.</p>
              <p className="text-muted">It runs in the browser. Nothing leaves the device.</p>
            </Box>
          </div>
        </div>
      ),
    },
    {
      name: 'What it could become',
      body: (
        <div className="flex h-full flex-col">
          <Eyebrow>What it could become</Eyebrow>
          <Title>What comes next, and who else it could help.</Title>
          <div className="mt-7 grid grid-cols-2 gap-4">
            <Box>
              <p className="font-semibold text-accent">Next steps</p>
              <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-[16px] leading-snug">
                <li>Flight surgeons review every threshold and model.</li>
                <li>Readings from wearables and cabin sensors.</li>
                <li>Space weather for the Environment Agent.</li>
              </ul>
            </Box>
            <Box>
              <p className="font-semibold text-accent">Beyond astronauts</p>
              <p className="mt-2 text-[16px] leading-snug">
                The same loop, a personal baseline, a simple projection and a what-if, could serve crews of polar stations, ships and remote sites, and patients followed at home between visits.
              </p>
            </Box>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Box>
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted">Try it</p>
              <p className="mt-1 text-[21px] font-semibold text-accent">{site}</p>
            </Box>
            <Box>
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted">Source code</p>
              <p className="mt-1 text-[21px] font-semibold text-accent">{repo}</p>
            </Box>
          </div>
          <div className="mt-auto flex flex-col gap-1 text-[13px] text-muted">
            <p>Team {team.name}: {team.members.join(', ')}. {team.event}.</p>
            <p>
              Parts of the code and text were written with an AI assistant (Claude Code) and reviewed by the team. The concept is the team's. No AI-generated images. Not affiliated with or endorsed by NASA.
            </p>
          </div>
        </div>
      ),
    },
  ];
}

export function DemoDeck() {
  const slides = useSlides();
  const scale = useScale();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const step = ['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key) ? 1 : ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key) ? -1 : 0;
      if (step === 0) return;
      e.preventDefault();
      const frames = Array.from(document.querySelectorAll<HTMLElement>('.deck-frame'));
      const current = frames.findIndex((f) => f.getBoundingClientRect().top > -f.offsetHeight / 2);
      frames[Math.min(frames.length - 1, Math.max(0, current + step))]?.scrollIntoView();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="deck min-h-screen">
      <header className="deck-chrome sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-line bg-bg/90 px-4 backdrop-blur sm:px-6">
        <Link to="/" aria-label="ASTRA home"><Logo /></Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted sm:inline">Project demo · {slides.length} slides · arrow keys to move</span>
          <button type="button" onClick={() => window.print()} className="rounded-lg border border-line px-3 py-1.5 font-semibold hover:border-accent hover:text-accent">Save as PDF</button>
          <Link to="/app" className="rounded-lg bg-accent px-3 py-1.5 font-semibold text-bg">Open the tool</Link>
        </div>
      </header>
      <main className="flex flex-col items-center gap-4 py-0 sm:gap-6">
        {slides.map((slide, i) => (
          <section key={slide.name} aria-label={`Slide ${i + 1} of ${slides.length}: ${slide.name}`} className="deck-frame relative shrink-0 overflow-hidden" style={{ width: W * scale, height: H * scale }}>
            <div className="deck-slide absolute left-0 top-0 flex flex-col" style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <div className="min-h-0 flex-1 px-14 pt-11 pb-5">{slide.body}</div>
              <footer className="flex items-center justify-between border-t border-line px-14 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                <span>ASTRA · Team {team.name} · {team.event}</span>
                <span>{i + 1} / {slides.length}</span>
              </footer>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
