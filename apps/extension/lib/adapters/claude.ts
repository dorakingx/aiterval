import type { AIWaitState } from "@aiterval/core";
import { createObserver, hasGeneratingSignal } from "./helpers";
import type { AIWaitAdapter } from "./types";

export const claudeAdapter: AIWaitAdapter = {
  id: "claude",
  hostnamePatterns: ["claude.ai"],
  detectState(document: Document): AIWaitState {
    return hasGeneratingSignal(document, ["stop response", "cancel"]) ||
      Boolean(document.querySelector("[aria-busy='true'][role='progressbar']"))
      ? { status: "generating", startedAt: Date.now() }
      : { status: "idle" };
  },
  observe(callback) {
    return createObserver(() => this.detectState(document), callback);
  },
};
