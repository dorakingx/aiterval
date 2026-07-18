import { chromium } from "@playwright/test";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "docs", "screenshots");
const extensionPath = path.join(
  root,
  "apps",
  "extension",
  ".output",
  "chrome-mv3",
);

const browser = await chromium.launch({ channel: "chromium", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(output, "home.png"), fullPage: true });
await browser.close();

const context = await chromium.launchPersistentContext("", {
  channel: "chromium",
  headless: true,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
  ],
});
let worker = context.serviceWorkers()[0];
worker ??= await context.waitForEvent("serviceworker");
const id = new URL(worker.url()).host;
const dashboard = await context.newPage();
await dashboard.setViewportSize({ width: 1440, height: 1000 });
await dashboard.goto(`chrome-extension://${id}/options.html`);
await dashboard
  .getByRole("heading", { name: "Small sprints. Real progress." })
  .waitFor();
await dashboard.screenshot({
  path: path.join(output, "dashboard.png"),
  fullPage: true,
});
await context.close();
