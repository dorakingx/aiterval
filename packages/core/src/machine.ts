import type { SprintEvent, SprintStateName } from "./types";

const transitions: Partial<
  Record<SprintStateName, Partial<Record<SprintEvent["type"], SprintStateName>>>
> = {
  idle: { DETECT: "opportunity_detected", START: "sprint_ready" },
  opportunity_detected: {
    WAIT: "waiting_for_threshold",
    DISMISS: "dismissed",
    SNOOZE: "snoozed",
  },
  waiting_for_threshold: {
    THRESHOLD_MET: "sprint_ready",
    AI_READY: "idle",
    DISMISS: "dismissed",
    SNOOZE: "snoozed",
  },
  sprint_ready: {
    START: "listening",
    AI_READY: "paused_ai_ready",
    DISMISS: "dismissed",
    SAVE: "saved_for_later",
  },
  listening: {
    LISTENED: "answering",
    AI_READY: "paused_ai_ready",
    DISMISS: "dismissed",
    SAVE: "saved_for_later",
  },
  answering: {
    ANSWER: "feedback",
    AI_READY: "paused_ai_ready",
    SAVE: "saved_for_later",
  },
  feedback: {
    FINISH: "completed",
    AI_READY: "paused_ai_ready",
    SAVE: "saved_for_later",
  },
  paused_ai_ready: {
    RESUME: "listening",
    FINISH: "completed",
    SAVE: "saved_for_later",
    DISMISS: "dismissed",
  },
  dismissed: { RESET: "idle" },
  snoozed: { RESET: "idle" },
  saved_for_later: { RESUME: "listening", RESET: "idle" },
  completed: { RESET: "idle" },
};

export function transition(
  state: SprintStateName,
  event: SprintEvent,
): SprintStateName {
  return transitions[state]?.[event.type] ?? state;
}

export class SprintMachine {
  constructor(public state: SprintStateName = "idle") {}
  send(event: SprintEvent): SprintStateName {
    this.state = transition(this.state, event);
    return this.state;
  }
}
