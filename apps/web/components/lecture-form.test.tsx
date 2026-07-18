import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LectureForm } from "./lecture-form";

const generated = {
  id: "generated-1700000000000-1",
  title: "A useful comparison point",
  mode: "academic",
  difficulty: 3,
  estimatedSeconds: 45,
  transcript:
    "The speaker establishes a baseline before treatment, giving the team a clear comparison point.",
  preferredLocales: ["en-GB"],
  question: {
    type: "main-idea",
    prompt: "Why establish a baseline?",
    choices: ["For comparison", "To stop the study"],
    correctIndex: 0,
  },
  explanationJa: "比較のためです。",
  keyExpression: "establishes a baseline",
  answerEvidence: "establishes a baseline",
  tags: ["academic", "main-idea"],
  source: "gpt-5.6",
  model: "gpt-5.6-sol",
  generatedAt: 1_700_000_000_000,
  lectureTitle: "Reliable experiments",
  generationVersion: 1,
};

afterEach(() => vi.unstubAllGlobals());

describe("LectureForm", () => {
  it("shows bounded inputs, access code, and the privacy disclosure", () => {
    render(<LectureForm />);
    expect(
      screen.getByRole("heading", { name: "Prepare for your next lecture" }),
    ).toBeVisible();
    expect(screen.getByLabelText(/Lecture title/)).toHaveAttribute(
      "maxlength",
      "180",
    );
    expect(screen.getByLabelText(/Abstract or description/)).toHaveAttribute(
      "maxlength",
      "6000",
    );
    expect(screen.getByLabelText(/Judge access code/)).toHaveAttribute(
      "type",
      "password",
    );
    expect(screen.getByText("What is sent to GPT-5.6?")).toBeVisible();
  });

  it("switches between English and Japanese UI", async () => {
    const user = userEvent.setup();
    render(<LectureForm />);
    await user.click(screen.getByRole("button", { name: "日本語" }));
    expect(
      screen.getByRole("heading", { name: "次の講義を聞き取る準備" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "GPT-5.6で生成" })).toBeVisible();
  });

  it("renders an honestly labeled no-key sample", async () => {
    const user = userEvent.setup();
    render(<LectureForm />);
    await user.click(
      screen.getByRole("button", { name: "Try the no-key sample" }),
    );
    expect(
      screen.getByText("Curated sample · not live GPT-5.6 output"),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Why establish a baseline?" }),
    ).toBeVisible();
  });

  it("shows validation errors without making a request", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const user = userEvent.setup();
    render(<LectureForm />);
    await user.click(
      screen.getByRole("button", { name: "Generate with GPT-5.6" }),
    );
    expect(screen.getByRole("alert")).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("renders validated live results and source badges", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          exercises: [generated],
          metadata: { model: "gpt-5.6-sol" },
        }),
      ),
    );
    render(<LectureForm />);
    fireEvent.change(screen.getByLabelText(/Lecture title/), {
      target: { value: "Reliable experiments" },
    });
    fireEvent.change(screen.getByLabelText(/Abstract or description/), {
      target: {
        value:
          "This lecture explains why baseline measurements make experimental comparisons reliable.",
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Generate with GPT-5.6" }),
    );
    await waitFor(() =>
      expect(screen.getByText("Generated with gpt-5.6-sol")).toBeVisible(),
    );
    expect(
      screen.getByRole("button", { name: /Download validated/ }),
    ).toBeVisible();
  });

  it("recovers to sample mode after an API error", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            { message: "Today's live demo quota has been reached." },
            { status: 429 },
          ),
        ),
    );
    render(<LectureForm />);
    fireEvent.change(screen.getByLabelText(/Lecture title/), {
      target: { value: "Reliable experiments" },
    });
    fireEvent.change(screen.getByLabelText(/Abstract or description/), {
      target: {
        value:
          "This lecture explains why baseline measurements make experimental comparisons reliable.",
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Generate with GPT-5.6" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("quota"),
    );
    expect(
      screen.getByRole("button", { name: "Try the no-key sample" }),
    ).toBeEnabled();
  });
});
