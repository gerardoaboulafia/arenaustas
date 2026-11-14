// AI-assisted: written with Claude Code, reviewed by the team.
// Charts are drawn as plain SVG: no chart library and no images to license.
import { useState } from 'react';
import type { MouseEvent } from 'react';
import { measureStatus, present, round } from '../../domain';
import type { IndicatorResult, Measure, Projection, Series, Status } from '../../domain';
import { STATUS_HEX } from './primitives';

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** 14-day trend with the astronaut's own baseline as a dashed line. */
export function Sparkline({ values, status, baseline, width = 120, height = 36 }: {
  values: Series; status: Status; baseline?: number | null; width?: number; height?: number;
}) {
  const xs = present(values);
  if (xs.length < 2) return <svg width={width} height={height} aria-hidden />;
  const all = typeof baseline === 'number' ? [...xs, baseline] : xs;
  const min = Math.min(...all);
  const span = Math.max(...all) - min || 1;
  const step = (width - 8) / (values.length - 1);
  const py = (v: number) => round(height - 4 - ((v - min) / span) * (height - 8), 1);
  const pts = values.map((v, i) => (typeof v === 'number' ? [round(4 + i * step, 1), py(v)] : null)).filter((p): p is number[] => p !== null);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  const color = STATUS_HEX[status];
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden>
      <path d={`${line} L${lx},${height} L${pts[0][0]},${height} Z`} fill={color} opacity="0.1" />
      {typeof baseline === 'number' && <line x1="0" x2={width} y1={py(baseline)} y2={py(baseline)} stroke="#9baec0" strokeWidth="1" strokeDasharray="2 4" opacity="0.7" vectorEffect="non-scaling-stroke" />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r="2.6" fill={color} />
    </svg>
  );
}

/** Where the last 3 days sit against the astronaut's baseline and the watch and alert lines. */
export function DeviationBar({ result }: { result: IndicatorResult }) {
  const { baseline, recent, watchAt, alertAt, status, indicator } = result;
  if (baseline === null || recent === null || watchAt === null || alertAt === null) {
    return <div className="h-2 rounded-full bg-line/60" aria-hidden />;
  }
  const range = Math.abs(alertAt - baseline) * 1.45 || 1;
  const pos = (v: number) => 50 + clamp((v - baseline) / range, -1, 1) * 50;
  const sides = indicator.rule.direction === 'both' ? [1, -1] : [1];
  const w = Math.abs(pos(watchAt) - 50);
  const al = Math.abs(pos(alertAt) - 50);
  const sign = watchAt >= baseline ? 1 : -1;
  return (
    <div className="relative h-2 rounded-full bg-line/70" aria-hidden>
      {sides.map((side) => {
        const dir = sign * side;
        return (
          <span key={side}>
            <span className="absolute inset-y-0 bg-watch/45" style={dir > 0 ? { left: `${50 + w}%`, width: `${al - w}%` } : { left: `${50 - al}%`, width: `${al - w}%` }} />
            <span className="absolute inset-y-0 bg-alert/55" style={dir > 0 ? { left: `${50 + al}%`, right: 0, borderRadius: '0 999px 999px 0' } : { left: 0, width: `${50 - al}%`, borderRadius: '999px 0 0 999px' }} />
          </span>
        );
      })}
      <span className="absolute -inset-y-1 w-px bg-muted" style={{ left: '50%' }} />
      <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg transition-[left] duration-500" style={{ left: `${pos(recent)}%`, background: STATUS_HEX[status] }} />
    </div>
  );
}

/** A body-system measure on its bands: today, day +30 if nothing changes, day +30 with the changes. */
export function BandMeter({ measure, today, baseline30, scenario30 }: {
  measure: Measure; today: number; baseline30?: number; scenario30?: number;
}) {
  const lower = measure.direction === 'lower';
  const gap = Math.abs(measure.watch - measure.alert);
  const lo = lower ? measure.alert - gap : 0;
  const hiRaw = lower ? measure.watch + gap * 1.5 : measure.alert * 2;
  const hi = lower && measure.unit.includes('%') ? Math.min(100, hiRaw) : hiRaw;
  const pos = (v: number) => clamp(((v - lo) / (hi - lo)) * 100, 0, 100);
  const a = pos(Math.min(measure.watch, measure.alert));
  const b = pos(Math.max(measure.watch, measure.alert));
  const zones: [Status, number, number][] = lower ? [['alert', 0, a], ['watch', a, b], ['nominal', b, 100]] : [['nominal', 0, a], ['watch', a, b], ['alert', b, 100]];
  return (
    <div aria-hidden>
      <div className="relative h-2.5 overflow-visible rounded-full">
        {zones.map(([status, from, to]) => (
          <span key={status} className="absolute inset-y-0 first:rounded-l-full last:rounded-r-full" style={{ left: `${from}%`, width: `${to - from}%`, background: STATUS_HEX[status], opacity: 0.3 }} />
        ))}
        {baseline30 !== undefined && (
          <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-muted bg-bg transition-[left] duration-500" style={{ left: `${pos(baseline30)}%` }} />
        )}
        {scenario30 !== undefined && Math.abs(scenario30 - (baseline30 ?? scenario30)) > 1e-9 && (
          <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-bg transition-[left] duration-500" style={{ left: `${pos(scenario30)}%` }} />
        )}
        <span className="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink shadow-[0_0_10px_rgba(235,246,250,0.8)] transition-[left] duration-500" style={{ left: `${pos(today)}%` }} />
      </div>
    </div>
  );
}

/** One cell per day, colored by status. */
export function StatusStrip({ statuses, activeIndex, onPick, faded = false }: {
  statuses: Status[]; activeIndex?: number; onPick?: (index: number) => void; faded?: boolean;
}) {
  return (
    <div className="flex h-5 gap-[2px]">
      {statuses.map((s, i) => {
        const cell = `h-full flex-1 rounded-[3px] ${i === activeIndex ? 'outline outline-2 outline-offset-1 outline-ink' : ''}`;
        const style = { background: STATUS_HEX[s], opacity: faded ? 0.6 : 0.95 };
        return onPick
          ? <button key={i} type="button" onClick={() => onPick(i)} className={cell} style={style} aria-label={`Day ${i + 1}: ${s}`} />
          : <span key={i} className={cell} style={style} />;
      })}
    </div>
  );
}

const W = 820;
const H = 330;
const M = { l: 54, r: 60, t: 18, b: 34 };
const HISTORY_DAYS = 14;

/** History, the "if nothing changes" line and the "with your changes" line, over the status bands. */
export function ProjectionChart({ projection, measure, unit, compact = false }: {
  projection: Projection; measure?: Measure; unit: string; compact?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const history = projection.history.slice(-HISTORY_DAYS);
  const today = history.length - 1;
  const steps = today + projection.baseline.length;
  const data = [...history, ...projection.baseline, ...projection.scenario];
  let lo = Math.min(...data);
  let hi = Math.max(...data);
  const range = hi - lo || Math.abs(hi) * 0.02 || 1;
  // Bring a threshold into view when it is close to the data.
  for (const t of measure ? [measure.watch, measure.alert] : []) {
    if (t < lo && lo - t <= range * 2) lo = t;
    if (t > hi && t - hi <= range * 2) hi = t;
  }
  const pad = (hi - lo || range) * 0.14;
  lo -= pad;
  hi += pad;
  const x = (i: number) => M.l + (i / steps) * (W - M.l - M.r);
  const y = (v: number) => M.t + ((hi - v) / (hi - lo)) * (H - M.t - M.b);
  const line = (values: number[], offset: number) => values.map((v, i) => `${i ? 'L' : 'M'}${round(x(offset + i), 1)},${round(y(v), 1)}`).join(' ');
  const from = history[today];
  const decimals = hi - lo < 3 ? 2 : hi - lo < 30 ? 1 : 0;
  const last = (v: number[]) => v[v.length - 1];
  const differs = Math.abs(last(projection.baseline) - last(projection.scenario)) > 1e-9;

  const bands: { status: Status; top: number; bottom: number }[] = [];
  if (measure) {
    const [a, b] = measure.direction === 'lower' ? [measure.alert, measure.watch] : [measure.watch, measure.alert];
    const order: Status[] = measure.direction === 'lower' ? ['alert', 'watch', 'nominal'] : ['nominal', 'watch', 'alert'];
    [[lo, a], [a, b], [b, hi]].forEach(([from0, to0], i) => {
      const bottom = Math.max(lo, from0);
      const top = Math.min(hi, to0);
      if (top > bottom) bands.push({ status: order[i], top, bottom });
    });
  }
  const todayStatus = measure ? measureStatus(measure, from) : null;
  const changeAt = measure ? projection.baseline.findIndex((v) => measureStatus(measure, v) !== todayStatus) : -1;
  const ticks = [0, 1, 2, 3].map((i) => lo + pad + ((hi - lo - 2 * pad) * i) / 3);
  const xLabels: [number, string][] = [[0, `−${today} d`], [today, 'Today'], [today + 10, '+10'], [today + 20, '+20'], [today + 30, '+30 days']];
  const scenarioArea = `${line([from, ...projection.scenario], today)} L${x(steps)},${H - M.b} L${x(today)},${H - M.b} Z`;

  const onMove = (e: MouseEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    setHover(clamp(Math.round(((px - M.l) / (W - M.l - M.r)) * steps), 0, steps));
  };
  const hv = hover === null ? null : hover <= today
    ? { label: hover === today ? 'Today' : `${today - hover} days ago`, rows: [['Recorded', history[hover], '#ebf6fa']] as [string, number, string][] }
    : { label: `Day +${hover - today}`, rows: [['If nothing changes', projection.baseline[hover - today - 1], '#9baec0'], ['With your changes', projection.scenario[hover - today - 1], '#58d8e8']] as [string, number, string][] };
  const tipW = 196;
  const tipX = hover === null ? 0 : clamp(x(hover) + 12, M.l, W - M.r - tipW);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none select-none" role="img"
      onMouseMove={compact ? undefined : onMove} onMouseLeave={() => setHover(null)}
      aria-label={`Simplified projection. Today ${round(from, decimals)} ${unit}. In 30 days: ${round(last(projection.baseline), decimals)} if nothing changes, ${round(last(projection.scenario), decimals)} with your changes.`}
    >
      {bands.map((b) => (
        <g key={b.status}>
          <rect x={M.l} y={y(b.top)} width={W - M.l - M.r} height={y(b.bottom) - y(b.top)} fill={STATUS_HEX[b.status]} opacity="0.075" />
          <text x={W - M.r + 8} y={(y(b.top) + y(b.bottom)) / 2 + 4} fontSize="11" fill={STATUS_HEX[b.status]} fontFamily="var(--font-mono)">{b.status}</text>
        </g>
      ))}
      {measure && [measure.watch, measure.alert].filter((t) => t > lo && t < hi).map((t, i) => (
        <line key={t} x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} stroke={STATUS_HEX[i ? 'alert' : 'watch']} strokeWidth="1" strokeDasharray="3 5" opacity="0.75" />
      ))}
      {ticks.map((t) => (
        <text key={t} x={M.l - 8} y={y(t) + 4} fontSize="11" textAnchor="end" fill="#9baec0" fontFamily="var(--font-mono)">{round(t, decimals)}</text>
      ))}
      {xLabels.map(([i, label]) => (
        <text key={label} x={x(i)} y={H - 10} fontSize="11" textAnchor={i === 0 ? 'start' : i === steps ? 'end' : 'middle'} fill="#9baec0">{label}</text>
      ))}
      <rect x={M.l} y={M.t} width={x(today) - M.l} height={H - M.t - M.b} fill="#050c17" opacity="0.28" />
      <line x1={x(today)} x2={x(today)} y1={M.t} y2={H - M.b} stroke="#3d5873" strokeWidth="1" />
      {differs && <path d={scenarioArea} fill="#58d8e8" opacity="0.06" />}
      <path d={line(history, 0)} fill="none" stroke="#c7d6e2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={line([from, ...projection.baseline], today)} fill="none" stroke="#9baec0" strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round" />
      <path d={line([from, ...projection.scenario], today)} fill="none" stroke="#58d8e8" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px rgba(88,216,232,0.55))' }} />
      {changeAt >= 0 && (
        <circle cx={x(today + changeAt + 1)} cy={y(projection.baseline[changeAt])} r="5" fill="#050c17" stroke="#9baec0" strokeWidth="1.8" />
      )}
      <circle cx={x(today)} cy={y(from)} r="4.5" fill="#ebf6fa" />
      <circle cx={x(steps)} cy={y(last(projection.baseline))} r="3.5" fill="#9baec0" />
      <circle cx={x(steps)} cy={y(last(projection.scenario))} r="4.5" fill="#58d8e8" />
      {hv && hover !== null && (
        <g pointerEvents="none">
          <line x1={x(hover)} x2={x(hover)} y1={M.t} y2={H - M.b} stroke="#ebf6fa" strokeWidth="1" opacity="0.5" />
          {hv.rows.map(([name, v, c]) => <circle key={name} cx={x(hover)} cy={y(v)} r="4" fill={c} stroke="#050c17" strokeWidth="1.5" />)}
          <rect x={tipX} y={M.t + 6} width={tipW} height={26 + hv.rows.length * 18} rx="8" fill="#050c17" stroke="#1e3449" opacity="0.96" />
          <text x={tipX + 12} y={M.t + 24} fontSize="11" fill="#9baec0">{hv.label}</text>
          {hv.rows.map(([name, v, c], i) => (
            <g key={name}>
              <circle cx={tipX + 15} cy={M.t + 38 + i * 18} r="3.5" fill={c} />
              <text x={tipX + 25} y={M.t + 42 + i * 18} fontSize="11.5" fill="#ebf6fa">{name}</text>
              <text x={tipX + tipW - 12} y={M.t + 42 + i * 18} fontSize="11.5" fill="#ebf6fa" textAnchor="end" fontFamily="var(--font-mono)">{round(v, decimals)}</text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

/** Small version of the projection for side-by-side comparison of every system. */
export function MiniProjection({ projection, measure }: { projection: Projection; measure?: Measure }) {
  const w = 220;
  const h = 64;
  const from = projection.history[projection.history.length - 1];
  const data = [from, ...projection.baseline, ...projection.scenario];
  let lo = Math.min(...data);
  let hi = Math.max(...data);
  const pad = (hi - lo || Math.abs(hi) * 0.01 || 1) * 0.2;
  lo -= pad;
  hi += pad;
  const n = projection.baseline.length;
  const px = (i: number) => round(3 + (i / n) * (w - 6), 1);
  const py = (v: number) => round(3 + ((hi - v) / (hi - lo)) * (h - 6), 1);
  const path = (values: number[]) => [from, ...values].map((v, i) => `${i ? 'L' : 'M'}${px(i)},${py(v)}`).join(' ');
  const lines = measure ? [measure.watch, measure.alert].map((t, i) => ({ t, c: STATUS_HEX[i ? 'alert' : 'watch'] })).filter(({ t }) => t > lo && t < hi) : [];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full" preserveAspectRatio="none" aria-hidden>
      {lines.map(({ t, c }) => <line key={t} x1="0" x2={w} y1={py(t)} y2={py(t)} stroke={c} strokeDasharray="3 5" opacity="0.7" vectorEffect="non-scaling-stroke" />)}
      <path d={path(projection.baseline)} fill="none" stroke="#9baec0" strokeWidth="1.6" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
      <path d={path(projection.scenario)} fill="none" stroke="#58d8e8" strokeWidth="2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function ChartLegend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
      <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 bg-[#c7d6e2]" />Recorded</span>
      <span className="inline-flex items-center gap-2"><span className="w-5 border-t-2 border-dashed border-muted" />If nothing changes</span>
      <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 bg-accent" />With your changes</span>
      <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full border-2 border-muted" />Status changes here</span>
    </div>
  );
}
