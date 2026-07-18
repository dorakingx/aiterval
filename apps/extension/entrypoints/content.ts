import { browser } from "wxt/browser";
import { canAutoStart } from "@aiterval/core";
import { adapterForHost } from "../lib/adapters";
import { hideOverlay, overlayVisible, showOverlay } from "../lib/overlay";
import { repository } from "../lib/repository";

export default defineContentScript({
  matches: [
    "https://chatgpt.com/*",
    "https://claude.ai/*",
    "https://gemini.google.com/*",
  ],
  main() {
    const adapter = adapterForHost(location.hostname);
    if (!adapter) return;
    let thresholdTimer = 0;
    let previous = "idle";
    const handle = async (state: ReturnType<typeof adapter.detectState>) => {
      if (state.status === "generating" && previous !== "generating") {
        previous = "generating";
        const data = await repository.load();
        if (
          !data.settings.autoStart ||
          !data.settings.autoStartSites[adapter.id]
        )
          return;
        const starts = data.sessions.map((session) => session.completedAt);
        if (
          !canAutoStart({
            now: Date.now(),
            lastSprintAt: starts.at(-1),
            automaticStarts: starts,
            cooldownMinutes: data.settings.cooldownMinutes,
            maxPerHour: data.settings.maxAutoStartsPerHour,
            snoozedUntil: data.settings.snoozedUntil,
          })
        )
          return;
        thresholdTimer = window.setTimeout(() => {
          if (previous === "generating") void showOverlay();
        }, data.settings.minimumWaitSeconds * 1000);
      } else if (state.status === "idle" && previous === "generating") {
        previous = "idle";
        window.clearTimeout(thresholdTimer);
        if (overlayVisible()) {
          hideOverlay();
          void showOverlay({ aiReady: true });
        }
      }
    };
    const stop = adapter.observe((state) => void handle(state));
    browser.runtime.onMessage.addListener((message: unknown) => {
      if (
        typeof message === "object" &&
        message &&
        "type" in message &&
        message.type === "AIT_START_MANUAL"
      )
        void showOverlay();
    });
    window.addEventListener("pagehide", stop, { once: true });
  },
});
