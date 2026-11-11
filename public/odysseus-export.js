// SpecTracer -> Odysseus export (shared by the service worker, the options page,
// the React content UI and scripts/test-send-to-odysseus.mjs).
// Posts a capture to Odysseus's existing intake: POST {baseUrl}/api/notes
// (Authorization: Bearer <ODYSSEUS_API_TOKEN>). No secrets live in this file:
// the URL and token come from chrome.storage.local (set on the Options page).

export const DEFAULT_ODYSSEUS_URL = 'http://127.0.0.1:7000';
export const STORAGE_KEYS = Object.freeze({ url: 'odysseusUrl', token: 'odysseusToken' });
export const ODYSSEUS_NOTE_LABEL = 'spectracer';
export const MESSAGE_TYPE = 'SPECTRACER_SEND_TO_ODYSSEUS';

const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0');

/** ISO 8601 timestamp in local time with a UTC offset, e.g. 2026-11-11T15:04:05.123-08:00 */
export function isoWithOffset(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `.${String(d.getMilliseconds()).padStart(3, '0')}` +
    `${sign}${pad(off / 60)}:${pad(off % 60)}`
  );
}

/** The canonical SpecTracer capture payload. */
export function buildCapturePayload({ url = '', title = '', selection = '', spec = '', capturedAt } = {}) {
  return {
    source: 'spectracer',
    url: String(url || ''),
    title: String(title || ''),
    selection: String(selection || '').trim(),
    spec: String(spec || '').trim(),
    timestamp: isoWithOffset(capturedAt ? new Date(capturedAt) : new Date()),
  };
}

/** Plain-text form, used for the clipboard copy (fallback and its own action). */
export function captureToClipboardText(p) {
  const parts = [`${p.title || 'Untitled page'}`, p.url, `Captured: ${p.timestamp}`];
  if (p.selection) parts.push('', 'Selection:', p.selection);
  if (p.spec) parts.push('', 'Spec:', p.spec);
  return parts.join('\n');
}

/** Map a capture onto Odysseus's NoteCreate body (routes/note_routes.py). */
export function captureToOdysseusNote(p) {
  const heading = p.title || p.url || 'Untitled page';
  const lines = [`Source: ${p.url || '(unknown)'}`, `Captured: ${p.timestamp}`, 'From: SpecTracer'];
  if (p.selection) lines.push('', '## Selection', '', p.selection);
  if (p.spec) lines.push('', '## Spec', '', '```', p.spec, '```');
  return {
    title: `[SpecTracer] ${heading}`.slice(0, 200),
    content: lines.join('\n'),
    note_type: 'note',
    label: ODYSSEUS_NOTE_LABEL,
    source: 'spectracer',
  };
}

export function normalizeBaseUrl(url) {
  return String(url || DEFAULT_ODYSSEUS_URL).trim().replace(/\/+$/, '');
}

/** POST the capture to Odysseus. Resolves { ok, id, note } or throws with a readable message. */
export async function sendCaptureToOdysseus(payload, { baseUrl, token, fetchImpl, timeoutMs = 10000 } = {}) {
  const doFetch = fetchImpl || globalThis.fetch.bind(globalThis);
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${String(token).trim()}`;
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  let res;
  try {
    res = await doFetch(`${normalizeBaseUrl(baseUrl)}/api/notes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(captureToOdysseusNote(payload)),
      signal: ctrl ? ctrl.signal : undefined,
    });
  } catch (err) {
    const why = err && err.name === 'AbortError' ? `timed out after ${timeoutMs} ms` : (err && err.message) || String(err);
    throw new Error(`Odysseus unreachable at ${normalizeBaseUrl(baseUrl)} (${why})`);
  } finally {
    if (timer) clearTimeout(timer);
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error(`Odysseus rejected the token (HTTP ${res.status}). Check the token in SpecTracer Options.`);
  }
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.text()).slice(0, 200); } catch (_) { /* ignore */ }
    throw new Error(`Odysseus returned HTTP ${res.status}${detail ? `: ${detail}` : ''}`);
  }
  const note = await res.json().catch(() => ({}));
  return { ok: true, id: note && note.id, note };
}
