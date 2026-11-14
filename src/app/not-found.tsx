import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="page">
      <span className="eyebrow">SIGNAL NOT FOUND / 404</span>
      <h1>This route is off course.</h1>
      <p>Choose one of the four fictional crew members from mission control.</p>
      <Link className="button" href="/mission">
        Return to mission
      </Link>
    </main>
  );
}
