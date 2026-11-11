import { DEFAULT_ODYSSEUS_URL, STORAGE_KEYS, ODYSSEUS_NOTE_LABEL, normalizeBaseUrl } from './odysseus-export.js';

const $ = (id) => document.getElementById(id);
const show = (msg, ok) => { $('status').textContent = msg; $('status').className = ok ? 'ok' : 'err'; };

async function load() {
  const s = await chrome.storage.local.get([STORAGE_KEYS.url, STORAGE_KEYS.token]);
  $('url').value = s[STORAGE_KEYS.url] || DEFAULT_ODYSSEUS_URL;
  $('token').value = s[STORAGE_KEYS.token] || '';
}

async function save() {
  await chrome.storage.local.set({
    [STORAGE_KEYS.url]: normalizeBaseUrl($('url').value),
    [STORAGE_KEYS.token]: $('token').value.trim(),
  });
  show('Saved.', true);
}

async function test() {
  await save();
  const base = normalizeBaseUrl($('url').value);
  try {
    const res = await fetch(`${base}/api/notes?label=${ODYSSEUS_NOTE_LABEL}`, {
      headers: { Authorization: `Bearer ${$('token').value.trim()}` },
    });
    if (!res.ok) return show(`Odysseus answered HTTP ${res.status}${res.status === 401 ? ' (token rejected)' : ''}.`, false);
    const data = await res.json();
    show(`Connected. ${(data.notes || []).length} SpecTracer note(s) in Odysseus.`, true);
  } catch (err) {
    show(`Can't reach ${base}: ${err.message}`, false);
  }
}

$('save').addEventListener('click', save);
$('test').addEventListener('click', test);
load();
