// AI-assisted: written with Claude Code, reviewed by the team.
// 30-day projection and what-if. Always a simplified projection, never a prediction.
import { SEVERITY, format, round } from '../domain';
import type { Projection, WhatIfInput } from '../domain';
import { ChartLegend, ProjectionChart } from '../components/ui/charts';
import { BasisTag, Card, PROJECTION_LABEL, SourceLink, StatusBadge, buttonSecondary } from '../components/ui/primitives';
import { useMission } from './state';
import { WHAT_IF, snap } from './whatIf';

function ModelCard({ projection }: { projection: Projection }) {
  const { model } = projection;
  return (
    <Card title="How this projection is calculated" agent="Prediction Agent">
      <p className="text-sm">{model.description}</p>
      <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        {Object.entries(model.parameters).map(([name, value]) => (
          <div key={name} className="flex items-center justify-between gap-3 border-b border-line pb-2">
            <dt className="font-mono text-xs text-muted">{name}</dt>
            <dd className="flex items-center gap-2"><span className="font-mono">{value}</span><BasisTag basis={model.parameterBasis[name]} /></dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-muted"><span className="font-semibold text-ink">Limits. </span>{model.limits}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <BasisTag basis={model.basis} needsReview={model.needsReview} />
        <SourceLink sourceId={model.sourceId} />
      </div>
    </Card>
  );
}

export function ProjectionPage() {
  const { twin, scenario, setWhatIf, resetScenario, focusSystem, setFocusSystem } = useMission();
  const worst = [...twin.systems].sort((a, b) => SEVERITY[b.status] - SEVERITY[a.status])[0];
  const tabId = focusSystem ?? worst.system.id;
  const system = twin.systems.find((s) => s.system.id === tabId);
  const projection = system ? system.projection : twin.radiation;
  const unit = system ? system.system.measure.unit : 'mSv since launch';
  const decimals = system ? system.system.measure.decimals : 1;
  const title = system ? system.system.measure.name : 'Mission radiation dose';
  const end = (values: number[]) => values[values.length - 1];
  const changed = Object.keys(scenario).length > 0;
  const tabs = [...twin.systems.map((s) => ({ id: s.system.id, name: s.system.name })), { id: 'radiation', name: 'Radiation dose' }];

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your next 30 days</h1>
        <p className="mt-1 text-sm text-muted">
          {twin.crew.label} · where each body system is heading if your current habits and conditions continue, and what changes if you change them.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <Card title="What if" className="self-start">
          <p className="text-sm text-muted">Change a habit or an exposure and compare it with your current path.</p>
          <div className="mt-4 flex flex-col gap-5">
            {(Object.keys(WHAT_IF) as WhatIfInput[]).map((input) => {
              const cfg = WHAT_IF[input];
              const now = twin.habits[input];
              const value = scenario[input] ?? snap(input, now);
              const drives = projection.input === input;
              return (
                <div key={input} className={`rounded-xl border p-3 ${drives ? 'border-accent' : 'border-line'}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <label htmlFor={`whatif-${input}`} className="text-sm font-semibold">{cfg.label}</label>
                    <span className="font-mono text-lg">{value}<span className="ml-1 text-xs text-muted">{cfg.unit}</span></span>
                  </div>
                  <input
                    id={`whatif-${input}`} type="range" min={cfg.min} max={cfg.max} step={cfg.step} value={value}
                    onChange={(e) => setWhatIf(input, Number(e.target.value))}
                    className="mt-1 h-11 w-full"
                  />
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Now: <span className="font-mono text-ink">{format(now, 2)}</span> (7-day average)</span>
                    {drives && <span className="text-accent">Moves this chart</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <button type="button" onClick={resetScenario} disabled={!changed} className={`${buttonSecondary} mt-4 w-full disabled:opacity-50`}>
            Reset to current habits
          </button>
        </Card>

        <Card>
          <div role="tablist" aria-label="Projected measure" className="flex flex-wrap gap-2">
            {tabs.map((t) => {
              const s = twin.systems.find((x) => x.system.id === t.id);
              const activeTab = t.id === tabId;
              return (
                <button
                  key={t.id} type="button" role="tab" aria-selected={activeTab} onClick={() => setFocusSystem(t.id)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${activeTab ? 'border-ink bg-panel2' : 'border-line text-muted hover:text-ink'}`}
                >
                  {t.name}
                  {s && <StatusBadge status={s.status} className="!px-1.5 !py-0.5" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-xs text-muted">{unit} · {PROJECTION_LABEL}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl border border-line bg-panel2 px-3 py-2">
                <p className="text-[11px] text-muted">Day +30 if nothing changes</p>
                <p className="flex items-center gap-2 font-mono text-lg">
                  {round(end(projection.baseline), decimals)}
                  {system && <StatusBadge status={system.day30.baseline.status} />}
                </p>
              </div>
              <div className="rounded-xl border border-accent bg-panel2 px-3 py-2">
                <p className="text-[11px] text-muted">Day +30 with your changes</p>
                <p className="flex items-center gap-2 font-mono text-lg">
                  {round(end(projection.scenario), decimals)}
                  {system && <StatusBadge status={system.day30.scenario.status} />}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3"><ProjectionChart projection={projection} measure={system?.system.measure} unit={unit} /></div>
          <div className="mt-2"><ChartLegend /></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ModelCard projection={projection} />
        <Card title="All body systems at day +30" agent="Physiology Agent">
          <ul className="flex flex-col gap-2">
            {twin.systems.map((s) => (
              <li key={s.system.id}>
                <button type="button" onClick={() => setFocusSystem(s.system.id)} className="flex min-h-11 w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-panel2 px-3 py-2 text-left text-sm hover:border-accent">
                  <span className="font-semibold">{s.system.name}</span>
                  <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    If nothing changes <StatusBadge status={s.day30.baseline.status} />
                    <span aria-hidden>·</span>
                    With your changes <StatusBadge status={s.day30.scenario.status} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            Mission radiation dose at day +30: {round(end(twin.radiation.baseline), 1)} mSv if nothing changes, {round(end(twin.radiation.scenario), 1)} mSv with your changes. No status: we have not verified a dose limit from a source yet.
          </p>
        </Card>
      </div>
    </div>
  );
}
