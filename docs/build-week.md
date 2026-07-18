# OpenAI Build Week evidence

This file records verifiable repository evidence for AIterval. Dates below are Git author timestamps; no timestamps were edited for this document.

## Official period

The official rules state that the Submission Period opened **July 13, 2026 at 9:00 AM Pacific Time** and closes **July 21, 2026 at 5:00 PM Pacific Time** (July 22 at 9:00 AM JST). Sources: [official rules](https://openai.devpost.com/rules) and [FAQ](https://openai.devpost.com/details/faqs).

## Git timeline

| Commit                                                                                             | Author timestamp        | Evidence                                                                                           |
| -------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------- |
| [`3763d2c`](https://github.com/dorakingx/aiterval/commit/3763d2c73fc9624929e6d3ebb3c57dd8ac0625ee) | 2026-07-18 16:25:11 JST | Initial extension, local exercise library, wait adapters, web app, tests, CI, and release workflow |
| [`384b961`](https://github.com/dorakingx/aiterval/commit/384b961db0d5223b517ebb561a8bbf2141769408) | 2026-07-18 16:35:11 JST | Private Sites deployment build                                                                     |
| [`b6f68a3`](https://github.com/dorakingx/aiterval/commit/b6f68a38ed6cc64fb51f337fe383012e9bdf6790) | 2026-07-18 16:38:21 JST | Sites worker dependency packaging fix                                                              |
| [`b352fe4`](https://github.com/dorakingx/aiterval/commit/b352fe41b7c115ac8d3ef4b7ecc01627097d7295) | 2026-07-18 16:50:53 JST | Static web package fix                                                                             |
| [`d09b098`](https://github.com/dorakingx/aiterval/commit/d09b0987322074d7fad27a2ea22133d53e6257a7) | 2026-07-18 20:30:04 JST | GPT-5.6 Lecture-to-Sprints, generated packs, judge route, privacy controls, and expanded tests     |
| [`25e2884`](https://github.com/dorakingx/aiterval/commit/25e28841310a39dcd463d82602c42512b7a1a1da) | 2026-07-18 20:47:50 JST | Build Week evidence, Devpost/video package, real screenshots, silent demo, and feedback path       |
| [`ae0d63e`](https://github.com/dorakingx/aiterval/commit/ae0d63effe95e7b58274d9a6839e5125fc3dd73a) | 2026-07-18 20:53:49 JST | Dependency audit remediation and optional GPT-5.6 smoke-command repair                             |
| [`9e790dc`](https://github.com/dorakingx/aiterval/commit/9e790dc8cbe0862840dd4383f50f74dcbefd3e96) | 2026-07-18 21:01:44 JST | Reproducible extension ZIP packaging and verified judge-guide checksum                             |

`git log --reverse --format='%H|%aI|%s' --all` shows no earlier AIterval commit. On the available repository evidence, the project began during the Submission Period; nothing in this repository predates it.

## What the GPT-5.6 upgrade added

- A deliberate lecture-input workflow and a server-only OpenAI Responses API call.
- GPT-5.6-family model enforcement and Zod-backed Structured Outputs.
- Double validation, provenance, one bounded schema retry, cancellation, timeout, rate limits, and a daily demo quota.
- A no-login public judge experience with explicitly curated sample data.
- A schema-validated web export/extension import boundary, local pack lifecycle, and generated-exercise scheduling.
- Aggregate-only, opt-in personalization; raw sessions, AI prompts, and AI responses are never sent.
- API, schema, component, storage migration, and Chromium E2E coverage.

## Build and deployment evidence

The release tag workflow installs from the lockfile on Node 22, runs lint/type/unit/build checks, packages the Chrome extension, creates a SHA-256 file, and attaches both artifacts to GitHub Releases. The final public deployment and release URLs are recorded in the judge guide and release notes after verification.

Reproduce locally with:

```bash
git show --no-patch --format=fuller 3763d2c d09b098
pnpm install --frozen-lockfile
pnpm check
```

Sample mode is not evidence of a live model call. Live GPT-5.6 generation is available only on deployments configured with server-side credentials; the final status report states whether that configuration was present during verification.
