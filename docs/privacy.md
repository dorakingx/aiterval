# Privacy

AIterval is local-first and has no account requirement.

## What it observes

On `chatgpt.com`, `claude.ai`, and `gemini.google.com`, the extension observes
generation-state controls and attributes such as accessible stop labels,
`aria-busy`, and known state markers. It uses them only to decide when a waiting
opportunity starts or ends.

It never reads, collects, stores, transmits, or logs prompt text, AI response
text, conversation content, page history, cookies, or account data.

## What stays local

Chrome extension storage contains settings, current sprint state, answers,
replay count, review dates, recent sessions, recovered listening time, and
aggregate completion statistics. Users can export a validated local backup or
delete their local data. Detailed history is capped at 500 sessions while
aggregate totals remain available.

The submitted product uses 132 original pre-authored exercises. It requires no
OpenAI API key and does not send lecture material or learning content to a
runtime generation service.

## Permissions

- `storage`: local settings and learning progress.
- narrow host permissions for ChatGPT, Claude, and Gemini: wait-state observation.
- `activeTab` and `scripting`: user-initiated manual sprint on the current page.
- `contextMenus`: manual **Start a Listening Sprint** action.

The extension does not request microphone, camera, clipboard, notifications,
cookies, or identity access. Its Content Security Policy permits no remote
extension code.

## Third parties

There are no analytics, advertising SDKs, tracking pixels, hidden telemetry,
remote executable code, or advertising cookies. Audio uses the browser or
operating system Web Speech implementation; AIterval does not upload exercise
transcripts.
