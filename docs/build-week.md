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

## Privacy-only history maintenance

After the repository became public, a scoped documentation-only history rewrite replaced a private feedback identifier with private-submission wording. Only `refs/heads/main` was rewritten. Author and committer identities and timestamps were preserved for the two rewritten documentation commits:

- [`145aa94`](https://github.com/dorakingx/aiterval/commit/145aa946e93a505c7e3023ec05ed188fb2041b59) records the private feedback-submission boundary.
- [`209f93c`](https://github.com/dorakingx/aiterval/commit/209f93c750c264e13f6f15062cb733590da308d2) records the public-repository documentation guidance.

The feature branch, annotated `v0.2.0` tag, tagged release commit, product source, release assets, and earlier Build Week evidence commits were not rewritten. The verified extension ZIP remains reproducible with SHA-256 `7e2bc8ed9195820aa526b3be0fd2de593c23a8a5d465693ca12a73b3f726bb58`.

## Development experiment and final scope

The Git timeline records a GPT-5.6 runtime-generation experiment developed during
the official period. The final submission direction subsequently archived that
experience. The submitted product uses the 132 original pre-authored exercises;
the public lecture route redirects, the generation endpoint returns HTTP 410,
and the Vercel production project has no model, API-key, judge-code, or quota
variables.

Codex with GPT-5.6 remains an honest development tool: it helped implement and
refine the architecture, adapters, state machine, UI, tests, security controls,
deployment, and evidence. It is not a runtime exercise source for the submitted
experience.

## Build and deployment evidence

The release tag workflow installs from the lockfile on Node 22, runs lint/type/unit/build checks, packages the Chrome extension, creates a SHA-256 file, and attaches both artifacts to GitHub Releases. The final public deployment and release URLs are recorded in the judge guide and release notes after verification.

Reproduce locally with:

```bash
git show --no-patch --format=fuller 3763d2c d09b098
pnpm install --frozen-lockfile
pnpm check
```

The final public judge path is deterministic, signed-out, and pre-authored. It
makes no paid model call.
