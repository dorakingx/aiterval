import { spawnSync } from "node:child_process";
import { readdirSync, rmSync, statSync, utimesSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const buildDirectory = path.join(
  root,
  "apps",
  "extension",
  ".output",
  "chrome-mv3",
);
const zipPath = path.join(
  root,
  "apps",
  "extension",
  ".output",
  "aitervalextension-0.2.0-chrome.zip",
);
const fixedTime = new Date("2000-01-01T00:00:00.000Z");

function filesBelow(directory, prefix = "") {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(prefix, entry.name);
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(absolute, relative) : [relative];
  });
}

const files = filesBelow(buildDirectory).sort();
for (const relative of files) {
  const absolute = path.join(buildDirectory, relative);
  if (!statSync(absolute).isFile()) continue;
  utimesSync(absolute, fixedTime, fixedTime);
}
rmSync(zipPath, { force: true });
const result = spawnSync("zip", ["-X", "-q", zipPath, ...files], {
  cwd: buildDirectory,
  encoding: "utf8",
  env: { ...process.env, TZ: "UTC" },
});
if (result.status !== 0)
  throw new Error(result.stderr || "Deterministic ZIP packaging failed");
console.log(`Repacked deterministic release ZIP with ${files.length} files.`);
