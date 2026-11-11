// SpecTracer service worker: "Send to Odysseus" (context menu, Alt+Shift+O, and
// messages from the SpecTracer UI). Falls back to the clipboard when the send fails.
import {
  DEFAULT_ODYSSEUS_URL,
  STORAGE_KEYS,
  MESSAGE_TYPE,
  buildCapturePayload,
  captureToClipboardText,
  sendCaptureToOdysseus,
} from './odysseus-export.js';

const MENU_SEND = 'spectracer-send-odysseus';
const MENU_COPY = 'spectracer-copy-capture';
const MENU_CONTEXTS = ['selection', 'page', 'link'];

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: MENU_SEND, title: 'Send to Odysseus', contexts: MENU_CONTEXTS });
    chrome.contextMenus.create({ id: MENU_COPY, title: 'Copy SpecTracer capture', contexts: MENU_CONTEXTS });
  });
});

async function getSettings() {
  const s = await chrome.storage.local.get([STORAGE_KEYS.url, STORAGE_KEYS.token]);
  return { baseUrl: s[STORAGE_KEYS.url] || DEFAULT_ODYSSEUS_URL, token: s[STORAGE_KEYS.token] || '' };
}

async function readSelection(tabId, fallback = '') {
  if (tabId == null || tabId < 0) return fallback;
  try {
    const [r] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => String((window.getSelection && window.getSelection()) || ''),
    });
    return (r && r.result) || fallback;
  } catch (_) {
    return fallback; // chrome:// pages, the Web Store, etc.
  }
}

async function captureFromTab(tab, info = {}) {
  const selection = await readSelection(tab && tab.id, info.selectionText || '');
  return buildCapturePayload({
    url: info.pageUrl || (tab && tab.url) || '',
    title: (tab && tab.title) || '',
    selection,
    spec: info.linkUrl ? `Link: ${info.linkUrl}` : '',
  });
}

// --- clipboard via an offscreen document (MV3 service workers have no DOM) ---
let creatingOffscreen = null;
async function ensureOffscreen() {
  if (chrome.offscreen.hasDocument && (await chrome.offscreen.hasDocument())) return;
  if (!creatingOffscreen) {
    creatingOffscreen = chrome.offscreen
      .createDocument({
        url: 'offscreen.html',
        reasons: ['CLIPBOARD'],
        justification: 'Copy a SpecTracer capture to the clipboard',
      })
      .catch((e) => {
        if (!String(e && e.message).includes('single offscreen')) throw e;
      })
      .finally(() => { creatingOffscreen = null; });
  }
  await creatingOffscreen;
}

async function copyText(text) {
  await ensureOffscreen();
  const res = await chrome.runtime.sendMessage({ target: 'spectracer-offscreen', type: 'copy', text });
  if (!res || !res.ok) throw new Error((res && res.error) || 'clipboard copy failed');
}

function flash(text, color, title) {
  chrome.action.setBadgeBackgroundColor({ color });
  chrome.action.setBadgeText({ text });
  if (title) chrome.action.setTitle({ title });
  setTimeout(() => {
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setTitle({ title: 'Trace Sight Debug View' });
  }, 6000);
}

async function deliver(payload, { mode = 'send' } = {}) {
  if (mode === 'copy') {
    try {
      await copyText(captureToClipboardText(payload));
      flash('CP', '#0891b2', 'SpecTracer capture copied to clipboard');
      return { ok: true, copied: true };
    } catch (err) {
      flash('!', '#dc2626', `Copy failed: ${err.message}`);
      return { ok: false, copied: false, error: err.message };
    }
  }
  try {
    const result = await sendCaptureToOdysseus(payload, await getSettings());
    flash('OK', '#16a34a', `Sent to Odysseus${result.id ? ` (note ${result.id})` : ''}`);
    return { ok: true, id: result.id };
  } catch (err) {
    let copied = false;
    try { await copyText(captureToClipboardText(payload)); copied = true; } catch (_) { /* ignore */ }
    flash('!', '#dc2626', `Odysseus send failed: ${err.message}${copied ? ' (copied to clipboard instead)' : ''}`);
    return { ok: false, copied, error: err.message };
  }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_SEND && info.menuItemId !== MENU_COPY) return;
  const payload = await captureFromTab(tab, info);
  await deliver(payload, { mode: info.menuItemId === MENU_COPY ? 'copy' : 'send' });
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== 'send-to-odysseus') return;
  const activeTab = tab || (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
  await deliver(await captureFromTab(activeTab));
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.type !== MESSAGE_TYPE) return false;
  const c = msg.capture || {};
  const payload = buildCapturePayload({
    url: c.url || (sender.tab && sender.tab.url) || '',
    title: c.title || (sender.tab && sender.tab.title) || '',
    selection: c.selection,
    spec: c.spec,
    capturedAt: c.capturedAt,
  });
  deliver(payload, { mode: msg.mode === 'copy' ? 'copy' : 'send' }).then(sendResponse);
  return true; // async response
});
