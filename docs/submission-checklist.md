# OpenAI Build Week submission checklist

## Product and evidence

- [x] Education category selected in drafts.
- [x] Entire Git history falls within the official Submission Period.
- [x] GPT-5.6 is central to Lecture-to-Sprints and uses Responses API Structured Outputs.
- [x] No-login sample judge path exists.
- [x] Private live path is access-code and quota protected.
- [x] Extension ZIP/release workflow and install guide exist.
- [x] Confirm final public deployment and release URLs after publishing.
- [ ] Run five real user tests and record only observed results.

## Devpost

- [ ] Paste and proofread `docs/devpost-submission-en.md`.
- [ ] Select **Education**.
- [ ] Add the public demo URL and public repository URL.
- [ ] Put the judge access code only in private testing instructions.
- [ ] Submit the primary Codex task `/feedback` Session ID privately through Devpost; never commit it or include it in screenshots, bundles, or video.
- [ ] Upload a public YouTube video under three minutes with audible narration.
- [ ] Confirm the final submission before **July 21, 2026 at 5:00 PM PT / July 22 at 9:00 AM JST**.

## Public repository access

- [ ] Confirm <https://github.com/dorakingx/aiterval> opens while signed out.
- [ ] Confirm the `v0.2.0` release and both assets download while signed out.
- [ ] Confirm the repository contains neither the private judge access code nor the `/feedback` Session ID in its current tree.
- [ ] Keep both private values only in Devpost's private testing/submission fields.

## Video and privacy

- [ ] Record only real product screens; do not expose keys, code, notifications, or personal data.
- [ ] Verify narration and captions against the final UI.
- [ ] Upload to YouTube as **Public** (not unlisted/private if the rules require public visibility).
- [ ] Confirm runtime is below 3:00.
- [ ] Confirm sample mode is described as sample and no unsupported live-call claim appears.

## Final technical review

- [ ] CI green on `main` and `v0.2.0`.
- [ ] Release ZIP checksum matches locally.
- [ ] Public URL works in a signed-out/incognito browser on desktop and mobile width.
- [ ] Secret and production-client-bundle scans are clean.
- [ ] Broken links, privacy link, install guide, Japanese/English UI, keyboard, and reduced-motion checks pass.
- [ ] Devpost private instructions contain the tested access code and no public document does.
- [ ] Devpost contains the `/feedback` Session ID privately and no public document does.
