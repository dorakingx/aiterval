import type { ListeningExercise } from "@aiterval/core";

export const sampleLecture = {
  title: "Reliable measurements in quantum systems",
  abstract:
    "This lecture introduces why experimental baselines, calibration, and uncertainty matter when researchers compare measurements from noisy quantum devices.",
};

export const sampleLectureExercises: ListeningExercise[] = [
  {
    id: "sample-quantum-baseline",
    title: "Why establish a baseline?",
    mode: "academic",
    difficulty: 3,
    estimatedSeconds: 42,
    transcript:
      "Before comparing the two quantum devices, the speaker establishes a baseline measurement. This reference does not remove noise, but it helps the researchers see whether a later change is meaningful.",
    preferredLocales: ["en-GB"],
    question: {
      type: "main-idea",
      prompt: "Why does the speaker establish a baseline?",
      choices: [
        "To judge whether later changes are meaningful",
        "To remove every source of noise",
        "To avoid comparing the devices",
      ],
      correctIndex: 0,
    },
    explanationJa:
      "基準測定はノイズを完全に消すものではなく、後の変化に意味があるか判断するための比較点です。",
    keyExpression: "establishes a baseline measurement",
    answerEvidence: "establishes a baseline measurement",
    tags: ["academic", "main-idea", "technical-terms"],
  },
];
