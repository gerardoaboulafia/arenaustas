# 07 — Local run, deployment and incident playbook

## Implemented release configuration

The application uses Next.js static export (`output: 'export'`, `trailingSlash: true`). `npm run build` writes the deployable artifact to `out/`. `npm start` runs the included loopback-only static preview server at http://127.0.0.1:3000. It does not run `next start`, which is incompatible with static export. No environment variables are needed; optional `PORT` changes only the local preview port.

For any static hosting provider, select a static/Other project, Node 24, install `npm ci`, build `npm run build`, and output `out`. Publish at the domain root. Upload the contents of `out`, including `_next`, crew subdirectories and `404.html`; never upload `node_modules`, `.env`, or the whole workspace as the web root. Preserve directory index resolution and the generated custom 404 response. This release is not configured for a GitHub Pages repository subpath.

After deployment, verify `/`, `/mission/`, every `/mission/crew/<id>/`, `/mission/scenarios/`, `/about/science/`, and an unknown URL from a logged-out browser. Complete the existing demo walkthrough at desktop and 390px width, test keyboard controls and inspect the console. Run `npm run test:e2e` locally after each new production build. This command checks production HTTP routes/assets; it does not replace browser interaction or layout checks.

Current state: local release built; no hosting account used or public URL created. Publication and official judging submission remain human steps. The provider suggestions below are generic alternatives from the planning kit; the explicit static-export configuration above controls this release.

## Codex setup checklist

- Node.js recent LTS + npm; verify with `node --version` and `npm --version`.
- Generate a lockfile; commit `package-lock.json` with repo.
- Keep provided docs and PDF; put Next.js app files alongside them.
- Required dev path should be:

```bash
npm install
npm run dev
# open http://localhost:3000/
# inspect /mission, /mission/crew/maya-torres, /mission/scenarios, /about/science
npm run typecheck
npm run lint
npm test
npm run build
```

Do not invent a passing result until these commands are actually executed. If a test framework is unavailable, implement enough fixture validation with Node/TS to cover core math and document why.

## Suggested deploy option A: Vercel

1. Push repository to GitHub (only with team authorization), import into Vercel, use Next.js preset.
2. No runtime environment variables required for the core demo.
3. Build and open public URL in browser private/incognito with no login.
4. Visit all routes directly; simulate a 30-second walkthrough.
5. If private GitHub repo with public Vercel deployment, confirm judge access to app and disclosed source materials. Public GitHub repo simplifies assessment.

## Suggested deploy option B: compatible Next.js host

Deploy using provider-supported Next.js method. Avoid Docker/DB for weekend build. Never promise a URL without an actual successful deployment.

## Submission external links

- Final project URL = public site root or `/mission` with an obvious route back to landing.
- Demo URL = YouTube unlisted/public link or file/deck accessible without login or request.
- Repository URL = public GitHub or a publicly readable source artifact, if sharing.
- Test every URL from anonymous browser. Judges cannot request access.

## Recovery / fallback

- If remote model/API unavailable: default to deterministic template explanations (core never depends on optional LLM).
- If NASA API is slow: use legitimate previously downloaded + attributed metadata, but do not fabricate a snapshot. If no real evidence available, keep science references and log source-verification blocker.
- If chart dependency fails: use native SVG line chart or simple tabular trend list with semantic labels.
- If deployment access missing: local app must still be buildable, and provide human exact release commands.
- If main site is inaccessible after deploy: restore last known good release, don't migrate stack.

## Security and privacy

No secrets in client code, no real health data, no signup, no analytics by default, no fake authorization. App is a research prototype; avoid 'medical device' language and keep disclaimer visible.
