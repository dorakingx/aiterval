import { render, screen } from "@testing-library/react";
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
const audio: AudioProvider = {
  isAvailable: () => true,
  getVoices: async () => [],
  play: vi.fn(async () => undefined),
  pause: vi.fn(),
  resume: vi.fn(),
  stop: vi.fn(),
};

describe("ListeningPlayer", () => {
  it("keeps transcript and answer hidden until feedback", async () => {
    const user = userEvent.setup();
    render(<ListeningPlayer exercise={exercise} audioProvider={audio} />);
    expect(screen.queryByText(exercise.transcript)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Play audio" }));
    await user.click(
      screen.getByRole("button", { name: /Answer one question/ }),
    );
    expect(screen.queryByText(exercise.transcript)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Friday/ }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText(/Mina will meet/)).toBeInTheDocument();
    expect(screen.getByText("Correct")).toBeInTheDocument();
  });
  it("renders the AI-ready interruption state with recovery actions", () => {
    render(
      <ListeningPlayer
        exercise={exercise}
        audioProvider={audio}
        initialStage="ai-ready"
      />,
    );
    expect(screen.getByText("Your AI is ready")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save for later" }),
    ).toBeInTheDocument();
  });
  it("supports keyboard answer navigation", async () => {
    const user = userEvent.setup();
    render(<ListeningPlayer exercise={exercise} audioProvider={audio} />);
    await user.click(screen.getByRole("button", { name: "Play audio" }));
    await user.click(
      screen.getByRole("button", { name: /Answer one question/ }),
    );
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
