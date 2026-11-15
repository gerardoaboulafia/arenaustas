// AI-assisted: written with Claude Code, reviewed by the team.
// 30-day projection and what-if. Always a simplified projection, never a prediction.
import { SEVERITY, format, measureStatus, round } from '../domain';
import type { ActionDef, Projection, WhatIfInput } from '../domain';
import { ChartLegend, MiniProjection, ProjectionChart, StatusStrip } from '../components/ui/charts';
import { AgentTag, BasisTag, Card, PROJECTION_LABEL, SourceLink, StatusBadge, buttonSecondary } from '../components/ui/primitives';
import { useMission } from './state';
import { WHAT_IF, snap } from './whatIf';

const SHORT_UNIT: Record<WhatIfInput, string> = { sleepHours: 'h sleep', exerciseMin: 'min resistive exercise', radiationDose: 'mSv per day' };

function ModelCard({ projection }: { projection: Projection }) {
  const { model } = projection;
  const names = Object.keys(model.parameters);
  return (
    <Card title="How this projection is calculated" agent="Prediction Agent">
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">
        <div>
          <p className="text-[15px]">{model.description}</p>
          <p className="mt-3 text-sm text-muted"><span className="font-semibold text-ink">What it leaves out. </span>{model.limits}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <BasisTag basis={model.basis} needsReview={model.needsReview} />
            <SourceLink sourceId={model.sourceId} />
            {model.alsoSourceIds?.map((id) => <SourceLink key={id} sourceId={id} />)}
          </div>
        </div>
        <dl className="inset self-start p-3.5 text-sm">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Model: {model.id} · form: {model.form}</p>
          
          {names.map((name) => (
            <div key={name} className="flex items-center justify-between gap-3 border-t border-line py-2 first:border-t-0">
              <dt className="font-mono text-xs text-muted">{name}</dt>
              <dd className="flex items-center gap-2"><span className="font-mono">{model.parameters[name]}</span><BasisTag basis={model.parameterBasis[name]} /></dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}

export function ProjectionPage() {
  const { twin, day, scenario, setWhatIf, resetScenario, focusSystem, setFocusSystem } = useMission();
  const worst = [...twin.systems].sort((a, b) => SEVERITY[b.status] - SEVERITY[a.status])[0];
  const tabId = focusSystem ?? worst.system.id;
  const system = twin.systems.find((s) => s.system.id === tabId);
  const projection = system ? system.projection : twin.radiation;
  const careerLimit = twin.radiation.model.parameters.careerLimitMsv;
  const unit = system ? system.system.measure.unit : 'mSv since launch';
  const decimals = system ? system.system.measure.decimals : 1;
  const title = system ? system.system.measure.name : 'Mission radiation dose';
  const end = (values: number[]) => values[values.length - 1];
  const changed = Object.keys(scenario).length > 0;
  const diff = end(projection.scenario) - end(projection.baseline);
  const suggestions = twin.advice.flatMap((a) => a.actions).filter((a): a is ActionDef & { whatIf: NonNullable<ActionDef['whatIf']> } => Boolean(a.whatIf));
  const apply = (input: WhatIfInput, delta: number) => {
    setWhatIf(input, snap(input, twin.habits[input] + delta));
    setFocusSystem(input === 'radiationDose' ? 'radiation' : twin.systems.find((s) => s.projection.input === input && s.status !== 'nominal')?.system.id ?? WHAT_IF[input].system);
  };
  const cards = [
    ...twin.systems.map((s) => ({ id: s.system.id, name: s.system.name, projection: s.projection, measure: s.system.measure, before: s.day30.baseline.status, after: s.day30.scenario.status })),
    { id: 'radiation', name: 'Radiation dose', projection: twin.radiation, measure: undefined, before: undefined, after: undefined },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="anim-rise">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">{twin.crew.label} · from mission day {day} · {PROJECTION_LABEL}</p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight">Your next 30 days</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">Where each body system is heading if your current habits and conditions continue, and what changes if you change them.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,370px)_minmax(0,1fr)]">
        <Card title="What if" className="self-start">
          {suggestions.length > 0 && (
            <div className="mb-4">
              <p className="mb-2"><AgentTag agent="Medical Advisor" /></p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((a) => (
                  <button key={a.text} type="button" title={a.text} onClick={() => apply(a.whatIf.input, a.whatIf.delta)}
                    className="min-h-9 rounded-full border border-accent/70 px-3 text-xs font-semibold text-accent transition hover:bg-accent hover:text-bg">
                    {a.whatIf.delta > 0 ? '+' : '−'}{Math.abs(a.whatIf.delta)} {SHORT_UNIT[a.whatIf.input]}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {(Object.keys(WHAT_IF) as WhatIfInput[]).map((input) => {
              const cfg = WHAT_IF[input];
              const now = twin.habits[input];
              const value = scenario[input] ?? snap(input, now);
              const drives = projection.input === input;
              const moved = scenario[input] !== undefined && Math.abs(value - now) > cfg.step / 2;
              const nowPos = Math.min(100, Math.max(0, ((now - cfg.min) / (cfg.max - cfg.min)) * 100));
              return (
                <div key={input} className={`inset p-3.5 transition ${drives ? 'glow-accent !border-accent' : ''}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <label htmlFor={`whatif-${input}`} className="text-sm font-semibold">{cfg.label}</label>
                    <span className={`font-mono text-xl ${moved ? 'text-accent' : ''}`}>{value}<span className="ml-1 text-[11px] text-muted">{cfg.unit}</span></span>
                  </div>
                  <input
                    id={`whatif-${input}`} type="range" min={cfg.min} max={cfg.max} step={cfg.step} value={value}
                    onChange={(e) => setWhatIf(input, Number(e.target.value))}
                    className="mt-1 h-9 w-full"
                  />
                  <div className="relative mx-2 h-3" aria-hidden>
                    <span className="absolute top-0 h-2 w-px bg-muted" style={{ left: `${nowPos}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>Now <span className="font-mono text-ink">{format(now, 2)}</span> · 7-day average</span>
                    {drives && <span className="text-accent">Moves this chart</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <button type="button" onClick={resetScenario} disabled={!changed} className={`${buttonSecondary} mt-4 w-full disabled:opacity-40`}>
            Reset to current habits
          </button>
        </Card>

        <section className="panel min-w-0 p-5">
          <div role="tablist" aria-label="Projected measure" className="flex flex-wrap gap-2">
            {cards.map((c) => {
              const on = c.id === tabId;
              const s = twin.systems.find((x) => x.system.id === c.id);
              return (
                <button key={c.id} type="button" role="tab" aria-selected={on} onClick={() => setFocusSystem(c.id)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${on ? 'border-accent bg-panel2 text-ink' : 'border-line text-muted hover:text-ink'}`}>
                  {c.name}
                  {s && <StatusBadge status={s.status} className="!px-1.5 !py-0.5" />}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
              <p className="text-xs text-muted">{unit}</p>
            </div>
            <div className="flex flex-wrap items-stretch gap-3">
              <div className="inset px-3.5 py-2.5">
                <p className="text-[11px] text-muted">Today</p>
                <p className="flex items-center gap-2 font-mono text-xl">{round(end(projection.history), decimals)}{system && <StatusBadge status={system.status} />}</p>
              </div>
              <div className="inset px-3.5 py-2.5">
                <p className="text-[11px] text-muted">Day +30 if nothing changes</p>
                <p className="flex items-center gap-2 font-mono text-xl">{round(end(projection.baseline), decimals)}{system && <StatusBadge status={system.day30.baseline.status} />}</p>
              </div>
              <div className="inset glow-accent !border-accent px-3.5 py-2.5">
                <p className="text-[11px] text-muted">Day +30 with your changes</p>
                <p className="flex items-center gap-2 font-mono text-xl text-accent">
                  {round(end(projection.scenario), decimals)}
                  {system && <StatusBadge status={system.day30.scenario.status} />}
                  {Math.abs(diff) > 1e-9 && <span className="text-xs">({diff > 0 ? '+' : '−'}{round(Math.abs(diff), decimals)})</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3"><ProjectionChart projection={projection} measure={system?.system.measure} unit={unit} /></div>
          {system && (
            <div className="mt-1 grid grid-cols-[132px_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 pl-1 text-[11px] text-muted">
              <span>If nothing changes</span>
              <StatusStrip statuses={projection.baseline.map((v) => measureStatus(system.system.measure, v))} faded />
              <span className="text-accent">With your changes</span>
              <StatusStrip statuses={projection.scenario.map((v) => measureStatus(system.system.measure, v))} />
            </div>
          )}
          {!system && (
            <div className="inset mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 p-3 text-sm">
              <StatusBadge status={end(projection.scenario) >= careerLimit ? 'alert' : 'nominal'} />
              <span>
                Day +30: <span className="font-mono">{round((end(projection.scenario) / careerLimit) * 100, 1)}%</span> of NASA's career limit of <span className="font-mono">{careerLimit} mSv</span>
              </span>
              <span className="h-2 min-w-[140px] flex-1 overflow-hidden rounded-full bg-panel2" role="img" aria-label={`${round((end(projection.scenario) / careerLimit) * 100, 1)} percent of the career limit`}>
                <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (end(projection.scenario) / careerLimit) * 100)}%` }} />
              </span>
              <BasisTag basis="nasa" />
              <span className="basis-full text-xs text-muted">The limit counts every flight of a career. This is the dose of this mission only.</span>
            </div>
          )}
          {!system && (
            <p className="inset mt-2 p-3 text-sm text-muted">
              Estimated neutron part at day +30: <span className="font-mono text-ink">{round(end(projection.scenario) * projection.model.parameters.neutronShare, 1)} mSv</span>
              {' '}({Math.round(projection.model.parameters.neutronShare * 100)}% of the total, the Canadian Space Agency's figure for the International Space Station).
            </p>
          )}
          <div className="mt-3"><ChartLegend /></div>
        </section>
      </div>

      <Card title="Every system, side by side" agent="Physiology Agent">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((c) => (
            <button key={c.id} type="button" onClick={() => setFocusSystem(c.id)}
              className={`inset flex flex-col gap-2 p-3.5 text-left transition ${c.id === tabId ? 'glow-accent !border-accent' : 'hover:border-muted'}`}>
              <span className="font-display text-sm font-semibold">{c.name}</span>
              <MiniProjection projection={c.projection} measure={c.measure} />
              {c.before && c.after ? (
                <span className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                  <StatusBadge status={c.before} className="!px-1.5 !py-0.5" /><span aria-hidden>→</span><StatusBadge status={c.after} className="!px-1.5 !py-0.5" />
                </span>
              ) : (
                <span className="text-[11px] text-muted">{round(end(c.projection.baseline), 1)} → {round(end(c.projection.scenario), 1)} mSv · {round((end(c.projection.scenario) / careerLimit) * 100, 0)}% of the career limit</span>
              )}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Each card: day +30 if nothing changes → day +30 with your changes. Radiation is compared with NASA's career limit of {careerLimit} mSv; the tool sets no lower watch level.</p>
      </Card>

      <ModelCard projection={projection} />
    </div>
  );
}
