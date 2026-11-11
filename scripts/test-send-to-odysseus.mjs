// End-to-end check: build the exact payload the extension builds, POST it to the
// live Odysseus, then read it back. Token comes from the ODYSSEUS_API_TOKEN env
// var and is never printed.
//   node scripts/test-send-to-odysseus.mjs [baseUrl]
import {
  DEFAULT_ODYSSEUS_URL,
  ODYSSEUS_NOTE_LABEL,
  buildCapturePayload,
  captureToOdysseusNote,
  normalizeBaseUrl,
  sendCaptureToOdysseus,
} from '../public/odysseus-export.js';

const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.ODYSSEUS_URL || DEFAULT_ODYSSEUS_URL);
const token = process.env.ODYSSEUS_API_TOKEN || '';
if (!token) { console.error('ODYSSEUS_API_TOKEN is not set'); process.exit(2); }

const payload = buildCapturePayload({
  url: 'https://github.com/Tylarcam/Spec_Tracer',
  title: 'SpecTracer test',
  selection: 'SpecTracer test capture: safe to delete.',
  spec: 'button#send-to-odysseus.btn.primary - "Send to Odysseus"',
});
console.log('payload:', JSON.stringify(payload));
console.log('note body:', JSON.stringify(captureToOdysseusNote(payload)));

const sent = await sendCaptureToOdysseus(payload, { baseUrl, token });
console.log(`POST ${baseUrl}/api/notes -> ok, note id ${sent.id}`);

const res = await fetch(`${baseUrl}/api/notes?label=${ODYSSEUS_NOTE_LABEL}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const { notes = [] } = await res.json();
const found = notes.find((n) => n.id === sent.id);
if (!found) { console.error(`FAIL: note ${sent.id} not returned by GET /api/notes`); process.exit(1); }
console.log('read back:', JSON.stringify({ id: found.id, title: found.title, label: found.label, source: found.source, note_type: found.note_type, created_at: found.created_at }));
console.log('PASS');
