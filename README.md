# AIterval

> Turn AI waiting time into English listening practice.

> AIの待ち時間を、英語が聞こえる時間に。

AIterval is a local-first Chrome extension that turns the short wait after a prompt to ChatGPT, Claude, or Gemini into one 15–90 second English listening sprint. When the AI finishes, audio pauses and the user returns to work.

![AIterval marketing site](docs/screenshots/home.png)
![AIterval extension dashboard](docs/screenshots/dashboard.png)

## What is included

- Semantic wait-state adapters for ChatGPT, Claude, and Gemini
- Manual start from popup, context menu, or `Command+Shift+L` (`Ctrl+Shift+L` on Windows/Linux)
- Isolated Shadow DOM overlay with listen, answer, feedback, AI-ready interruption, save, and dismiss flows
- Browser speech synthesis with real installed English voice discovery and graceful fallback
- 132 original, runtime-validated listening exercises across academic, conversational, and technical topics
- Deterministic local recommendation, lightweight review scheduling, cooldowns, and honest recovered-time metrics
- Full onboarding, popup, local-data dashboard, import/export, and confirmed deletion
- English/Japanese product copy and a responsive multi-page Next.js site with an interactive extension demo
- Vitest, Testing Library, Playwright fixtures, GitHub CI, and tagged release builds

## Privacy principles

AIterval observes generation-state interface signals only. It never reads, stores, transmits, or logs prompt or response content. There is no account, analytics SDK, advertising SDK, tracking pixel, remote executable code, or external AI API. Learning data remains in extension storage and can be exported or deleted.

See [docs/privacy.md](docs/privacy.md) for the exact data and permission model.

## Architecture

This pnpm workspace contains:

```text
apps/extension  WXT + React, Chrome Manifest V3
apps/web        Next.js App Router marketing site and interactive demo
packages/core   State machine, scheduling, rules, statistics, typed storage
packages/content  Runtime-validated exercise bank
packages/ui     Shared React components, listening player, audio provider, tokens
packages/config Shared strict TypeScript configuration
```

Detailed design: [docs/architecture.md](docs/architecture.md).

## Prerequisites on macOS

1. Install Node.js 22 or newer.
2. Enable pnpm with `corepack enable`.
3. Install Google Chrome.
4. Optional for E2E: install Playwright Chromium with `pnpm exec playwright install chromium`.

No environment variables are required.

## Install and develop

```bash
git clone <repository-url>
cd aiterval
pnpm install
pnpm dev:extension
```

In another terminal, start the web app:

```bash
pnpm dev:web
```

Open [http://localhost:3000](http://localhost:3000).

## Load the unpacked extension

1. Run `pnpm build`.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the verified output directory: `apps/extension/.output/chrome-mv3`.

For development, WXT writes a development build under `apps/extension/.output/chrome-mv3-dev` after `pnpm dev:extension` starts.

## Quality commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm build:web-worker
pnpm zip:extension
pnpm check
```

`pnpm check` runs the required quality suite, including browser E2E. The E2E suite loads the built extension and routes the three real supported hostnames to local semantic-state fixtures, so no AI account is needed. See [docs/testing.md](docs/testing.md).

## How wait detection works

Each supported site has an isolated adapter implementing `AIWaitAdapter`. A debounced `MutationObserver` watches a narrow attribute set and combines accessible stop/cancel labels, `aria-busy`, and site-specific stable signals. The shared controller handles thresholds, cooldown, completion, SPA navigation, and duplicate prevention. It never accesses conversation containers or text.

Automatic detection can fail when a third-party interface changes; the keyboard shortcut, popup, and context menu remain available. Signal details live in [docs/architecture.md](docs/architecture.md).

## Add a new AI-site adapter

1. Add an isolated file under `apps/extension/lib/adapters/`.
2. Implement `id`, `hostnamePatterns`, `detectState`, and `observe`.
3. Use semantic control attributes, debounce mutations, and never inspect conversation text.
4. Export the adapter from `adapters/index.ts`.
5. Add the narrow host permission and a local fixture.
6. Extend E2E coverage for start, completion, duplicates, and SPA navigation.

## Add listening exercises

Edit `packages/content/src/index.ts` or add a new original content module that exports `ListeningExercise` values. Every item must pass `exerciseSchema`; run `pnpm test` to check IDs, answers, indexes, durations, tags, questions, and transcript uniqueness. Do not copy textbook, podcast, course, movie, lecture, or other copyrighted material.

## Build, ZIP, and release

```bash
pnpm build
pnpm zip:extension
```

The unpacked build is `apps/extension/.output/chrome-mv3`. WXT writes the distributable ZIP to `apps/extension/.output/aitervalextension-0.1.0-chrome.zip`.

To publish a GitHub release, update the version, commit, then push a `v*` tag. `.github/workflows/release.yml` builds the extension, creates a ZIP and SHA-256 checksum, and uploads both to the release. It does not publish to the Chrome Web Store.

## Known limitations

- Third-party AI interfaces change; semantic detection is resilient but cannot be guaranteed. Manual start is always available.
- Speech quality and available accents depend on system-installed voices. AIterval does not claim an accent is available unless the browser reports it.
- Static recorded audio, microphone scoring, accounts, syncing, telemetry, and Chrome Web Store publishing are outside the MVP.
- The detailed local history retains the most recent 500 sessions; aggregate totals remain available.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [LICENSE](LICENSE).
