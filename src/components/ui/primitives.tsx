// AI-assisted: written with Claude Code, reviewed by the team.
import type { ReactNode } from 'react';
import { sourceById } from '../../domain';
import type { AgentName, Basis, Status } from '../../domain';

const STATUS_STYLE: Record<Status, { word: string; text: string; bg: string }> = {
  nominal: { word: 'Nominal', text: 'text-nominal', bg: 'bg-nominal/10' },
  watch: { word: 'Watch', text: 'text-watch', bg: 'bg-watch/10' },
  alert: { word: 'Alert', text: 'text-alert', bg: 'bg-alert/10' },
  'no-data': { word: 'No data', text: 'text-muted', bg: 'bg-muted/10' },
};

export const statusText = (status: Status) => STATUS_STYLE[status].text;
export const statusWord = (status: Status) => STATUS_STYLE[status].word;
export const STATUS_HEX: Record<Status, string> = { nominal: '#80d6b3', watch: '#e6ac55', alert: '#ff8a73', 'no-data': '#9baec0' };

/** Each status has its own shape, so it never depends on color alone. */
export function StatusIcon({ status, size = 14 }: { status: Status; size?: number }) {
  const common = {
    width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
  };
  if (status === 'nominal') return (<svg {...common}><circle cx="8" cy="8" r="6.2" /><path d="M5.4 8.2l1.8 1.8 3.4-3.8" /></svg>);
  if (status === 'watch') return (<svg {...common}><path d="M8 2.4l6 10.6H2z" /><path d="M8 6.6v3M8 11.4v.1" /></svg>);
  if (status === 'alert') return (<svg {...common}><path d="M5.5 1.8h5l3.7 3.7v5l-3.7 3.7h-5L1.8 10.5v-5z" /><path d="M8 5v3.6M8 11v.1" /></svg>);
  return (<svg {...common} strokeDasharray="2.4 2.4"><circle cx="8" cy="8" r="6.2" /></svg>);
}

export function StatusBadge({ status, className = '' }: { status: Status; className?: string }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold whitespace-nowrap ${s.text} ${s.bg} ${className}`}>
      <StatusIcon status={status} />
      {s.word}
    </span>
  );
}

export function AgentTag({ agent }: { agent: AgentName }) {
  return <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{agent}</span>;
}

export function Card({ title, agent, action, children, className = '' }: {
  title?: string; agent?: AgentName; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={`panel min-w-0 p-5 ${className}`}>
      {(title || agent || action) && (
        <header className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          {title && <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>}
          <div className="flex items-center gap-3">
            {agent && <AgentTag agent={agent} />}
            {action}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}

export function SimulatedBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border border-dashed border-muted/60 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted ${className}`}>
      Simulated data
    </span>
  );
}

export function BasisTag({ basis, needsReview }: { basis: Basis; needsReview?: boolean }) {
  const label = basis === 'nasa' ? 'NASA source' : basis === 'partner' ? 'Partner source' : basis === 'clinical' ? 'Clinical source' : 'Assumption';
  return (
    <span
      title={needsReview ? 'Not taken from a source, or simplified from one. Illustrative until a flight surgeon reviews it.' : undefined}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${basis === 'assumption' ? 'border-watch/50 text-watch' : 'border-accent/50 text-accent'}`}
    >
      {label}
    </span>
  );
}

export function SourceLink({ sourceId, className = '' }: { sourceId?: string; className?: string }) {
  const source = sourceById(sourceId);
  if (!source) return null;
  return (
    <a href={source.url} target="_blank" rel="noreferrer" className={`text-xs text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent ${className}`}>
      Source: {source.org}, “{source.title.length > 60 ? `${source.title.slice(0, 57)}…` : source.title}”
    </a>
  );
}

export const PROJECTION_LABEL = 'Simplified projection, not a prediction';

export function ProjectionNote({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md border border-line bg-panel2 px-2 py-1 text-xs text-muted ${className}`}>
      {PROJECTION_LABEL}
    </span>
  );
}

/** Two circles: you, and your twin (dashed, like every projected line in the tool). */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="30" height="20" viewBox="0 0 30 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="10" cy="10" r="8" />
        <circle cx="20" cy="10" r="8" strokeDasharray="2.6 2.6" className="text-accent" stroke="currentColor" />
      </svg>
      <span className="font-display text-lg font-bold tracking-[0.22em]">ASTRA</span>
    </span>
  );
}

export const buttonPrimary =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-bg shadow-[0_0_32px_-8px_rgba(88,216,232,0.7)] transition hover:bg-ink hover:shadow-[0_0_36px_-6px_rgba(235,246,250,0.6)]';
export const buttonSecondary =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-panel2/80 px-5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent';
