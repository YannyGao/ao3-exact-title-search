# AO3 Exact Title Search extension

This browser extension leaves AO3's interface unchanged. Submitting AO3's native header search sends the complete input as a contiguous exact-title phrase. The results page is checked again in the browser and non-matching titles are hidden.

Use the toolbar popup to turn exact-title search on or off. The preference is stored locally by the extension.

## Install in Chrome or Edge

1. Download and extract the release ZIP.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable Developer mode.
4. Choose **Load unpacked** and select the extracted `extension` folder.
5. Refresh AO3.

The extension requests local storage for the on/off preference. It does not request account, history, or cross-site permissions. It runs only on `archiveofourown.org`.
