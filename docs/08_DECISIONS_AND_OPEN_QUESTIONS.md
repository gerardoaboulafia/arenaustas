# 08 — Defaults, assumptions and human review items

## Fixed decisions so Codex does not block

- Product name: ASTRA. Expansion: **Astronaut System for Tracking Risk & Assessment**.
- Language: English for everything submitted and linked.
- Mission: fictional 4-person crew, 30 daily records each, days 120–149.
- Primary UX: landing → mission dashboard → Maya finding → scenario → evidence.
- Implementation: Node/TypeScript, Next.js, deterministic local modules, no required paid API.
- Scientific focus: sleep, HRV, resting HR, activity adherence; cabin CO2 is environmental context only; radiation proxy is fictional context and must NOT be reported as actual radiation dose.
- Explainable status, not diagnosis or personalized treatments.
- Public site, no auth.

## Unresolved and truly human-dependent

- Team display name and member roster; no names invented.
- Actual NASA resource chosen **from this specific challenge's Resources tab**; if inaccessible, record exact blocker and don't claim Global Award eligibility verified.
- Whether any real third-party assets are licensed and credited.
- Deployment accounts and link upload credentials.
- Which Local Event/Universal Event they entered and resulting timezone/deadline.
- Verification that finalist/demo visual assets obey competition AI watermark and no-minor-likeness rules.
- Final publication/submission must be performed or supervised by human team.

## Decision log template

| Date UTC | Choice | Reason | Alternative rejected | Impact |
|---|---|---|---|---|
| TBD | Next.js + local fixtures | 48h reliability and zero credentials | managed DB | low setup overhead |

Codex may expand this table in `docs/DECISIONS_LOG.md` as needed.
