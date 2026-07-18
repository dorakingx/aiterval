import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workDir = path.join(root, "artifacts", "demo", "work");
const plan = JSON.parse(
  await readFile(path.join(root, "scripts", "demo-scenes.json"), "utf8"),
);
await mkdir(workDir, { recursive: true });

const voices = execFileSync("/usr/bin/say", ["-v", "?"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .map((line) => ({ name: line.trim().split(/\s+/)[0], line }));
const english = voices.filter((voice) => /\ben[_-]/i.test(voice.line));
const narrationVoice =
  english.find((voice) => voice.name === "Daniel")?.name ??
  english.find((voice) => voice.name === "Samantha")?.name ??
  english[0]?.name;
if (!narrationVoice)
  throw new Error("No English macOS system voice is available");
const exerciseVoice =
  english.find(
    (voice) => voice.name === "Samantha" && voice.name !== narrationVoice,
  )?.name ??
  english.find((voice) => voice.name !== narrationVoice)?.name ??
  narrationVoice;

const audioInputs = [];
const filters = [];
for (const [index, scene] of plan.scenes.entries()) {
  const textPath = path.join(
    workDir,
    `narration-${String(index + 1).padStart(2, "0")}.txt`,
  );
  const audioPath = path.join(
    workDir,
    `narration-${String(index + 1).padStart(2, "0")}.aiff`,
  );
  await writeFile(textPath, `${scene.narration}\n`, { mode: 0o600 });
  execFileSync("/usr/bin/say", [
    "-v",
    narrationVoice,
    "-r",
    "165",
    "-f",
    textPath,
    "-o",
    audioPath,
  ]);
  audioInputs.push("-i", audioPath);
  filters.push(
    `[${index}:a]loudnorm=I=-17:LRA=7:TP=-2,adelay=${Math.round(scene.startSeconds * 1000)}:all=1[n${index}]`,
  );
}

const exerciseTextPath = path.join(workDir, "exercise-audio.txt");
const exerciseAudioPath = path.join(workDir, "exercise-audio.aiff");
await writeFile(exerciseTextPath, `${plan.exerciseAudio.text}\n`, {
  mode: 0o600,
});
execFileSync("/usr/bin/say", [
  "-v",
  exerciseVoice,
  "-r",
  "145",
  "-f",
  exerciseTextPath,
  "-o",
  exerciseAudioPath,
]);
const exerciseIndex = plan.scenes.length;
audioInputs.push("-i", exerciseAudioPath);
filters.push(
  `[${exerciseIndex}:a]volume=0.13,afade=t=in:st=0:d=0.15,afade=t=out:st=4:d=0.4,adelay=${Math.round(plan.exerciseAudio.startSeconds * 1000)}:all=1[exercise]`,
);

const mixInputs = [
  ...plan.scenes.map((_, index) => `[n${index}]`),
  "[exercise]",
].join("");
filters.push(
  `${mixInputs}amix=inputs=${plan.scenes.length + 1}:duration=longest:normalize=0,alimiter=limit=0.95,apad=pad_dur=${plan.durationSeconds},atrim=duration=${plan.durationSeconds},afade=t=in:st=0:d=0.35,afade=t=out:st=${plan.durationSeconds - 0.6}:d=0.6[mix]`,
);

const output = path.join(workDir, "mixed-audio.m4a");
const result = spawnSync(
  "/opt/homebrew/bin/ffmpeg",
  [
    "-hide_banner",
    "-loglevel",
    "warning",
    "-y",
    ...audioInputs,
    "-filter_complex",
    filters.join(";"),
    "-map",
    "[mix]",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    output,
  ],
  { stdio: "inherit" },
);
if (result.status !== 0) throw new Error("FFmpeg audio rendering failed");
await writeFile(
  path.join(workDir, "narration-voice.txt"),
  `${narrationVoice}\n`,
  { mode: 0o600 },
);
process.stdout.write(`Narration voice: ${narrationVoice}\n`);
