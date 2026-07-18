import { describe, expect, it } from "vitest";
import { exercises, validateDataset } from ".";

describe("exercise dataset", () => {
  it("contains at least 120 original and valid exercises", () => {
    expect(exercises.length).toBeGreaterThanOrEqual(120);
    expect(validateDataset(exercises)).toEqual([]);
  });
  it("covers every difficulty and required question type", () => {
    expect(new Set(exercises.map((item) => item.difficulty))).toEqual(
      new Set([1, 2, 3, 4, 5]),
    );
    expect(new Set(exercises.map((item) => item.question.type))).toEqual(
      new Set([
        "main-idea",
        "heard-word",
        "number",
        "fill-blank",
        "speaker-intent",
      ]),
    );
  });
});
