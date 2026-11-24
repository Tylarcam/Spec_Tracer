import React from 'react';
import { createRoot } from 'react-dom/client';
import { LogTraceExtension } from './LogTraceExtension';
import css from '../index.css?inline';

function mount() {
  if (document.getElementById('logtrace-extension-root')) return;

  const host = document.createElement('div');
  host.id = 'logtrace-extension-root';
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.width = '100vw';
  host.style.height = '100vh';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'none';

  const parent = document.body || document.documentElement;
  parent.appendChild(host);

  // Keep Tailwind/preflight inside a shadow root so Odysseus page styles stay intact.
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = css;
  shadow.appendChild(style);

  const container = document.createElement('div');
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  shadow.appendChild(container);

  createRoot(container).render(<LogTraceExtension />);
}

if (document.body) {
  mount();
} else {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
}
