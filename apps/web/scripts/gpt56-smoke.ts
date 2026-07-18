import { generateSprintsWithOpenAI } from "../lib/generation-server";

if (!process.env.OPENAI_API_KEY) {
  console.log(
    "SKIP: OPENAI_API_KEY is not available; no paid request was made.",
  );
  process.exit(0);
}

const result = await generateSprintsWithOpenAI({
  lectureTitle: "Reliable measurements in quantum systems",
  lectureAbstract:
    "This lecture explains why calibration and baseline measurements matter when researchers compare noisy quantum devices.",
  expectedTechnicalTerms: ["calibration", "baseline"],
  userLevel: "B2",
  difficulty: 3,
  targetSeconds: 35,
  exerciseCount: 1,
  learningFocus: "main-idea",
  preferredLocale: "en-GB",
  eventContext: "Manual pre-submission smoke test",
  japaneseExplanation: true,
  schemaVersion: 1,
});

console.log(
  JSON.stringify({
    status: "passed",
    model: result.model,
    exerciseCount: result.exercises.length,
    requestId: result.requestId,
  }),
);
