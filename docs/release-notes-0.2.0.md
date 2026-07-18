# AIterval 0.2.0 — OpenAI Build Week Edition

## Final submission scope

The v0.2.0 tag and release assets are preserved unchanged as Build Week
evidence. For the final submission, AIterval is presented and deployed as a
local-first extension using only its 132 original pre-authored exercises.
Runtime AI exercise generation is archived, not advertised, and not configured
in production.

## Submitted highlights

- One 15–90 second listening sprint during a normal AI wait.
- 132 original built-in exercises with local scheduling and review.
- Narrow semantic wait-state observation that never reads prompts or responses.
- Immediate speech interruption when AI work finishes.
- Local progress, weak-skill view, recovered-time totals, and settings.
- Public no-login judge journey and deterministic real-extension E2E fixtures.
- Manifest V3 permissions and CSP with no remote extension code.

## Install

Download the Chrome ZIP and `SHA256SUMS.txt`, verify the checksum, unzip, and
load the extracted `manifest.json` directory through `chrome://extensions`
Developer mode. See `docs/installation.md`.

## Compatibility and limitations

Current desktop Chrome is supported. Automatic detection depends on third-party
UI; manual start remains available. Speech quality depends on installed voices.
The release is not a Chrome Web Store publication. No OpenAI key or model access
is required for the submitted experience.
