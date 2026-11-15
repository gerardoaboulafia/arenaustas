// AI-assisted: written with Claude Code, reviewed by the team.
// The crew on one screen, for the crew medical officer: who needs attention, and one indicator
// compared across everyone. The crew-wide view comes from the team's `astra` branch; here each
// line can also be drawn as the change from that person's own baseline.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEVERITY, format, indicators, mean, overallStatus, round, rules, topEscalation } from '../domain';
import type { Status, Twin } from '../domain';
import { Card, StatusBadge, StatusIcon, buttonSecondary, statusText, statusWord } from '../components/ui/primitives';
import { CREW_STYLE, initials } from './crew';
import { useMission } from './state';

type Mode = 'value' | 'change';

const W = 920;
const H = 300;
const PAD = { left: 52, right: 56, top: 16, bottom: 30 };

function Compare({ twins }: { twins: Twin[] }) {
  const { dataset, day } = useMission();
  const [indicatorId, setIndicatorId] = useState('sleepHours');
  const [mode, setMode] = useState<Mode>('change');
  const [hidden, setHidden] = useState<string[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const indicator = indicators.find((n) => n.id === indicatorId) ?? indicators[0];
  const count = day - dataset.firstDay + 1;
  const decimals = indicator.input.step < 1 ? 2 : 1;

  // Only days up to the current mission day: the chart never shows the future.
  const series = useMemo(() => twins.map((twin, i) => {
    const raw = (twin.crew.readings[indicator.id] ?? []).slice(0, count);
    const baseline = mean(raw.slice(0, rules.baselineDays));
    const values = raw.map((v) => (v === null || v === undefined ? null : mode === 'value' ? v : baseline === null ? null : v - baseline));
    return { twin, i, raw, baseline, values };
  }), [twins, indicator.id, count, mode]);

  const shown = series.filter((s) => !hidden.includes(s.twin.crew.id));
  const all = shown.flatMap((s) => s.values.filter((v): v is number => v !== null));
  if (mode === 'change') all.push(0);
  const lo = all.length ? Math.min(...all) : 0;
  const hi = all.length ? Math.max(...all) : 1;
  const span = hi - lo || 1;
  const yMin = lo - span * 0.12;
  const yMax = hi + span * 0.12;
  const x = (i: number) => PAD.left + (count <= 1 ? 0 : (i / (count - 1)) * (W - PAD.left - PAD.right));
  const y = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);
  const path = (values: (number | null)[]) => {
    let d = '';
    let pen = false;
    values.forEach((v, i) => {
      if (v === null) { pen = false; return; }
      d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)} `;
      pen = true;
    });
    return d;
  };
  const ticks = [yMin + (yMax - yMin) * 0.1, (yMin + yMax) / 2, yMax - (yMax - yMin) * 0.1];
  const signed = (v: number) => `${mode === 'change' && v > 0 ? '+' : ''}${round(v, decimals)}`;
  const toggle = (id: string) => setHidden((h) => (h.includes(id) ? h.filter((v) => v !== id) : [...h, id]));
  const tableDays = Array.from({ length: Math.min(7, count) }, (_, k) => count - Math.min(7, count) + k);

  return (
    <Card title="Compare one indicator across the crew" agent={indicator.agent === 'biometric' ? 'Biometric Agent' : 'Environment Agent'}>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Indicator
          <select value={indicator.id} onChange={(e) => setIndicatorId(e.target.value)} className="min-h-11 rounded-lg border border-line bg-panel2 px-3 text-sm font-semibold text-ink">
            {indicators.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </label>
        <div className="flex flex-col gap-1 text-xs text-muted">
          Show
          <div className="inset flex gap-1 p-1" role="group" aria-label="Show">
            {([['change', 'Change from own baseline'], ['value', 'Values']] as const).map(([id, label]) => (
              <button key={id} type="button" aria-pressed={mode === id} onClick={() => setMode(id)}
                className={`min-h-9 rounded-lg px-3 text-xs font-semibold transition ${mode === id ? 'bg-accent text-bg' : 'text-muted hover:text-ink'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Crew members shown">
          {series.map((s) => {
            const on = !hidden.includes(s.twin.crew.id);
            return (
              <button key={s.twin.crew.id} type="button" aria-pressed={on} onClick={() => toggle(s.twin.crew.id)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${on ? 'border-line text-ink' : 'border-line/50 text-muted opacity-60'}`}>
                <svg width="26" height="8" aria-hidden><line x1="0" y1="4" x2="26" y2="4" stroke={CREW_STYLE[s.i].color} strokeWidth="2.5" strokeDasharray={CREW_STYLE[s.i].dash} /></svg>
                {s.twin.crew.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mt-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
          aria-label={`${indicator.name} for each crew member, mission day ${dataset.firstDay} to ${day}. The table below gives the exact values.`}
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            const px = ((e.clientX - box.left) / box.width) * W;
            const i = Math.round(((px - PAD.left) / (W - PAD.left - PAD.right)) * (count - 1));
            setHover(Math.min(count - 1, Math.max(0, i)));
          }}>
          <rect x={x(0)} y={PAD.top} width={Math.max(0, x(Math.min(rules.baselineDays, count) - 1) - x(0))} height={H - PAD.top - PAD.bottom} fill="#58d8e8" fillOpacity="0.045" />
          <text x={x(0) + 6} y={PAD.top + 14} className="fill-muted font-mono text-[10px] uppercase tracking-[0.12em]">Baseline days</text>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#1e3449" />
              <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="fill-muted font-mono text-[11px]">{signed(t)}</text>
            </g>
          ))}
          {mode === 'change' && <line x1={PAD.left} x2={W - PAD.right} y1={y(0)} y2={y(0)} stroke="#9baec0" strokeDasharray="3 5" />}
          {[0, Math.floor((count - 1) / 2), count - 1].filter((v, k, a) => a.indexOf(v) === k).map((i) => (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-muted font-mono text-[11px]">Day {dataset.firstDay + i}</text>
          ))}
          {shown.map((s) => {
            const lastIndex = s.values.reduce<number>((acc, v, i) => (v === null ? acc : i), -1);
            return (
              <g key={s.twin.crew.id}>
                <path d={path(s.values)} fill="none" stroke={CREW_STYLE[s.i].color} strokeWidth="2.2" strokeDasharray={CREW_STYLE[s.i].dash} strokeLinejoin="round" strokeLinecap="round" />
                {lastIndex >= 0 && (
                  <text x={x(lastIndex) + 8} y={y(s.values[lastIndex] as number) + 4} fill={CREW_STYLE[s.i].color} className="font-mono text-[11px] font-semibold">{initials(s.twin.crew.label)}</text>
                )}
                {hover !== null && s.values[hover] !== null && <circle cx={x(hover)} cy={y(s.values[hover] as number)} r="4" fill={CREW_STYLE[s.i].color} stroke="#050c17" strokeWidth="1.5" />}
              </g>
            );
          })}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={H - PAD.bottom} stroke="#9baec0" strokeOpacity="0.5" />}
        </svg>
        {hover !== null && (
          <div className="inset pointer-events-none absolute top-2 z-10 px-3 py-2 text-xs shadow-lg" style={hover > count / 2 ? { left: 60 } : { right: 60 }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">Mission day {dataset.firstDay + hover}</p>
            {shown.map((s) => (
              <p key={s.twin.crew.id} className="mt-1 flex items-center justify-between gap-4">
                <span style={{ color: CREW_STYLE[s.i].color }}>{s.twin.crew.label}</span>
                <span className="font-mono">{s.values[hover] === null ? 'no reading' : `${signed(s.values[hover] as number)} ${indicator.unit}`}</span>
              </p>
            ))}
          </div>
        )}
      </div>
      <p className="mt-1 text-xs text-muted">
        {mode === 'change'
          ? `Each line is that person's reading minus their own baseline, the mean of their first ${rules.baselineDays} days, in ${indicator.unit}. Two people with different normal values can be compared.`
          : `Each line is the reading as recorded, in ${indicator.unit}.`}
        {' '}A gap is a day with no reading.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-0 text-sm">
          <caption className="pb-2 text-left font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Exact values, last {tableDays.length} days · {indicator.unit}</caption>
          <thead>
            <tr>
              <th scope="col" className="border-b border-line py-2 pr-3 text-left text-xs font-medium text-muted">Crew member</th>
              <th scope="col" className="border-b border-line px-2 py-2 text-right text-xs font-medium text-muted">Baseline</th>
              {tableDays.map((i) => <th key={i} scope="col" className="border-b border-line px-2 py-2 text-right font-mono text-xs font-medium text-muted">D{dataset.firstDay + i}</th>)}
            </tr>
          </thead>
          <tbody>
            {series.map((s) => (
              <tr key={s.twin.crew.id} className={hidden.includes(s.twin.crew.id) ? 'opacity-50' : ''}>
                <th scope="row" className="border-b border-line/60 py-2 pr-3 text-left font-semibold" style={{ color: CREW_STYLE[s.i].color }}>{s.twin.crew.label}</th>
                <td className="border-b border-line/60 px-2 py-2 text-right font-mono text-muted">{format(s.baseline, decimals)}</td>
                {tableDays.map((i) => <td key={i} className="border-b border-line/60 px-2 py-2 text-right font-mono">{s.raw[i] === null || s.raw[i] === undefined ? '–' : round(s.raw[i] as number, decimals)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const worstFirst = (a: Twin, b: Twin) => SEVERITY[overallStatus(b)] - SEVERITY[overallStatus(a)];

function Cell({ status, note }: { status: Status; note?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap ${statusText(status)}`}>
      <StatusIcon status={status} />
      {statusWord(status)}
      {note && <span className="font-normal text-muted">{note}</span>}
    </span>
  );
}

export function CrewPage() {
  const { crewTwins, day, setCrewId } = useMission();
  const navigate = useNavigate();
  const ordered = [...crewTwins].sort(worstFirst);
  const attention = crewTwins.filter((t) => overallStatus(t) !== 'nominal').length;
  const systemNames = crewTwins[0].systems.map((s) => s.system.name);
  const open = (id: string) => { setCrewId(id); navigate('/app'); };

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="anim-rise">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">Mission day {day} · for the crew medical officer</p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight">The crew today</h1>
        <p className="mt-1 text-sm text-muted">
          {attention === 0 ? 'Everyone is nominal.' : `${attention} of ${crewTwins.length} crew members need attention.`} Each status compares a person with their own baseline, not with the others.
        </p>
      </div>

      <Card title="Who needs attention" agent="Medical Advisor">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th scope="col" className="border-b border-line py-2 pr-3 font-medium">Crew member</th>
                <th scope="col" className="border-b border-line px-2 py-2 font-medium">Overall</th>
                {systemNames.map((name) => <th key={name} scope="col" className="border-b border-line px-2 py-2 font-medium">{name}</th>)}
                <th scope="col" className="border-b border-line px-2 py-2 font-medium">Pattern check</th>
                <th scope="col" className="border-b border-line px-2 py-2 font-medium">Who to involve</th>
                <th scope="col" className="border-b border-line py-2 pl-2 font-medium"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {ordered.map((twin) => {
                const i = crewTwins.indexOf(twin);
                const overall = overallStatus(twin);
                const reasons = twin.indicators
                  .filter((r) => r.status === 'watch' || r.status === 'alert')
                  .map((r) => r.indicator.name.charAt(0).toLowerCase() + r.indicator.name.slice(1));
                if (reasons.length === 0 && twin.pattern.status === 'watch') reasons.push('readings unusual together');
                return (
                  <tr key={twin.crew.id}>
                    <th scope="row" className="border-b border-line/60 py-3 pr-3 text-left">
                      <span className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-panel2 font-display text-xs font-semibold" style={{ borderColor: CREW_STYLE[i].color, color: CREW_STYLE[i].color }}>{initials(twin.crew.label)}</span>
                        <span>
                          <span className="block font-semibold">{twin.crew.label}</span>
                          <span className="block text-xs font-normal text-muted">{twin.crew.role}</span>
                        </span>
                      </span>
                    </th>
                    <td className="border-b border-line/60 px-2 py-3">
                      <StatusBadge status={overall} />
                      {reasons.length > 0 && <span className="mt-1 block max-w-[200px] text-xs text-muted">{reasons.join(', ')}</span>}
                    </td>
                    {twin.systems.map((s) => (
                      <td key={s.system.id} className="border-b border-line/60 px-2 py-3">
                        <Cell status={s.status} />
                        {s.change && <span className="mt-1 block text-xs text-muted">{statusWord(s.change.status).toLowerCase()} projected in {s.change.day} d</span>}
                      </td>
                    ))}
                    <td className="border-b border-line/60 px-2 py-3"><Cell status={twin.pattern.status} note={twin.pattern.ratio === null ? undefined : `${round(twin.pattern.ratio, 2)}×`} /></td>
                    <td className="border-b border-line/60 px-2 py-3 text-xs">{twin.advice.length === 0 ? <span className="text-muted">No one</span> : <span className="font-semibold">{rules.escalation.short[topEscalation(twin.advice)]}</span>}</td>
                    <td className="border-b border-line/60 py-3 pl-2 text-right">
                      <button type="button" className={`${buttonSecondary} !min-h-9 !px-3 !text-xs`} onClick={() => open(twin.crew.id)}>Open twin</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">Body-system notes are a simplified projection, not a prediction. "Who to involve" follows the escalation rule; in this view "You" means the crew member.</p>
      </Card>

      <Compare twins={crewTwins} />
    </div>
  );
}
