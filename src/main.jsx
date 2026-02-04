import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'
import App from './App.jsx'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'
import './index.css'

window.Buffer = Buffer

function showFallback(msg) {
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif;text-align:center;"><p style="margin-bottom:16px;">${msg}</p><a href="${window.location.href}" style="padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Reload</a></div>`
  }
}

// On Android: unregister any existing SW so stale cache doesn't block the app from opening
const isAndroid = /Android/i.test(navigator.userAgent)
if (isAndroid && navigator.serviceWorker?.getRegistrations) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister())
  })
}
if (!isAndroid) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    const register = registerSW({ immediate: false })
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => register(), { timeout: 3000 })
    } else {
      setTimeout(register, 2000)
    }
  }).catch(() => {})
}

try {
  const root = createRoot(document.getElementById('root'))
  root.render(
    <StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </StrictMode>,
  )
} catch (err) {
  console.error(err)
  showFallback('Something went wrong.')
}
