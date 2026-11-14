# Role: Architecture / Project Setup Agent

**Goal:** reproducible simple monorepo (actually single Next.js project) with typed contracts.

## Inputs

`docs/02_ARCHITECTURE.md`, `docs/05_API_AND_SCHEMAS.md`, `data/synthetic/*`.

## Tasks

1. Validate Node/npm; scaffold Next.js App Router TS in this existing directory without overwriting docs.
2. Add Tailwind, Recharts, Lucide and a modest test harness; pin dependency resolution with lockfile.
3. Establish `src/lib/types` and pure domain modules, fixture loader, all required routes.
4. Ensure no API key or backend needed for core functionality.
5. Add scripts `dev`, `lint`, `typecheck`, `test`, `build`, optionally `test:e2e`.
6. Add `.gitignore`, `README` implementation section and verify npm build.

## Success checks

- `npm install` and `npm run build` work.
- Browser can navigate all named paths.
- Parser returns exactly 120 synthetic records; values are correctly typed.
- No source data falsely labeled NASA.

## Output

Code + decisions log + initial build report. Hand off to data/runtime/frontend roles.
