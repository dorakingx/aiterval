import { describe, expect, it } from "vitest";
import {
  aggregatePersonalization,
  defaultSettings,
  emptyStoredData,
  generatedExercisesForScheduling,
  generatedListeningExerciseSchema,
  generatedPackExportSchema,
  isGPT56Model,
  lectureGenerationRequestSchema,
  migrateStorage,
  type GeneratedExercisePack,
} from ".";

const exercise = generatedListeningExerciseSchema.parse({
  id: "lecture-pack-1-exercise-1",
  title: "Why the baseline matters",
  mode: "academic",
  difficulty: 3,
  estimatedSeconds: 45,
  transcript:
    "The speaker first establishes a baseline so that later measurements can be compared fairly.",
  preferredLocales: ["en-GB"],
  question: {
    type: "main-idea",
    prompt: "Why does the speaker establish a baseline?",
    choices: ["To compare later measurements", "To cancel the study"],
    correctIndex: 0,
  },
  explanationJa: "後の測定と公平に比較するためです。",
  keyExpression: "establishes a baseline",
  answerEvidence: "establishes a baseline",
  tags: ["academic", "main-idea"],
  source: "gpt-5.6",
  model: "gpt-5.6-sol",
  generatedAt: 1_700_000_000_000,
  lectureTitle: "Reliable Experimental Design",
  generationVersion: 1,
});

const pack: GeneratedExercisePack = generatedPackExportSchema.parse({
  kind: "aiterval-generated-pack",
  schemaVersion: 1,
  pack: {
    id: "lecture-pack-1",
    name: "Reliable Experimental Design",
    lectureTitle: "Reliable Experimental Design",
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_000_000,
    source: "gpt-5.6",
    model: "gpt-5.6-sol",
    generationVersion: 1,
    status: "active",
    exercises: [exercise],
  },
}).pack;

describe("Lecture-to-Sprints schemas", () => {
  it("accepts bounded lecture inputs and rejects prompt-sized abuse", () => {
    const valid = {
      lectureTitle: "Quantum error correction",
      lectureAbstract:
        "A lecture about detecting errors without measuring the encoded state directly.",
      expectedTechnicalTerms: ["syndrome", "logical qubit"],
      userLevel: "B2",
      difficulty: 3,
      targetSeconds: 45,
      exerciseCount: 2,
      learningFocus: "technical-terminology",
      preferredLocale: "en-GB",
      eventContext: "International summer school",
      japaneseExplanation: true,
      schemaVersion: 1,
    } as const;
    expect(lectureGenerationRequestSchema.parse(valid).exerciseCount).toBe(2);
    expect(() =>
      lectureGenerationRequestSchema.parse({
        ...valid,
        lectureAbstract: "x".repeat(6_001),
      }),
    ).toThrow();
  });

  it("enforces provenance and the GPT-5.6 family", () => {
    expect(isGPT56Model("gpt-5.6-luna")).toBe(true);
    expect(isGPT56Model("gpt-4.1")).toBe(false);
    expect(() =>
      generatedListeningExerciseSchema.parse({
        ...exercise,
        model: "gpt-4.1",
      }),
    ).toThrow();
  });

  it("validates pack imports and prioritizes active generated exercises", () => {
    expect(
      generatedPackExportSchema.parse({
        kind: "aiterval-generated-pack",
        schemaVersion: 1,
        pack,
      }).pack.exercises,
    ).toHaveLength(1);
    expect(generatedExercisesForScheduling([pack], [])[0]?.id).toBe(
      exercise.id,
    );
    expect(
      generatedExercisesForScheduling([{ ...pack, status: "paused" }], []),
    ).toEqual([]);
  });

  it("sends only aggregated opt-in personalization", () => {
    const result = aggregatePersonalization(
      [
        {
          id: "s1",
          exerciseId: "e1",
          completedAt: 1,
          activeSeconds: 20,
          correct: false,
          replayCount: 1,
          transcriptRevealed: true,
          locale: "en-GB",
          tags: ["numbers"],
          difficulty: 3,
        },
        {
          id: "s2",
          exerciseId: "e2",
          completedAt: 2,
          activeSeconds: 20,
          correct: false,
          replayCount: 1,
          transcriptRevealed: true,
          locale: "en-GB",
          tags: ["numbers"],
          difficulty: 3,
        },
      ],
      { ...defaultSettings, voiceLocale: "en-GB" },
    );
    expect(result).toEqual({
      weakSkills: ["numbers"],
      targetDifficulty: 2,
      preferredLocale: "en-GB",
    });
    expect(JSON.stringify(result)).not.toContain("exerciseId");
  });

  it("migrates version 1 storage without losing learning history", () => {
    const current = emptyStoredData();
    const legacy = {
      ...current,
      schemaVersion: 1,
      settings: (({ personalizedGenerationOptIn: _, ...settings }) => settings)(
        current.settings,
      ),
    };
    delete (legacy as { generatedPacks?: unknown }).generatedPacks;
    const migrated = migrateStorage(legacy);
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.generatedPacks).toEqual([]);
    expect(migrated.settings.personalizedGenerationOptIn).toBe(false);
  });
});
