import { describe, expect, it } from "vitest";
import { themeFromBackgrounds } from "./theme";

describe("overlay theme detection", () => {
  it("uses the first visible host-page surface", () => {
    expect(
      themeFromBackgrounds(["rgba(0, 0, 0, 0)", "rgb(247, 247, 248)"], true),
    ).toBe("light");
    expect(
      themeFromBackgrounds(["rgba(0, 0, 0, 0)", "rgb(33, 33, 33)"], false),
    ).toBe("dark");
  });

  it("falls back to the browser color preference for transparent pages", () => {
    expect(themeFromBackgrounds(["rgba(0, 0, 0, 0)"], true)).toBe("dark");
    expect(themeFromBackgrounds([], false)).toBe("light");
  });

  it("composites translucent surfaces over their visible parent", () => {
    expect(
      themeFromBackgrounds(["rgba(0, 0, 0, 0.2)", "rgb(255, 255, 255)"], true),
    ).toBe("light");
    expect(
      themeFromBackgrounds(
        ["rgba(255, 255, 255, 0.15)", "rgb(33, 33, 33)"],
        false,
      ),
    ).toBe("dark");
  });
});
