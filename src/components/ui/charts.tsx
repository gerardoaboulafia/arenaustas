// AI-assisted: written with Claude Code, reviewed by the team.
// Charts are drawn as plain SVG: no chart library and no images to license.
import { measureStatus, present, round } from '../../domain';
import type { Measure, Projection, Series, Status } from '../../domain';
import { STATUS_HEX } from './primitives';

export function Sparkline({ values, status, width = 72, height = 24 }: { values: Series; status: Status; width?: number; height?: number }) {
  const xs = present(values);
  if (xs.length < 2) return <svg width={width} height={height} aria-hidden />;
  const min = Math.min(...xs);
  const span = Math.max(...xs) - min || 1;
  const step = (width - 4) / (values.length - 1);
  const points = values
    .map((v, i) => (typeof v === 'number' ? `${round(2 + i * step, 1)},${round(height - 3 - ((v - min) / span) * (height - 6), 1)}` : null))
    .filter(Boolean)
    .join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={points} fill="none" stroke={STATUS_HEX[status]} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const W = 820;
const H = 320;
const M = { l: 54, r: 58, t: 16, b: 34 };
const HISTORY_DAYS = 14;

/** History, the "if nothing changes" line and the "with your changes" line, over the status bands. */
export function ProjectionChart({ projection, measure, unit, compact = false }: {
  projection: Projection; measure?: Measure; unit: string; compact?: boolean;
}) {
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
  const pad = (hi - lo || range) * 0.12;
  lo -= pad;
  hi += pad;
  const x = (i: number) => M.l + (i / steps) * (W - M.l - M.r);
  const y = (v: number) => M.t + ((hi - v) / (hi - lo)) * (H - M.t - M.b);
  const line = (values: number[], offset: number) => values.map((v, i) => `${i ? 'L' : 'M'}${round(x(offset + i), 1)},${round(y(v), 1)}`).join(' ');
  const from = history[today];
  const decimals = hi - lo < 3 ? 2 : hi - lo < 30 ? 1 : 0;

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
  const last = (v: number[]) => v[v.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Simplified projection. Today ${round(from, decimals)} ${unit}. In 30 days: ${round(last(projection.baseline), decimals)} if nothing changes, ${round(last(projection.scenario), decimals)} with your changes.`}
    >
      {bands.map((b) => (
        <g key={b.status}>
          <rect x={M.l} y={y(b.top)} width={W - M.l - M.r} height={y(b.bottom) - y(b.top)} fill={STATUS_HEX[b.status]} opacity="0.07" />
          {!compact && (
            <text x={W - M.r + 8} y={(y(b.top) + y(b.bottom)) / 2 + 4} fontSize="11" fill={STATUS_HEX[b.status]}>{b.status}</text>
          )}
        </g>
      ))}
      {measure && [measure.watch, measure.alert].filter((t) => t > lo && t < hi).map((t, i) => (
        <line key={t} x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} stroke={STATUS_HEX[i ? 'alert' : 'watch']} strokeWidth="1" strokeDasharray="3 5" opacity="0.7" />
      ))}
      {ticks.map((t) => (
        <text key={t} x={M.l - 8} y={y(t) + 4} fontSize="11" textAnchor="end" fill="#9baec0" fontFamily="ui-monospace, Menlo, monospace">{round(t, decimals)}</text>
      ))}
      {xLabels.map(([i, label]) => (
        <text key={label} x={x(i)} y={H - 10} fontSize="11" textAnchor={i === 0 ? 'start' : i === steps ? 'end' : 'middle'} fill="#9baec0">{label}</text>
      ))}
      <line x1={x(today)} x2={x(today)} y1={M.t} y2={H - M.b} stroke="#21374b" strokeWidth="1" />
      <path d={line(history, 0)} fill="none" stroke="#9baec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={line([from, ...projection.baseline], today)} fill="none" stroke="#9baec0" strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round" />
      <path d={line([from, ...projection.scenario], today)} fill="none" stroke="#58d8e8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      {changeAt >= 0 && (
        <circle cx={x(today + changeAt + 1)} cy={y(projection.baseline[changeAt])} r="4.5" fill="#07111f" stroke="#9baec0" strokeWidth="1.6" />
      )}
      <circle cx={x(today)} cy={y(from)} r="4" fill="#ebf6fa" />
      <circle cx={x(steps)} cy={y(last(projection.baseline))} r="3.5" fill="#9baec0" />
      <circle cx={x(steps)} cy={y(last(projection.scenario))} r="4" fill="#58d8e8" />
    </svg>
  );
}

export function ChartLegend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
      <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 bg-muted" />History</span>
      <span className="inline-flex items-center gap-2"><span className="w-5 border-t-2 border-dashed border-muted" />If nothing changes</span>
      <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 bg-accent" />With your changes</span>
      <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full border border-muted" />Status changes here</span>
    </div>
  );
}
