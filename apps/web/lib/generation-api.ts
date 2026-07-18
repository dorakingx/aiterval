import { createHash, timingSafeEqual } from "node:crypto";
import { ZodError } from "zod";
import { lectureGenerationRequestSchema } from "@aiterval/core";
import {
  GENERATION_TIMEOUT_MS,
  GenerationError,
  configuredModel,
  generateSprintsWithOpenAI,
  type ResponsesClient,
} from "./generation-server";

type Counter = { day: string; count: number };
const rateWindows = new Map<string, number[]>();
const dailyCounters = new Map<string, Counter>();
const activeRequests = new Set<string>();

export interface GenerationApiDependencies {
  environment?: Record<string, string | undefined>;
  client?: ResponsesClient;
  now?: () => number;
}

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
    },
  });
}

function safeEqual(actual: string, expected: string): boolean {
  const left = Buffer.from(actual);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function identityFor(request: Request, secret: string): string {
  const raw =
    request.headers.get("x-aiterval-session") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous";
  return createHash("sha256").update(`${secret}:${raw}`).digest("hex");
}

export function rateLimitDecision(
  identity: string,
  now: number,
  dailyQuota: number,
): { allowed: true } | { allowed: false; reason: "rate" | "quota" } {
  const recent = (rateWindows.get(identity) ?? []).filter(
    (timestamp) => now - timestamp < 60 * 60 * 1_000,
  );
  if (recent.length >= 5) return { allowed: false, reason: "rate" };
  const day = new Date(now).toISOString().slice(0, 10);
  const daily = dailyCounters.get(day) ?? { day, count: 0 };
  if (daily.count >= dailyQuota) return { allowed: false, reason: "quota" };
  recent.push(now);
  rateWindows.set(identity, recent);
  daily.count += 1;
  dailyCounters.set(day, daily);
  return { allowed: true };
}

export function resetGenerationLimitsForTests() {
  rateWindows.clear();
  dailyCounters.clear();
  activeRequests.clear();
}

export async function handleGenerationRequest(
  request: Request,
  dependencies: GenerationApiDependencies = {},
): Promise<Response> {
  const startedAt = Date.now();
  if (request.method !== "POST")
    return json(405, { error: "method_not_allowed" });
  const environment = dependencies.environment ?? process.env;
  if (!environment.OPENAI_API_KEY)
    return json(503, {
      error: "live_unavailable",
      message:
        "Live GPT-5.6 generation is not configured. Use the sample pack instead.",
    });
  const expectedCode = environment.DEMO_ACCESS_CODE;
  if (!expectedCode)
    return json(503, {
      error: "live_unavailable",
      message: "Judge access is not configured. Use the sample pack instead.",
    });
  const accessCode = request.headers.get("x-demo-access-code") ?? "";
  if (!safeEqual(accessCode, expectedCode))
    return json(401, {
      error: "invalid_access_code",
      message: "Enter the judge access code or use sample mode.",
    });

  const identity = identityFor(request, expectedCode);
  if (activeRequests.has(identity))
    return json(409, {
      error: "duplicate_request",
      message:
        "A generation request is already running in this browser session.",
    });
  const now = (dependencies.now ?? Date.now)();
  const limit = rateLimitDecision(
    identity,
    now,
    Number(environment.DEMO_DAILY_QUOTA || 30),
  );
  if (!limit.allowed)
    return json(429, {
      error: limit.reason === "quota" ? "quota_exceeded" : "rate_limited",
      message:
        limit.reason === "quota"
          ? "Today's live demo quota has been reached. Sample mode remains available."
          : "Please wait before generating another lecture pack.",
    });

  activeRequests.add(identity);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);
  const abort = () => controller.abort();
  request.signal.addEventListener("abort", abort, { once: true });
  try {
    const body = lectureGenerationRequestSchema.parse(await request.json());
    const model = configuredModel(environment);
    const result = await generateSprintsWithOpenAI(body, {
      ...(dependencies.client ? { client: dependencies.client } : {}),
      model,
      signal: controller.signal,
      ...(dependencies.now ? { now: dependencies.now } : {}),
    });
    console.info(
      JSON.stringify({
        event: "lecture_generation",
        at: new Date().toISOString(),
        model: result.model,
        category: "success",
        latencyMs: Date.now() - startedAt,
        exerciseCount: result.exercises.length,
        requestId: result.requestId,
      }),
    );
    return json(200, {
      exercises: result.exercises,
      metadata: {
        model: result.model,
        generatedAt: result.generatedAt,
        requestId: result.requestId,
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof ZodError)
      return json(400, {
        error: "invalid_request",
        message: "Check the lecture details and length limits.",
      });
    const safe =
      error instanceof GenerationError
        ? error
        : new GenerationError("network", "Generation failed safely.");
    console.info(
      JSON.stringify({
        event: "lecture_generation",
        at: new Date().toISOString(),
        model: environment.OPENAI_MODEL || "gpt-5.6",
        category: safe.code,
        latencyMs: Date.now() - startedAt,
        exerciseCount: 0,
        requestId: safe.requestId,
      }),
    );
    const status =
      safe.code === "configuration" || safe.code === "model_unavailable"
        ? 503
        : safe.code === "rate_limit"
          ? 429
          : safe.code === "timeout"
            ? 504
            : safe.code === "invalid_output"
              ? 502
              : 502;
    return json(status, { error: safe.code, message: safe.message });
  } finally {
    clearTimeout(timeout);
    request.signal.removeEventListener("abort", abort);
    activeRequests.delete(identity);
  }
}
