# Trace Sight Debug View Extension: Issues Faced

## 1. Manifest File Errors
- **Error:** `Manifest file is missing or unreadable` / `Could not load manifest.`
- **Cause:** Chrome could not find or read `/extension/manifest.json` when loading the unpacked extension.
- **Resolution:** Ensured manifest.json exists, is valid JSON, and is in the correct directory.

## 2. ERR_FILE_NOT_FOUND
- **Error:** `Your file couldn't be accessed. ERR_FILE_NOT_FOUND`
- **Cause:** Chrome could not find files referenced in the manifest (e.g., icons, popup.html, popup.js).
- **Resolution:**
  - Ensured all referenced files are present in `/extension`.
  - Removed or replaced missing icon references in the manifest.

## 3. Icon File Issues
- **Problem:** Placeholder icon files were not valid PNGs, causing Chrome to fail loading the extension.
- **Resolution:**
  - Removed icon references from the manifest for a quick fix.
  - Optionally, real PNG icons can be added later.

## 4. UI/UX Mismatch
- **Problem:** Extension popup UI did not match the main app or LogTrace component, causing confusion and inconsistent experience.
- **Resolution:**
  - Updated the build process so the extension popup uses the same UI as the LogTrace component.

## 5. Build Output Location
- **Problem:** Vite build output was not always targeting the `/extension` directory, leading to missing files when loading the extension.
- **Resolution:**
  - Set Vite `outDir` to `/extension` and ensured all necessary files are output there.

## 6. General Debugging Frustration
- **Symptoms:**
  - Repeated errors when loading the extension in Chrome.
  - Unclear error messages and missing files.
  - Time wasted on troubleshooting basic file and manifest issues.

## Recommendations
- Always check that `/extension/manifest.json` and all referenced files exist before loading in Chrome.
- Use real PNGs for icons or remove icon references if not needed.
- Keep the extension popup UI consistent with the main app for a better user experience.
- After every build, verify the contents of `/extension` before reloading the extension in Chrome. 