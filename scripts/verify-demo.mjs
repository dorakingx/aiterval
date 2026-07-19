import { spawnSync } from "node:child_process";
import { access, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifactRoot = path.join(root, "artifacts", "demo");
const finalDir = path.join(artifactRoot, "final");
const verificationDir = path.join(artifactRoot, "verification");
const narrated = path.join(finalDir, "aiterval-build-week-demo-en.mp4");
const silent = path.join(finalDir, "aiterval-build-week-demo-silent.mp4");
const englishSrtPath = path.join(finalDir, "aiterval-build-week-demo-en.srt");
const japaneseSrtPath = path.join(finalDir, "aiterval-build-week-demo-ja.srt");
const thumbnail = path.join(finalDir, "aiterval-youtube-thumbnail.png");
const gallery = [1, 2, 3].map((number) =>
  path.join(finalDir, `devpost-gallery-${String(number).padStart(2, "0")}.png`),
);
const plan = JSON.parse(
  await readFile(path.join(root, "scripts", "demo-scenes.json"), "utf8"),
);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.status !== 0)
    throw new Error(
      `${command} failed: ${(result.stderr || result.stdout).trim()}`,
    );
  return result;
}

function probe(file) {
  return JSON.parse(
    run("ffprobe", [
      "-v",
      "error",
      "-show_streams",
      "-show_format",
      "-of",
      "json",
      file,
    ]).stdout,
  );
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function srtTime(value) {
  const match = value.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
  if (!match) throw new Error(`Invalid SRT timestamp: ${value}`);
  return (
    Number(match[1]) * 3600 +
    Number(match[2]) * 60 +
    Number(match[3]) +
    Number(match[4]) / 1000
  );
}

function parseSrt(source) {
  return source
    .trim()
    .split(/\r?\n\r?\n/)
    .map((block) => {
      const lines = block.split(/\r?\n/);
      const [start, end] = lines[1].split(" --> ");
      return {
        start: srtTime(start),
        end: srtTime(end),
        text: lines.slice(2).join(" "),
      };
    });
}

for (const file of [
  narrated,
  silent,
  englishSrtPath,
  japaneseSrtPath,
  thumbnail,
  ...gallery,
])
  await access(file);
const narratedProbe = probe(narrated);
const silentProbe = probe(silent);
const duration = Number(narratedProbe.format.duration);
const video = narratedProbe.streams.find(
  (stream) => stream.codec_type === "video",
);
const audio = narratedProbe.streams.find(
  (stream) => stream.codec_type === "audio",
);

assert(
  duration >= 145 && duration <= 170,
  `Duration ${duration}s is outside 2:25–2:50`,
);
assert(duration < 180, "Duration is not strictly below three minutes");
assert(
  Math.abs(duration - plan.durationSeconds) <= 0.25,
  "Duration differs from the scene plan",
);
assert(
  video?.width === 1920 && video?.height === 1080,
  "Video is not 1920x1080",
);
assert(
  video?.codec_name === "h264",
  `Unexpected video codec: ${video?.codec_name}`,
);
assert(
  video?.pix_fmt === "yuv420p",
  `Unexpected pixel format: ${video?.pix_fmt}`,
);
assert(
  video?.r_frame_rate === "30/1",
  `Unexpected frame rate: ${video?.r_frame_rate}`,
);
assert(
  audio?.codec_name === "aac",
  `Unexpected audio codec: ${audio?.codec_name}`,
);
assert(
  !silentProbe.streams.some((stream) => stream.codec_type === "audio"),
  "Silent video contains audio",
);

const englishCues = parseSrt(await readFile(englishSrtPath, "utf8"));
const japaneseCues = parseSrt(await readFile(japaneseSrtPath, "utf8"));
assert(
  englishCues.length === plan.scenes.length,
  "English caption count does not match narration scenes",
);
assert(
  japaneseCues.length === plan.scenes.length,
  "Japanese caption count does not match narration scenes",
);
for (const cues of [englishCues, japaneseCues]) {
  cues.forEach((cue, index) => {
    assert(
      cue.start >= 0 && cue.end <= duration + 0.25 && cue.start < cue.end,
      `Caption ${index + 1} timing is invalid`,
    );
    if (index)
      assert(
        cue.start >= cues[index - 1].end,
        `Caption ${index + 1} overlaps the prior cue`,
      );
  });
}
const normalize = (value) => value.replace(/\s+/g, " ").trim();
assert(
  normalize(englishCues.map((cue) => cue.text).join(" ")) ===
    normalize(plan.scenes.map((scene) => scene.narration).join(" ")),
  "English captions do not match narration source",
);
const wordCount = plan.scenes
  .map((scene) => scene.narration)
  .join(" ")
  .trim()
  .split(/\s+/).length;
assert(
  wordCount >= 235 && wordCount <= 260,
  `Narration word count ${wordCount} is outside 235–260`,
);

const black = run(
  "ffmpeg",
  [
    "-hide_banner",
    "-i",
    narrated,
    "-vf",
    "blackdetect=d=1:pix_th=0.10",
    "-an",
    "-f",
    "null",
    "-",
  ],
  { maxBuffer: 20 * 1024 * 1024 },
);
assert(
  !/black_start:/.test(black.stderr),
  "A black video section of at least one second was detected",
);
const freeze = run(
  "ffmpeg",
  [
    "-hide_banner",
    "-i",
    narrated,
    "-vf",
    "freezedetect=n=-55dB:d=12",
    "-an",
    "-f",
    "null",
    "-",
  ],
  { maxBuffer: 20 * 1024 * 1024 },
);
assert(
  !/freeze_start:/.test(freeze.stderr),
  "An unexpected frozen frame of at least twelve seconds was detected",
);
const volume = run("ffmpeg", [
  "-hide_banner",
  "-i",
  narrated,
  "-af",
  "volumedetect",
  "-vn",
  "-f",
  "null",
  "-",
]);
const meanVolume = Number(
  volume.stderr.match(/mean_volume:\s*(-?[\d.]+) dB/)?.[1],
);
assert(
  Number.isFinite(meanVolume) && meanVolume > -35 && meanVolume < -8,
  `Unexpected narration loudness: ${meanVolume} dB`,
);

await rm(verificationDir, { recursive: true, force: true });
await mkdir(verificationDir, { recursive: true });
for (const timestamp of [
  "00:10",
  "00:30",
  "01:05",
  "01:25",
  "01:45",
  "02:05",
  "02:28",
  "02:42",
]) {
  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-ss",
    timestamp,
    "-i",
    narrated,
    "-frames:v",
    "1",
    path.join(verificationDir, `${timestamp.replace(":", "-")}.png`),
  ]);
}

const textFiles = [
  path.join(artifactRoot, "recorded-text.txt"),
  path.join(artifactRoot, "record-demo.log"),
  path.join(artifactRoot, "render-demo.log"),
  path.join(finalDir, "youtube-metadata.txt"),
  path.join(finalDir, "devpost-final-en.md"),
  path.join(finalDir, "devpost-private-fields-checklist.txt"),
  englishSrtPath,
  japaneseSrtPath,
];
const forbidden = [
  [/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b/, "API credential pattern"],
  [
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    "UUID/Session ID pattern",
  ],
  [/\/Users\//, "local absolute path"],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, "email address"],
  [/DEMO_ACCESS_CODE\s*=/, "access-code assignment"],
  [/speech stops automatically/i, "obsolete interruption claim"],
  [/exercises? (?:are|is) generated at runtime/i, "runtime generation claim"],
];
for (const file of textFiles) {
  const source = await readFile(file, "utf8");
  for (const [pattern, label] of forbidden)
    assert(!pattern.test(source), `${label} found in ${path.basename(file)}`);
}

let binaryText = "";
for (const file of [narrated, silent, thumbnail, ...gallery]) {
  binaryText += run("strings", [file]).stdout;
}
for (const [pattern, label] of [
  forbidden[0],
  forbidden[1],
  forbidden[2],
  forbidden[4],
])
  assert(!pattern.test(binaryText), `${label} found in media strings`);

const thumbnailProbe = probe(thumbnail).streams.find(
  (stream) => stream.codec_type === "video",
);
assert(
  thumbnailProbe?.width === 1280 && thumbnailProbe?.height === 720,
  "Thumbnail is not 1280x720",
);
for (const image of gallery) {
  const imageProbe = probe(image).streams.find(
    (stream) => stream.codec_type === "video",
  );
  assert(
    imageProbe?.width === 1920 && imageProbe?.height === 1080,
    `${path.basename(image)} is not 1920x1080`,
  );
}

process.stdout.write(
  `Verified ${duration.toFixed(3)}s, 1920x1080, 30 fps, H.264/yuv420p, AAC narration, silent alternate, ${wordCount} narration words, clean privacy/claim scans, and eight review frames.\n`,
);
