# Trace Sight Debug View Chrome Extension

## Usage

1. Build the extension using `npm run build:extension` (see below).
2. Go to chrome://extensions, enable Developer Mode.
3. Click 'Load unpacked' and select the `extension` directory.
4. Use the popup or inspect any page to see the LogTrace overlay.

## Development

- Popup UI is built with React/Vite/Tailwind.
- Content script injects LogTrace overlay and supports LLM/code injection.
- Background script relays LLM and code injection messages.

## Build

Add this to your `package.json` scripts:

```
"build:extension": "vite build --config vite.config.extension.ts"
```

See vite.config.extension.ts for dual entry setup. 