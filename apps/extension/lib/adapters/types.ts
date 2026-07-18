import type { AIWaitState } from "@aiterval/core";
export interface AIWaitAdapter {
  id: "chatgpt" | "claude" | "gemini";
  hostnamePatterns: string[];
  detectState(document: Document): AIWaitState;
  observe(callback: (state: AIWaitState) => void): () => void;
}
