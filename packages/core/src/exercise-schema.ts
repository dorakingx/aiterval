import { z } from "zod";

export const listeningSkillTags = [
  "main-idea",
  "detail",
  "numbers",
  "names",
  "connected-speech",
  "reduced-forms",
  "technical-terms",
  "speaker-intent",
  "academic-signposting",
  "conversational-fillers",
  "numbers-and-equations",
  "international-conversation",
  "questions-and-answers",
] as const;

export const topicTags = [
  "academic",
  "research",
  "summer-school",
  "networking",
  "group-discussion",
  "daily",
  "ai",
  "software",
  "quantum",
  "machine-learning",
  "web3",
  "technology",
] as const;

export const validTags = [...listeningSkillTags, ...topicTags] as const;

const exerciseFields = {
  id: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9][a-z0-9-]*$/),
  title: z.string().min(1).max(140),
  mode: z.enum(["academic", "conversation", "technology", "daily"]),
  difficulty: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  estimatedSeconds: z.number().int().min(15).max(90),
  transcript: z.string().min(10).max(1_200),
  audioUrl: z.url().optional(),
  preferredLocales: z
    .array(z.string().regex(/^en-[A-Z]{2}$/))
    .min(1)
    .max(3),
  question: z
    .object({
      type: z.enum([
        "main-idea",
        "heard-word",
        "number",
        "fill-blank",
        "speaker-intent",
      ]),
      prompt: z.string().min(1).max(240),
      choices: z.array(z.string().min(1).max(180)).min(2).max(5),
      correctIndex: z.number().int().min(0).max(4),
    })
    .strict(),
  explanationJa: z.string().min(2).max(500),
  keyExpression: z.string().min(1).max(180),
  answerEvidence: z.string().min(1).max(300),
  tags: z.array(z.enum(validTags)).min(2).max(8),
};

function validateEvidence(
  exercise: {
    transcript: string;
    answerEvidence: string;
    question: { correctIndex: number; choices: string[] };
  },
  context: z.RefinementCtx,
) {
  if (exercise.question.correctIndex >= exercise.question.choices.length)
    context.addIssue({
      code: "custom",
      path: ["question", "correctIndex"],
      message: "Correct choice index is out of range",
    });
  if (!exercise.transcript.includes(exercise.answerEvidence))
    context.addIssue({
      code: "custom",
      path: ["answerEvidence"],
      message: "Evidence must appear in transcript",
    });
}

export const exerciseObjectSchema = z.object(exerciseFields).strict();
export const exerciseSchema =
  exerciseObjectSchema.superRefine(validateEvidence);

export const generatedListeningExerciseSchema = exerciseObjectSchema
  .omit({ audioUrl: true })
  .extend({
    source: z.literal("gpt-5.6"),
    model: z.string().regex(/^gpt-5\.6(?:-(?:sol|terra|luna))?$/),
    generatedAt: z.number().int().nonnegative(),
    lectureTitle: z.string().min(1).max(180),
    generationVersion: z.literal(1),
  })
  .strict()
  .superRefine(validateEvidence);
