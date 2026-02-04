import React from 'react';

/**
 * Catches React errors so the app never shows a blank screen (e.g. on Android).
 * Shows a simple "Reload" UI instead of crashing.
 */
export default class AppErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('AppErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: '#0f172a',
            color: '#e2e8f0',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          <p style={{ marginBottom: 16, fontSize: '1rem' }}>
            Something went wrong.
          </p>
          <a
            href={window.location.href}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#2563eb',
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Reload
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
