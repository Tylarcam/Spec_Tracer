
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set dark mode as default
if (!('theme' in localStorage)) {
  document.documentElement.classList.add('dark');
  localStorage.setItem('theme', 'dark');
} else if (localStorage.theme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById("root")!).render(<App />);
