# AIterval 0.2.0 — OpenAI Build Week Edition

## Highlights

- **Lecture-to-Sprints:** turn an explicitly submitted upcoming lecture abstract into 1–5 schema-validated listening exercises with GPT-5.6.
- Current OpenAI Responses API and Zod Structured Outputs with server revalidation, trusted provenance, and one bounded schema retry.
- Public no-login judge journey plus clearly labeled curated sample mode.
- Safe JSON export/import keeps the extension’s host permissions and CSP unchanged.
- Generated-pack progress, pause/resume, rename, export, regenerate, delete, source badge, and scheduling.
- Aggregate-only opt-in personalization without raw session history.
- Storage schema v2 migration and 38 unit/component/API tests plus Chromium web/extension E2E.
- Accurate external-call privacy copy, server-only credentials, access-code enforcement, timeout, rate limits, and daily quota.

## Install

Download the Chrome ZIP and `SHA256SUMS.txt`, verify the checksum, unzip, and load the extracted `manifest.json` directory through `chrome://extensions` Developer mode. See `docs/installation.md` for the full no-build path.

## Compatibility and limitations

Current desktop Chrome is supported. Automatic wait detection depends on third-party UI; manual start remains available. Browser speech quality depends on installed voices. Live GPT-5.6 generation requires a configured server key and private demo code, while built-in exercises and the public sample require neither. This release is not a Chrome Web Store publication.
