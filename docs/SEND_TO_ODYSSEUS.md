# Send to Odysseus

SpecTracer can post a capture straight into Odysseus Notes instead of (only) the clipboard.

**Ways to send**
- Right-click a selection, link, or page, then **Send to Odysseus**.
- Press **Alt+Shift+O** on any page.
- Use the **Send to Odysseus** quick action in the SpecTracer in-page UI.
- **Copy SpecTracer capture** (right-click) still copies to the clipboard as its own action.

If the send fails (Odysseus is down or the token is wrong), the capture is copied to the clipboard, and the toolbar badge shows `!` with the reason in its tooltip. `OK` means it was sent.

**Endpoint:** the existing `POST /api/notes` on Odysseus (`Authorization: Bearer <ODYSSEUS_API_TOKEN>`). Each capture becomes a note titled `[SpecTracer] <page title>`, with label `spectracer` and source `spectracer`. The note body holds the source URL, the timestamp (ISO 8601 with offset), and the selection and spec.

Payload built by `public/odysseus-export.js`:

```json
{ "source": "spectracer", "url": "...", "title": "...", "selection": "...", "spec": "...", "timestamp": "2026-11-11T15:04:05.123-08:00" }
```

**Setup**
1. Build (`npm run build`), then load `dist/` unpacked in `chrome://extensions` (or reload it).
2. Open the extension's **Options**, paste the Odysseus API token, then **Save** and **Test connection**.
   The token stays in `chrome.storage.local`. It's never in the repo.

**CORS:** requests go out from the extension's service worker and options page, which have `host_permissions` for `http://127.0.0.1:7000/*` and `http://localhost:7000/*`, so Chrome skips CORS for them. Odysseus needs no `chrome-extension://` origin allowance. To use a different host or port, add it to `host_permissions`.

**Test:** `ODYSSEUS_API_TOKEN=... node scripts/test-send-to-odysseus.mjs` posts a `SpecTracer test` note and reads it back.
