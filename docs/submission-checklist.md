# OpenAI Build Week submission checklist

## Product and evidence

- [x] Education category selected in drafts.
- [x] Entire Git history falls within the official Submission Period.
- [x] Submitted runtime uses 132 original pre-authored exercises only.
- [x] No-login, no-key public judge path exists.
- [x] Runtime generation path is archived and production variables are removed.
- [x] Extension ZIP/release workflow and install guide exist.
- [ ] Run five real user tests and record only observed results.

## Devpost

- [ ] Paste and proofread `docs/devpost-submission-en.md`.
- [ ] Select **Education**.
- [ ] Add the public demo, repository, and reviewed video URLs.
- [ ] Submit the primary Codex task `/feedback` Session ID privately through
      Devpost; never commit it or include it in screenshots, bundles, or video.
- [ ] Upload the reviewed video to YouTube manually; keep it under three minutes.
- [ ] Confirm the final submission before the official deadline.

## Public access

- [x] Confirm the public repository opens while signed out.
- [x] Confirm the v0.2.0 release and both assets are public.
- [x] Confirm the release ZIP checksum.
- [ ] Reconfirm the final production deployment while signed out.

## Video and privacy

- [x] Recorder uses headless Playwright, the real product, and deterministic fixtures.
- [x] Narration identifies all exercises as pre-authored.
- [x] No personal account, microphone, camera, copyrighted music, or live API call.
- [ ] Review the final English and Japanese captions.
- [ ] Confirm runtime is strictly below 3:00 and all verification checks pass.
- [ ] Upload to YouTube manually; automation must not access the account.

## Final technical review

- [ ] CI green on final `main`.
- [ ] Public judge demo uses the 132-exercise flow without login or a key.
- [ ] `/lecture` redirects and the generation API remains archived.
- [ ] Secret, production-bundle, video-frame, subtitle, narration, log, and metadata scans are clean.
- [ ] ZIP checksum and v0.2.0 tag/release remain unchanged.
- [ ] Devpost contains the `/feedback` Session ID privately and no public artifact does.
