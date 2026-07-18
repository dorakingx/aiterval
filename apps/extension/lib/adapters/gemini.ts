import type { AIWaitState } from "@aiterval/core";
import { createObserver, hasGeneratingSignal } from "./helpers";
import type { AIWaitAdapter } from "./types";

export const geminiAdapter: AIWaitAdapter = {
  id: "gemini",
  hostnamePatterns: ["gemini.google.com"],
  detectState(document: Document): AIWaitState {
    return hasGeneratingSignal(document, [
      "stop loading",
      "stop generating response",
    ]) ||
      Boolean(document.querySelector("[aria-live='polite'] [aria-busy='true']"))
      ? { status: "generating", startedAt: Date.now() }
      : { status: "idle" };
  },
  observe(callback) {
    return createObserver(() => this.detectState(document), callback);
  },
};
