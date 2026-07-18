# Privacy

AIterval is local-first and has no account requirement.

## Access

On `chatgpt.com`, `claude.ai`, and `gemini.google.com`, the extension observes generation-state UI attributes on buttons, progress indicators, and busy regions. It uses these signals only to decide when a waiting opportunity starts or ends.

It does not collect prompts, AI responses, conversation content, browsing history, or page text. Core listening and learning history remain local.

## Local data

Chrome extension storage contains settings, current sprint recovery state, answers, replay count, transcript reveal, self-reported difficulty, review dates, recent sessions, generated lecture packs, recovered active listening time, and aggregate completion statistics. Users can export validated JSON or delete all local data from the dashboard. Built-in exercises remain usable without an API key.

## Lecture-to-Sprints

Live generation is opt-in. When the user explicitly selects **Generate with GPT-5.6**, AIterval sends only the lecture title, abstract, expected terms, optional event context, and selected learning preferences to the server-side OpenAI Responses API. Optional personalization sends only aggregated weak-skill tags, target difficulty, and preferred locale; it never sends raw sessions.

The API key and judge access code exist only on the server. Lecture input is used for the request and is not stored by AIterval. The server logs only timestamp, model, safe result category, latency, exercise count, and an OpenAI request ID when available. It never logs the abstract or generated transcript. Generated packs are runtime-validated before export and again before extension storage.

## Permissions

- `storage`: local settings and learning progress.
- narrow host permissions for ChatGPT, Claude, and Gemini: automatic wait-state observation.
- `activeTab` and `scripting`: user-initiated manual sprint on the current page.
- `contextMenus`: manual Start a Listening Sprint action.

The keyboard command and popup do not require microphone, camera, clipboard, notifications, cookies, or identity access.

## Third parties

There are no analytics, advertising, tracking pixels, remote executable code, or advertising cookies. OpenAI is called only for explicit live Lecture-to-Sprints generation; the public sample demo makes no paid API request. Audio uses the browser/operating system Web Speech implementation; AIterval does not upload the transcript.
