import { describe, expect, it, vi } from "vitest";
import { createObserver, hasGeneratingSignal } from "./helpers";

describe("AI state-signal helpers", () => {
  it("recognizes semantic labels and busy states without conversation text", () => {
    document.body.innerHTML = `<button aria-label="Stop generating"></button>`;
    expect(hasGeneratingSignal(document)).toBe(true);
    document.body.innerHTML = `<div aria-busy="true"></div>`;
    expect(hasGeneratingSignal(document)).toBe(true);
    document.body.innerHTML = `<article>Stop generating appears only in conversation text</article>`;
    expect(hasGeneratingSignal(document)).toBe(false);
  });
  it("debounces duplicate mutations", async () => {
    vi.useFakeTimers();
    document.body.innerHTML = `<button aria-label="Send"></button>`;
    const callback = vi.fn();
    let generating = false;
    const stop = createObserver(
      () =>
        generating
          ? { status: "generating", startedAt: 1 }
          : { status: "idle" },
      callback,
    );
    generating = true;
    const button = document.querySelector("button")!;
    button.setAttribute("data-state", "1");
    button.setAttribute("data-state", "2");
    await vi.advanceTimersByTimeAsync(200);
    expect(callback).toHaveBeenCalledTimes(2);
    stop();
    vi.useRealTimers();
  });
});
