import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Buffer } from "buffer";
window.Buffer = Buffer;

// Defer PWA registration to avoid memory spike on first load (reduces "Aw, Snap!" on Android)
import { registerSW } from 'virtual:pwa-register';
const register = registerSW({ immediate: false });
if (typeof requestIdleCallback !== 'undefined') {
  requestIdleCallback(() => register(), { timeout: 3000 });
} else {
  setTimeout(register, 2000);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
