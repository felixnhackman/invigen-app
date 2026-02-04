import React, { useState, useEffect } from 'react';

const DISMISS_KEY = 'invigen_android_tip_dismissed';

/**
 * On Android, many links open inside in-app browsers (WhatsApp, Gmail, etc.) which can
 * fail to load the app. This banner suggests opening in Chrome for a working experience.
 */
export default function AndroidChromeTip() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (!isAndroid) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
      setShow(true);
    } catch (_) {}
  }, []);

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch (_) {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="banner"
      style={{
        background: 'linear-gradient(90deg, #1e3a5f 0%, #0f172a 100%)',
        color: '#e2e8f0',
        padding: '10px 12px',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <span>
        On Android, if the app didn’t load, open this link in <strong>Chrome</strong> for the best experience.
      </span>
      <button
        type="button"
        onClick={dismiss}
        style={{
          background: 'rgba(255,255,255,0.15)',
          color: '#e2e8f0',
          border: 'none',
          padding: '6px 12px',
          borderRadius: 6,
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Got it
      </button>
    </div>
  );
}
