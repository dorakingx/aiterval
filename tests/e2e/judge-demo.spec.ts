import { expect, test } from "@playwright/test";

const generated = {
  id: "generated-1700000000000-1",
  title: "A useful comparison point",
  mode: "academic",
  difficulty: 3,
  estimatedSeconds: 45,
  transcript:
    "The speaker establishes a baseline before treatment, giving the team a clear comparison point.",
  preferredLocales: ["en-GB"],
  question: {
    type: "main-idea",
    prompt: "Why establish a baseline?",
    choices: ["For comparison", "To stop the study"],
    correctIndex: 0,
  },
  explanationJa: "比較のためです。",
  keyExpression: "establishes a baseline",
  answerEvidence: "establishes a baseline",
  tags: ["academic", "main-idea"],
  source: "gpt-5.6",
  model: "gpt-5.6-sol",
  generatedAt: 1_700_000_000_000,
  lectureTitle: "Reliable experiments",
  generationVersion: 1,
};

test("public judge demo completes the no-login waiting-time loop", async ({
  page,
}) => {
  await page.goto("/demo/judge");
  await expect(
    page.getByRole("heading", { name: "Understand the loop in two minutes." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Send prompt and try it" }).click();
  await expect(page.getByRole("button", { name: "Play audio" })).toBeVisible();
  await page.getByRole("button", { name: "Play audio" }).click();
  await expect(page.getByText("Your AI is ready")).toBeVisible({
    timeout: 12_000,
  });
  await page.getByRole("button", { name: "Finish this question" }).click();
  await page.getByRole("button", { name: /check the calibration/i }).click();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText("Correct", { exact: true })).toBeVisible();
  await expect(page.getByRole("mark")).toHaveText(
    "check the calibration before 31 minutes have passed",
  );
  await page.getByRole("button", { name: "Complete sprint" }).click();
  await expect(page.getByText(/Recovered waiting time:/)).not.toContainText(
    "0s",
  );
});

test("judge demo visibly interrupts listening when simulated AI is ready", async ({
  page,
}) => {
  await page.goto("/demo/judge");
  await page.getByRole("button", { name: "Send prompt and try it" }).click();
  await expect(page.getByText("Your AI is ready")).toBeVisible({
    timeout: 12_000,
  });
  await expect(
    page.getByRole("button", { name: "Return to AI" }),
  ).toBeVisible();
});

test("Lecture-to-Sprints supports sample mode and Japanese UI", async ({
  page,
}) => {
  await page.goto("/lecture");
  await page.getByRole("button", { name: "日本語" }).click();
  await expect(
    page.getByRole("heading", { name: "次の講義を聞き取る準備" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "APIキー不要のサンプル" }).click();
  await expect(
    page.getByText("Curated sample—not a live GPT-5.6 call"),
  ).toBeVisible();
});

test("mocked GPT-5.6 generation renders a validated result", async ({
  page,
}) => {
  await page.route("**/api/generate-sprints", async (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        exercises: [generated],
        metadata: { model: "gpt-5.6-sol" },
      }),
    }),
  );
  await page.goto("/lecture");
  await page.getByLabel(/Lecture title/).fill("Reliable experiments");
  await page
    .getByLabel(/Abstract or description/)
    .fill(
      "This lecture explains why baseline measurements make experimental comparisons more reliable.",
    );
  await page.getByLabel(/Judge access code/).fill("test-code");
  await page.getByRole("button", { name: "Generate with GPT-5.6" }).click();
  await expect(page.getByText("Generated with gpt-5.6-sol")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Download validated/ }),
  ).toBeVisible();
});

test("live-generation failure leaves the accessible sample fallback", async ({
  page,
}) => {
  await page.route("**/api/generate-sprints", async (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Live GPT-5.6 generation is not configured.",
      }),
    }),
  );
  await page.goto("/lecture");
  await page.getByLabel(/Lecture title/).fill("Reliable experiments");
  await page
    .getByLabel(/Abstract or description/)
    .fill(
      "This lecture explains why baseline measurements make experimental comparisons more reliable.",
    );
  await page.getByRole("button", { name: "Generate with GPT-5.6" }).click();
  await expect(page.locator(".form-error")).toContainText("not configured");
  await expect(
    page.getByRole("button", { name: "Try the no-key sample" }),
  ).toBeEnabled();
});

test("primary judge actions are keyboard reachable", async ({ page }) => {
  await page.goto("/demo/judge");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  await page.goto("/lecture");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
});
