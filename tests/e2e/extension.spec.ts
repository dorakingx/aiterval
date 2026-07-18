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

type FixtureTheme = "light" | "dark";

async function openFixture(
  site: "chatgpt" | "claude" | "gemini",
  theme: FixtureTheme = "light",
) {
  const hosts = {
    chatgpt: "chatgpt.com",
    claude: "claude.ai",
    gemini: "gemini.google.com",
  };
  const page = await context.newPage();
  await page.route(`https://${hosts[site]}/**`, async (route) => {
    let body = await readFile(
      path.join(fixtureRoot, site, "index.html"),
      "utf8",
    );
    if (theme === "dark") {
      body = body.replace(
        "</head>",
        `<style>
          html, body { background: #212121 !important; color: #f4f4f4 !important; }
          main { background: #2f2f2f !important; border-color: #737373 !important; }
        </style></head>`,
      );
    }
    await route.fulfill({ contentType: "text/html", body });
  });
  await page.goto(`https://${hosts[site]}/fixture`);
  return page;
}

function rgb(color: string): [number, number, number] {
  const channels = color.match(/[\d.]+/g)?.map(Number);
  if (!channels || channels.length < 3)
    throw new Error(`Invalid RGB: ${color}`);
  return [channels[0] ?? 0, channels[1] ?? 0, channels[2] ?? 0];
}

function luminance(color: string): number {
  const channels = rgb(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return (
    0.2126 * (channels[0] ?? 0) +
    0.7152 * (channels[1] ?? 0) +
    0.0722 * (channels[2] ?? 0)
  );
}

function contrast(foreground: string, background: string): number {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
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

for (const theme of ["light", "dark"] as const) {
  test(`AI-ready recovery state maintains AA contrast on a ${theme} host`, async () => {
    const page = await openFixture("chatgpt", theme);
    const host = page.locator("#aiterval-shadow-host");
    await expect(host).toHaveAttribute("data-ai-theme", theme, {
      timeout: 8_000,
    });

    const activeCard = host.getByLabel("AIterval listening sprint");
    await expect(activeCard).toBeVisible();
    const disabledButton = activeCard.getByRole("button", {
      name: /Answer one question/,
    });
    const disabledStyles = await disabledButton.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        foreground: styles.color,
        background: styles.backgroundColor,
      };
    });
    expect(
      contrast(disabledStyles.foreground, disabledStyles.background),
    ).toBeGreaterThanOrEqual(4.5);

    await page.getByRole("button", { name: "Finish generation" }).click();
    const readyCard = host.getByLabel("AIterval: your AI is ready");
    await expect(readyCard).toBeVisible({ timeout: 3_000 });
    const stylePairs = await readyCard.evaluate((card) => {
      const pair = (element: Element) => {
        const elementStyles = getComputedStyle(element);
        let background = elementStyles.backgroundColor;
        let ancestor = element.parentElement;
        while (background === "rgba(0, 0, 0, 0)" && ancestor) {
          background = getComputedStyle(ancestor).backgroundColor;
          ancestor = ancestor.parentElement;
        }
        return {
          foreground: elementStyles.color,
          background,
        };
      };
      const cardStyles = getComputedStyle(card);
      return {
        card: {
          background: cardStyles.backgroundColor,
          border: cardStyles.borderTopColor,
        },
        text: [
          pair(card.querySelector(".ai-badge")!),
          pair(card.querySelector("h2")!),
          pair(card.querySelector("p")!),
          ...Array.from(card.querySelectorAll("button"), pair),
        ],
      };
    });
    for (const pair of stylePairs.text) {
      expect(contrast(pair.foreground, pair.background)).toBeGreaterThanOrEqual(
        4.5,
      );
    }
    expect(
      contrast(stylePairs.card.border, stylePairs.card.background),
    ).toBeGreaterThanOrEqual(3);

    const primaryButton = readyCard.getByRole("button", {
      name: "Finish this question",
    });
    await primaryButton.hover();
    const hoverStyles = await primaryButton.evaluate((element) => {
      const styles = getComputedStyle(element);
      return { foreground: styles.color, background: styles.backgroundColor };
    });
    expect(
      contrast(hoverStyles.foreground, hoverStyles.background),
    ).toBeGreaterThanOrEqual(4.5);

    await primaryButton.evaluate((element) => (element as HTMLElement).blur());
    await page.mouse.move(0, 0);
    for (let index = 0; index < 12; index += 1) {
      await page.keyboard.press("Tab");
      const primaryHasFocus = await host.evaluate((element) =>
        element.shadowRoot?.activeElement?.textContent?.includes(
          "Finish this question",
        ),
      );
      if (primaryHasFocus) break;
    }
    await expect(primaryButton).toBeFocused();
    const focusStyles = await primaryButton.evaluate((element) => {
      const styles = getComputedStyle(element);
      const cardStyles = getComputedStyle(element.closest(".ai-ready")!);
      return {
        outline: styles.outlineColor,
        outlineWidth: Number.parseFloat(styles.outlineWidth),
        surface: cardStyles.backgroundColor,
      };
    });
    expect(focusStyles.outlineWidth).toBeGreaterThanOrEqual(3);
    expect(
      contrast(focusStyles.outline, focusStyles.surface),
    ).toBeGreaterThanOrEqual(3);

    await primaryButton.click();
    const answerCard = host.getByLabel("AIterval listening sprint");
    const choices = answerCard.locator(".ai-choices button");
    await expect(choices.first()).toBeVisible();
    const choiceStyles = await choices.evaluateAll((elements) =>
      elements.map((element) => {
        const styles = getComputedStyle(element);
        return {
          foreground: styles.color,
          background: styles.backgroundColor,
        };
      }),
    );
    for (const pair of choiceStyles) {
      expect(contrast(pair.foreground, pair.background)).toBeGreaterThanOrEqual(
        4.5,
      );
    }
    await choices.first().click();
    await answerCard.getByRole("button", { name: "Check answer" }).click();
    const feedback = answerCard.locator(".ai-feedback");
    await expect(feedback).toBeVisible();
    const feedbackStyles = await feedback.evaluate((root) => {
      const pair = (element: Element) => {
        const styles = getComputedStyle(element);
        let background = styles.backgroundColor;
        let ancestor = element.parentElement;
        while (background === "rgba(0, 0, 0, 0)" && ancestor) {
          background = getComputedStyle(ancestor).backgroundColor;
          ancestor = ancestor.parentElement;
        }
        return { foreground: styles.color, background };
      };
      return Array.from(
        root.querySelectorAll(
          ".correct, .incorrect, .ai-transcript, mark, dt, dd, .ai-shadow button, .ai-feedback-actions button, .ai-button",
        ),
        pair,
      );
    });
    for (const pair of feedbackStyles) {
      expect(contrast(pair.foreground, pair.background)).toBeGreaterThanOrEqual(
        4.5,
      );
    }
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
