# OpenAI Build Week submission checklist

## Product and evidence

- [x] Education category selected in drafts.
- [x] Entire Git history falls within the official Submission Period.
- [x] GPT-5.6 is central to Lecture-to-Sprints and uses Responses API Structured Outputs.
- [x] No-login sample judge path exists.
- [x] Private live path is access-code and quota protected.
- [x] Extension ZIP/release workflow and install guide exist.
- [ ] Confirm final public deployment and release URLs after publishing.
- [ ] Run five real user tests and record only observed results.

## Devpost

- [ ] Paste and proofread `docs/devpost-submission-en.md`.
- [ ] Select **Education**.
- [ ] Add the public demo URL and private repository URL.
- [ ] Put the judge access code only in private testing instructions.
- [ ] Run `/feedback` in the primary Codex task and paste the real Session ID into the three required locations.
- [ ] Upload a public YouTube video under three minutes with audible narration.
- [ ] Confirm the final submission before **July 21, 2026 at 5:00 PM PT / July 22 at 9:00 AM JST**.

## Private repository judge access

The [official rules](https://openai.devpost.com/rules) require private repositories to be shared with `testing@devpost.com` and `build-week-event@openai.com`. GitHub collaborator invitation by email is not safely supported by the current CLI flow, so complete this manually without changing repository visibility:

1. Open `https://github.com/dorakingx/aiterval/settings/access` while signed in as the owner.
2. Select **Add people**.
3. Invite `testing@devpost.com`.
4. Repeat for `build-week-event@openai.com`.
5. Confirm both invitations appear as pending/accepted collaborators.
6. Keep the repository private and record completion in the private submission notes.

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
