// AI-assisted: written with Claude Code, reviewed by the team.
// Gather: type today's readings over the simulated telemetry. Statuses update as you type.
import { useState } from 'react';
import { hazardById, overrideKey } from '../domain';
import type { IndicatorResult } from '../domain';
import { AgentTag, BasisTag, Card, SourceLink, StatusBadge, buttonSecondary } from '../components/ui/primitives';
import { useMission } from './state';

function ReadingsForm() {
  const { twin, crewId, day, overrides, setReading, resetReadings } = useMission();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState(twin.indicators[1].indicator.id);
  const info = twin.indicators.find((r) => r.indicator.id === focused) ?? twin.indicators[0];
  const edited = Object.keys(overrides).length > 0;

  const onType = (result: IndicatorResult, text: string) => {
    const { id, input } = result.indicator;
    setDrafts((d) => ({ ...d, [id]: text }));
    if (text.trim() === '') return setReading(id, null);
    const value = Number(text);
    if (Number.isFinite(value) && value >= input.min && value <= input.max) setReading(id, value);
  };

  const row = (result: IndicatorResult) => {
    const { indicator, today, status } = result;
    const draft = drafts[indicator.id];
    const text = draft ?? (today === null ? '' : String(today));
    const number = Number(text);
    const invalid = text.trim() !== '' && !(Number.isFinite(number) && number >= indicator.input.min && number <= indicator.input.max);
    const typed = overrideKey(crewId, day, indicator.id) in overrides;
    return (
      <div key={indicator.id} className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-xl border px-3 py-2 sm:grid-cols-[minmax(0,1fr)_170px_110px] ${focused === indicator.id ? 'border-accent' : 'border-line'} bg-panel2`}>
        <label htmlFor={`reading-${indicator.id}`} className="text-sm font-semibold">
          {indicator.name}
          <span className="block text-xs font-normal text-muted">{typed ? 'Typed in' : 'Simulated telemetry'}</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            id={`reading-${indicator.id}`} type="number" inputMode="decimal"
            min={indicator.input.min} max={indicator.input.max} step={indicator.input.step}
            value={text} aria-invalid={invalid}
            onFocus={() => setFocused(indicator.id)}
            onChange={(e) => onType(result, e.target.value)}
            className={`min-h-11 w-24 rounded-lg border bg-bg px-3 font-mono text-base ${invalid ? 'border-alert' : 'border-line'}`}
          />
          <span className="text-xs text-muted">{indicator.unit}</span>
        </div>
        <div className="col-span-2 sm:col-span-1 sm:justify-self-end">
          {invalid
            ? <span className="text-xs text-alert">Enter {indicator.input.min} to {indicator.input.max}</span>
            : <StatusBadge status={status} />}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
      <Card>
        {(['biometric', 'environment'] as const).map((agent) => (
          <fieldset key={agent} className="mb-5 last:mb-0">
            <legend className="mb-3"><AgentTag agent={agent === 'biometric' ? 'Biometric Agent' : 'Environment Agent'} /></legend>
            <div className="flex flex-col gap-2">
              {twin.indicators.filter((r) => r.indicator.agent === agent).map(row)}
            </div>
          </fieldset>
        ))}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted">Saved in this browser only. A status compares your last 3 days with your own baseline, so one reading may not change it.</p>
          <button
            type="button" disabled={!edited} className={`${buttonSecondary} disabled:opacity-50`}
            onClick={() => { resetReadings(); setDrafts({}); }}
          >
            Reset to simulated data
          </button>
        </div>
      </Card>

      <Card title={info.indicator.name} className="self-start">
        <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Why it matters</h3>
        <p className="mt-1 text-sm">{info.indicator.whyItMatters}</p>
        <h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted">How to measure</h3>
        <p className="mt-1 text-sm">{info.indicator.howToMeasure}</p>
        <h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Your status</h3>
        <p className="mt-1 text-sm text-muted">{info.reason}</p>
        <h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Spaceflight hazard</h3>
        <ul className="mt-1 flex flex-col gap-2 text-sm">
          {info.indicator.hazardIds.map((id) => {
            const hazard = hazardById(id);
            return hazard ? <li key={id}><span className="font-semibold">{hazard.name}.</span> <span className="text-muted">{hazard.summary}</span></li> : null;
          })}
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <BasisTag basis={info.indicator.basis} needsReview={info.indicator.needsReview} />
          <SourceLink sourceId={info.indicator.sourceId} />
        </div>
        <p className="mt-2 text-xs text-muted">The source gives the context. The threshold itself is our assumption until a reviewer confirms it.</p>
      </Card>
    </div>
  );
}

export function LogPage() {
  const { twin, crewId, day } = useMission();
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Log today's readings</h1>
        <p className="mt-1 text-sm text-muted">
          {twin.crew.label} · mission day {day} · the simulated telemetry stream has filled these in. Type over any value.
        </p>
      </div>
      {/* Remount when the crew member or day changes, so typed drafts never carry over. */}
      <ReadingsForm key={`${crewId}:${day}`} />
    </div>
  );
}
