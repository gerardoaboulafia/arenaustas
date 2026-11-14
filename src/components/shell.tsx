import Link from "next/link";
import { Activity, ArrowUpRight, Orbit } from "lucide-react";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="ASTRA home">
      <span className="brand-icon">
        <Orbit size={25} />
      </span>
      ASTRA<span className="brand-sub">MISSION INTELLIGENCE</span>
    </Link>
  );
}
export function Header() {
  return (
    <header className="header">
      <Brand />
      <nav aria-label="Main navigation">
        <Link href="/mission">Mission control</Link>
        <Link href="/mission/scenarios">Scenarios</Link>
        <Link href="/about/science">Science & sources</Link>
      </nav>
      <Link className="button small" href="/mission">
        Launch Mission <ArrowUpRight size={16} />
      </Link>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div>
        <Brand />
        <p>
          Independent participant-created prototype.
          <br />
          Synthetic data. No NASA endorsement.
        </p>
      </div>
      <div>
        <Link href="/about/science">
          Methods, sources & AI disclosure <ArrowUpRight size={14} />
        </Link>
        <p>ASTRA / 2026 · Built for understanding.</p>
      </div>
    </footer>
  );
}
export function Disclaimer() {
  return (
    <div className="disclaimer">
      <Activity size={16} />
      <span>
        Prototype signal / not a clinical assessment. All crew readings are
        synthetic. Human review remains essential.
      </span>
    </div>
  );
}
