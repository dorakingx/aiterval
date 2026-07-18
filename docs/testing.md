# Testing

## Unit and component coverage

Vitest covers the sprint machine, deterministic selection, cooldown/hourly limits, spaced review, adaptive difficulty, real recovered time, weekly progress, migrations/import validation, dataset validation, listening controls, transcript reveal, answer feedback, AI-ready recovery, and keyboard-accessible native controls.

Run:

```bash
pnpm test
```

## Browser E2E

Build first, install Chromium once, then run:

```bash
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Playwright launches `apps/extension/.output/chrome-mv3` in a persistent Chromium context. Requests to the supported public hostnames are fulfilled with local fixtures in `test-fixtures/`, so no login, live AI service, prompt, or response is involved.

The fixtures simulate generation start/completion, duplicate attribute mutations, and SPA navigation. The suite checks one overlay, audio controls, AI-ready pause, manual keyboard activation with auto-start disabled, popup rendering, and dashboard rendering.

If the execution environment cannot launch Chromium, install it with the command above. CI installs only Chromium and uploads Playwright traces/screenshots on failure.

## Full suite

```bash
pnpm check
```

This runs lint, strict type checking, Vitest, both production builds, E2E, and extension ZIP generation.
