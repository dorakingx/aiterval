import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  handleGenerationRequest,
  rateLimitDecision,
  resetGenerationLimitsForTests,
} from "./generation-api";
import type { ResponsesClient } from "./generation-server";

const body = {
  lectureTitle: "Reliable experiments",
  lectureAbstract:
    "This lecture explains why baseline measurements make experimental comparisons more reliable.",
  expectedTechnicalTerms: [],
  userLevel: "B2",
  difficulty: 3,
  targetSeconds: 45,
  exerciseCount: 1,
  learningFocus: "main-idea",
  preferredLocale: "en-GB",
  eventContext: "",
  japaneseExplanation: true,
  schemaVersion: 1,
};

const output = {
  exercises: [
    {
      id: "model-draft-1",
      title: "A useful comparison point",
      mode: "academic",
      difficulty: 3,
      estimatedSeconds: 45,
      transcript:
        "The speaker establishes a baseline before treatment, which gives the team a clear comparison point.",
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
      model: "gpt-5.6",
      generatedAt: 1,
      lectureTitle: "Reliable experiments",
      generationVersion: 1,
    },
  ],
};

const environment = {
  OPENAI_API_KEY: "test-only",
  OPENAI_MODEL: "gpt-5.6",
  DEMO_ACCESS_CODE: "judge-only",
  DEMO_DAILY_QUOTA: "30",
};

function makeRequest(
  options: { code?: string; value?: unknown; session?: string } = {},
) {
  return new Request("https://example.test/api/generate-sprints", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-demo-access-code": options.code ?? "judge-only",
      "x-aiterval-session": options.session ?? crypto.randomUUID(),
    },
    body: JSON.stringify(options.value ?? body),
  });
}

const client: ResponsesClient = {
  responses: {
    parse: vi.fn().mockResolvedValue({
      output_parsed: output,
      model: "gpt-5.6-sol",
    }),
  },
};

describe("generation API", () => {
  beforeEach(() => {
    resetGenerationLimitsForTests();
    vi.clearAllMocks();
  });

  it("keeps sample mode available when no API key exists", async () => {
    const response = await handleGenerationRequest(makeRequest(), {
      environment: {},
    });
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: "live_unavailable",
    });
  });

  it("rejects missing or invalid access codes", async () => {
    const response = await handleGenerationRequest(
      makeRequest({ code: "wrong" }),
      { environment },
    );
    expect(response.status).toBe(401);
  });

  it("rejects overlong input before calling OpenAI", async () => {
    const response = await handleGenerationRequest(
      makeRequest({ value: { ...body, lectureAbstract: "x".repeat(6_001) } }),
      { environment, client },
    );
    expect(response.status).toBe(400);
    expect(client.responses.parse).not.toHaveBeenCalled();
  });

  it("returns only validated exercises and minimal metadata", async () => {
    const response = await handleGenerationRequest(makeRequest(), {
      environment,
      client,
      now: () => 1_700_000_000_000,
    });
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toMatchObject({
      exercises: [{ source: "gpt-5.6" }],
      metadata: { model: "gpt-5.6-sol" },
    });
    expect(JSON.stringify(payload)).not.toContain(body.lectureAbstract);
  });

  it("enforces rate and daily quota decisions", () => {
    for (let index = 0; index < 5; index += 1)
      expect(rateLimitDecision("browser", 1_000 + index, 30)).toEqual({
        allowed: true,
      });
    expect(rateLimitDecision("browser", 2_000, 30)).toEqual({
      allowed: false,
      reason: "rate",
    });
    resetGenerationLimitsForTests();
    expect(rateLimitDecision("one", 1_000, 1)).toEqual({ allowed: true });
    expect(rateLimitDecision("two", 2_000, 1)).toEqual({
      allowed: false,
      reason: "quota",
    });
  });
});
