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
await page.goto("http://127.0.0.1:3000/demo/judge", {
  waitUntil: "networkidle",
});
await page.screenshot({
  path: path.join(output, "judge-demo.png"),
  fullPage: true,
});
await page.goto("http://127.0.0.1:3000/lecture", {
  waitUntil: "networkidle",
});
await page.getByRole("button", { name: "Try the no-key sample" }).click();
await page.screenshot({
  path: path.join(output, "lecture-to-sprints.png"),
  fullPage: true,
});
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:3000/demo/judge", {
  waitUntil: "networkidle",
});
await page.screenshot({
  path: path.join(output, "judge-demo-mobile.png"),
  fullPage: true,
});
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
await dashboard
  .locator('#lecture-packs input[type="file"]')
  .setInputFiles(path.join(root, "test-fixtures", "generated-pack.json"));
await dashboard.getByText("Reliable experiments").waitFor();
await dashboard
  .getByRole("heading", { name: "Small sprints. Real progress." })
  .waitFor();
await dashboard.screenshot({
  path: path.join(output, "dashboard.png"),
  fullPage: true,
});
await context.close();
