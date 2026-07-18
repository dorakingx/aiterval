# AIterval — Devpost submission (English)

## Project name and category

**AIterval**  
**Category:** Education  
**Tagline:** Turn AI waiting time into personalized English listening practice.

## Short description

AIterval is a local-first Chrome extension that creates one 15–90 second listening sprint while ChatGPT, Codex, Claude, or Gemini is working. GPT-5.6 turns an upcoming lecture abstract into validated, personalized exercises, so a researcher can prepare for real academic listening without finding extra study time.

## Inspiration

At an international summer school, I struggled to understand lectures and conversations in English. I also had little dedicated time to improve. At the same time, I was repeatedly waiting for AI tools to finish work. AIterval connects those two problems.

## What it does

AIterval detects a generation state through narrow semantic controls—never by reading a prompt or response—and starts one short listening exercise. When the AI is ready, speech stops immediately and the user returns to work. Progress, review scheduling, and 132 original built-in exercises remain local.

Lecture-to-Sprints makes GPT-5.6 central to the preparation loop. A user explicitly submits an upcoming lecture title or abstract, preferences, and optional terms. The server-only Responses API produces Structured Outputs compatible with AIterval’s canonical schema. The server validates them, adds provenance, and exports a pack that the extension validates again and prioritizes during future waits.

## How it was built

The monorepo uses WXT, React, TypeScript, Chrome Manifest V3, Next.js App Router, Zod, the current OpenAI JavaScript SDK, Vitest, Testing Library, and Playwright. The extension has isolated ChatGPT/Claude/Gemini adapters, a deterministic state machine, Shadow DOM UI, browser speech synthesis, local scheduling, schema-versioned storage, and migration support.

The generation endpoint enforces the GPT-5.6 family, validates bounded inputs, treats source material as untrusted, uses `responses.parse` with Zod Structured Outputs, validates again, allows one schema-only retry, sets `store: false`, and maps timeouts/429/5xx safely. A private judge code, hashed in-memory identity, per-hour limit, daily quota, and no-key sample path limit abuse and cost.

## How Codex was used

The majority of the product and this upgrade were developed in one primary Codex task. I supplied the lived problem, the one-question interaction, privacy boundaries, product priorities, Education-track story, and final direction. Codex translated that specification into architecture, adapters, schemas, React UX, tests, security controls, deployment configuration, debugging, and submission evidence. It ran real builds and Chromium tests and kept claims tied to repository/deployment evidence.

Primary task `/feedback` Session ID: **[PASTE REAL SESSION ID]**

## How GPT-5.6 was used

GPT-5.6 solves the part a fixed library cannot: converting a specific upcoming lecture topic into original listening practice matched to level, focus, locale, and duration. It is not used to decorate copy or chat. Its validated output becomes the actual exercise played inside the extension’s core wait-time loop. Public sample mode is explicitly curated and is not presented as a live model call.

## Challenges

- Detecting “AI is working” without touching conversation content across changing third-party interfaces.
- Interrupting speech promptly without disrupting the user’s real workflow.
- Preserving a no-key local product while adding an honest, server-only external generation path.
- Sharing generated packs without broadening extension network permissions or weakening CSP.
- Making model output safe enough for local scheduling through one canonical strict schema.

## Accomplishments

- A complete no-login judge journey and a two-minute install/test route.
- GPT-5.6 Structured Outputs that feed the real extension experience.
- 132 original built-in exercises that remain usable without OpenAI credentials.
- Local-first progress, review, generated-pack lifecycle, and aggregate-only opt-in personalization.
- Unit/component/API tests plus real Chromium extension and web E2E tests.
- A privacy boundary that never reads ChatGPT, Codex, Claude, or Gemini prompt/response content.

## What I learned

The most important design decision was not “add more AI.” It was deciding exactly where AI creates unique value and keeping everything else deterministic and local. GPT-5.6 is valuable before the lecture; the extension’s state machine, audio, interruption, and review loop should stay fast, inspectable, and reliable.

## What is next

Run the prepared five-person test, improve confusing moments based on observed evidence, harden the distributed demo quota for broader use, add more site adapter fixtures, test static recorded-audio options, and pursue Chrome Web Store review. Publication is not complete today.

## Built with

Codex, GPT-5.6, OpenAI Responses API, Structured Outputs, OpenAI JavaScript SDK, TypeScript, React, Next.js, WXT, Chrome Manifest V3, Zod, Web Speech API, Vitest, Testing Library, Playwright, pnpm, Vercel, and GitHub Actions.

## Links

- Public demo: <https://aiterval-build-week-doraking.vercel.app/demo/judge>
- Lecture-to-Sprints: <https://aiterval-build-week-doraking.vercel.app/lecture>
- Private repository: <https://github.com/dorakingx/aiterval>
- Release: <https://github.com/dorakingx/aiterval/releases/tag/v0.2.0>

## Testing instructions

The no-login path requires no key: open the judge demo, send the simulated prompt, complete one exercise, and observe the AI-ready interruption. Then open Lecture-to-Sprints and choose the clearly labeled sample. For live generation, enter the code supplied only in Devpost’s private testing field: **[PASTE PRIVATE JUDGE CODE IN DEVPOST ONLY]**. A local extension package and checksum are attached to the release; detailed steps are in `docs/judge-testing-guide.md`.

## Privacy and limitations

Core listening and learning data are local-first. A lecture title/abstract and selected preferences go to OpenAI only after explicit generation. AI-work prompts and responses are never read or sent. There is no analytics, ad, or tracking SDK. The sample works without credentials; live generation requires configured server credentials and is quota bounded. Speech voices and automatic detection depend on the local browser and third-party UI. Chrome Web Store publication and real five-person testing remain manual next steps.
