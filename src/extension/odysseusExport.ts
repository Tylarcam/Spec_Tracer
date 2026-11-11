// React-side "Send to Odysseus": hands the capture to the service worker
// (public/background.js), which POSTs it to Odysseus. If the extension runtime
// is missing or the send fails, the capture is copied to the clipboard instead.

export interface SpecTracerCapture {
  url?: string;
  title?: string;
  selection?: string;
  spec?: string;
}

export interface SendToOdysseusResult {
  ok: boolean;
  id?: string;
  copied?: boolean;
  error?: string;
}

const MESSAGE_TYPE = 'SPECTRACER_SEND_TO_ODYSSEUS';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chromeRuntime = (): any => (globalThis as any).chrome?.runtime;

function clipboardText(c: SpecTracerCapture): string {
  const parts = [c.title || document.title || 'Untitled page', c.url || location.href, `Captured: ${new Date().toISOString()}`];
  if (c.selection) parts.push('', 'Selection:', c.selection);
  if (c.spec) parts.push('', 'Spec:', c.spec);
  return parts.join('\n');
}

async function copyFallback(c: SpecTracerCapture): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(clipboardText(c));
    return true;
  } catch {
    return false;
  }
}

export async function sendCaptureToOdysseus(capture: SpecTracerCapture): Promise<SendToOdysseusResult> {
  const c: SpecTracerCapture = {
    url: capture.url || location.href,
    title: capture.title || document.title,
    selection: capture.selection ?? String(window.getSelection?.() || ''),
    spec: capture.spec,
  };
  const runtime = chromeRuntime();
  if (!runtime?.id || !runtime.sendMessage) {
    const copied = await copyFallback(c);
    return { ok: false, copied, error: 'SpecTracer extension runtime not available' };
  }
  try {
    const res: SendToOdysseusResult | undefined = await runtime.sendMessage({ type: MESSAGE_TYPE, capture: c });
    if (res?.ok) return res;
    const copied = res?.copied || (await copyFallback(c));
    return { ok: false, copied, error: res?.error || 'No response from SpecTracer service worker' };
  } catch (err) {
    const copied = await copyFallback(c);
    return { ok: false, copied, error: err instanceof Error ? err.message : String(err) };
  }
}
