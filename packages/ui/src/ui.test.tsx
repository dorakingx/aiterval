import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ListeningExercise } from "@aiterval/core";
import { ListeningPlayer, Modal, Toggle, type AudioProvider } from ".";

const exercise: ListeningExercise = {
  id: "test",
  title: "Test",
  mode: "daily",
  difficulty: 1,
  estimatedSeconds: 20,
  transcript: "Mina will meet on Friday.",
  preferredLocales: ["en-US"],
  question: {
    type: "number",
    prompt: "When will Mina meet?",
    choices: ["Friday", "Monday"],
    correctIndex: 0,
  },
  explanationJa: "金曜日です。",
  keyExpression: "on Friday",
  answerEvidence: "on Friday",
  tags: ["numbers", "daily"],
};
class DeferredAudioProvider implements AudioProvider {
  events: string[] = [];
  play = vi.fn(() => {
    this.events.push("playback started");
    return new Promise<void>((resolve, reject) => {
      this.resolvePlayback = resolve;
      this.rejectPlayback = reject;
    });
  });
  pause = vi.fn();
  resume = vi.fn();
  stop = vi.fn();
  resolvePlayback?: () => void;
  rejectPlayback?: (reason?: unknown) => void;
  isAvailable = () => true;
  getVoices = async () => [];
  midpoint() {
    this.events.push("midpoint reached");
  }
  finish() {
    this.events.push("playback naturally ended");
    this.resolvePlayback?.();
  }
}

describe("ListeningPlayer", () => {
  it("keeps transcript and answer hidden until feedback", async () => {
    const user = userEvent.setup();
    const audio = new DeferredAudioProvider();
    render(<ListeningPlayer exercise={exercise} audioProvider={audio} />);
    expect(screen.queryByText(exercise.transcript)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Play audio" }));
    await act(async () => audio.finish());
    expect(screen.queryByText(exercise.transcript)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Friday/ }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText(/Mina will meet/)).toBeInTheDocument();
    expect(screen.getByText("Correct")).toBeInTheDocument();
  });
  it("keeps active audio and controls mounted when AI readiness arrives", async () => {
    const user = userEvent.setup();
    const audio = new DeferredAudioProvider();
    const view = render(
      <ListeningPlayer exercise={exercise} audioProvider={audio} />,
    );
    await user.click(screen.getByRole("button", { name: "Play audio" }));
    audio.midpoint();
    view.rerender(
      <ListeningPlayer exercise={exercise} audioProvider={audio} aiReady />,
    );
    expect(screen.getByText("Your AI is ready")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause audio" })).toBeVisible();
    expect(screen.getByText("Listen first")).toBeVisible();
    expect(audio.stop).not.toHaveBeenCalled();
    await act(async () => audio.finish());
    expect(audio.events).toEqual([
      "playback started",
      "midpoint reached",
      "playback naturally ended",
    ]);
    expect(screen.getByText(exercise.question.prompt)).toBeVisible();
  });
  it("allows playback to start after AI readiness arrives", async () => {
    const user = userEvent.setup();
    const audio = new DeferredAudioProvider();
    render(
      <ListeningPlayer exercise={exercise} audioProvider={audio} aiReady />,
    );
    await user.click(screen.getByRole("button", { name: "Play audio" }));
    expect(audio.play).toHaveBeenCalledOnce();
    expect(audio.stop).not.toHaveBeenCalled();
  });
  it("does not cancel when AI readiness follows playback start immediately", async () => {
    const user = userEvent.setup();
    const audio = new DeferredAudioProvider();
    const view = render(
      <ListeningPlayer exercise={exercise} audioProvider={audio} />,
    );
    await user.click(screen.getByRole("button", { name: "Play audio" }));
    view.rerender(
      <ListeningPlayer exercise={exercise} audioProvider={audio} aiReady />,
    );
    expect(screen.getByRole("button", { name: "Pause audio" })).toBeVisible();
    expect(audio.stop).not.toHaveBeenCalled();
    await act(async () => audio.finish());
    expect(screen.getByText(exercise.question.prompt)).toBeVisible();
  });
  it("treats duplicate AI-ready renders as idempotent", async () => {
    const audio = new DeferredAudioProvider();
    const view = render(
      <ListeningPlayer exercise={exercise} audioProvider={audio} aiReady />,
    );
    view.rerender(
      <ListeningPlayer exercise={exercise} audioProvider={audio} aiReady />,
    );
    expect(screen.getAllByText("Your AI is ready")).toHaveLength(1);
    expect(audio.stop).not.toHaveBeenCalled();
  });
  it("stops audio once when returning to AI", async () => {
    const user = userEvent.setup();
    const audio = new DeferredAudioProvider();
    const onReturnToAi = vi.fn();
    render(
      <ListeningPlayer
        exercise={exercise}
        audioProvider={audio}
        aiReady
        onReturnToAi={onReturnToAi}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Play audio" }));
    await user.click(screen.getByRole("button", { name: "Return to AI now" }));
    expect(audio.stop).toHaveBeenCalledOnce();
    expect(onReturnToAi).toHaveBeenCalledOnce();
  });
  it("stops and saves an unfinished exercise once", async () => {
    const user = userEvent.setup();
    const audio = new DeferredAudioProvider();
    const onSave = vi.fn();
    render(
      <ListeningPlayer
        exercise={exercise}
        audioProvider={audio}
        aiReady
        onSave={onSave}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Play audio" }));
    await user.dblClick(screen.getByRole("button", { name: "Save for later" }));
    expect(audio.stop).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
  });
  it("stops audio when the overlay is closed", async () => {
    const user = userEvent.setup();
    const audio = new DeferredAudioProvider();
    const onClose = vi.fn();
    render(
      <ListeningPlayer
        exercise={exercise}
        audioProvider={audio}
        onClose={onClose}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Play audio" }));
    await user.click(
      screen.getByRole("button", { name: "Close listening sprint" }),
    );
    expect(audio.stop).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
  it("keeps AI readiness visible after audio has already finished", async () => {
    const user = userEvent.setup();
    const audio = new DeferredAudioProvider();
    const view = render(
      <ListeningPlayer exercise={exercise} audioProvider={audio} />,
    );
    await user.click(screen.getByRole("button", { name: "Play audio" }));
    await act(async () => audio.finish());
    view.rerender(
      <ListeningPlayer exercise={exercise} audioProvider={audio} aiReady />,
    );
    expect(screen.getByText("Your AI is ready")).toBeVisible();
    expect(screen.getByText(exercise.question.prompt)).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Save for later" }),
    ).toBeInTheDocument();
  });
  it("reports normal completion once after AI readiness", async () => {
    const user = userEvent.setup();
    const audio = new DeferredAudioProvider();
    const onComplete = vi.fn();
    render(
      <ListeningPlayer
        exercise={exercise}
        audioProvider={audio}
        aiReady
        onComplete={onComplete}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Play audio" }));
    await act(async () => audio.finish());
    await user.click(screen.getByRole("button", { name: /Friday/ }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await user.dblClick(
      screen.getByRole("button", { name: "Complete sprint" }),
    );
    expect(onComplete).toHaveBeenCalledOnce();
  });
  it("supports keyboard answer navigation", async () => {
    const user = userEvent.setup();
    const audio = new DeferredAudioProvider();
    render(<ListeningPlayer exercise={exercise} audioProvider={audio} />);
    await user.click(screen.getByRole("button", { name: "Play audio" }));
    await act(async () => audio.finish());
    await user.tab();
    expect(screen.getByRole("button", { name: /Friday/ })).toHaveFocus();
  });
  it("updates settings controls and presents explicit deletion confirmation", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <>
        <Toggle
          checked={false}
          onChange={onChange}
          label="Auto-start globally"
        />
        <Modal open title="Delete all local data?" onClose={vi.fn()}>
          <p>This permanently removes settings and history.</p>
          <button>Delete everything</button>
        </Modal>
      </>,
    );
    await user.click(screen.getByText("Auto-start globally"));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(
      screen.getByRole("dialog", { name: "Delete all local data?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete everything" }),
    ).toBeInTheDocument();
  });
});
