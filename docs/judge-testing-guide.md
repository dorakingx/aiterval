# Judge testing guide

No build, account, OpenAI key, or access code is required for the primary judging path.

## Two-minute path

1. Open [the public judge demo](https://aiterval-build-week.vercel.app/demo/judge).
2. Select **Send prompt and try it**. Play the sprint, answer the question, and observe the **AI is ready** interruption and recovered-time update.
3. Open [Lecture-to-Sprints](https://aiterval-build-week.vercel.app/lecture).
4. Select **Try the no-key sample**. Confirm the visible **Curated sample—not a live GPT-5.6 call** label and inspect/export the generated-pack shape.
5. Optional: install the release extension and import `test-fixtures/generated-pack.json` to see a generated exercise prioritized during a real supported-site wait.

## Live GPT-5.6 path

Judge access code: **[PROVIDE ONLY IN PRIVATE DEVPOST TESTING INSTRUCTIONS]**

Enter the private code on the lecture page and choose live generation. Expected behavior is a loading state followed by 1–5 schema-validated exercises labeled **Generated with GPT-5.6**. If server credentials or quota are unavailable, the page provides a clear error while sample mode continues to work.

The committed repository intentionally contains no real access code. Do not paste it into an issue, screenshot, video, or public description.

## Extension package (no build required)

- Release: [AIterval v0.2.0](https://github.com/dorakingx/aiterval/releases/tag/v0.2.0)
- ZIP name: `aitervalextension-0.2.0-chrome.zip`
- SHA-256: `7e2bc8ed9195820aa526b3be0fd2de593c23a8a5d465693ca12a73b3f726bb58`
- Supported: current desktop Google Chrome on macOS, Windows, and Linux. Manifest V3 and browser speech synthesis are required.

Installation:

1. Download the ZIP and `SHA256SUMS.txt` from the release.
2. Verify it with `shasum -a 256 aitervalextension-0.2.0-chrome.zip` (macOS/Linux) or `Get-FileHash -Algorithm SHA256` (PowerShell).
3. Unzip it.
4. Open `chrome://extensions`, enable **Developer mode**, select **Load unpacked**, and choose the extracted folder containing `manifest.json`.
5. Open ChatGPT, Claude, or Gemini. Send a request, or use `Command+Shift+L` / `Ctrl+Shift+L` for immediate manual start.

Chrome Web Store publication is not complete; Developer mode is expected for this package.

## Expected behavior

- One listening card appears after the configured wait threshold.
- Playback uses an English voice actually reported by the browser.
- When the AI finishes, speech stops and the card changes to **AI is ready**.
- A generated pack is labeled separately from built-in content and remains local until exported/deleted.
- The extension never displays or reads conversation content.

## Troubleshooting

- **No card:** use the keyboard shortcut or popup; third-party interfaces can change.
- **No speech:** check Chrome/site audio, select an installed English voice, then retry.
- **Load unpacked fails:** choose the extracted directory containing `manifest.json`, not the ZIP or its parent.
- **Live generation unavailable/429:** use sample mode; the public demo is intentionally quota bounded.
- **Generated import rejected:** use the unedited JSON export; imports are strict and fail closed.
