// AI-assisted: written with Claude Code, reviewed by the team.
// The digital twin: an original 2D figure drawn in SVG, with four clickable body systems.
import type { SystemResult } from '../../domain';
import { STATUS_HEX, StatusIcon, statusText, statusWord } from './primitives';

const SPOTS: Record<string, { cx: number; cy: number; side: 'left' | 'right'; lineTo: number }> = {
  circadian: { cx: 240, cy: 48, side: 'left', lineTo: 226 },
  muscle: { cx: 175, cy: 180, side: 'left', lineTo: 162 },
  cardio: { cx: 248, cy: 142, side: 'right', lineTo: 262 },
  bone: { cx: 263, cy: 380, side: 'right', lineTo: 277 },
};

function Body() {
  const limbs: [number, number, number, number, number][] = [
    [184, 116, 164, 262, 24], [296, 116, 316, 262, 24], [220, 280, 214, 486, 30], [260, 280, 266, 486, 30], [240, 76, 240, 100, 20],
  ];
  const pass = (stroke: string, grow: number) => (
    <g stroke={stroke} strokeLinecap="round" fill={stroke}>
      {limbs.map(([x1, y1, x2, y2, w], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={w + grow} />)}
      <circle cx="240" cy="48" r={30 + grow / 2} stroke="none" />
      <rect x={196 - grow / 2} y={96 - grow / 2} width={88 + grow} height={190 + grow} rx={26 + grow / 2} stroke="none" />
    </g>
  );
  return (<>{pass('#3d5873', 3)}{pass('#102238', 0)}</>);
}

export function TwinFigure({ systems, selected, onSelect }: {
  systems: Pick<SystemResult, 'system' | 'status'>[]; selected?: string | null; onSelect?: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="relative mx-auto h-[520px] w-[480px]">
        <svg viewBox="0 0 480 520" width="480" height="520" className="absolute inset-0" role="img" aria-label="Body figure with four body systems marked">
          <Body />
          {systems.map(({ system, status }) => {
            const spot = SPOTS[system.id];
            if (!spot) return null;
            const color = STATUS_HEX[status];
            return (
              <g key={system.id}>
                <line x1={spot.side === 'left' ? 140 : 340} y1={spot.cy} x2={spot.lineTo} y2={spot.cy} stroke="#5d7791" strokeWidth="1" />
                <circle cx={spot.cx} cy={spot.cy} r="13" fill={color} opacity="0.2" />
                <circle cx={spot.cx} cy={spot.cy} r="6" fill={color} />
                {selected === system.id && <circle cx={spot.cx} cy={spot.cy} r="17" fill="none" stroke="#ebf6fa" strokeWidth="1.5" />}
              </g>
            );
          })}
        </svg>
        {systems.map(({ system, status }) => {
          const spot = SPOTS[system.id];
          if (!spot) return null;
          const active = selected === system.id;
          return (
            <button
              key={system.id}
              type="button"
              onClick={() => onSelect?.(system.id)}
              aria-pressed={active}
              style={{ top: spot.cy - 27, [spot.side]: 0 }}
              className={`absolute flex min-h-[54px] w-[132px] flex-col items-start justify-center gap-1 rounded-xl border px-2.5 py-2 text-left transition-colors ${active ? 'border-ink bg-panel2' : 'border-line bg-panel hover:border-accent'}`}
            >
              <span className="text-[13px] font-semibold leading-tight">{system.name}</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${statusText(status)}`}>
                <StatusIcon status={status} size={13} />
                {statusWord(status)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
