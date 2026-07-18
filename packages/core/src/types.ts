export type AIWaitState =
  | { status: "idle" }
  | { status: "generating"; startedAt: number }
  | { status: "completed"; completedAt: number };

export type SprintStateName =
  | "idle"
  | "opportunity_detected"
  | "waiting_for_threshold"
  | "sprint_ready"
  | "listening"
  | "answering"
  | "feedback"
  | "completed"
  | "paused_ai_ready"
  | "dismissed"
  | "snoozed"
  | "saved_for_later";

export type SprintEvent =
  | { type: "DETECT"; at: number }
  | { type: "WAIT" }
  | { type: "THRESHOLD_MET" }
  | { type: "START" }
  | { type: "LISTENED" }
  | { type: "ANSWER" }
  | { type: "FINISH" }
  | { type: "AI_READY" }
  | { type: "RESUME" }
  | { type: "DISMISS" }
  | { type: "SNOOZE" }
  | { type: "SAVE" }
  | { type: "RESET" };

export type ExerciseMode = "academic" | "conversation" | "technology" | "daily";
export type QuestionType =
  "main-idea" | "heard-word" | "number" | "fill-blank" | "speaker-intent";

export interface ListeningQuestion {
  type: QuestionType;
  prompt: string;
  choices: string[];
  correctIndex: number;
}

export interface ListeningExercise {
  id: string;
  title: string;
  mode: ExerciseMode;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedSeconds: number;
  transcript: string;
  audioUrl?: string | undefined;
  preferredLocales: string[];
  question: ListeningQuestion;
  explanationJa: string;
  keyExpression: string;
  answerEvidence: string;
  tags: string[];
}

export interface ReviewState {
  exerciseId: string;
  attempts: number;
  correctCount: number;
  lastAttemptAt?: number | undefined;
  nextReviewAt?: number | undefined;
  intervalDays: number;
  ease: number;
}

export interface SessionRecord {
  id: string;
  exerciseId: string;
  completedAt: number;
  activeSeconds: number;
  correct: boolean;
  replayCount: number;
  transcriptRevealed: boolean;
  locale: string;
  tags: string[];
  difficulty: number;
}

export interface Settings {
  language: "ja" | "en";
  autoStart: boolean;
  autoStartSites: Record<"chatgpt" | "claude" | "gemini", boolean>;
  minimumWaitSeconds: number;
  cooldownMinutes: number;
  maxAutoStartsPerHour: number;
  weeklyGoal: number;
  preferredTopics: string[];
  preferredDifficulty: 1 | 2 | 3 | 4 | 5;
  adaptiveDifficulty: boolean;
  voiceLocale: string;
  voiceName: string;
  playbackRate: 0.8 | 1 | 1.2;
  volume: number;
  soundEnabled: boolean;
  overlayPosition: "bottom-right" | "bottom-left";
  maxQuestions: 1 | 2 | 3;
  reducedMotion: boolean;
  snoozedUntil?: number | undefined;
}

export const defaultSettings: Settings = {
  language: "ja",
  autoStart: true,
  autoStartSites: { chatgpt: true, claude: true, gemini: true },
  minimumWaitSeconds: 5,
  cooldownMinutes: 10,
  maxAutoStartsPerHour: 4,
  weeklyGoal: 5,
  preferredTopics: ["technology", "conversation"],
  preferredDifficulty: 2,
  adaptiveDifficulty: true,
  voiceLocale: "en-US",
  voiceName: "",
  playbackRate: 1,
  volume: 1,
  soundEnabled: true,
  overlayPosition: "bottom-right",
  maxQuestions: 1,
  reducedMotion: false,
};
