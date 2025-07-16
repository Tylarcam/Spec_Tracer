# Screenshot (Shot) Quick Actions Architecture & Evolution

## 1. Initial Implementation
- Only a single screenshot action existed, using `html2canvas(logTraceRef.current)` to capture the LogTrace area.
- Triggered by the 'screenshot' quick action.

## 2. Introduction of Screenshot Modes
- Added a submenu for 'Shot' with four modes:
  - Rectangle (Rect)
  - Window (Win)
  - Full Screen (Full)
  - Free Form (Free)
- Each mode was mapped to a handler in `handleScreenshot`.

## 3. Mode Handler Evolution
- **Rectangle:**
  - Prompts user for coordinates (x, y, width, height).
  - Uses `html2canvas(document.body, { x, y, width, height, ... })`.
- **Window:**
  - Originally: Captured the browser viewport using `html2canvas(document.body, { width: window.innerWidth, ... })`.
  - Swapped: Now captures only the LogTrace area (`html2canvas(logTraceRef.current)`).
- **Full:**
  - Originally: Captured the LogTrace area.
  - Swapped: Now captures the entire browser window (`html2canvas(document.body, { width: window.innerWidth, ... })`).
- **Free Form:**
  - Currently uses the Rectangle handler as a placeholder, with a toast indicating freeform is coming soon.

## 4. Current Handler Logic
- `handleQuickAction` dispatches to `handleScreenshot(mode)` for screenshot actions.
- `handleScreenshot` switch:
  - 'rectangle' → `captureRectangleScreenshot()`
  - 'window' → `captureFullscreenScreenshot()` (LogTrace area)
  - 'fullscreen' → `captureEntireBrowserWindowScreenshot()` (entire browser window)
  - 'freeform' → `captureFreeformScreenshot()` (currently rectangle)
- Each handler uses `html2canvas` and provides download/copy-to-clipboard feedback.

## 5. Known Issues & Next Steps
- **User Expectation Mismatch:**
  - 'Full' now correctly captures the browser window, but the icon/label may still confuse users.
  - 'Window' captures only the LogTrace area, which may not match the icon/label.
- **Rectangle/Freeform:**
  - No visual selection tool; uses prompt for coordinates.
  - Freeform is not implemented.
- **UX:**
  - The submenu and feedback are functional, but the selection experience is not yet intuitive.

## 6. Next Steps
- Implement a visual rectangle/freeform selection overlay.
- Consider renaming or clarifying the 'Window' and 'Full' labels/icons.
- Add tooltips or help text for each mode.
- Ensure all screenshot modes are accessible and provide clear user feedback. 