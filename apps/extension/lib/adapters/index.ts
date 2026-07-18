import { chatgptAdapter } from "./chatgpt";
import { claudeAdapter } from "./claude";
import { geminiAdapter } from "./gemini";
export const adapters = [chatgptAdapter, claudeAdapter, geminiAdapter];
export function adapterForHost(hostname: string) {
  return adapters.find((adapter) =>
    adapter.hostnamePatterns.some(
      (pattern) => hostname === pattern || hostname.endsWith(`.${pattern}`),
    ),
  );
}
export type { AIWaitAdapter } from "./types";
