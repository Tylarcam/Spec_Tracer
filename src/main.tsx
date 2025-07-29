
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { securityMonitor } from './utils/securityHeaders';

// Initialize security monitoring
securityMonitor.init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
