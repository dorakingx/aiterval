export function canAutoStart(input: {
  now: number;
  lastSprintAt?: number | undefined;
  automaticStarts: number[];
  cooldownMinutes: number;
  maxPerHour: number;
  snoozedUntil?: number | undefined;
}): boolean {
  if (input.snoozedUntil && input.snoozedUntil > input.now) return false;
  if (
    input.lastSprintAt &&
    input.now - input.lastSprintAt < input.cooldownMinutes * 60_000
  )
    return false;
  return (
    input.automaticStarts.filter((time) => input.now - time < 3_600_000)
      .length < input.maxPerHour
  );
}

export function recoveredSeconds(
  sessions: { activeSeconds: number }[],
): number {
  return sessions.reduce(
    (total, session) => total + Math.max(0, session.activeSeconds),
    0,
  );
}

export function weeklyProgress(completed: number, goal: number): number {
  return goal <= 0 ? 0 : Math.min(1, completed / goal);
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return minutes ? `${minutes}m ${rest}s` : `${rest}s`;
}
