# Google Chrome Extension Development Guide

## Table of Contents
- [Introduction](#introduction)
- [Quick Start: Your First Extension](#quick-start-your-first-extension)
- [Project Structure](#project-structure)
- [Manifest v3 Explained](#manifest-v3-explained)
- [Core Components](#core-components)
  - [Background (Service Worker)](#background-service-worker)
  - [Content Scripts](#content-scripts)
  - [Popup Page](#popup-page)
  - [Options Page](#options-page)
- [Messaging & Communication](#messaging--communication)
- [Permissions](#permissions)
- [Debugging](#debugging)
- [Best Practices](#best-practices)
- [References & Further Reading](#references--further-reading)

---

## Introduction
Google Chrome extensions are small software programs that customize the browsing experience. They are built using web technologies like HTML, CSS, and JavaScript, and can interact with browser APIs to enhance or modify browser behavior.

## Quick Start: Your First Extension
1. **Create a folder** for your extension files.
2. **Add a `manifest.json` file** (required):

```json
{
  "manifest_version": 3,
  "name": "My First Extension",
  "description": "A simple Chrome extension.",
  "version": "1.0",
  "background": {
    "service_worker": "background.js"
  },
  "permissions": ["storage", "activeTab", "scripting"],
  "action": {
    "default_popup": "popup.html"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["contentScript.js"]
    }
  ],
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "options_page": "options.html"
}
```

3. **Add supporting files** (e.g., `background.js`, `popup.html`, `contentScript.js`, icons, etc.).
4. **Load your extension**:
   - Go to ` chrome://extensions` in Chrome.
   - Enable Developer Mode.
   - Click "Load unpacked" and select your extension folder.

## Project Structure
```
my-extension/
├── background.js
├── contentScript.js
├── popup.html
├── options.html
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── manifest.json
```

## Manifest v3 Explained
- **`manifest_version`**: Always use 3 for new extensions.
- **`background.service_worker`**: The background script runs as a service worker (event-driven, not persistent).
- **`permissions`**: List of Chrome APIs your extension needs.
- **`action`**: Defines the popup UI and default icon.
- **`content_scripts`**: Scripts injected into matching web pages.
- **`options_page`**: Optional settings page for your extension.

## Core Components
### Background (Service Worker)
Handles background tasks, event listeners, and long-running logic.

**Example:**
```js
// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');
});
```

### Content Scripts
Injected into web pages to interact with the DOM.

**Example:**
```js
// contentScript.js
document.body.style.backgroundColor = 'lightyellow';
```

### Popup Page
The UI shown when the user clicks the extension icon.

**Example:**
```html
<!-- popup.html -->
<!DOCTYPE html>
<html>
  <head><title>Popup</title></head>
  <body>
    <button id="changeColor">Change Color</button>
    <script src="popup.js"></script>
  </body>
</html>
```

### Options Page
A settings page for user preferences.

**Example:**
```html
<!-- options.html -->
<!DOCTYPE html>
<html>
  <head><title>Options</title></head>
  <body>
    <label>Option: <input type="checkbox" id="myOption"></label>
    <script src="options.js"></script>
  </body>
</html>
```

## Messaging & Communication
Extensions often need to communicate between background, popup, and content scripts.

**Send a message from content script:**
```js
chrome.runtime.sendMessage({greeting: "hello"}, (response) => {
  console.log(response);
});
```

**Listen in background/service worker:**
```js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting === "hello") {
    sendResponse({message: "success"});
  }
});
```

## Permissions
Declare only the permissions you need in `manifest.json` for security and to avoid Chrome warnings.

**Common permissions:**
- `storage`: Store and retrieve data.
- `activeTab`: Access the currently active tab.
- `scripting`: Inject scripts programmatically.
- `tabs`: Interact with browser tabs.

## Debugging
- **Service Worker**: Inspect via `chrome://extensions` > your extension > "service worker" link.
- **Content Scripts**: Use the regular page inspector.
- **Popup/Options**: Right-click the popup and select "Inspect".

## Best Practices
- Keep your extension focused on a single purpose.
- Minimize permissions for better security.
- Avoid inline JavaScript in HTML files (use external scripts).
- Store persistent data using the `storage` API.
- Test thoroughly and handle errors gracefully.
- Follow [Chrome Web Store policies](https://developer.chrome.com/docs/webstore/program-policies/).

## References & Further Reading
- [Chrome Extensions Official Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest v3 Overview](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Extension Boilerplate (GitHub)](https://github.com/alejandro-ao/chrome-extension-boilerplate)
- [Medium: Chrome Extensions For Beginners](https://jl978.medium.com/chrome-extensions-for-beginners-46019a826cd6)
- [DEV.to: How To Build A Chrome Extension NEW Manifest V3](https://dev.to/anobjectisa/how-to-build-a-chrome-extension-new-manifest-v3-5edk)
- [Alejandro AO: How to create a Chrome Extension with Manifest V3](https://alejandro-ao.com/how-to-create-a-chrome-extension-with-manifest-v3/) 