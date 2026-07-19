# AIterval — Devpost submission (English)

## Project name and category

**AIterval**  
**Category:** Education  
**Tagline:** Turn AI waiting time into English listening practice.

## Short description

AIterval is a local-first Chrome extension that turns 15–90 seconds of AI
waiting time into one focused English listening sprint. The submitted experience
uses 132 original pre-authored exercises, works without an OpenAI API key, and
keeps learning progress in the browser.

## Inspiration

At an international summer school, I struggled to follow English lectures and
conversations. As a researcher, I had little dedicated study time. At the same
time, I repeatedly waited for AI tools to finish. AIterval connects those two
problems by turning time already lost into a small learning habit.

## What it does

AIterval detects visible generation state through narrow semantic controls such
as busy states and stop-generation buttons. It never reads a prompt or response.
After the wait threshold, one short exercise appears. The learner listens and
answers; when the AI is ready, AIterval notifies them without cutting off the
current sentence. They can finish the question or return to the AI immediately.

The library contains 132 original exercises across practical and academic
listening skills. Progress, review scheduling, weak-skill signals, settings, and
recovered-time totals remain local. No runtime AI exercise generation is part of
the submitted product.

## How it was built

The monorepo uses WXT, React, TypeScript, Chrome Manifest V3, Next.js App Router,
Zod, Vitest, Testing Library, Playwright, pnpm, Vercel, and GitHub Actions. It
includes isolated ChatGPT, Claude, and Gemini adapters, a deterministic state
machine, Shadow DOM UI, browser speech synthesis, schema-versioned local
storage, and deterministic real-extension fixtures.

## How Codex and GPT-5.6 were used

I supplied the lived problem, product decisions, one-question interaction,
Education-track story, and privacy rules. Codex with GPT-5.6 translated those
constraints into the architecture, adapters, state machine, UI, tests,
deployment, debugging, security review, and submission evidence. It ran builds
and real Chromium tests and helped refine claims against repository evidence.

This is a development role, not a runtime product claim. The submitted extension
uses deterministic pre-authored exercises and makes no OpenAI API call.

The primary Codex task `/feedback` Session ID is submitted privately through
Devpost.

## Challenges and accomplishments

- Detecting AI work without touching conversation content across changing sites.
- Separating AI readiness from the learning state so speech is not cut off.
- Delivering 132 original exercises without accounts, remote content, or an API.
- Keeping progress local while supporting review and weak-skill prioritization.
- Testing the actual Manifest V3 extension against deterministic site fixtures.
- Shipping a signed-out public demo, public source, and verifiable release ZIP.

## What I learned

The strongest AI product boundary can be restraint. AIterval observes only the
state needed to recover waiting time; learning content and progress stay
deterministic, inspectable, and local. Codex and GPT-5.6 accelerated development
without becoming a hidden runtime dependency.

## What is next

Run the prepared five-person study, refine confusing moments from observation,
add more original exercises and adapter fixtures, evaluate recorded-audio
options, and pursue Chrome Web Store review.

## Built with

Codex, GPT-5.6 (development), TypeScript, React, Next.js, WXT, Chrome Manifest
V3, Zod, Web Speech API, Vitest, Testing Library, Playwright, pnpm, Vercel, and
GitHub Actions.

## Links

- Public demo: <https://aiterval-build-week.vercel.app/demo/judge>
- Public repository: <https://github.com/dorakingx/aiterval>
- Release: <https://github.com/dorakingx/aiterval/releases/tag/v0.2.0>

## Testing instructions

Open the signed-out judge demo, select **Send prompt and try it**, complete the
pre-authored exercise, and observe the non-destructive AI-ready notice and
recovered-time update. The release ZIP can be installed without rebuilding; detailed steps are
in `docs/judge-testing-guide.md`.

## Privacy and limitations

The extension observes generation-state controls only. It never reads prompts
or responses. Progress is stored locally, and there are no analytics, ads,
tracking pixels, or remote extension scripts. Speech voices and automatic
detection depend on the browser and changing third-party interfaces. Chrome Web
Store publication and real five-person testing remain incomplete.
