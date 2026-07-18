import { expect, test } from "@playwright/test";

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

test("the archived lecture route redirects to the pre-authored judge demo", async ({
  page,
}) => {
  await page.goto("/lecture");
  await expect(page).toHaveURL(/\/demo\/judge$/);
  await expect(
    page.getByText("132 original pre-authored exercises"),
  ).toBeVisible();
});

test("the archived generation endpoint cannot perform runtime generation", async ({
  request,
}) => {
  const response = await request.post("/api/generate-sprints", { data: {} });
  expect(response.status()).toBe(410);
  await expect(response.json()).resolves.toMatchObject({
    error: "feature_archived",
  });
});

test("primary judge actions are keyboard reachable", async ({ page }) => {
  await page.goto("/demo/judge");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  await page.goto("/privacy");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
});
