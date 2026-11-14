"use client";

import { useId } from "react";
import { phaseAt } from "@/lib/mission";
import type { MissionConfig, MissionPhase } from "@/lib/mission/types";

const PHASE_LABELS: Record<MissionPhase, string> = {
  transit: "Outbound transit",
  orbit: "Orbital operations",
  return: "Return transit",
  complete: "Mission complete",
};

export default function MissionPosition({
  config,
  minute,
}: {
  config: MissionConfig;
  minute: number;
}) {
  const id = useId();
  const total = config.timeline.durationDays * 1440;
  const elapsed = Math.min(
    total,
    Math.max(0, Number.isFinite(minute) ? minute : 0),
  );
  const phase = phaseAt(config, elapsed);
  const transitEnd = config.timeline.transitHours * 60;
  const orbitEnd = transitEnd + config.timeline.orbitalDays * 1440;
  // A clock-driven schematic, not a physical trajectory or orbit propagator.
  const angle = ((elapsed - transitEnd) / 1440) * Math.PI * 2 - Math.PI / 2;
  let x = 190;
  let y = 54;
  if (phase === "transit") {
    const progress = Math.min(1, elapsed / Math.max(1, transitEnd));
    x = 190;
    y = 54 - 20 * progress;
  } else if (phase === "orbit") {
    x = 190 + Math.cos(angle) * 116;
    y = 88 + Math.sin(angle) * 54;
  } else if (phase === "return") {
    const progress = (elapsed - orbitEnd) / Math.max(1, total - orbitEnd);
    x = 190;
    y = 34 + 20 * progress;
  }
  const whole = Math.floor(elapsed);
  const elapsedLabel = `${Math.floor(whole / 1440)}d ${String(Math.floor((whole % 1440) / 60)).padStart(2, "0")}h ${String(whole % 60).padStart(2, "0")}m`;

  return (
    <figure className="mx-position mx-panel">
      <div className="mx-section-heading">
        <span className="mx-eyebrow">MISSION POSITION</span>
        <span className="mx-badge">{PHASE_LABELS[phase]}</span>
      </div>
      <svg
        className="mx-position-svg"
        viewBox="0 0 380 176"
        role="img"
        aria-labelledby={`${id}-title ${id}-description`}
      >
        <title id={`${id}-title`}>
          {PHASE_LABELS[phase]} · elapsed {elapsedLabel}
        </title>
        <desc id={`${id}-description`}>
          Original Earth and spacecraft schematic driven only by the mission
          clock. Synthetic illustration, not to scale; it does not show a real
          spacecraft location.
        </desc>
        <defs>
          <radialGradient id={`${id}-earth`} cx="30%" cy="25%">
            <stop offset="0" stopColor="#37869d" />
            <stop offset="0.65" stopColor="#164a68" />
            <stop offset="1" stopColor="#0a243e" />
          </radialGradient>
          <radialGradient id={`${id}-halo`}>
            <stop offset="0" stopColor="#5bdce8" stopOpacity="0.16" />
            <stop offset="1" stopColor="#5bdce8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          d="M18 44H362M18 88H362M18 132H362M76 16V160M152 16V160M228 16V160M304 16V160"
          stroke="#173147"
          strokeWidth="0.6"
        />
        <ellipse
          cx="190"
          cy="88"
          rx="116"
          ry="54"
          fill="none"
          stroke="#31516a"
          strokeDasharray="3 5"
        />
        <path
          d="M190 54L190 34"
          fill="none"
          stroke="#5bdce8"
          strokeOpacity="0.4"
          strokeDasharray="5 5"
        />
        <circle cx="190" cy="88" r="64" fill={`url(#${id}-halo)`} />
        <circle
          cx="190"
          cy="88"
          r="34"
          fill={`url(#${id}-earth)`}
          stroke="#5bdce8"
          strokeOpacity="0.55"
        />
        <path
          d="M169 64L181 58L190 64L186 74L174 79L169 91L161 88M196 78L212 75L220 86L209 96L206 112L194 105L190 91Z"
          fill="#69b5b0"
          opacity="0.52"
        />
        <ellipse
          cx="190"
          cy="88"
          rx="15"
          ry="34"
          fill="none"
          stroke="#91c9dc"
          strokeOpacity="0.22"
        />
        <path
          d="M157 88H223M161 73Q190 81 219 73M161 103Q190 95 219 103"
          fill="none"
          stroke="#91c9dc"
          strokeOpacity="0.22"
        />
        <text
          x="190"
          y="142"
          textAnchor="middle"
          fill="#9cb2c9"
          fontSize="10"
          letterSpacing="2"
        >
          EARTH
        </text>
        <g
          className="mx-position-craft"
          transform={`translate(${x.toFixed(3)} ${y.toFixed(3)})`}
        >
          <circle r="18" fill="#5bdce8" fillOpacity="0.08" />
          <path
            d="M-20-7H-7V7H-20ZM7-7H20V7H7Z"
            fill="#1b5473"
            stroke="#6be1ec"
            strokeWidth="1"
          />
          <path
            d="M-14-7V7M14-7V7M-20 0H-7M7 0H20"
            stroke="#6be1ec"
            strokeOpacity="0.5"
          />
          <rect x="-6" y="-9" width="12" height="18" rx="3" fill="#e6f7fc" />
          <path d="M0-14V-9M-3 12H3" stroke="#e6f7fc" strokeWidth="2" />
          <circle r="2" fill="#23738a" />
        </g>
      </svg>
      <figcaption>
        <strong className="mx-mono">T+ {elapsedLabel}</strong>
        <span>Clock-driven schematic · synthetic · not to scale</span>
        <small>Original AI-assisted SVG illustration.</small>
      </figcaption>
    </figure>
  );
}
