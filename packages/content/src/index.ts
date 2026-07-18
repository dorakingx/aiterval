import { z } from "zod";
import type {
  ExerciseMode,
  ListeningExercise,
  QuestionType,
} from "@aiterval/core";

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

export const exerciseSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    mode: z.enum(["academic", "conversation", "technology", "daily"]),
    difficulty: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ]),
    estimatedSeconds: z.number().int().min(15).max(90),
    transcript: z.string().min(10),
    audioUrl: z.url().optional(),
    preferredLocales: z.array(z.string().regex(/^en-[A-Z]{2}$/)).min(1),
    question: z.object({
      type: z.enum([
        "main-idea",
        "heard-word",
        "number",
        "fill-blank",
        "speaker-intent",
      ]),
      prompt: z.string().min(1),
      choices: z.array(z.string().min(1)).min(2).max(5),
      correctIndex: z.number().int().min(0),
    }),
    explanationJa: z.string().min(2),
    keyExpression: z.string().min(1),
    answerEvidence: z.string().min(1),
    tags: z.array(z.enum(validTags)).min(2),
  })
  .superRefine((exercise, context) => {
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
  });

type Theme = {
  slug: string;
  title: string;
  mode: ExerciseMode;
  topic: (typeof topicTags)[number];
  places: string[];
  actions: string[];
  objects: string[];
};
const themes: Theme[] = [
  {
    slug: "lecture",
    title: "Academic lecture",
    mode: "academic",
    topic: "academic",
    places: ["seminar hall", "physics lab", "library"],
    actions: [
      "compare two models",
      "outline the evidence",
      "define the central term",
    ],
    objects: ["working hypothesis", "control group", "review paper"],
  },
  {
    slug: "research",
    title: "Research update",
    mode: "academic",
    topic: "research",
    places: ["weekly lab meeting", "poster session", "methods workshop"],
    actions: [
      "repeat the measurement",
      "share the preliminary graph",
      "check the calibration",
    ],
    objects: ["sample set", "confidence interval", "baseline result"],
  },
  {
    slug: "summer",
    title: "Summer school",
    mode: "conversation",
    topic: "summer-school",
    places: ["campus café", "registration desk", "student lounge"],
    actions: [
      "join the afternoon tutorial",
      "find the lecture room",
      "meet after the keynote",
    ],
    objects: ["printed schedule", "visitor badge", "discussion notes"],
  },
  {
    slug: "network",
    title: "Networking",
    mode: "conversation",
    topic: "networking",
    places: ["conference reception", "online meetup", "department lobby"],
    actions: [
      "exchange contact details",
      "introduce a colleague",
      "follow up next week",
    ],
    objects: ["recent project", "research interest", "conference talk"],
  },
  {
    slug: "discussion",
    title: "Group discussion",
    mode: "conversation",
    topic: "group-discussion",
    places: ["project room", "video call", "design studio"],
    actions: [
      "summarize the options",
      "invite another opinion",
      "resolve the open question",
    ],
    objects: ["shared proposal", "decision log", "user feedback"],
  },
  {
    slug: "daily",
    title: "Daily conversation",
    mode: "daily",
    topic: "daily",
    places: ["train platform", "neighborhood shop", "office kitchen"],
    actions: [
      "change the meeting time",
      "pick up a package",
      "recommend a quiet place",
    ],
    objects: ["umbrella", "lunch order", "weekend plan"],
  },
  {
    slug: "ai",
    title: "AI engineering",
    mode: "technology",
    topic: "ai",
    places: ["model review", "prompt workshop", "evaluation meeting"],
    actions: [
      "inspect the failure cases",
      "reduce hallucinations",
      "compare the benchmarks",
    ],
    objects: ["evaluation set", "system prompt", "safety filter"],
  },
  {
    slug: "software",
    title: "Software delivery",
    mode: "technology",
    topic: "software",
    places: ["code review", "release meeting", "incident call"],
    actions: [
      "add a regression test",
      "roll back the deployment",
      "document the interface",
    ],
    objects: ["pull request", "error trace", "release candidate"],
  },
  {
    slug: "quantum",
    title: "Quantum computing",
    mode: "technology",
    topic: "quantum",
    places: ["quantum seminar", "hardware briefing", "theory group"],
    actions: [
      "measure the qubit",
      "explain the noise source",
      "compare two circuits",
    ],
    objects: ["error rate", "entangled pair", "readout signal"],
  },
  {
    slug: "ml",
    title: "Machine learning",
    mode: "technology",
    topic: "machine-learning",
    places: ["training review", "data meeting", "model demo"],
    actions: [
      "rebalance the classes",
      "tune the learning rate",
      "inspect the confusion matrix",
    ],
    objects: ["validation split", "feature pipeline", "training checkpoint"],
  },
  {
    slug: "web3",
    title: "Web3 briefing",
    mode: "technology",
    topic: "web3",
    places: ["protocol call", "security review", "community meeting"],
    actions: [
      "audit the contract",
      "explain the fee change",
      "test the wallet flow",
    ],
    objects: ["governance proposal", "transaction record", "validator set"],
  },
  {
    slug: "numbers",
    title: "Numbers and names",
    mode: "daily",
    topic: "technology",
    places: ["booking call", "project briefing", "travel desk"],
    actions: [
      "confirm the date",
      "spell the surname",
      "repeat the reference number",
    ],
    objects: ["July eighteenth", "Dr. Rivera", "code B seventy-four"],
  },
];

const questionTypes: QuestionType[] = [
  "main-idea",
  "heard-word",
  "number",
  "fill-blank",
  "speaker-intent",
];
const skillForQuestion: Record<
  QuestionType,
  (typeof listeningSkillTags)[number]
> = {
  "main-idea": "main-idea",
  "heard-word": "detail",
  number: "numbers",
  "fill-blank": "connected-speech",
  "speaker-intent": "speaker-intent",
};
const locales = [
  ["en-US", "en-CA"],
  ["en-GB", "en-AU"],
  ["en-IN", "en-US"],
];

function makeExercise(theme: Theme, variant: number): ListeningExercise {
  const place = theme.places[variant % theme.places.length] ?? theme.places[0]!;
  const action =
    theme.actions[(variant * 2) % theme.actions.length] ?? theme.actions[0]!;
  const object =
    theme.objects[(variant * 3 + 1) % theme.objects.length] ??
    theme.objects[0]!;
  const difficulty = ((variant % 5) + 1) as 1 | 2 | 3 | 4 | 5;
  const type = questionTypes[variant % questionTypes.length] ?? "main-idea";
  const minute = 10 + variant * 3;
  const evidence = `${action} before ${minute} minutes have passed`;
  const transcript = `During the ${place}, Mina asks the team to ${evidence}. She says the ${object} is useful, but one detail still needs a careful check. Her purpose is to keep the next step small and clear.`;
  const choices = [
    action,
    "cancel the project",
    "delay every decision",
    "replace the whole team",
  ];
  const prompt = `${theme.title} ${variant + 1}: what does Mina want the team to do?`;
  return {
    id: `${theme.slug}-${String(variant + 1).padStart(2, "0")}`,
    title: `${theme.title} · ${variant + 1}`,
    mode: theme.mode,
    difficulty,
    estimatedSeconds: 20 + difficulty * 6,
    transcript,
    preferredLocales: locales[variant % locales.length] ?? ["en-US"],
    question: { type, prompt, choices, correctIndex: 0 },
    explanationJa: `Mina は「${action}」を短時間で行うよう求めています。目的を表す動詞に注目しましょう。`,
    keyExpression: evidence,
    answerEvidence: evidence,
    tags: [
      theme.topic,
      skillForQuestion[type],
      difficulty >= 4
        ? "technical-terms"
        : variant % 2
          ? "conversational-fillers"
          : "detail",
    ],
  };
}

export const exercises: ListeningExercise[] = themes.flatMap((theme) =>
  Array.from({ length: 11 }, (_, variant) => makeExercise(theme, variant)),
);

export function validateDataset(items: ListeningExercise[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const questions = new Set<string>();
  const transcripts = new Set<string>();
  for (const item of items) {
    const result = exerciseSchema.safeParse(item);
    if (!result.success)
      errors.push(
        `${item.id}: ${result.error.issues.map((issue) => issue.message).join(", ")}`,
      );
    if (ids.has(item.id)) errors.push(`${item.id}: duplicate id`);
    ids.add(item.id);
    if (questions.has(item.question.prompt))
      errors.push(`${item.id}: duplicate question`);
    questions.add(item.question.prompt);
    const normalized = item.transcript.toLowerCase().replace(/\W/g, "");
    if (transcripts.has(normalized))
      errors.push(`${item.id}: duplicate transcript`);
    transcripts.add(normalized);
  }
  if (items.length < 120)
    errors.push(`dataset has only ${items.length} exercises`);
  return errors;
}

const startupErrors = validateDataset(exercises);
if (startupErrors.length)
  throw new Error(`Invalid AIterval dataset:\n${startupErrors.join("\n")}`);
