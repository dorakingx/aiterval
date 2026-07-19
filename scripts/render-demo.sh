#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RAW_DIR="$REPO_ROOT/artifacts/demo/raw"
WORK_DIR="$REPO_ROOT/artifacts/demo/work"
FINAL_DIR="$REPO_ROOT/artifacts/demo/final"

mkdir -p "$WORK_DIR" "$FINAL_DIR"

names=(01-intro 02-judge 03-ai-ready 04-dashboard 05-privacy 06-development 07-closing)
durations=(16 42 32 25 20 23 10)
offsets=(0 0 0 0 0 0 0)

for index in "${!names[@]}"; do
  input="$RAW_DIR/${names[$index]}.webm"
  output="$WORK_DIR/${names[$index]}.mp4"
  duration="${durations[$index]}"
  offset="${offsets[$index]}"
  test -s "$input"
  ffmpeg -hide_banner -loglevel warning -y -i "$input" \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=#fffdf7,setsar=1,fps=30,tpad=stop_mode=clone:stop_duration=${duration},trim=start=${offset}:duration=${duration},setpts=PTS-STARTPTS,format=yuv420p" \
    -an -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p "$output"
done

CONCAT_FILE="$WORK_DIR/concat.txt"
: > "$CONCAT_FILE"
for name in "${names[@]}"; do
  printf "file '%s/%s.mp4'\n" "$WORK_DIR" "$name" >> "$CONCAT_FILE"
done

SILENT="$FINAL_DIR/aiterval-build-week-demo-silent.mp4"
NARRATED="$FINAL_DIR/aiterval-build-week-demo-en.mp4"
ffmpeg -hide_banner -loglevel warning -y -f concat -safe 0 -i "$CONCAT_FILE" \
  -c copy -movflags +faststart "$SILENT"

node "$SCRIPT_DIR/render-demo-audio.mjs"
ffmpeg -hide_banner -loglevel warning -y -i "$SILENT" -i "$WORK_DIR/mixed-audio.m4a" \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest \
  -movflags +faststart "$NARRATED"

cp "$REPO_ROOT/docs/video/captions-en.srt" "$FINAL_DIR/aiterval-build-week-demo-en.srt"
cp "$REPO_ROOT/docs/video/captions-ja.srt" "$FINAL_DIR/aiterval-build-week-demo-ja.srt"

node "$SCRIPT_DIR/render-demo-assets.mjs"

for item in "01:00:30" "02:01:15" "03:01:43"; do
  number="${item%%:*}"
  timestamp="${item#*:}"
  ffmpeg -hide_banner -loglevel warning -y -ss "$timestamp" -i "$NARRATED" \
    -frames:v 1 -update 1 "$FINAL_DIR/devpost-gallery-$number.png"
done

voice="$(tr -d '\r\n' < "$WORK_DIR/narration-voice.txt")"
duration="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$NARRATED")"
cat > "$FINAL_DIR/youtube-metadata.txt" <<EOF
Title: AIterval — Turn AI Waiting Time into English Listening Practice

Description:
AIterval is a local-first Chrome extension that turns 15–90 seconds of AI waiting time into one focused English listening exercise. The submitted v0.2.1 runtime includes 132 original pre-authored exercises, works without an API key, and keeps progress in the browser.

Public demo: https://aiterval-build-week.vercel.app/demo/judge
Repository: https://github.com/dorakingx/aiterval
Release: https://github.com/dorakingx/aiterval/releases/tag/v0.2.1

Built for OpenAI Build Week — Education. Codex with GPT-5.6 supported design, implementation, testing, security, deployment, and release work. GPT-5.6 is not a runtime exercise generator in the submitted product.

Narration voice: $voice
Duration seconds: $duration
Resolution: 1920x1080 at 30 fps
Video: H.264, yuv420p, fast start
Audio: AAC narration with low-volume exercise speech; no music
EOF

cp "$REPO_ROOT/docs/devpost-submission-en.md" "$FINAL_DIR/devpost-final-en.md"
cat > "$FINAL_DIR/devpost-private-fields-checklist.txt" <<'EOF'
DEVPOST PRIVATE FIELDS — MANUAL ONLY

[ ] Paste the primary Codex task /feedback Session ID into Devpost's private Session ID field.
[ ] Upload the narrated MP4 to YouTube as Public.
[ ] Paste the resulting public YouTube URL into the Devpost video field.
[ ] Confirm that no judge access code is requested or supplied; none exists.
[ ] Proofread all public fields and submit before the deadline.

Never paste the private Session ID into the repository, video, subtitles, screenshots, YouTube metadata, or public description.
EOF

printf 'Rendered narrated and silent demo artifacts and submission package.\n'
