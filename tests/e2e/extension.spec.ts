import { chromium, expect, test, type BrowserContext } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const extensionPath = path.resolve("apps/extension/.output/chrome-mv3");
const fixtureRoot = path.resolve("test-fixtures");
let context: BrowserContext;

async function extensionId(): Promise<string> {
  let worker = context.serviceWorkers()[0];
  worker ??= await context.waitForEvent("serviceworker");
  return new URL(worker.url()).host;
}

async function openFixture(site: "chatgpt" | "claude" | "gemini") {
  const hosts = {
    chatgpt: "chatgpt.com",
    claude: "claude.ai",
    gemini: "gemini.google.com",
  };
  const page = await context.newPage();
  await page.route(`https://${hosts[site]}/**`, async (route) =>
    route.fulfill({
      contentType: "text/html",
      body: await readFile(path.join(fixtureRoot, site, "index.html"), "utf8"),
    }),
  );
  await page.goto(`https://${hosts[site]}/fixture`);
  return page;
}

test.beforeAll(async () => {
  context = await chromium.launchPersistentContext("", {
    channel: "chromium",
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
});
test.afterAll(async () => {
  await context.close();
});

for (const site of ["chatgpt", "claude", "gemini"] as const) {
  test(`${site} generation opens one isolated sprint and pauses when ready`, async () => {
    const page = await openFixture(site);
    const host = page.locator("#aiterval-shadow-host");
    await expect(host).toHaveCount(1, { timeout: 8_000 });
    await expect(
      host.getByRole("button", { name: "Play audio" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Finish generation" }).click();
    await expect(host.getByText("Your AI is ready")).toBeVisible({
      timeout: 3_000,
    });
    await page.close();
  });
}

test("duplicate mutations and SPA navigation never create duplicate overlays", async () => {
  const page = await openFixture("chatgpt");
  const host = page.locator("#aiterval-shadow-host");
  await expect(host).toHaveCount(1, { timeout: 8_000 });
  await page.getByRole("button", { name: "Duplicate mutations" }).click();
  await page.getByRole("button", { name: "SPA navigation" }).click();
  await expect(host).toHaveCount(1);
  await page.close();
});

test("the keyboard command's manual route works when auto-start is disabled", async () => {
  const id = await extensionId();
  const dashboard = await context.newPage();
  await dashboard.goto(`chrome-extension://${id}/options.html`);
  const autoToggle = dashboard.getByRole("checkbox", {
    name: "Auto-start globally",
  });
  if (await autoToggle.isChecked()) await autoToggle.uncheck({ force: true });
  await dashboard.close();
  const page = await openFixture("chatgpt");
  await page.waitForTimeout(1_000);
  await expect(page.locator("#aiterval-shadow-host")).toHaveCount(0);
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker"));
  await worker.evaluate(async () => {
    const [tab] = await chrome.tabs.query({ url: "https://chatgpt.com/*" });
    if (!tab?.id) throw new Error("Fixture tab not found");
    await chrome.tabs.sendMessage(tab.id, { type: "AIT_START_MANUAL" });
  });
  await expect(page.locator("#aiterval-shadow-host")).toHaveCount(1, {
    timeout: 3_000,
  });
  const manifest = JSON.parse(
    await readFile(path.join(extensionPath, "manifest.json"), "utf8"),
  ) as {
    commands: Record<
      string,
      { suggested_key: { default: string; mac: string } }
    >;
  };
  expect(manifest.commands["start-sprint"]?.suggested_key).toEqual({
    default: "Ctrl+Shift+L",
    mac: "Command+Shift+L",
  });
  await page.close();
});

test("popup and dashboard render persisted local metrics", async () => {
  const id = await extensionId();
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${id}/popup.html`);
  await expect(
    popup.getByRole("button", { name: "Start a Listening Sprint" }),
  ).toBeVisible();
  const dashboard = await context.newPage();
  await dashboard.goto(`chrome-extension://${id}/options.html`);
  await expect(
    dashboard.getByRole("heading", { name: "Small sprints. Real progress." }),
  ).toBeVisible();
  await expect(
    dashboard.getByRole("heading", { name: "History" }),
  ).toBeVisible();
  await popup.close();
  await dashboard.close();
});
