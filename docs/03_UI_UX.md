# 03 — UX, visual system, content and navigation

## Aesthetic target

A credible mission-health interface, **not** generic purple AI cards. Background deep navy (#07111F), calm marine blue (#11253B), cyan accents (#58D8E8), restrained amber for review flags (#E6AC55), near-white text (#EBF6FA). Use status icons/words in addition to color. Use system/inter fonts available without licensing concerns. Overall style: precise typography, open whitespace, subtle grid and orbital line motifs drawn in CSS/SVG.

Do not use NASA insignia/logos, mission patches or copyrighted astronaut photos; build simple original vector visuals and icons. If using AI images, apply the visible 'AI-generated' watermark required by the guide and list the tool/source.

## Landing page wireframe

```text
┌─────────────────────────────────────────────────────────────────────┐
│ ASTRA [independent prototype]  Mission / Science     Launch Mission │
├─────────────────────────────────────────────────────────────────────┤
│ A healthier mission starts with understanding the signal.          │
│ Your health today. Your risks tomorrow. Your decisions in control. │
│ [Launch Mission] [Explore Science]       [original astronaut UI art]│
├─────────────────────────────────────────────────────────────────────┤
│ The challenge: distance, uncertainty, disrupted physiology          │
│ Four agents: MONITOR -> ASSESS -> EXPLORE -> EXPLAIN                 │
│ 'This demo uses synthetic crew telemetry'                           │
│ Product preview: trend chart / risk card / scenario controls        │
│ NASA-informed research provenance + how we're transparent          │
│ [Launch the demo]                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

## App wireframe

```text
┌─────────────────────────────────────────────────────────────────────┐
│ ASTRA / Mission Control   Day [120 === 149]  [Play] [Reset]        │
├───────────────────────────────┬─────────────────────────────────────┤
│ Crew selector (4 cards)       │ Selected astronaut / quality status │
│                               ├─────────────────────────────────────┤
│ Today's summary               │ Sleep, HRV, Resting HR & CO2 trends │
│ Review suggested (if flagged) │ 30-day sample window               │
│                               ├─────────────────────────────────────┤
│ [Agent activity]              │ Why flagged? baseline + quality     │
│                               │ [View scenario] [Review finding]   │
└───────────────────────────────┴─────────────────────────────────────┘
```

## Required interactions

- Nav has visible keyboard focus; CTA shows obvious hover/focus state.
- Day slider/playback advances selected mission day, filters data up to that day, updates findings and cards; 100% deterministic, no fake live API.
- Crew selection changes trends/finding list; URL reflects crew ID.
- Risk card expands to display: observed signal, comparison baseline, rule, data quality, timeframe, NASA context reference where appropriate.
- Scenario sliders show initial and modified **assumed sleep/exercise schedules**; side-by-side outlook, not invented improvement to bone density. 'Reset assumptions' button.
- Science page shows NASA source collection with verified URL and exactly how it was used.
- 'Review with medical officer' updates a prototype workflow status; it does **not** send a real notification.

## Copy guidance

Use 'monitoring signal', 'illustrative projection', 'review suggested', 'evidence context' instead of 'disease predicted', 'at risk of stroke', 'clinically safe' or 'treatment recommended'. At the top of the app show a persistent pill: **SIMULATED MISSION • DEMO DATA**.

## Visual states

- `normal`: No notable signal deviation in available data.
- `observe`: Small persistent difference from individual baseline.
- `review`: Multiple persistent signals, human review suggested.
- `insufficient_data`: Data insufficient; omit certainty-based results.

## Responsive behavior

Desktop 12-column grid and two-column mission layout; mobile stacked card list, 1-column charts, slider reachable without horizontal scroll, text at least ~14px for key content; avoid text overlays on complex imagery. Respect reduced motion preference.

## Demo storytelling

Always initialize on a visually meaningful frame: mission day 149, Maya selected, visible explainable flag, 'Explore Scenario' direct button. Day slider remains interactive. For video, show landing hero in 2 sec then product demonstration and science provenance in <=30 sec.
