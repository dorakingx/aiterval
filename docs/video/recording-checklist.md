# Automated recording checklist

## Before recording

- [ ] Clean `main` equals `origin/main` and the production alias is Ready.
- [ ] Public judge, privacy, feedback, repository, release, and Actions are available.
- [ ] `pnpm build` and `pnpm zip:extension` succeeded.
- [ ] `/lecture` redirects and `/api/generate-sprints` returns archived status.
- [ ] Production contains no OpenAI/model/access/quota variables.

## Record and render

```bash
nohup pnpm demo:record > artifacts/demo/record-demo.log 2>&1 &
RECORD_PID=$!
```

Capture the PID, poll until completion, and fail on a non-zero exit. Then run:

```bash
pnpm demo:render > artifacts/demo/render-demo.log 2>&1
pnpm demo:verify
```

The recorder loads the real public demo and the real packaged extension in
headless Chromium. Third-party AI pages are replaced by repository fixtures.

## Automated verification

- [ ] Duration is 2:25–2:50 and strictly under 3:00.
- [ ] 1920×1080, 30 fps, H.264, yuv420p, fast-start MP4.
- [ ] Narrated version contains normalized AAC audio; silent version has none.
- [ ] No black section ≥1 second or unplanned unchanged frame ≥12 seconds.
- [ ] Captions match the narration source and stay within the video duration.
- [ ] Recorded page text and logs contain no credential, UUID/Session ID, email,
      notification content, or local absolute path.
- [ ] Browser error-page phrases are absent.
- [ ] Thumbnail is 1280×720.

## Visual review

Inspect frames at 00:10, 00:30, 01:00, 01:30, 02:00, and 02:35. Confirm the UI
is readable, no private data is visible, the extension fixture has its
deterministic-environment caption, no Lecture-to-Sprints surface appears, and
the thumbnail remains legible at YouTube size.

Allow at most three complete rendering attempts. Do not upload to YouTube from
this workflow; account access and final upload remain manual.
