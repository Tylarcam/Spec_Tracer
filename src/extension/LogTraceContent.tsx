
import React from 'react';
import { createRoot } from 'react-dom/client';
import LogTraceExtension from './LogTraceExtension';
import '../index.css'; // Import Tailwind/global styles

// Create a container for the extension UI
const container = document.createElement('div');
container.id = 'logtrace-extension-root';
container.style.position = 'fixed';
container.style.top = '0';
container.style.left = '0';
container.style.width = '100vw';
container.style.height = '100vh';
container.style.zIndex = '2147483647';
container.style.pointerEvents = 'none';
document.body.appendChild(container);

const root = createRoot(container);
root.render(<LogTraceExtension />);
