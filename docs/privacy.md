# Privacy

AIterval is local-first and has no account requirement.

## Access

On `chatgpt.com`, `claude.ai`, and `gemini.google.com`, the extension observes generation-state UI attributes on buttons, progress indicators, and busy regions. It uses these signals only to decide when a waiting opportunity starts or ends.

It does not collect prompts, AI responses, conversation content, browsing history, or page text. It does not send learning data to a server.

## Local data

Chrome extension storage contains settings, current sprint recovery state, answers, replay count, transcript reveal, self-reported difficulty, review dates, recent sessions, recovered active listening time, and aggregate completion statistics. Users can export validated JSON or delete all local data from the dashboard.

## Permissions

- `storage`: local settings and learning progress.
- narrow host permissions for ChatGPT, Claude, and Gemini: automatic wait-state observation.
- `activeTab` and `scripting`: user-initiated manual sprint on the current page.
- `contextMenus`: manual Start a Listening Sprint action.

The keyboard command and popup do not require microphone, camera, clipboard, notifications, cookies, or identity access.

## Third parties

There are no analytics, advertising, tracking pixels, remote executable code, external AI calls, or cookies. Audio uses the browser/operating system Web Speech implementation; AIterval does not upload the transcript.
