"use client";
import Link from "next/link";
import type { AgentTrace, WorkflowState } from "@/lib/types";
export const stateNames: Record<WorkflowState, string> = {
  normal: "No notable deviation",
  observe: "Observe trend",
  review: "Review suggested",
  insufficient_data: "Insufficient data",
};
export function StateBadge({ state }: { state: WorkflowState }) {
  return (
    <span
      className={`tag ${state === "normal" ? "green" : state === "review" || state === "observe" ? "amber" : ""}`}
    >
      {state === "normal" ? "✓" : state === "insufficient_data" ? "?" : "△"}{" "}
      {stateNames[state]}
    </span>
  );
}
export function MissionTabs({
  active,
}: {
  active: "mission" | "scenarios" | "science";
}) {
  return (
    <nav className="page-tabs" aria-label="Workspace">
      <Link className={active === "mission" ? "active" : ""} href="/mission">
        Mission overview
      </Link>
      <Link
        className={active === "scenarios" ? "active" : ""}
        href="/mission/scenarios"
      >
        Scenario explorer
      </Link>
      <Link
        className={active === "science" ? "active" : ""}
        href="/about/science"
      >
        Science & sources
      </Link>
    </nav>
  );
}
export function AgentTracePanel({ trace }: { trace: AgentTrace[] }) {
  return (
    <details className="trace">
      <summary>
        How this insight was produced · Agent trace ({trace.length} stages)
      </summary>
      <div className="trace-grid">
        {trace.map((t, i) => (
          <article className="trace-item" key={`${t.agent}-${i}`}>
            <span className="eyebrow">0{i + 1} / DETERMINISTIC</span>
            <h3>{t.agent}</h3>
            <p>
              <strong>Input</strong>
              <br />
              {t.inputSummary}
            </p>
            <p>
              <strong>Output</strong>
              <br />
              {t.outputSummary}
            </p>
            <code>
              {t.rules.join(" · ") || "Structured source-linked templates"}
            </code>
            {t.sourceIds.length > 0 && <p>Sources: {t.sourceIds.join(", ")}</p>}
          </article>
        ))}
      </div>
    </details>
  );
}
