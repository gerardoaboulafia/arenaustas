// AI-assisted: written with Claude Code, reviewed by the team.
// The Twin screen. Each of the five agents owns one labelled zone.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEVERITY, format, hazardById } from '../domain';
import type { ActionDef, IndicatorResult } from '../domain';
import { Sparkline } from '../components/ui/charts';
import { TwinFigure } from '../components/ui/TwinFigure';
import {
  BasisTag, Card, ProjectionNote, SourceLink, StatusBadge, StatusIcon, buttonPrimary, buttonSecondary, statusText,
} from '../components/ui/primitives';
import { useMission } from './state';
import { WHAT_IF, snap } from './whatIf';

function Tile({ result, highlighted }: { result: IndicatorResult; highlighted: boolean }) {
  const { indicator, today, baseline, status, history } = result;
  return (
    <div className={`flex flex-col gap-2 rounded-xl border bg-panel2 p-3 ${highlighted ? 'border-accent' : 'border-line'}`} title={result.reason}>
      <span className="text-[13px] text-muted">{indicator.name}</span>
      <span className="font-mono text-2xl leading-none">
        {today === null ? '–' : today}
        <span className="ml-1.5 text-xs text-muted">{indicator.unit}</span>
      </span>
      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={status} />
        <Sparkline values={history} status={status} />
      </div>
      <span className="text-[11px] text-muted">Your baseline: {format(baseline)}</span>
    </div>
  );
}

export function TwinPage() {
  const { twin, day, setWhatIf, setFocusSystem } = useMission();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const worst = [...twin.systems].sort((a, b) => SEVERITY[b.status] - SEVERITY[a.status])[0];
  const active = twin.systems.find((s) => s.system.id === selected) ?? worst;
  const biometric = twin.indicators.filter((r) => r.indicator.agent === 'biometric');
  const environment = twin.indicators.filter((r) => r.indicator.agent === 'environment');

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your twin today</h1>
          <p className="mt-1 text-sm text-muted">{twin.crew.label} · mission day {day} · compared with your own baseline</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/app/log" className={buttonSecondary}>Log readings</Link>
          <button type="button" className={buttonPrimary} onClick={() => openProjection(active.system.id)}>Open 30-day projection</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,540px)_minmax(0,1fr)_minmax(0,370px)]">
        <Card title="Body systems" agent="Physiology Agent">
          <TwinFigure systems={twin.systems} selected={active.system.id} onSelect={setSelected} />
          <div className="mt-3 rounded-xl border border-line bg-panel2 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{active.system.name}</span>
              <StatusBadge status={active.status} />
            </div>
            <p className="mt-2 text-muted">{active.reason}</p>
            <p className="mt-2 text-xs text-muted">
              Driven by: {active.system.drivers.map((id) => twin.indicators.find((r) => r.indicator.id === id)?.indicator.name).join(', ')}.
              {' '}Hazard: {active.system.hazardIds.map((id) => hazardById(id)?.name).join(', ')}.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <BasisTag basis={active.projection.model.basis} needsReview={active.projection.model.needsReview} />
              <SourceLink sourceId={active.projection.model.sourceId} />
            </div>
          </div>
        </Card>

        <div className="flex min-w-0 flex-col gap-5">
          <Card title="Today's readings" agent="Biometric Agent">
            <div className="grid grid-cols-2 gap-3">
              {biometric.map((r) => <Tile key={r.indicator.id} result={r} highlighted={active.system.drivers.includes(r.indicator.id)} />)}
            </div>
          </Card>
          <Card title="Cabin and exposure" agent="Environment Agent">
            <div className="grid grid-cols-2 gap-3">
              {environment.map((r) => <Tile key={r.indicator.id} result={r} highlighted={false} />)}
            </div>
          </Card>
        </div>

        <Card title="What to do" agent="Medical Advisor" className="self-start">
          <p className="text-sm">{twin.summary}</p>
          <ul className="mt-4 flex flex-col gap-3">
            {twin.advice.map((item) => (
              <li key={item.key} className="rounded-xl border border-line bg-panel2 p-3">
                <p className={`flex items-start gap-2 text-sm font-semibold ${statusText(item.status)}`}>
                  <span className="mt-0.5"><StatusIcon status={item.status} /></span>
                  {item.title}
                </p>
                <p className="mt-1 text-[13px] text-muted">{item.explanation}</p>
                {item.actions.map((action) => (
                  <div key={action.text} className="mt-3 border-t border-line pt-3">
                    <p className="text-sm">{action.text}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <BasisTag basis={action.basis} needsReview={action.needsReview} />
                      {action.whatIf && (
                        <button type="button" onClick={() => tryAction(action)} className="min-h-9 rounded-lg border border-accent px-3 text-xs font-semibold text-accent hover:bg-accent hover:text-bg">
                          See projected effect
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
          <details className="mt-4 rounded-xl border border-line p-3 text-xs">
            <summary className="font-semibold">How this was decided</summary>
            <ol className="mt-3 flex flex-col gap-3">
              {twin.trace.map((entry) => (
                <li key={entry.agent}>
                  <p className="font-mono uppercase tracking-[0.1em] text-accent">{entry.agent}</p>
                  <p className="text-muted"><span className="text-ink">Input:</span> {entry.input}</p>
                  <p className="text-muted"><span className="text-ink">Rule:</span> {entry.rule}</p>
                  <p className="text-muted"><span className="text-ink">Result:</span> {entry.output}</p>
                </li>
              ))}
            </ol>
          </details>
        </Card>
      </div>

      <Card title="30-day outlook if nothing changes" agent="Prediction Agent" action={<ProjectionNote />}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {twin.systems.map((s) => (
            <button key={s.system.id} type="button" onClick={() => openProjection(s.system.id)} className="flex flex-col gap-2 rounded-xl border border-line bg-panel2 p-3 text-left hover:border-accent">
              <span className="text-sm font-semibold">{s.system.name}</span>
              <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <StatusBadge status={s.status} /> today <span aria-hidden>→</span> <StatusBadge status={s.day30.baseline.status} /> day +30
              </span>
              <span className="text-xs text-muted">
                {s.change ? `Crosses into ${s.change.status} around day +${s.change.day}.` : 'No status change in the next 30 days.'}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
