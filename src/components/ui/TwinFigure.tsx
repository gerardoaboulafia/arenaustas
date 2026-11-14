// AI-assisted: written with Claude Code, reviewed by the team.
// The digital twin: an original 2D figure drawn in SVG by this code (no image files).
// Four layers, one per body system, each colored by its status: skeleton (bone),
// muscle groups (muscle), heart and vessels (cardiovascular), day-night ring (circadian).
import { useId } from 'react';
import type { ReactNode } from 'react';
import type { Status } from '../../domain';
import { STATUS_HEX } from './primitives';

const HALF =
  'M150,92 L163,92 C164,104 170,110 184,114 C204,118 216,128 219,148 L226,214 C228,232 232,262 236,292 ' +
  'C238,304 236,318 228,318 C221,318 219,306 218,294 L206,226 L198,170 C197,200 194,232 192,256 ' +
  'C192,280 198,300 200,326 C203,372 198,420 194,452 C193,470 196,520 191,566 C190,580 196,596 198,604 ' +
  'L170,604 C170,590 172,580 170,566 C168,520 170,476 168,452 C166,420 160,372 153,336 L150,332 Z';

const HOTSPOT: Record<string, [number, number]> = { circadian: [150, 48], cardio: [160, 154], muscle: [86, 180], bone: [178, 392] };

const Mirror = ({ children }: { children: ReactNode }) => (
  <>
    {children}
    <g transform="translate(300,0) scale(-1,1)">{children}</g>
  </>
);

export function TwinFigure({ statuses, selected, onSelect, projected = false, height = 560, animate = true }: {
  statuses: Record<string, Status>;
  selected?: string | null;
  onSelect?: (id: string) => void;
  /** The twin 30 days ahead: drawn dashed, like every projected line in the tool. */
  projected?: boolean;
  height?: number;
  animate?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const color = (id: string) => STATUS_HEX[statuses[id] ?? 'no-data'];
  const show = (id: string) => (selected ? (selected === id ? 1 : 0.3) : 0.7);
  const a = (name: string) => (animate ? name : undefined);
  const outline = projected ? '#58d8e8' : '#4d6f8f';

  return (
    <svg
      viewBox="0 0 300 640" height={height} width={(height * 300) / 640}
      className="max-w-full shrink-0" role="img"
      aria-label={`${projected ? 'Projected twin' : 'Twin'}: ${Object.entries(statuses).map(([id, s]) => `${id} ${s}`).join(', ')}`}
    >
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a3a5c" stopOpacity={projected ? 0.35 : 0.95} />
          <stop offset="1" stopColor="#0a1727" stopOpacity={projected ? 0.2 : 0.95} />
        </linearGradient>
        <linearGradient id={`${uid}-scan`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#58d8e8" stopOpacity="0" />
          <stop offset="0.8" stopColor="#58d8e8" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ebf6fa" stopOpacity="0.7" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <ellipse cx="150" cy="52" rx="30" ry="36" />
          <path d={HALF} />
          <path d={HALF} transform="translate(300,0) scale(-1,1)" />
        </clipPath>
      </defs>

      {/* Hologram base */}
      <ellipse cx="150" cy="612" rx="118" ry="15" fill="none" stroke="#1e3449" />
      <ellipse cx="150" cy="612" rx="84" ry="10.5" fill="none" stroke="#58d8e8" strokeOpacity="0.45" strokeDasharray="3 9" className={a('anim-flow')} />
      <ellipse cx="150" cy="612" rx="46" ry="6" fill="#58d8e8" fillOpacity="0.1" />

      {/* Body */}
      <g fill={`url(#${uid}-body)`} stroke={outline} strokeWidth="1.5" strokeDasharray={projected ? '5 5' : undefined} strokeLinejoin="round">
        <ellipse cx="150" cy="52" rx="30" ry="36" />
        <Mirror><path d={HALF} /></Mirror>
      </g>

      {/* Bone: skeleton */}
      <g opacity={show('bone')} stroke={color('bone')} fill="none" strokeLinecap="round" style={{ transition: 'opacity .35s' }}>
        <line x1="150" y1="98" x2="150" y2="316" strokeWidth="3.2" strokeDasharray="5 3" />
        <Mirror>
          <path d="M150,112 L204,124" strokeWidth="2.2" />
          {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M153,${134 + i * 15} C172,${134 + i * 15} 186,${138 + i * 15} ${189 - i},${149 + i * 15}`} strokeWidth="1.6" />)}
          <path d="M208,133 L216,210 M217,222 L228,294" strokeWidth="2.6" />
          <path d="M152,322 C170,326 192,314 190,292 C182,300 168,304 152,300" strokeWidth="2" />
          <path d="M178,332 L180,446 M181,460 L183,564" strokeWidth="3.2" />
          {[[208, 130], [216.5, 216], [178, 329], [180.5, 453], [183, 569]].map(([x, y]) => <circle key={y} cx={x} cy={y} r="3.4" fill={color('bone')} stroke="none" />)}
        </Mirror>
      </g>

      {/* Muscle: main groups */}
      <g opacity={show('muscle')} fill={color('muscle')} fillOpacity="0.26" stroke={color('muscle')} strokeOpacity="0.85" strokeWidth="1.1" style={{ transition: 'opacity .35s' }}>
        <Mirror>
          <ellipse cx="205" cy="136" rx="12" ry="17" transform="rotate(-18 205 136)" />
          <ellipse cx="213" cy="180" rx="8" ry="26" transform="rotate(-5 213 180)" />
          <ellipse cx="226" cy="258" rx="6.5" ry="27" transform="rotate(-8 226 258)" />
          <ellipse cx="172" cy="146" rx="18" ry="12" />
          <ellipse cx="177" cy="392" rx="15" ry="50" transform="rotate(-2 177 392)" />
          <ellipse cx="182" cy="512" rx="9.5" ry="40" />
        </Mirror>
      </g>

      {/* Cardiovascular: heart and vessels */}
      <g opacity={show('cardio')} style={{ transition: 'opacity .35s' }}>
        <g fill="none" stroke={color('cardio')} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 8" className={a('anim-flow')}>
          <path d="M160,148 C160,128 152,114 150,98" />
          <path d="M158,168 C154,220 152,280 152,318 C168,332 176,380 180,560" />
          <path d="M152,318 C132,332 124,380 120,560" />
          <path d="M162,146 C188,124 208,136 214,210 L227,296" />
          <path d="M150,142 C114,124 92,136 86,210 L73,296" />
        </g>
        <path d="M160,172 C140,157 145,137 156,139.5 C159,140.2 160,143 160,145.5 C160,143 161,140.2 164,139.5 C175,137 180,157 160,172Z" fill={color('cardio')} className={a('anim-beat')} />
      </g>

      {/* Circadian rhythm: day-night ring around the head */}
      <g opacity={show('circadian')} style={{ transition: 'opacity .35s' }}>
        <ellipse cx="150" cy="48" rx="17" ry="19" fill={color('circadian')} fillOpacity="0.22" />
        <circle cx="150" cy="52" r="48" fill="none" stroke={color('circadian')} strokeWidth="1.4" strokeDasharray="2 7" className={a('anim-spin')} />
        <path d="M102,52 A48,48 0 0 1 198,52" fill="none" stroke={color('circadian')} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="150" cy="4" r="4.5" fill={color('circadian')} />
      </g>

      {/* Scan line, clipped to the body */}
      {animate && !projected && (
        <g clipPath={`url(#${uid}-clip)`}>
          <rect x="0" y="-60" width="300" height="60" fill={`url(#${uid}-scan)`} className="anim-scan" />
        </g>
      )}

      {/* Hotspots */}
      {Object.entries(HOTSPOT).map(([id, [x, y]]) => statuses[id] && (
        <g key={id} onClick={onSelect ? () => onSelect(id) : undefined} style={{ cursor: onSelect ? 'pointer' : undefined }}>
          <circle cx={x} cy={y} r="18" fill="transparent" />
          {statuses[id] !== 'nominal' && <circle cx={x} cy={y} r="9" fill="none" stroke={color(id)} strokeWidth="1.5" className={a('anim-ring')} />}
          <circle cx={x} cy={y} r="9" fill="#050c17" fillOpacity="0.75" stroke={color(id)} strokeWidth="1.5" />
          <circle cx={x} cy={y} r="4" fill={color(id)} />
          {selected === id && <circle cx={x} cy={y} r="14" fill="none" stroke="#ebf6fa" strokeWidth="1.3" />}
        </g>
      ))}
    </svg>
  );
}
