# GPT-5.6 integration

## Why GPT-5.6 is central

The 132 built-in exercises make the waiting-time habit usable offline, but they cannot prepare a researcher for the vocabulary and listening patterns of a specific upcoming lecture. GPT-5.6 turns deliberately submitted topic material into original, level-appropriate exercises that fit AIterval’s validated runtime format. Those generated exercises then enter the same real wait/interruption/scheduling loop as built-in content.

## Data flow

```text
explicit lecture form submission
→ strict request validation and private demo-code check
→ server-only OpenAI Responses API call
→ GPT-5.6 Structured Output
→ strict server validation and provenance normalization
→ browser receives exercises + minimal metadata
→ schema-versioned JSON export
→ extension validates again and stores locally
→ generated pack is prioritized during an AI wait
```

Only the lecture title, abstract, optional terms/context, explicit learning preferences, requested count, and schema version are sent. The access code is a server authentication header and is not forwarded to the model. The API key never reaches the client. AIterval never reads or sends ChatGPT, Codex, Claude, or Gemini prompts/responses.

## Structured Outputs and validation

The server uses the current OpenAI JavaScript SDK `responses.parse` pattern with `zodTextFormat`. `generationOutputSchema` is shared with TypeScript inference, runtime validation, exported-pack import, and tests. After parsing, the server overwrites trusted provenance fields, verifies the exact exercise count, rejects transcripts copied wholesale from the supplied abstract, and validates again. It permits one retry only when structured output is invalid.

No hidden reasoning or full API response is returned or stored. Requests set `store: false` and use low reasoning effort because the task is bounded transformation.

## Prompt and content safety

The developer message treats all user text as untrusted source material. It instructs the model to ignore embedded instructions, role changes, URLs, code, and prompt-exfiltration requests; not to use tools; and not to claim the source said unsupported things. Input/output limits and strict tags/types reduce the parsing surface. Generated strings are rendered as React text.

## Reliability and cost controls

- 45-second server timeout plus request-abort propagation.
- At most one invalid-schema retry; no retries for other errors.
- 1–5 exercises, 15–90 seconds, 6,000-character abstract, 6,000 output tokens, and bounded transcript/schema fields.
- One active request per hashed browser identity, five requests per hour, and a configurable best-effort daily quota (default 30 per server instance).
- Explicit mappings for no key/code, wrong model, 429, 5xx, timeout, invalid output, and network failure.
- Public curated sample remains available without credentials and is never presented as a live call.

The in-memory limiter is appropriate to a bounded judging demo but is not a distributed production quota system.

## Model configuration

Preferred: `OPENAI_MODEL=gpt-5.6`. Allowed values are `gpt-5.6`, `gpt-5.6-sol`, `gpt-5.6-terra`, and `gpt-5.6-luna`. Any other model fails clearly; there is no silent fallback to a different family.

Required server-only settings:

```text
OPENAI_API_KEY
OPENAI_MODEL=gpt-5.6
DEMO_ACCESS_CODE
DEMO_DAILY_QUOTA=30   # optional
```

## Source map

- `packages/core/src/exercise-schema.ts` — canonical exercise schemas.
- `packages/core/src/generation.ts` — request/output/pack schemas, model allowlist, import, aggregation, scheduling.
- `apps/web/lib/generation-server.ts` — prompt, Responses API, Structured Outputs, retry, normalization, safe error mapping.
- `apps/web/lib/generation-api.ts` — access control, rate/quota, abort, response headers, safe logging.
- `apps/web/app/api/generate-sprints/route.ts` — POST route.
- `apps/web/components/lecture-form.tsx` — explicit submission, sample/live states, cancellation, validated export.
- `apps/extension/entrypoints/options/lecture-packs.tsx` — local import and pack lifecycle.
- `apps/extension/lib/overlay.tsx` — generated-pack scheduling into the wait loop.

Tests live beside these modules plus `tests/e2e/judge-demo.spec.ts` and `tests/e2e/extension.spec.ts`. `pnpm test:gpt56:smoke` is the only command permitted to make a real call, and it skips honestly when no key exists.
