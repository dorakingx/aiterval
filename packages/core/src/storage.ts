import { z } from "zod";
import {
  defaultSettings,
  type ReviewState,
  type SessionRecord,
  type Settings,
  type SprintStateName,
} from "./types";

export const CURRENT_SCHEMA_VERSION = 1;
const settingsSchema = z.object({
  language: z.enum(["ja", "en"]),
  autoStart: z.boolean(),
  autoStartSites: z.object({
    chatgpt: z.boolean(),
    claude: z.boolean(),
    gemini: z.boolean(),
  }),
  minimumWaitSeconds: z.number().min(3).max(90),
  cooldownMinutes: z.number().min(1).max(120),
  maxAutoStartsPerHour: z.number().int().min(1).max(12),
  weeklyGoal: z.number().int().min(1).max(50),
  preferredTopics: z.array(z.string().max(60)).max(20),
  preferredDifficulty: z.number().int().min(1).max(5),
  adaptiveDifficulty: z.boolean(),
  voiceLocale: z.string().max(30),
  voiceName: z.string().max(200),
  playbackRate: z.union([z.literal(0.8), z.literal(1), z.literal(1.2)]),
  volume: z.number().min(0).max(1),
  soundEnabled: z.boolean(),
  overlayPosition: z.enum(["bottom-right", "bottom-left"]),
  maxQuestions: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  reducedMotion: z.boolean(),
  snoozedUntil: z.number().optional(),
});

const sessionSchema = z.object({
  id: z.string().max(100),
  exerciseId: z.string().max(100),
  completedAt: z.number(),
  activeSeconds: z.number().min(0).max(7_200),
  correct: z.boolean(),
  replayCount: z.number().int().min(0).max(100),
  transcriptRevealed: z.boolean(),
  locale: z.string().max(30),
  tags: z.array(z.string().max(60)).max(30),
  difficulty: z.number().int().min(1).max(5),
});
const reviewSchema = z.object({
  exerciseId: z.string(),
  attempts: z.number().int().min(0),
  correctCount: z.number().int().min(0),
  lastAttemptAt: z.number().optional(),
  nextReviewAt: z.number().optional(),
  intervalDays: z.number().min(0),
  ease: z.number().min(1).max(4),
});

export interface StoredData {
  schemaVersion: number;
  settings: Settings;
  sessions: SessionRecord[];
  reviews: ReviewState[];
  runtime: {
    sprintState: SprintStateName;
    exerciseId?: string | undefined;
    startedAt?: number | undefined;
  };
  aggregates: {
    totalRecoveredSeconds: number;
    totalCompleted: number;
    bestWeeklyTotal: number;
  };
}

const storedDataSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  settings: settingsSchema,
  sessions: z.array(sessionSchema).max(500),
  reviews: z.array(reviewSchema).max(1000),
  runtime: z.object({
    sprintState: z.string(),
    exerciseId: z.string().optional(),
    startedAt: z.number().optional(),
  }),
  aggregates: z.object({
    totalRecoveredSeconds: z.number().min(0),
    totalCompleted: z.number().int().min(0),
    bestWeeklyTotal: z.number().int().min(0),
  }),
});

export function emptyStoredData(): StoredData {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    settings: defaultSettings,
    sessions: [],
    reviews: [],
    runtime: { sprintState: "idle" },
    aggregates: {
      totalRecoveredSeconds: 0,
      totalCompleted: 0,
      bestWeeklyTotal: 0,
    },
  };
}

export function migrateStorage(input: unknown): StoredData {
  if (!input || typeof input !== "object") return emptyStoredData();
  const record = input as Record<string, unknown>;
  if (record.schemaVersion === CURRENT_SCHEMA_VERSION) return importData(input);
  return emptyStoredData();
}

export function importData(input: unknown): StoredData {
  const parsed = storedDataSchema.parse(input);
  return {
    ...parsed,
    runtime: {
      ...parsed.runtime,
      sprintState: parsed.runtime.sprintState as SprintStateName,
    },
    settings: parsed.settings as Settings,
  };
}

export interface KeyValueStore {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

export class StorageRepository {
  static readonly key = "aiterval-data";
  constructor(private readonly store: KeyValueStore) {}
  async load(): Promise<StoredData> {
    return migrateStorage(await this.store.get(StorageRepository.key));
  }
  async save(data: StoredData): Promise<void> {
    const safe = importData(data);
    if (safe.sessions.length > 500) safe.sessions = safe.sessions.slice(-500);
    await this.store.set(StorageRepository.key, safe);
  }
  async clear(): Promise<void> {
    await this.store.remove(StorageRepository.key);
  }
}
