// Offscreen document: the only MV3 surface where the worker can write the clipboard.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.target !== 'spectracer-offscreen' || msg.type !== 'copy') return false;
  try {
    const el = document.getElementById('buf');
    el.value = msg.text || '';
    el.select();
    const ok = document.execCommand('copy');
    sendResponse(ok ? { ok: true } : { ok: false, error: 'execCommand(copy) returned false' });
  } catch (err) {
    sendResponse({ ok: false, error: String((err && err.message) || err) });
  }
  return false;
});
