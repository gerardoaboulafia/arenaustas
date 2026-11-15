// AI-assisted: written with Claude Code, reviewed by the team.
// Gather: type today's readings over the simulated telemetry. Statuses update as you type.
import { useRef, useState } from 'react';
import { CSV_HEADER, hazardById, overrideKey } from '../domain';
import type { ImportResult, IndicatorResult } from '../domain';
import { DeviationBar, Sparkline } from '../components/ui/charts';
import { AgentTag, BasisTag, Card, SourceLink, StatusBadge, buttonSecondary } from '../components/ui/primitives';
import { useMission } from './state';

/** Readings leave the tool and come back as CSV. A file with any wrong row changes nothing. */
function DataPanel({ onImported }: { onImported: () => void }) {
  const { day, exportCsv, importCsv } = useMission();
  const input = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<(ImportResult & { name: string }) | null>(null);

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportCsv()], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `astra-readings-day-${day}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const imported = importCsv(await file.text());
    setResult({ ...imported, name: file.name });
    if (imported.overrides) onImported();
    if (input.current) input.current.value = '';
  };

  return (
    <Card title="Export and import">
      <p className="text-sm text-muted">Take the readings out as a CSV file, for example to send to the ground, and bring corrected readings back in. Every row is checked first.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={buttonSecondary} onClick={download}>Export readings (CSV)</button>
        <button type="button" className={buttonSecondary} onClick={() => input.current?.click()}>Import readings (CSV)</button>
        <input ref={input} type="file" accept=".csv,text/csv" className="sr-only" aria-label="CSV file to import" onChange={(e) => void onFile(e.target.files?.[0])} />
      </div>
      <p className="mt-3 text-xs text-muted">
        The export holds every crew member up to mission day {day}, never later days. Format: <code className="font-mono text-ink">{CSV_HEADER}</code>. An empty value means no reading.
      </p>
      {result && (
        <div role="status" className={`inset mt-3 p-3 text-sm ${result.overrides ? '' : '!border-alert/70'}`}>
          {result.overrides ? (
            <p><span className="font-semibold">{result.name} imported.</span> <span className="text-muted">{result.rows} rows read, {result.changed} different from the simulated readings.</span></p>
          ) : (
            <>
              <p className="font-semibold text-alert">{result.name} was not imported. Nothing changed.</p>
              <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-xs text-muted">
                {result.errors.slice(0, 6).map((error) => <li key={error}>{error}</li>)}
                {result.errors.length > 6 && <li>and {result.errors.length - 6} more.</li>}
              </ul>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

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
      <div key={indicator.id} className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-xl border px-3 py-2 sm:grid-cols-[minmax(0,1fr)_170px_110px] lg:grid-cols-[minmax(0,1fr)_minmax(0,150px)_170px_110px] ${focused === indicator.id ? 'glow-accent border-accent' : 'border-line'} bg-bg/50`}>
        <label htmlFor={`reading-${indicator.id}`} className="text-sm font-semibold">
          {indicator.name}
          <span className="block text-xs font-normal text-muted">{typed ? 'Typed in' : 'Simulated telemetry'}</span>
        </label>
        <div className="hidden flex-col gap-1.5 lg:flex">
          <Sparkline values={result.history} status={status} baseline={result.baseline} height={26} />
          <DeviationBar result={result} />
        </div>
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

      <div className="flex min-w-0 flex-col gap-5 self-start">
      <Card title={info.indicator.name}>
        <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Why it matters</h3>
        <p className="mt-1 text-sm">{info.indicator.whyItMatters}</p>
        <h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted">How to measure</h3>
        <p className="mt-1 text-sm">{info.indicator.howToMeasure}</p>
        <h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Your status</h3>
        <p className="mt-1 text-sm text-muted">{info.reason}</p>
        {info.indicator.limit && (
          <>
            <h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Limit</h3>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <span><span className="font-mono">{info.indicator.limit.alert} {info.indicator.unit}</span>, {info.indicator.limit.label}</span>
              <BasisTag basis={info.indicator.limit.basis} />
            </p>
            <p className="mt-1 text-xs text-muted">{info.indicator.limit.note}</p>
          </>
        )}
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
        <p className="mt-2 text-xs text-muted">The source gives the context{info.indicator.limit ? ' and the limit' : ''}. The threshold against your own baseline is our assumption; no clinician has reviewed it.</p>
      </Card>
      <DataPanel onImported={() => setDrafts({})} />
      </div>
    </div>
  );
}

export function LogPage() {
  const { twin, crewId, day } = useMission();
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="anim-rise">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">{twin.crew.label} · mission day {day}</p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight">Log today's readings</h1>
        <p className="mt-1 text-sm text-muted">The simulated telemetry stream has filled these in. Type over any value and the twin updates.</p>
      </div>
      {/* Remount when the crew member or day changes, so typed drafts never carry over. */}
      <ReadingsForm key={`${crewId}:${day}`} />
    </div>
  );
}
