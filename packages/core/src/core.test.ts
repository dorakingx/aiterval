import { describe, expect, it } from "vitest";
import {
  canAutoStart,
  defaultSettings,
  emptyStoredData,
  formatDuration,
  importData,
  recoveredSeconds,
  selectExercise,
  suggestedDifficulty,
  transition,
  updateReview,
  weeklyProgress,
  type ListeningExercise,
  type SessionRecord,
} from ".";

const exercise: ListeningExercise = {
  id: "x",
  title: "X",
  mode: "daily",
  difficulty: 2,
  estimatedSeconds: 20,
  transcript: "A unique listening sample.",
  preferredLocales: ["en-US"],
  question: {
    type: "main-idea",
    prompt: "What is the point?",
    choices: ["A", "B"],
    correctIndex: 0,
  },
  explanationJa: "説明",
  keyExpression: "unique",
  answerEvidence: "unique",
  tags: ["main-idea"],
};
const session = (correct: boolean): SessionRecord => ({
  id: crypto.randomUUID(),
  exerciseId: "x",
  completedAt: Date.now(),
  activeSeconds: 20,
  correct,
  replayCount: 0,
  transcriptRevealed: false,
  locale: "en-US",
  tags: ["main-idea"],
  difficulty: 2,
});

describe("core", () => {
  it("moves deterministically through the sprint state machine", () => {
    expect(transition("idle", { type: "DETECT", at: 1 })).toBe(
      "opportunity_detected",
    );
    expect(transition("listening", { type: "AI_READY" })).toBe(
      "paused_ai_ready",
    );
    expect(transition("completed", { type: "START" })).toBe("completed");
  });
  it("enforces cooldown and hourly limits", () => {
    expect(
      canAutoStart({
        now: 100_000,
        lastSprintAt: 90_000,
        automaticStarts: [],
        cooldownMinutes: 10,
        maxPerHour: 4,
      }),
    ).toBe(false);
    expect(
      canAutoStart({
        now: 4_000_000,
        automaticStarts: [500_000, 1_000_000, 2_000_000, 3_000_000],
        cooldownMinutes: 10,
        maxPerHour: 4,
      }),
    ).toBe(false);
    expect(
      canAutoStart({
        now: 4_000_000,
        automaticStarts: [],
        cooldownMinutes: 10,
        maxPerHour: 4,
      }),
    ).toBe(true);
  });
  it("schedules review and adaptive difficulty", () => {
    const review = updateReview(
      {
        exerciseId: "x",
        attempts: 1,
        correctCount: 0,
        intervalDays: 1,
        ease: 2,
      },
      true,
      0,
    );
    expect(review.intervalDays).toBeGreaterThan(1);
    expect(
      suggestedDifficulty([session(true), session(true), session(true)], 2),
    ).toBe(3);
  });
  it("selects deterministically and avoids recent items", () => {
    const other = { ...exercise, id: "y", transcript: "Another sample." };
    const context = {
      now: 1,
      seed: 42,
      expectedWaitSeconds: 20,
      recentExerciseIds: ["x"],
      reviews: [],
      sessions: [],
      settings: defaultSettings,
    };
    expect(selectExercise([exercise, other], context)?.id).toBe("y");
    expect(selectExercise([exercise, other], context)?.id).toBe("y");
  });
  it("aggregates real active time and weekly progress", () => {
    expect(
      recoveredSeconds([{ activeSeconds: 20 }, { activeSeconds: 35 }]),
    ).toBe(55);
    expect(formatDuration(80)).toBe("1m 20s");
    expect(weeklyProgress(6, 5)).toBe(1);
  });
  it("validates imports and migration defaults", () => {
    expect(importData(emptyStoredData()).schemaVersion).toBe(2);
    expect(() =>
      importData({ ...emptyStoredData(), sessions: [{ unsafe: "x" }] }),
    ).toThrow();
  });
});
