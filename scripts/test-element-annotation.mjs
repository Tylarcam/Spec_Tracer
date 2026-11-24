// Unit check: a picked-element capture includes selector, DOM path, attrs, and the annotation.
// No network and no token.
import assert from 'node:assert/strict';
import { buildCapturePayload, captureToOdysseusNote } from '../public/odysseus-export.js';

const annotation = 'Move the health badge left of the sweep button.';
const spec = [
  'Selector: button#health.status',
  'Element: <button>',
  'ID: #health',
  'Classes: .status.ok',
  'Text: "Healthy"',
  'Path: header#top.bar > div.toolbar',
  'Size: 88×28px',
  'Position: (120, 16)',
  'Attributes: type="button", aria-label="Health", data-cn="health"',
].join('\n');

const payload = buildCapturePayload({
  url: 'http://localhost:7000/',
  title: 'Odysseus',
  selection: annotation,
  spec,
});
assert.equal(payload.source, 'spectracer');
assert.equal(payload.selection, annotation);
assert.match(payload.spec, /Selector: button#health\.status/);
assert.match(payload.spec, /Path: header#top\.bar > div\.toolbar/);
assert.match(payload.spec, /Attributes: type="button"/);

const note = captureToOdysseusNote(payload);
assert.equal(note.label, 'spectracer');
assert.equal(note.source, 'spectracer');
assert.match(note.title, /^\[SpecTracer\] Odysseus/);
assert.match(note.content, /Move the health badge left of the sweep button\./);
assert.match(note.content, /Selector: button#health\.status/);
assert.match(note.content, /Path: header#top\.bar > div\.toolbar/);
assert.match(note.content, /data-cn="health"/);
console.log('PASS: element annotation payload includes selector, path, attrs, and note');
