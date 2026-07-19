import { expect, test } from "@playwright/test";

const downloadUrl =
  "https://github.com/dorakingx/aiterval/releases/download/v0.2.1/aitervalextension-0.2.1-chrome.zip";
const releaseUrl = "https://github.com/dorakingx/aiterval/releases/tag/v0.2.1";

test("installation page makes the unpacked release flow explicit", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/install");

  await expect(
    page.getByRole("link", {
      name: "Download AIterval v0.2.1 for Chrome",
    }),
  ).toHaveAttribute("href", downloadUrl);
  await expect(
    page.getByRole("link", { name: "View release details and checksum" }),
  ).toHaveAttribute("href", releaseUrl);
  await expect(
    page.getByText("Chrome Web Store publication is not complete"),
  ).toBeVisible();
  await expect(
    page.getByText("Chrome cannot install this ZIP directly"),
  ).toBeVisible();

  for (const heading of [
    "Download the ZIP",
    "Extract it",
    "Open browser extensions",
    "Enable Developer mode",
    "Choose “Load unpacked”",
    "Select the extracted folder",
  ]) {
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }

  await page.getByRole("button", { name: "Copy chrome://extensions" }).click();
  await expect(
    page.getByRole("button", { name: "Copy chrome://extensions" }),
  ).toContainText("Copied");
  await expect(
    page.evaluate(() => navigator.clipboard.readText()),
  ).resolves.toBe("chrome://extensions");
  await expect(
    page.getByRole("button", { name: "Copy brave://extensions" }),
  ).toBeVisible();
  await expect(page.getByText("“Manifest file is missing”")).toBeVisible();
});
