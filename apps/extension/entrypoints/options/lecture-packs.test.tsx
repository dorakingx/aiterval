import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  emptyStoredData,
  generatedPackExportSchema,
  type StoredData,
} from "@aiterval/core";
import { LecturePacks } from "./lecture-packs";

const pack = generatedPackExportSchema.parse({
  kind: "aiterval-generated-pack",
  schemaVersion: 1,
  pack: {
    id: "lecture-pack-test",
    name: "Reliable experiments",
    lectureTitle: "Reliable experiments",
    createdAt: 1,
    updatedAt: 1,
    source: "gpt-5.6",
    model: "gpt-5.6-sol",
    generationVersion: 1,
    status: "active",
    exercises: [
      {
        id: "generated-test-1",
        title: "A useful baseline",
        mode: "academic",
        difficulty: 3,
        estimatedSeconds: 40,
        transcript:
          "The speaker establishes a baseline so later measurements have a clear comparison point.",
        preferredLocales: ["en-GB"],
        question: {
          type: "main-idea",
          prompt: "Why establish a baseline?",
          choices: ["For comparison", "To stop"],
          correctIndex: 0,
        },
        explanationJa: "比較のためです。",
        keyExpression: "establishes a baseline",
        answerEvidence: "establishes a baseline",
        tags: ["academic", "main-idea"],
        source: "gpt-5.6",
        model: "gpt-5.6-sol",
        generatedAt: 1,
        lectureTitle: "Reliable experiments",
        generationVersion: 1,
      },
    ],
  },
}).pack;

describe("LecturePacks", () => {
  it("shows the generated-pack empty state and privacy opt-in", () => {
    render(<LecturePacks data={emptyStoredData()} save={vi.fn()} />);
    expect(screen.getByText("No lecture packs yet")).toBeVisible();
    expect(
      screen.getByRole("checkbox", { name: /aggregated personalization/ }),
    ).not.toBeChecked();
  });

  it("pauses and deletes a saved generated pack", async () => {
    const user = userEvent.setup();
    const save = vi
      .fn<(next: StoredData) => Promise<void>>()
      .mockResolvedValue();
    render(
      <LecturePacks
        data={{ ...emptyStoredData(), generatedPacks: [pack] }}
        save={save}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        generatedPacks: [expect.objectContaining({ status: "paused" })],
      }),
    );
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(
      screen.getByRole("dialog", { name: "Delete this lecture pack?" }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Delete pack" }));
    expect(save).toHaveBeenLastCalledWith(
      expect.objectContaining({ generatedPacks: [] }),
    );
  });
});
