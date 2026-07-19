# AIterval

> Turn AI waiting time into 15–90 second English listening practice.

AIterval is a local-first Manifest V3 Chrome extension for busy people who want
to improve English listening without finding another study block. While a
supported AI interface is visibly working, AIterval offers one short exercise.
When the AI is ready, AIterval notifies the learner without cutting off the
current listening sentence. They can finish the question or return immediately.

The OpenAI Build Week submission uses **132 original pre-authored exercises**.
It works without an OpenAI API key, account, analytics service, or runtime
exercise-generation service.

## Try it

- Public judge demo: <https://aiterval-build-week.vercel.app/demo/judge>
- Privacy model: <https://aiterval-build-week.vercel.app/privacy>
- Release: <https://github.com/dorakingx/aiterval/releases/tag/v0.2.0>
- Judge guide: [docs/judge-testing-guide.md](docs/judge-testing-guide.md)

The public demo is signed-out and uses the same pre-authored exercise library.
The `/lecture` route is archived and redirects to the judge demo. Runtime AI
exercise generation is not part of the submitted product.

## Product loop

```text
AI work starts
→ AIterval observes a semantic generation-state control
→ one pre-authored listening exercise appears
→ the learner listens and answers
→ AI completion adds a non-destructive readiness notice
→ the current sentence and question remain usable
→ recovered waiting time and review progress stay local
```

The extension observes only generation-state controls such as accessible busy
states and stop-generation buttons. It never reads prompts, responses,
conversation content, cookies, or account data.

## Included learning system

- 132 original exercises across practical and academic listening skills
- 15–90 second sprints with multiple difficulty levels
- transcript evidence and concise Japanese explanations
- local review queue, weak-skill map, and recovered-time metrics
- system-reported English voices and adjustable playback speed
- capped local history with export, import, and delete controls

## Codex and GPT-5.6

Codex with GPT-5.6 was used as a development partner for architecture,
implementation, adapters, the state machine, UI, tests, debugging, deployment,
security review, and submission evidence. The creator supplied the lived
problem, product decisions, learning experience, and privacy rules.

That development role is separate from the submitted runtime. GPT-5.6 does not
generate exercises while judges use AIterval; the submitted extension uses only
the deterministic pre-authored library. See
[docs/codex-collaboration.md](docs/codex-collaboration.md).

## Install the release

1. Download `aitervalextension-0.2.0-chrome.zip` and `SHA256SUMS.txt` from
   [v0.2.0](https://github.com/dorakingx/aiterval/releases/tag/v0.2.0).
2. Verify the ZIP SHA-256:

   ```text
   7e2bc8ed9195820aa526b3be0fd2de593c23a8a5d465693ca12a73b3f726bb58
   ```

3. Unzip it, open `chrome://extensions`, enable Developer mode, choose
   **Load unpacked**, and select the directory containing `manifest.json`.
4. Open ChatGPT, Claude, or Gemini. Send a request, or use
   `Command+Shift+L` / `Ctrl+Shift+L` for a manual sprint.

Chrome Web Store publication is not complete.

## Develop

Requirements: Node.js 20.19+ and pnpm 10.34.5.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Quality suite:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm audit
```

Package the extension:

```bash
pnpm zip:extension
```

The real browser E2E suite loads the Manifest V3 extension against deterministic
ChatGPT, Claude, and Gemini fixtures; no AI account or API call is required.

## Reproduce the demo video

The automated recorder uses headless Playwright Chromium, the public web demo,
the packaged extension, deterministic site fixtures, macOS system narration,
and FFmpeg:

```bash
pnpm demo:record
pnpm demo:render
pnpm demo:verify
```

Large rendered files stay under ignored `artifacts/demo/` paths. Recording is
headless and requires no microphone, camera, personal account, or live OpenAI
request. See [docs/video/recording-checklist.md](docs/video/recording-checklist.md).

## Privacy and permissions

Learning progress remains in `chrome.storage.local`. There are no analytics,
ads, tracking pixels, hidden telemetry, or remote extension scripts. The
extension uses narrowly scoped host access for the three supported AI sites,
plus storage and user-initiated controls documented in
[docs/privacy.md](docs/privacy.md).

## Submission evidence

- Build Week Git evidence: [docs/build-week.md](docs/build-week.md)
- Architecture: [docs/architecture.md](docs/architecture.md)
- Testing: [docs/testing.md](docs/testing.md)
- Devpost draft: [docs/devpost-submission-en.md](docs/devpost-submission-en.md)

The primary Codex task `/feedback` Session ID is submitted privately through
Devpost. It is never committed or shown in screenshots, bundles, logs, or video.

## Known limitations

- Third-party interfaces can change; manual start remains available.
- Speech quality depends on voices installed in the user’s browser or system.
- Chrome Web Store review and real five-person testing are not complete.
- The detailed local history retains the most recent 500 sessions; aggregate
  totals remain available.

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and
[LICENSE](LICENSE).
