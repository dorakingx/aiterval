# Architecture

## Product flow

The content script owns the opportunity lifecycle. A site adapter emits idle or generating. The controller applies per-site settings, snooze, cooldown, hourly cap, and minimum wait threshold before mounting one Shadow DOM host. AI completion replaces the active sprint with the `paused_ai_ready` recovery screen. Every meaningful transition is persisted immediately.

The deterministic state machine supports:

```text
idle → opportunity_detected → waiting_for_threshold → sprint_ready
→ listening → answering → feedback → completed

Interruption: paused_ai_ready, dismissed, snoozed, saved_for_later
```

Unknown events are idempotent, so duplicate mutations do not create duplicate records or overlays.

## Site adapters and observed signals

All adapters use a debounced `MutationObserver`, watch only `aria-label`, `aria-busy`, `disabled`, and `data-state`, and re-run detection after `popstate` or `history.pushState`. They fail to idle when no known generation signal exists.

- **ChatGPT:** accessible stop-generation/stop-streaming controls, busy states, and Japanese stop labels.
- **Claude:** accessible stop-response/cancel controls and busy progress indicators.
- **Gemini:** accessible stop-loading/stop-generating-response controls and busy live regions.

The helpers query controls and state attributes only. They never read page text, prompt inputs, response containers, conversation content, or network requests.

## Packages

- `@aiterval/core`: pure types, deterministic state/scheduling rules, transparent recommendation scoring, canonical built-in/generated exercise schemas, lecture-generation schemas, stats helpers, Zod-validated storage repository, and schema migration entry point.
- `@aiterval/content`: 132 original exercises and startup/test-time validation.
- `@aiterval/ui`: shared accessible controls, design tokens, Web Speech provider, and the complete listening player used by extension and web demo.
- `apps/extension`: WXT entry points, local repository adapter, site adapters, and isolated overlay.
- `apps/web`: Next.js App Router pages, the no-login judge demo, Lecture-to-Sprints form, and a server-only Responses API route.

## Lecture-to-Sprints boundary

The browser deliberately sends only fields the user enters in the lecture form plus explicit learning preferences. The Next.js route validates that request, authenticates the private demo code with a timing-safe comparison, applies per-session and daily limits, then calls the OpenAI Responses API from the server. `OPENAI_API_KEY` and `DEMO_ACCESS_CODE` are never serialized into props or client JavaScript.

The server uses the same strict Zod schemas for Structured Outputs, post-response validation, exported packs, extension import, and tests. It allows one retry only for invalid structured output. It stores neither source input nor full API responses and logs only safe operational metadata.

The extension does not call the generation API. The web app exports a schema-versioned JSON pack, and the extension validates it locally before saving it. This keeps the extension host permissions and Content Security Policy unchanged.

## Audio

`SpeechAudioProvider` waits for asynchronous voice discovery and listens once for `voiceschanged`, filters actual English system voices, selects the saved name or requested locale when available, and falls back to another reported English voice. `play` cancels any queued utterance first. Overlay close stops speech. Missing voices produce a user-facing troubleshooting message.

The exercise schema already permits a future `audioUrl`; static recorded audio can implement the same `AudioProvider` contract later.

## Scheduling

The local selector scores due reviews, weak skills with sufficient evidence, selected topics, difficulty fit, waiting-time fit, recent-item avoidance, and seeded variety. The supplied seed makes tests repeatable. Review intervals expand on correct answers and reset to one day after a miss. Adaptive difficulty uses recent accuracy and moves at most one level.

## Storage and retention

`StorageRepository` separates schema version, settings, detailed sessions, reviews, generated packs, runtime sprint state, and aggregates. `CURRENT_SCHEMA_VERSION` is 2; version 1 migrates by adding an empty generated-pack collection and an opt-in personalization setting. Imports pass a strict runtime schema before writes. Detailed history is capped at 500 sessions; aggregate total time and completions are preserved. Future migrations are added as explicit version-to-version functions inside `migrateStorage`.

## Security boundaries

The Manifest V3 policy allows self-hosted extension scripts only and blocks objects and external connections. The extension uses no remote code, analytics, cookies, secrets, or user HTML injection. User-controlled data is rendered as React text and never through `dangerouslySetInnerHTML`.

The web app sets a restrictive production CSP and security headers. Generation responses are `no-store`. Access identities are one-way hashed in memory, abstract text is never logged, and error responses do not expose provider details. The in-memory limiter is intentionally a best-effort demo safeguard rather than a distributed production rate limiter.
