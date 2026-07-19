# Automated recording checklist

## Before recording

- [ ] Clean `main` equals `origin/main`; v0.2.1 tags and release assets are unchanged.
- [ ] The signed-out v0.2.1 ZIP SHA-256 is
      `92bca4f885e99519fcda0ad02b077b4c90e25ffb303d086bc9d53a168715e95d`.
- [ ] Production judge, privacy, repository, release, and Actions pages work.
- [ ] Production contains no runtime generation, key, access-code, or quota claim.

## Record and render

Run the recorder as a background child while keeping its supervising shell and
PID until the child exits:

```bash
pnpm demo:record > artifacts/demo/record-demo.log 2>&1 &
RECORD_PID=$!
wait "$RECORD_PID"
```

Then run:

```bash
pnpm demo:render > artifacts/demo/render-demo.log 2>&1
pnpm demo:verify
```

The recorder loads an extracted copy of the checksum-verified v0.2.1 release
ZIP. A controlled local speech probe makes the AI-ready continuation state
deterministic without opening a personal AI account.

## Automated verification

- [ ] Duration is 2:25–2:50 and strictly under 3:00.
- [ ] 1920×1080, 30 fps, H.264, yuv420p, fast-start MP4.
- [ ] Narrated version contains audible AAC; silent version contains no audio.
- [ ] No black section ≥1 second or unplanned unchanged frame ≥12 seconds.
- [ ] Captions match the 258-word narration and fit within the duration.
- [ ] Text, logs, metadata, and frames contain no credential, UUID/Session ID,
      access code, email, browser error, or local absolute path.
- [ ] Runtime exercise-generation claims are absent.
- [ ] Thumbnail is 1280×720 and galleries are 1920×1080.

## Visual review

Inspect frames at 00:10, 00:30, 01:05, 01:25, 01:45, 02:05, 02:28, and
02:42. Confirm that the v0.2.1 ready notice is readable; playback controls remain
available; the fixture is labeled; archived Lecture-to-Sprints UI is absent;
light surfaces remain legible; no private data is visible; and the thumbnail is
readable at small size.

Allow at most three complete rendering attempts. YouTube upload and Devpost
submission remain manual.
