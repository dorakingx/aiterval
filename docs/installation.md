# AIterval 0.2.0 installation

## Supported setup

Use current desktop Google Chrome on macOS, Windows, or Linux. AIterval is a Manifest V3 package and uses the browser’s installed speech-synthesis voices. Chrome Web Store publication is not complete.

## Install the verified release

1. Download `aitervalextension-0.2.0-chrome.zip` and `SHA256SUMS.txt` from [GitHub Releases](https://github.com/dorakingx/aiterval/releases/tag/v0.2.0).
2. Verify the file:
   - macOS/Linux: `shasum -a 256 aitervalextension-0.2.0-chrome.zip`
   - Windows PowerShell: `Get-FileHash -Algorithm SHA256 .\aitervalextension-0.2.0-chrome.zip`
3. Extract the ZIP.
4. Open `chrome://extensions`.
5. Enable **Developer mode**, select **Load unpacked**, and choose the extracted folder that directly contains `manifest.json`.
6. Complete onboarding and test with the manual shortcut: `Command+Shift+L` on macOS or `Ctrl+Shift+L` on Windows/Linux.

Automatic waits are supported on `chatgpt.com`, `claude.ai`, and `gemini.google.com`. If an interface update prevents detection, manual start remains available through the shortcut, popup, or context menu.

## Exercise library

The submitted experience includes 132 original pre-authored exercises. No
OpenAI API key, model access, account, or generated pack is required.

## Remove AIterval

Use the dashboard’s confirmed local-data deletion for learning data, then select **Remove** on `chrome://extensions`. Export first if you want a personal backup.
