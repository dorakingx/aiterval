# Testing

## Unit and component coverage

Vitest covers the sprint machine, deterministic selection, cooldown/hourly limits, spaced review, adaptive difficulty, real recovered time, weekly progress, storage migration, dataset validation, listening controls, transcript reveal, answer feedback, AI-ready recovery, and keyboard-accessible native controls.

The Build Week suites additionally cover lecture input bounds, GPT-5.6-family enforcement, canonical Structured Outputs, provenance, copy protection, prompt-injection source text, invalid output retry, timeouts, OpenAI 429/500 mapping, access-code enforcement, rate/quota decisions, duplicate requests, pack import, aggregate-only personalization, generated scheduling, bilingual form states, and pack deletion.

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

The fixtures simulate generation start/completion, duplicate attribute mutations, SPA navigation, and an imported generated pack. The suite checks one overlay, audio controls, source badges, AI-ready pause, manual keyboard activation with auto-start disabled, popup rendering, generated scheduling, and dashboard rendering.

The same Playwright run starts the production-style web app and verifies the no-login judge journey, sample Lecture-to-Sprints, live-generation failure recovery, English/Japanese controls, keyboard operation, and mobile layout. Paid API calls are never made in CI.

If the execution environment cannot launch Chromium, install it with the command above. CI installs only Chromium and uploads Playwright traces/screenshots on failure.

## Full suite

```bash
pnpm check
```

This runs lint, strict type checking, Vitest, both production builds, E2E, and extension ZIP generation.

## Optional live smoke test

```bash
pnpm test:gpt56:smoke
```

This makes exactly one small real request only when `OPENAI_API_KEY` is present. Otherwise it reports `SKIP` and exits successfully. It never runs in the default or CI suite.
