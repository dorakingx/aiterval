import type {
  ListeningExercise,
  ReviewState,
  SessionRecord,
  Settings,
} from "./types";

export interface SelectionContext {
  now: number;
  seed: number;
  expectedWaitSeconds: number;
  recentExerciseIds: string[];
  reviews: ReviewState[];
  sessions: SessionRecord[];
  settings: Settings;
}

function seeded(seed: number): number {
  const value = Math.sin(seed * 12_989.8) * 43_758.5453;
  return value - Math.floor(value);
}

export function weakTags(
  sessions: SessionRecord[],
  minimumAttempts = 3,
): string[] {
  const scores = new Map<string, { attempts: number; correct: number }>();
  for (const session of sessions)
    for (const tag of session.tags) {
      const item = scores.get(tag) ?? { attempts: 0, correct: 0 };
      item.attempts += 1;
      item.correct += Number(session.correct);
      scores.set(tag, item);
    }
  return [...scores.entries()]
    .filter(([, value]) => value.attempts >= minimumAttempts)
    .sort((a, b) => a[1].correct / a[1].attempts - b[1].correct / b[1].attempts)
    .map(([tag]) => tag);
}

export function selectExercise(
  exercises: ListeningExercise[],
  context: SelectionContext,
): ListeningExercise | undefined {
  const reviewMap = new Map(
    context.reviews.map((review) => [review.exerciseId, review]),
  );
  const weak = new Set(weakTags(context.sessions));
  const scored = exercises.map((exercise, index) => {
    const review = reviewMap.get(exercise.id);
    let score = seeded(context.seed + index);
    if (review?.nextReviewAt && review.nextReviewAt <= context.now) score += 12;
    score += exercise.tags.filter((tag) => weak.has(tag)).length * 3;
    score +=
      exercise.tags.filter((tag) =>
        context.settings.preferredTopics.includes(tag),
      ).length * 2;
    score += Math.max(
      0,
      4 - Math.abs(exercise.difficulty - context.settings.preferredDifficulty),
    );
    score += Math.max(
      0,
      3 -
        Math.abs(exercise.estimatedSeconds - context.expectedWaitSeconds) / 20,
    );
    if (context.recentExerciseIds.includes(exercise.id)) score -= 20;
    return { exercise, score };
  });
  return scored.sort(
    (a, b) => b.score - a.score || a.exercise.id.localeCompare(b.exercise.id),
  )[0]?.exercise;
}

export function updateReview(
  previous: ReviewState | undefined,
  correct: boolean,
  now: number,
): ReviewState {
  const attempts = (previous?.attempts ?? 0) + 1;
  const ease = Math.max(
    1.3,
    Math.min(2.8, (previous?.ease ?? 2) + (correct ? 0.1 : -0.2)),
  );
  const intervalDays = correct
    ? Math.max(1, Math.round((previous?.intervalDays || 1) * ease))
    : 1;
  return {
    exerciseId: previous?.exerciseId ?? "",
    attempts,
    correctCount: (previous?.correctCount ?? 0) + Number(correct),
    lastAttemptAt: now,
    nextReviewAt: now + intervalDays * 86_400_000,
    intervalDays,
    ease,
  };
}

export function suggestedDifficulty(
  sessions: SessionRecord[],
  current: 1 | 2 | 3 | 4 | 5,
): 1 | 2 | 3 | 4 | 5 {
  const recent = sessions.slice(-5);
  if (recent.length < 3) return current;
  const accuracy =
    recent.filter((session) => session.correct).length / recent.length;
  const next =
    accuracy >= 0.8 ? current + 1 : accuracy < 0.5 ? current - 1 : current;
  return Math.max(1, Math.min(5, next)) as 1 | 2 | 3 | 4 | 5;
}
