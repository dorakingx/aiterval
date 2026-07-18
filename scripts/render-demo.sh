#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RAW_DIR="$REPO_ROOT/artifacts/demo/raw"
WORK_DIR="$REPO_ROOT/artifacts/demo/work"
FINAL_DIR="$REPO_ROOT/artifacts/demo/final"

mkdir -p "$WORK_DIR" "$FINAL_DIR"

names=(01-intro 02-judge 03-extension-dashboard 04-privacy 05-development 06-closing)
durations=(15 40 55 20 25 10)
offsets=(0 0 8 0 0 1.5)

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

ffmpeg -hide_banner -loglevel warning -y -ss 10 -i "$NARRATED" -frames:v 1 \
  -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=#fffdf7" \
  -update 1 \
  "$FINAL_DIR/thumbnail.png"

voice="$(tr -d '\r\n' < "$WORK_DIR/narration-voice.txt")"
duration="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$NARRATED")"
cat > "$FINAL_DIR/metadata.txt" <<EOF
Title: AIterval — OpenAI Build Week Education Demo
Runtime scope: 132 original pre-authored exercises; no runtime AI generation
Narration voice: $voice
Duration seconds: $duration
Resolution: 1920x1080
Frame rate: 30 fps
Video: H.264, yuv420p, fast start
Audio: AAC narration with low-volume exercise speech; no music
Public demo: https://aiterval-build-week.vercel.app/demo/judge
Repository: https://github.com/dorakingx/aiterval
EOF

printf 'Rendered narrated and silent demo artifacts.\n'
