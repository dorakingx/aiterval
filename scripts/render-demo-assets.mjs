import { chromium } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const finalDir = path.join(root, "artifacts", "demo", "final");
const workDir = path.join(root, "artifacts", "demo", "work");
const narrated = path.join(finalDir, "aiterval-build-week-demo-en.mp4");
const background = path.join(workDir, "thumbnail-background.png");
const output = path.join(finalDir, "aiterval-youtube-thumbnail.png");

const extraction = spawnSync(
  "ffmpeg",
  [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-ss",
    "65",
    "-i",
    narrated,
    "-frames:v",
    "1",
    "-vf",
    "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=#fffdf7",
    "-update",
    "1",
    background,
  ],
  { encoding: "utf8" },
);
if (extraction.status !== 0) {
  throw new Error(`Thumbnail frame extraction failed: ${extraction.stderr}`);
}

const image = (await readFile(background)).toString("base64");
const browser = await chromium.launch({ channel: "chromium", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box}body{margin:0;width:1280px;height:720px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#172638}
  .capture{position:absolute;inset:0;background:url(data:image/png;base64,${image}) center/cover no-repeat;filter:saturate(.88) contrast(1.03)}
  .shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(23,38,56,.96) 0%,rgba(23,38,56,.82) 43%,rgba(23,38,56,.08) 77%)}
  main{position:absolute;left:62px;top:66px;width:650px;color:#fffdf7;text-shadow:0 3px 24px rgba(0,0,0,.25)}
  .brand{font-size:25px;font-weight:850;letter-spacing:.14em;text-transform:uppercase;color:#f7cfc3}
  h1{margin:24px 0 22px;font-size:68px;line-height:.98;letter-spacing:-.045em}p{margin:0;width:max-content;padding:12px 18px;border-radius:999px;background:#fffdf7;color:#8e3c2a;font-size:25px;font-weight:850;letter-spacing:.035em}
</style></head><body><div class="capture"></div><div class="shade"></div><main><div class="brand">AIterval · Education</div><h1>AI WAIT →<br>ENGLISH PRACTICE</h1><p>132 PRE-AUTHORED EXERCISES</p></main></body></html>`);
await page.screenshot({ path: output, type: "png" });
await browser.close();
