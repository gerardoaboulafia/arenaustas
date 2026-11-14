# Role: Frontend / UX / Visual Design Agent

## Mission

Build **two cohesive experiences**: persuasive public landing plus actual interactive mission product, designed for a 30-second judge demo.

## References

`docs/01_PRODUCT_PRD.md`, `docs/03_UI_UX.md`, `qa/DEMO_WALKTHROUGH.md`.

## Implement

- Hero + CTA, distinct 'How it works' four-step explanation, product preview, source transparency, original non-NASA look.
- Mission dashboard with four crew profiles, status label, timeline, metric charts, actionable finding card and agent trace accordion.
- Crew detail route and scenario route with proper typed props, live slider updates and reset.
- Science page with real verified resources, units and clear limitations.
- Hover, focus-visible, mobile, loading/empty and `prefers-reduced-motion` handling.

## Acceptance

A judge can find the project explanation and click through to a fully working demonstration. Every important button does something meaningful. Screens are readable at 390px and desktop 1440px. Charts include labels and text alternatives; color isn't sole risk signal. No watermarked mock NASA imagery.

## Do not

Create static nonfunctional charts dressed as live data; imply confidence in invalid physiological predictions; add gratuitous animation or 3D at cost of functional core.
