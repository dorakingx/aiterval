import { browser } from "wxt/browser";

async function startInActiveTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    await browser.tabs.sendMessage(tab.id, { type: "AIT_START_MANUAL" });
  } catch {
    try {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["/content-scripts/content.js"],
      });
      await browser.tabs.sendMessage(tab.id, { type: "AIT_START_MANUAL" });
    } catch {
      await browser.tabs.create({
        url: browser.runtime.getURL("/onboarding.html?sample=1"),
      });
    }
  }
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    browser.contextMenus.create({
      id: "aiterval-start",
      title: "Start a Listening Sprint",
      contexts: ["page"],
    });
    if (reason === "install")
      await browser.tabs.create({
        url: browser.runtime.getURL("/onboarding.html"),
      });
  });
  browser.commands.onCommand.addListener((command) => {
    if (command === "start-sprint") void startInActiveTab();
  });
  browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "aiterval-start") void startInActiveTab();
  });
  browser.runtime.onMessage.addListener((message: unknown) => {
    if (
      typeof message === "object" &&
      message &&
      "type" in message &&
      message.type === "AIT_START_ACTIVE"
    )
      return startInActiveTab();
  });
});
