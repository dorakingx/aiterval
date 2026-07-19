# Judge testing guide

No build, login, OpenAI key, or access code is required.

- Public demo: <https://aiterval-build-week.vercel.app/demo/judge>
- Public repository: <https://github.com/dorakingx/aiterval>
- Release: <https://github.com/dorakingx/aiterval/releases/tag/v0.2.0>

The primary Codex task `/feedback` Session ID is submitted privately through
Devpost.

## Two-minute path

1. Open the public judge demo.
2. Select **Send prompt and try it**.
3. Play the pre-authored listening exercise, answer it, and inspect the feedback.
4. Observe the **Your AI is ready** notice while the listening flow remains usable.
5. Review the privacy page and the built-in-library explanation.

The submitted experience uses 132 original pre-authored exercises. Runtime AI
exercise generation and Lecture-to-Sprints are not submitted product features.

## Extension package

- ZIP: `aitervalextension-0.2.0-chrome.zip`
- SHA-256: `7e2bc8ed9195820aa526b3be0fd2de593c23a8a5d465693ca12a73b3f726bb58`
- Requirements: current desktop Chrome, Manifest V3, and browser speech synthesis

Installation:

1. Download the ZIP and `SHA256SUMS.txt` from the v0.2.0 release.
2. Verify the checksum.
3. Unzip it.
4. Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**,
   and select the directory containing `manifest.json`.
5. Open ChatGPT, Claude, or Gemini, or use `Command+Shift+L` /
   `Ctrl+Shift+L` for a manual sprint.

## Expected behavior

- One pre-authored card appears after the configured wait threshold.
- Playback uses an English voice reported by the browser.
- AI completion shows **Your AI is ready** without cutting off the current
  sentence; the learner can finish the question or select **Return to AI now**.
- Progress, reviews, settings, and recovered time remain local.
- The extension never reads or displays conversation content.

## Troubleshooting

- **No card:** use the keyboard shortcut or popup; third-party interfaces change.
- **No speech:** check Chrome/site audio and select an installed English voice.
- **Load unpacked fails:** choose the extracted directory containing
  `manifest.json`, not the ZIP or its parent.

Chrome Web Store publication is not complete; Developer mode is expected.
