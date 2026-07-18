import { z } from "zod";
import { generatedListeningExerciseSchema } from "./exercise-schema";
import type {
  GeneratedExercisePack,
  GeneratedListeningExercise,
  SessionRecord,
  Settings,
} from "./types";

export const GPT56_MODELS = [
  "gpt-5.6",
  "gpt-5.6-sol",
  "gpt-5.6-terra",
  "gpt-5.6-luna",
] as const;

export const learningFocuses = [
  "main-idea",
  "academic-signposting",
  "technical-terminology",
  "numbers-and-equations",
  "speaker-intention",
  "connected-speech",
  "international-academic-conversation",
  "lecture-questions-and-answers",
] as const;

export const aggregatedPersonalizationSchema = z
  .object({
    weakSkills: z.array(z.string().min(1).max(60)).max(5),
    targetDifficulty: z.number().int().min(1).max(5),
    preferredLocale: z.enum(["en-US", "en-GB", "en-AU", "en-IN", "en-CA"]),
  })
  .strict();

export const lectureGenerationRequestSchema = z
  .object({
    lectureTitle: z.string().trim().min(3).max(180),
    lectureAbstract: z.string().trim().min(20).max(6_000),
    expectedTechnicalTerms: z.array(z.string().trim().min(1).max(80)).max(20),
    userLevel: z.enum(["A2", "B1", "B2", "C1"]),
    difficulty: z.number().int().min(1).max(5),
    targetSeconds: z.number().int().min(15).max(90),
    exerciseCount: z.number().int().min(1).max(5),
    learningFocus: z.enum(learningFocuses),
    preferredLocale: z.enum(["en-US", "en-GB", "en-AU", "en-IN", "en-CA"]),
    eventContext: z.string().trim().max(800),
    japaneseExplanation: z.boolean(),
    personalization: aggregatedPersonalizationSchema.optional(),
    schemaVersion: z.literal(1),
  })
  .strict();

export const generationOutputSchema = z
  .object({
    exercises: z.array(generatedListeningExerciseSchema).min(1).max(5),
  })
  .strict();

export const generatedPackSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9][a-z0-9-]*$/),
    name: z.string().trim().min(1).max(120),
    lectureTitle: z.string().trim().min(1).max(180),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
    source: z.literal("gpt-5.6"),
    model: z.string().regex(/^gpt-5\.6(?:-(?:sol|terra|luna))?$/),
    generationVersion: z.literal(1),
    status: z.enum(["active", "paused"]),
    exercises: z.array(generatedListeningExerciseSchema).min(1).max(5),
  })
  .strict();

export const generatedPackExportSchema = z
  .object({
    kind: z.literal("aiterval-generated-pack"),
    schemaVersion: z.literal(1),
    pack: generatedPackSchema,
  })
  .strict();

export type LectureGenerationRequest = z.infer<
  typeof lectureGenerationRequestSchema
>;
export type AggregatedPersonalization = z.infer<
  typeof aggregatedPersonalizationSchema
>;
export type GeneratedPackExport = z.infer<typeof generatedPackExportSchema>;

export function isGPT56Model(model: string): boolean {
  return (GPT56_MODELS as readonly string[]).includes(model);
}

export function aggregatePersonalization(
  sessions: SessionRecord[],
  settings: Settings,
): AggregatedPersonalization {
  const attempts = new Map<string, { attempts: number; correct: number }>();
  for (const session of sessions)
    for (const tag of session.tags) {
      const current = attempts.get(tag) ?? { attempts: 0, correct: 0 };
      current.attempts += 1;
      current.correct += Number(session.correct);
      attempts.set(tag, current);
    }
  const weakSkills = [...attempts.entries()]
    .filter(([, score]) => score.attempts >= 2)
    .sort((a, b) =>
      a[1].correct / a[1].attempts === b[1].correct / b[1].attempts
        ? a[0].localeCompare(b[0])
        : a[1].correct / a[1].attempts - b[1].correct / b[1].attempts,
    )
    .slice(0, 5)
    .map(([tag]) => tag);
  return {
    weakSkills,
    targetDifficulty: settings.preferredDifficulty,
    preferredLocale:
      settings.voiceLocale as AggregatedPersonalization["preferredLocale"],
  };
}

export function parseGeneratedPackExport(input: unknown): GeneratedPackExport {
  return generatedPackExportSchema.parse(input);
}

export function generatedExercisesForScheduling(
  packs: GeneratedExercisePack[],
  recentExerciseIds: string[],
): GeneratedListeningExercise[] {
  const recent = new Set(recentExerciseIds);
  const active = packs
    .filter((pack) => pack.status === "active")
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .flatMap((pack) => pack.exercises);
  return [
    ...active.filter((exercise) => !recent.has(exercise.id)),
    ...active.filter((exercise) => recent.has(exercise.id)),
  ];
}
