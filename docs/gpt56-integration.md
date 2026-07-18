# Archived GPT-5.6 runtime experiment

This document records a development experiment for repository transparency. It
does not describe an available or submitted product feature.

During Build Week, Codex with GPT-5.6 helped design and test a server-only
lecture-to-exercise prototype, strict schemas, validation boundaries, and
failure handling. The final product decision was to submit AIterval as a
local-first extension using only 132 original pre-authored exercises.

Final production state:

- `/lecture` redirects to the public judge demo.
- `POST /api/generate-sprints` returns HTTP 410 with an archived-feature error.
- The public navigation contains no runtime-generation entry point.
- Production has no OpenAI key, model, judge-code, or quota variables.
- The extension makes no OpenAI request and requires no OpenAI permission.

Historical implementation and tests remain in the repository for auditability
and to avoid altering the verified v0.2.0 release. They are unreachable from the
submitted product and must not be presented as judge functionality.

GPT-5.6 remains part of the honest development story: it supported architecture,
implementation, testing, debugging, security review, and refinement through
Codex. It does not generate exercises in the submitted runtime.
