// AI-assisted: written with Claude Code, reviewed by the team.
// The Twin screen. Each of the five agents owns one labelled zone.
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEVERITY, format, hazardById, overallStatus, round, measureStatus, rules, systemTimeline, topEscalation } from '../domain';
import type { ActionDef, IndicatorResult, Status, SystemResult } from '../domain';
import { BandMeter, DeviationBar, Sparkline, StatusStrip } from '../components/ui/charts';
import { TwinFigure } from '../components/ui/TwinFigure';
import {
  AgentTag, BasisTag, Card, ProjectionNote, STATUS_HEX, SourceLink, StatusBadge, StatusIcon, buttonPrimary, buttonSecondary, statusText,
} from '../components/ui/primitives';
import { useMission } from './state';
import { WHAT_IF, snap } from './whatIf';

type View = 'today' | 'baseline' | 'scenario';
const VIEW_LABEL: Record<View, string> = { today: 'Today', baseline: 'Day +30 if nothing changes', scenario: 'Day +30 with your changes' };

function statusIn(view: View, s: SystemResult): Status {
  return view === 'today' ? s.status : view === 'baseline' ? s.day30.baseline.status : s.day30.scenario.status;
}

function SystemCard({ s, view, active, onSelect }: { s: SystemResult; view: View; active: boolean; onSelect: () => void }) {
  const m = s.system.measure;
  const value = view === 'today' ? s.value : view === 'baseline' ? s.day30.baseline.value : s.day30.scenario.value;
  return (
    <button
      type="button" onClick={onSelect} aria-pressed={active}
      className={`inset flex w-full flex-col gap-2.5 p-3.5 text-left transition ${active ? 'glow-accent !border-accent' : 'hover:border-muted'}`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-display text-[15px] font-semibold">{s.system.name}</span>
        <StatusBadge status={statusIn(view, s)} />
      </span>
      <span className="flex items-baseline gap-2">
        <span className="font-mono text-[26px] leading-none">{format(value, m.decimals)}</span>
        <span className="text-[11px] leading-tight text-muted">{m.name}<br />{m.unit}</span>
      </span>
      <BandMeter measure={m} today={s.value} baseline30={s.day30.baseline.value} scenario30={s.day30.scenario.value} />
      <span className="text-[11px] text-muted">
        {s.change ? `Crosses into ${s.change.status} around day +${s.change.day} if nothing changes.` : 'No status change projected in 30 days.'}
      </span>
    </button>
  );
}

function Tile({ result, highlighted }: { result: IndicatorResult; highlighted: boolean }) {
  const { indicator, today, baseline, recent, status, history } = result;
  const delta = baseline !== null && recent !== null ? recent - baseline : null;
  return (
    <div className={`inset flex flex-col gap-2.5 p-3.5 transition ${highlighted ? '!border-accent/80' : ''}`} title={result.reason}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-muted">{indicator.name}</span>
        <StatusBadge status={status} />
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="font-mono text-[28px] leading-none">
          {today === null ? '–' : today}
          <span className="ml-1.5 text-xs text-muted">{indicator.unit}</span>
        </span>
        <span className="w-[46%]"><Sparkline values={history} status={status} baseline={baseline} /></span>
      </div>
      <DeviationBar result={result} />
      <div className="flex items-center justify-between text-[11px] text-muted">
        <span>Baseline <span className="font-mono text-ink">{format(baseline)}</span></span>
        {delta !== null && (
          <span className={status === 'nominal' ? '' : statusText(status)}>
            3-day avg {delta >= 0 ? '+' : '−'}{format(Math.abs(delta), 2)}
          </span>
        )}
      </div>
    </div>
  );
}

/** The learned pattern model: one score for all biometric indicators taken together. */
function PatternCard() {
  const { twin } = useMission();
  const p = twin.pattern;
  const name = (id: string) => twin.indicators.find((r) => r.indicator.id === id)?.indicator.name ?? id;
  return (
    <div className={`inset mb-3 grid grid-cols-1 items-center gap-x-7 gap-y-3 p-3.5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(0,1.25fr)] ${p.status === 'watch' ? '!border-watch/70' : ''}`}>
      <div>
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-display text-[15px] font-semibold">Pattern check</span>
          <span className="rounded-md border border-accent/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-accent">Machine learning</span>
          <StatusBadge status={p.status} />
        </p>
        <p className="mt-1.5 text-[13px] text-muted">{p.reason}</p>
      </div>
      <div>
        <p className="flex items-end gap-2">
          <span className="font-mono text-[28px] leading-none">{p.ratio === null ? '–' : `${format(p.ratio, 2)}×`}</span>
          <span className="text-[11px] leading-tight text-muted">the farthest day<br />of your baseline</span>
        </p>
        <div className="mt-1"><Sparkline values={p.history} status={p.status} baseline={rules.pattern.unusualAt} height={30} /></div>
      </div>
      <ul className="flex flex-col gap-1.5">
        {p.contributors.slice(0, 3).map((c) => (
          <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_64px_minmax(0,90px)] items-center gap-2 text-xs">
            <span className="truncate">{name(c.id)}</span>
            <span className="text-right font-mono text-muted">{c.z < 0 ? '−' : '+'}{format(Math.abs(c.z))} SD</span>
            <span className="h-1.5 rounded-full bg-line/70"><span className="block h-full rounded-full bg-accent" style={{ width: `${Math.round(c.share * 100)}%` }} /></span>
          </li>
        ))}
      </ul>
      <p className="flex flex-wrap items-center gap-2 text-[11px] text-muted lg:col-span-3">
        Learned from {p.trainedOn} of your own baseline days: the mean of six indicators and how they move together. It has only seen simulated data, so it can raise a watch and never an alert.
        <BasisTag basis={rules.pattern.basis} needsReview={rules.pattern.needsReview} />
      </p>
    </div>
  );
}

export function TwinPage() {
  const { twin, crewTwins, crewId, setCrewId, dataset, day, minDay, setDay, scenario, setWhatIf, setFocusSystem } = useMission();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<View>('today');
  const [openAgent, setOpenAgent] = useState(4);
  const hasScenario = Object.keys(scenario).length > 0;
  const shownView: View = view === 'scenario' && !hasScenario ? 'baseline' : view;
  const worst = [...twin.systems].sort((a, b) => SEVERITY[b.status] - SEVERITY[a.status])[0];
  const active = twin.systems.find((s) => s.system.id === selected) ?? worst;
  const statuses = Object.fromEntries(twin.systems.map((s) => [s.system.id, statusIn(shownView, s)]));
  const timeline = useMemo(() => systemTimeline(dataset, crewId, minDay, dataset.lastDay), [dataset, crewId, minDay]);
  const [left, right] = [twin.systems.slice(0, 2), twin.systems.slice(2)];

  const openProjection = (systemId: string) => {
    setFocusSystem(systemId);
    navigate('/app/projection');
  };
  const tryAction = (action: ActionDef) => {
    if (!action.whatIf) return;
    const { input, delta } = action.whatIf;
    setWhatIf(input, snap(input, twin.habits[input] + delta));
    const target = twin.systems.find((s) => s.projection.input === input && s.status !== 'nominal')
      ?? twin.systems.find((s) => s.projection.input === input);
    openProjection(input === 'radiationDose' ? 'radiation' : target?.system.id ?? WHAT_IF[input].system);
  };

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="anim-rise">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">Mission day {day} · {twin.crew.label}</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight">Your twin today</h1>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Crew member">
          {crewTwins.map((t) => {
            const on = t.crew.id === crewId;
            return (
              <button key={t.crew.id} type="button" aria-pressed={on} onClick={() => setCrewId(t.crew.id)}
                className={`inset flex min-h-12 items-center gap-3 px-3.5 py-2 text-left transition ${on ? 'glow-accent !border-accent' : 'hover:border-muted'}`}>
                <span className="grid h-8 w-8 place-items-center rounded-full border border-line bg-panel2 font-display text-sm font-semibold">{t.crew.label.slice(-1)}</span>
                <span className="flex flex-col">
                  <span className="text-[13px] font-semibold leading-tight">{t.crew.label}</span>
                  <span className="mt-1 flex items-center gap-1" aria-label={`Overall: ${overallStatus(t)}`}>
                    {t.systems.map((s) => <span key={s.system.id} className="h-1.5 w-4 rounded-full" style={{ background: STATUS_HEX[s.status] }} />)}
                  </span>
                </span>
                <span className={statusText(overallStatus(t))}><StatusIcon status={overallStatus(t)} size={16} /></span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,390px)]">
        <section className="panel min-w-0 p-5">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-[17px] font-semibold tracking-tight">Digital twin</h2>
              <AgentTag agent="Physiology Agent" />
            </div>
            <div className="inset flex flex-wrap gap-1 p-1" role="group" aria-label="Twin view">
              {(['today', 'baseline', 'scenario'] as View[]).map((v) => (
                <button key={v} type="button" disabled={v === 'scenario' && !hasScenario} aria-pressed={shownView === v} onClick={() => setView(v)}
                  className={`min-h-9 rounded-[10px] px-3 text-xs font-semibold transition disabled:opacity-40 ${shownView === v ? 'bg-accent text-bg' : 'text-muted hover:text-ink'}`}>
                  {VIEW_LABEL[v]}
                </button>
              ))}
            </div>
          </header>

          <div className="mt-4 grid grid-cols-1 items-center gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <div className="order-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:order-1 lg:grid-cols-1">
              {left.map((s) => <SystemCard key={s.system.id} s={s} view={shownView} active={active.system.id === s.system.id} onSelect={() => setSelected(s.system.id)} />)}
            </div>
            <div className="order-1 flex flex-col items-center lg:order-2">
              <TwinFigure statuses={statuses} selected={active.system.id} onSelect={setSelected} projected={shownView !== 'today'} height={520} />
              <p className="mt-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                {shownView === 'today' ? `Day ${day}` : `Day ${day + 30}`}
                {shownView !== 'today' && <ProjectionNote />}
              </p>
            </div>
            <div className="order-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {right.map((s) => <SystemCard key={s.system.id} s={s} view={shownView} active={active.system.id === s.system.id} onSelect={() => setSelected(s.system.id)} />)}
            </div>
          </div>

          <div className="inset mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 p-3.5 text-sm">
            <div className="min-w-0 flex-1 basis-80">
              <p><span className="font-semibold">{active.system.name}.</span> <span className="text-muted">{active.reason}</span></p>
              <p className="mt-1 text-xs text-muted">
                Driven by {active.system.drivers.map((id) => twin.indicators.find((r) => r.indicator.id === id)?.indicator.name.toLowerCase()).join(', ')} ·
                {' '}hazard: {active.system.hazardIds.map((id) => hazardById(id)?.name.toLowerCase()).join(', ')}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <BasisTag basis={active.projection.model.basis} needsReview={active.projection.model.needsReview} />
                <SourceLink sourceId={active.projection.model.sourceId} />
              </div>
            </div>
            <button type="button" className={buttonPrimary} onClick={() => openProjection(active.system.id)}>Open 30-day projection</button>
          </div>
        </section>

        <Card title="What to do" agent="Medical Advisor" className="self-start">
          <p className="text-sm">{twin.summary}</p>
          {twin.advice.length > 0 && (() => {
            const rung = topEscalation(twin.advice);
            const order = ['self', 'crew', 'ground'] as const;
            return (
              <div className="inset mt-3 p-3" title={rules.escalation.note}>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Who to involve now</p>
                <p className="mt-1 text-sm font-semibold">{rules.escalation.labels[rung]}</p>
                <ol className="mt-2 grid grid-cols-3 gap-1.5" aria-label="Escalation ladder">
                  {order.map((step, i) => (
                    <li key={step} className={`rounded-md px-2 py-1.5 text-center text-[11px] font-semibold ${i <= order.indexOf(rung) ? 'bg-accent text-bg' : 'bg-line/60 text-muted'}`}>
                      {rules.escalation.short[step]}
                    </li>
                  ))}
                </ol>
              </div>
            );
          })()}
          <ul className="mt-4 flex flex-col gap-3">
            {twin.advice.map((item) => (
              <li key={item.key} className="inset p-3.5">
                <p className={`flex items-start gap-2 text-sm font-semibold ${statusText(item.status)}`}>
                  <span className="mt-0.5"><StatusIcon status={item.status} /></span>
                  {item.title}
                </p>
                <p className="mt-1 text-[13px] text-muted">{item.explanation}</p>
                <p className="mt-2 text-[12px]">
                  <span className={`rounded-md border px-1.5 py-0.5 font-semibold ${item.escalate === 'self' ? 'border-line text-muted' : 'border-accent text-accent'}`}>{rules.escalation.short[item.escalate]}</span>
                  {item.alertDays > 0 && <span className="ml-2 text-muted">on alert for {item.alertDays} day{item.alertDays === 1 ? '' : 's'}</span>}
                </p>
                {item.actions.map((action) => (
                  <div key={action.text} className="mt-3 border-t border-line pt-3">
                    <p className="text-sm">{action.text}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <BasisTag basis={action.basis} needsReview={action.needsReview} />
                      {action.whatIf && (
                        <button type="button" onClick={() => tryAction(action)} className="min-h-9 rounded-lg border border-accent px-3 text-xs font-semibold text-accent transition hover:bg-accent hover:text-bg">
                          See projected effect →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <p className="mt-3 flex flex-wrap items-center gap-x-2 text-[11px] text-muted">
                  <span className="font-mono uppercase tracking-[0.1em]">{item.agent}</span>
                  <SourceLink sourceId={item.sourceId} className="!text-[11px]" />
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">Guidance is subject to mission protocols. It explains a signal; it is not a diagnosis.</p>
          <Link to="/app/log" className={`${buttonSecondary} mt-4 w-full`}>Log today's readings</Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <Card title="Today's readings" agent="Biometric Agent">
          <PatternCard />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {twin.indicators.filter((r) => r.indicator.agent === 'biometric').map((r) => <Tile key={r.indicator.id} result={r} highlighted={active.system.drivers.includes(r.indicator.id)} />)}
          </div>
        </Card>
        <Card title="Cabin and exposure" agent="Environment Agent">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {twin.indicators.filter((r) => r.indicator.agent === 'environment').map((r) => <Tile key={r.indicator.id} result={r} highlighted={false} />)}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title="How the twin has evolved" agent="Prediction Agent" action={<ProjectionNote />}>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-[128px_minmax(0,16fr)_minmax(0,30fr)] gap-x-3 text-[11px] text-muted">
              <span />
              <span>Recorded, day {minDay} to {dataset.lastDay}</span>
              <span>Projected from day {day}, +1 to +30, if nothing changes</span>
            </div>
            {twin.systems.map((s) => (
              <div key={s.system.id} className="grid grid-cols-[128px_minmax(0,16fr)_minmax(0,30fr)] items-center gap-x-3">
                <span className="truncate text-xs font-semibold">{s.system.name}</span>
                <StatusStrip statuses={timeline.map((t) => t.statuses[s.system.id])} activeIndex={day - minDay} onPick={(i) => setDay(minDay + i)} />
                <StatusStrip statuses={s.projection.baseline.map((v) => measureStatus(s.system.measure, v))} faded />
              </div>
            ))}
            <p className="text-xs text-muted">Select a recorded day to move the twin to it, or press Replay in the top bar.</p>
          </div>
        </Card>

        <Card title="How this was decided">
          <ol className="grid grid-cols-5 gap-1.5">
            {twin.trace.map((entry, i) => (
              <li key={entry.agent} className="relative">
                <button type="button" aria-pressed={openAgent === i} onClick={() => setOpenAgent(i)}
                  className={`inset flex h-full w-full flex-col items-start gap-1.5 p-2.5 text-left transition ${openAgent === i ? 'glow-accent !border-accent' : 'hover:border-muted'}`}>
                  <span className="font-mono text-[10px] text-accent">0{i + 1}</span>
                  <span className="text-[12px] font-semibold leading-tight">{entry.agent}</span>
                </button>
                {i < 4 && <span aria-hidden className="absolute top-1/2 -right-[7px] z-[1] -translate-y-1/2 text-xs text-accent">›</span>}
              </li>
            ))}
          </ol>
          <dl className="inset mt-3 grid grid-cols-[64px_minmax(0,1fr)] gap-x-3 gap-y-2 p-3.5 text-[13px]">
            <dt className="text-muted">Input</dt><dd>{twin.trace[openAgent].input}</dd>
            <dt className="text-muted">Rule</dt><dd>{twin.trace[openAgent].rule}</dd>
            <dt className="text-muted">Result</dt><dd className="font-mono text-[12px] leading-relaxed">{twin.trace[openAgent].output}</dd>
          </dl>
          <p className="mt-3 text-xs text-muted">Sourced rules plus one model learned from your own baseline. Same input, same result: no language model and no network call. Mission radiation dose so far: {round(twin.radiation.history[twin.radiation.history.length - 1], 1)} mSv (simulated).</p>
        </Card>
      </div>
    </div>
  );
}
