import { chromium } from "@playwright/test";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifactRoot = path.join(root, "artifacts", "demo");
const rawDir = path.join(artifactRoot, "raw");
const workDir = path.join(artifactRoot, "work");
const extensionPath = path.join(
  root,
  "apps",
  "extension",
  ".output",
  "chrome-mv3",
);
const fixturePath = path.join(root, "test-fixtures", "chatgpt", "index.html");
const productionOrigin =
  process.env.AITERVAL_DEMO_ORIGIN || "https://aiterval-build-week.vercel.app";
const viewport = { width: 1920, height: 1080 };
const recordedText = [];

await rm(rawDir, { recursive: true, force: true });
await rm(workDir, { recursive: true, force: true });
await mkdir(rawDir, { recursive: true });
await mkdir(workDir, { recursive: true });

function log(message) {
  process.stdout.write(`${new Date().toISOString()} ${message}\n`);
}

function assertSafeText(label, value) {
  const forbidden = [
    [/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b/, "API credential pattern"],
    [
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
      "UUID/Session ID pattern",
    ],
    [/\/Users\//, "local absolute path"],
    [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, "email address"],
  ];
  for (const [pattern, description] of forbidden) {
    if (pattern.test(value)) throw new Error(`${label}: ${description} found`);
  }
}

function assertHealthyPage(label, value) {
  const failures = [
    "This site can’t be reached",
    "This site can't be reached",
    "Application error",
    "Internal Server Error",
    "404: This page could not be found",
  ];
  if (failures.some((failure) => value.includes(failure))) {
    throw new Error(`${label}: browser error page detected`);
  }
}

async function captureText(label, page) {
  const value = await page.locator("body").innerText();
  assertHealthyPage(label, value);
  assertSafeText(label, value);
  recordedText.push(`===== ${label} =====\n${value}`);
}

async function waitUntilDuration(startedAt, seconds) {
  const remaining = seconds * 1000 - (Date.now() - startedAt);
  if (remaining > 0)
    await new Promise((resolve) => setTimeout(resolve, remaining));
}

async function saveVideo(page, context, target) {
  const video = page.video();
  await context.close();
  if (!video) throw new Error(`Video was not created for ${target}`);
  await video.saveAs(target);
}

async function titleCard(page, eyebrow, title, body, footer = "") {
  await page.setContent(`<!doctype html>
    <html><head><meta charset="utf-8"><style>
      *{box-sizing:border-box} body{margin:0;width:100vw;height:100vh;display:grid;place-items:center;
      overflow:hidden;background:#fffdf7;color:#172638;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      body:before{content:"";position:absolute;width:620px;height:620px;border-radius:50%;right:-160px;top:-220px;
      background:radial-gradient(circle,#f7cfc3 0,#fff3ed 55%,transparent 72%);animation:drift 8s ease-in-out infinite alternate}
      main{position:relative;width:min(1320px,82vw);padding:90px;border:1px solid #e1dbd1;border-radius:36px;
      background:rgba(255,255,255,.86);box-shadow:0 35px 110px rgba(23,38,56,.12);animation:rise 1.2s ease-out}
      .eyebrow{color:#a6412a;font-size:24px;font-weight:850;letter-spacing:.14em;text-transform:uppercase}
      h1{max-width:1150px;margin:22px 0 28px;font-size:76px;line-height:1.02;letter-spacing:-.045em}
      p{max-width:1050px;margin:0;font-size:34px;line-height:1.45;color:#435368}
      footer{margin-top:48px;font-size:23px;font-weight:750;color:#a6412a}
      @keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
      @keyframes drift{to{transform:translate(-55px,55px) scale(1.08)}}
    </style></head><body><main><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${body}</p><footer>${footer}</footer></main></body></html>`);
}

const browser = await chromium.launch({ channel: "chromium", headless: true });

async function recordStandardScene(name, seconds, action) {
  const context = await browser.newContext({
    viewport,
    colorScheme: "light",
    reducedMotion: "no-preference",
    recordVideo: { dir: rawDir, size: viewport },
  });
  const page = await context.newPage();
  const startedAt = Date.now();
  log(`recording ${name}`);
  await action(page);
  await waitUntilDuration(startedAt, seconds);
  await saveVideo(page, context, path.join(rawDir, `${name}.webm`));
}

await recordStandardScene("01-intro", 15, async (page) => {
  await titleCard(
    page,
    "OpenAI Build Week · Education",
    "AI makes us wait.",
    "AIterval turns those seconds into English listening practice.",
    "Local-first · 132 original pre-authored exercises",
  );
});

await recordStandardScene("02-judge", 40, async (page) => {
  await page.goto(`${productionOrigin}/demo/judge`, {
    waitUntil: "networkidle",
  });
  await captureText("public judge demo", page);
  await page
    .getByRole("heading", { name: "Send work. Listen while it runs." })
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  await page.getByRole("button", { name: "Send prompt and try it" }).click();
  await page.getByRole("button", { name: "Play audio" }).waitFor();
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "Play audio" }).click();
  await page.waitForTimeout(1700);
  await page.getByRole("button", { name: "Answer one question" }).click();
  await page.getByRole("button", { name: /check the calibration/i }).click();
  await page.getByRole("button", { name: "Check answer" }).click();
  await page.waitForTimeout(2800);
  await page.getByText("Your AI is ready").waitFor({ timeout: 12_000 });
  await page.waitForTimeout(2600);
  await page.getByRole("button", { name: "Finish this question" }).click();
  await page.getByRole("button", { name: /check the calibration/i }).click();
  await page.getByRole("button", { name: "Check answer" }).click();
  await page.waitForTimeout(1700);
  await page.getByRole("button", { name: "Complete sprint" }).click();
  await page.getByText(/Recovered waiting time:/).waitFor();
});

await browser.close();

async function extensionId(context) {
  let worker = context.serviceWorkers()[0];
  worker ??= await context.waitForEvent("serviceworker");
  return { id: new URL(worker.url()).host, worker };
}

log("recording 03-extension-dashboard");
const extensionProfile = path.join(workDir, "extension-profile");
const extensionContext = await chromium.launchPersistentContext(
  extensionProfile,
  {
    channel: "chromium",
    headless: true,
    viewport,
    colorScheme: "light",
    recordVideo: { dir: rawDir, size: viewport },
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  },
);
const extensionPage =
  extensionContext.pages()[0] ?? (await extensionContext.newPage());
const extensionStartedAt = Date.now();
await extensionPage.route("https://chatgpt.com/**", async (route) =>
  route.fulfill({
    contentType: "text/html",
    body: await readFile(fixturePath, "utf8"),
  }),
);
await extensionPage.goto("https://chatgpt.com/fixture");
const overlay = extensionPage.locator("#aiterval-shadow-host");
await overlay
  .getByRole("button", { name: "Play audio" })
  .waitFor({ timeout: 10_000 });
await captureText("deterministic supported-site fixture", extensionPage);
await extensionPage.waitForTimeout(2800);
await overlay.getByRole("button", { name: "Play audio" }).click();
await extensionPage.waitForTimeout(1800);
await overlay.getByRole("button", { name: "Answer one question" }).click();
await overlay.locator(".ai-choices button").first().click();
await overlay.getByRole("button", { name: "Check answer" }).click();
await extensionPage.waitForTimeout(3300);
await extensionPage.getByRole("button", { name: "Finish generation" }).click();
await overlay.getByText("Your AI is ready").waitFor({ timeout: 4000 });
await extensionPage.waitForTimeout(5000);

const { id, worker } = await extensionId(extensionContext);
await worker.evaluate(async () => {
  const key = "aiterval-data";
  const current = (await chrome.storage.local.get(key))[key];
  const now = Date.now();
  current.generatedPacks = [];
  current.runtime = { sprintState: "idle" };
  current.sessions = [
    {
      id: "demo-1",
      exerciseId: "academic-main-001",
      completedAt: now - 300000,
      activeSeconds: 42,
      correct: true,
      replayCount: 1,
      transcriptRevealed: true,
      locale: "en-US",
      tags: ["academic", "main-idea"],
      difficulty: 3,
    },
    {
      id: "demo-2",
      exerciseId: "conversation-detail-001",
      completedAt: now - 180000,
      activeSeconds: 35,
      correct: false,
      replayCount: 2,
      transcriptRevealed: true,
      locale: "en-US",
      tags: ["detail", "numbers"],
      difficulty: 3,
    },
    {
      id: "demo-3",
      exerciseId: "workplace-inference-001",
      completedAt: now - 60000,
      activeSeconds: 51,
      correct: true,
      replayCount: 1,
      transcriptRevealed: true,
      locale: "en-GB",
      tags: ["inference", "workplace"],
      difficulty: 4,
    },
  ];
  current.reviews = [
    {
      exerciseId: "conversation-detail-001",
      attempts: 1,
      correctCount: 0,
      lastAttemptAt: now - 180000,
      nextReviewAt: now - 1000,
      intervalDays: 0,
      ease: 2.2,
    },
  ];
  current.aggregates = {
    totalRecoveredSeconds: 128,
    totalCompleted: 3,
    bestWeeklyTotal: 3,
  };
  await chrome.storage.local.set({ [key]: current });
});

await extensionPage.addInitScript(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement("style");
    style.textContent =
      '#lecture-packs, a[href="#lecture-packs"]{display:none!important}';
    document.documentElement.append(style);
  });
});
await extensionPage.goto(`chrome-extension://${id}/options.html#today`);
await extensionPage
  .getByRole("heading", { name: "Small sprints. Real progress." })
  .waitFor();
await captureText("extension dashboard", extensionPage);
await extensionPage.evaluate(() => {
  const badge = document.createElement("div");
  badge.textContent =
    "132 original pre-authored exercises · No API key required";
  Object.assign(badge.style, {
    position: "fixed",
    right: "28px",
    top: "22px",
    zIndex: "1000000",
    padding: "9px 14px",
    borderRadius: "999px",
    background: "#fffdf7",
    border: "1px solid #d8cfc2",
    color: "#8e3c2a",
    fontWeight: "750",
  });
  document.body.append(badge);
});
await extensionPage.waitForTimeout(6500);
await extensionPage.locator("#map").scrollIntoViewIfNeeded();
await extensionPage.waitForTimeout(6500);
await extensionPage.locator("#settings").scrollIntoViewIfNeeded();
await extensionPage.waitForTimeout(6500);
await extensionPage.getByLabel("Preferred difficulty").selectOption("4");
await extensionPage.waitForTimeout(2500);
await extensionPage
  .getByLabel(/Voice/)
  .first()
  .scrollIntoViewIfNeeded()
  .catch(() => {});
await waitUntilDuration(extensionStartedAt, 55);
await saveVideo(
  extensionPage,
  extensionContext,
  path.join(rawDir, "03-extension-dashboard.webm"),
);

const browser2 = await chromium.launch({ channel: "chromium", headless: true });

async function recordFinalScene(name, seconds, action) {
  const context = await browser2.newContext({
    viewport,
    colorScheme: "light",
    recordVideo: { dir: rawDir, size: viewport },
  });
  const page = await context.newPage();
  const startedAt = Date.now();
  log(`recording ${name}`);
  await action(page);
  await waitUntilDuration(startedAt, seconds);
  await saveVideo(page, context, path.join(rawDir, `${name}.webm`));
}

await recordFinalScene("04-privacy", 20, async (page) => {
  await page.goto(`${productionOrigin}/privacy`, { waitUntil: "networkidle" });
  await captureText("public privacy page", page);
  await page.waitForTimeout(3500);
  await page
    .getByRole("heading", { name: "What it never collects" })
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(4500);
  await page
    .getByRole("heading", { name: "No runtime content generation" })
    .scrollIntoViewIfNeeded();
});

await recordFinalScene("05-development", 25, async (page) => {
  await page.goto("https://github.com/dorakingx/aiterval", {
    waitUntil: "domcontentloaded",
  });
  await page
    .getByText("AIterval", { exact: true })
    .first()
    .waitFor({ timeout: 20_000 });
  await captureText("public GitHub repository", page);
  await page.waitForTimeout(4500);
  await page.goto(
    "https://github.com/dorakingx/aiterval/blob/main/docs/architecture.md",
    { waitUntil: "domcontentloaded" },
  );
  await captureText("public architecture document", page);
  await page.waitForTimeout(5200);
  await page.goto("https://github.com/dorakingx/aiterval/actions", {
    waitUntil: "domcontentloaded",
  });
  await captureText("public GitHub Actions", page);
});

await recordFinalScene("06-closing", 10, async (page) => {
  await titleCard(
    page,
    "OpenAI Build Week — Education",
    "AIterval",
    "It turns time busy people already lose into a learning habit.",
    "aiterval-build-week.vercel.app · github.com/dorakingx/aiterval",
  );
});

await browser2.close();
const allRecordedText = recordedText.join("\n\n");
assertSafeText("recorded page text", allRecordedText);
await writeFile(path.join(artifactRoot, "recorded-text.txt"), allRecordedText, {
  mode: 0o600,
});

const expected = [
  "01-intro.webm",
  "02-judge.webm",
  "03-extension-dashboard.webm",
  "04-privacy.webm",
  "05-development.webm",
  "06-closing.webm",
];
for (const file of expected) {
  const info = await stat(path.join(rawDir, file));
  if (!info.isFile() || info.size === 0)
    throw new Error(`${file} was not recorded`);
}
log(`recording complete: ${expected.length} headless scenes`);
