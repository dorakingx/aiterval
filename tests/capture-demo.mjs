import { chromium } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const output = path.resolve("artifacts/demo");
const temporaryVideoDirectory = await mkdtemp(
  path.join(os.tmpdir(), "aiterval-demo-"),
);
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: {
    dir: temporaryVideoDirectory,
    size: { width: 1440, height: 900 },
  },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const video = page.video();

await page.goto("http://127.0.0.1:3000/demo/judge", {
  waitUntil: "networkidle",
});
await page.waitForTimeout(1_500);
await page.getByRole("button", { name: "Send prompt and try it" }).click();
await page.getByRole("button", { name: "Play audio" }).click();
await page.getByText("Your AI is ready").waitFor({ timeout: 12_000 });
await page.waitForTimeout(1_000);
await page.getByRole("button", { name: "Finish this question" }).click();
await page.getByRole("button", { name: /check the calibration/i }).click();
await page.getByRole("button", { name: "Check answer" }).click();
await page.waitForTimeout(1_500);
await page.getByRole("button", { name: "Complete sprint" }).click();
await page.waitForTimeout(1_500);

await page.goto("http://127.0.0.1:3000/lecture", {
  waitUntil: "networkidle",
});
await page.waitForTimeout(1_000);
await page.getByRole("button", { name: "Try the no-key sample" }).click();
await page.getByText("Curated sample—not a live GPT-5.6 call").waitFor();
await page.waitForTimeout(3_000);
await page.getByRole("button", { name: "日本語" }).click();
await page.waitForTimeout(2_000);

await page.close();
if (!video) throw new Error("Playwright video recording was unavailable");
await video.saveAs(
  path.join(output, "aiterval-real-product-silent-draft.webm"),
);
await context.close();
await browser.close();
await rm(temporaryVideoDirectory, { recursive: true, force: true });
