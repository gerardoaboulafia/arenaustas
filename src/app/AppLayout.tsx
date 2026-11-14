// AI-assisted: written with Claude Code, reviewed by the team.
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Logo, SimulatedBadge } from '../components/ui/primitives';
import { useMission } from './state';

const tab = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold transition-colors ${isActive ? 'bg-panel2 text-ink' : 'text-muted hover:text-ink'}`;

/** Mission-day slider with replay: the twin evolves as the mission goes on. */
function DayControl() {
  const { day, setDay, minDay, dataset } = useMission();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (day >= dataset.lastDay) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setDay(day + 1), 600);
    return () => clearTimeout(timer);
  }, [playing, day, dataset.lastDay, setDay]);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="mission-day" className="font-mono text-xs whitespace-nowrap text-muted">
        Mission day <span className="text-ink">{day}</span>
      </label>
      <input
        id="mission-day" type="range" min={minDay} max={dataset.lastDay} step={1} value={day}
        onChange={(e) => { setPlaying(false); setDay(Number(e.target.value)); }}
        className="h-11 w-28 sm:w-36"
      />
      <button
        type="button"
        onClick={() => { if (!playing && day >= dataset.lastDay) setDay(minDay); setPlaying(!playing); }}
        className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-xs font-semibold hover:border-accent"
      >
        {playing ? 'Pause' : 'Replay'}
      </button>
    </div>
  );
}

export function AppLayout() {
  const { dataset, crewId, setCrewId } = useMission();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 sm:px-8">
          <Link to="/" aria-label="ASTRA home" className="inline-flex min-h-11 items-center"><Logo /></Link>
          <nav aria-label="Tool" className="flex flex-wrap gap-1">
            <NavLink to="/app" end className={tab}>Twin</NavLink>
            <NavLink to="/app/projection" className={tab}>Projection</NavLink>
            <NavLink to="/app/log" className={tab}>Log readings</NavLink>
          </nav>
          <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
            <DayControl />
            <label className="flex items-center gap-2 text-xs text-muted">
              <span className="sr-only">Crew member</span>
              <select
                value={crewId}
                onChange={(e) => setCrewId(e.target.value)}
                className="min-h-11 rounded-lg border border-line bg-panel2 px-3 text-sm font-semibold text-ink"
              >
                {dataset.crew.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
            <SimulatedBadge />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-8">
        <Outlet />
      </main>
      <footer className="border-t border-line px-4 py-4 text-center text-xs text-muted sm:px-8">
        Prototype. Not a medical device. Every reading on this screen is simulated.
      </footer>
    </div>
  );
}
