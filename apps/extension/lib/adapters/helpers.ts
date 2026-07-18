import type { AIWaitState } from "@aiterval/core";

const generatingLabels = [
  "stop generating",
  "stop response",
  "stop",
  "cancel response",
  "応答を停止",
  "生成を停止",
];
export function hasGeneratingSignal(
  document: Document,
  extraLabels: string[] = [],
): boolean {
  const labels = [...generatingLabels, ...extraLabels].map((label) =>
    label.toLowerCase(),
  );
  const candidates = document.querySelectorAll<HTMLElement>(
    "button[aria-label], [role='button'][aria-label], [aria-busy='true'], button[data-state]",
  );
  return [...candidates].some(
    (element) =>
      element.getAttribute("aria-busy") === "true" ||
      labels.some((label) =>
        (element.getAttribute("aria-label") ?? "")
          .toLowerCase()
          .includes(label),
      ),
  );
}
export function createObserver(
  detect: () => AIWaitState,
  callback: (state: AIWaitState) => void,
): () => void {
  let timer = 0;
  let last = "";
  const emit = () => {
    const state = detect();
    const key = state.status;
    if (key !== last) {
      last = key;
      callback(state);
    }
  };
  const observer = new MutationObserver(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(emit, 180);
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["aria-label", "aria-busy", "disabled", "data-state"],
  });
  window.addEventListener("popstate", emit);
  const originalPush = history.pushState;
  history.pushState = function (...args) {
    originalPush.apply(this, args);
    window.setTimeout(emit, 0);
  };
  emit();
  return () => {
    observer.disconnect();
    window.clearTimeout(timer);
    window.removeEventListener("popstate", emit);
    history.pushState = originalPush;
  };
}
