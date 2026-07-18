import type { AIWaitState } from "@aiterval/core";
import { createObserver, hasGeneratingSignal } from "./helpers";
import type { AIWaitAdapter } from "./types";

export const chatgptAdapter: AIWaitAdapter = {
  id: "chatgpt",
  hostnamePatterns: ["chatgpt.com"],
  detectState(document: Document): AIWaitState {
    return hasGeneratingSignal(document, ["stop streaming"])
      ? { status: "generating", startedAt: Date.now() }
      : { status: "idle" };
  },
  observe(callback) {
    return createObserver(() => this.detectState(document), callback);
  },
};
