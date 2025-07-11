import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize Sentry in production when DSN is provided
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  import('@sentry/react').then((Sentry) => {
    import('@sentry/tracing').then(({ BrowserTracing }) => {
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        integrations: [new BrowserTracing()],
        tracesSampleRate: 0.1,
      });
    });
  });
}

// Register service worker for PWA caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('ServiceWorker registration failed:', err);
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
