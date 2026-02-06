import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: true },
        includeAssets: ['vite.svg', 'invigen.jpg'],
        manifest: {
          name: 'Invigen',
          short_name: 'Invigen',
          description: 'Create professional invoices and receipts in seconds',
          theme_color: '#0f172a',
          background_color: '#030712',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          id: '/',
          icons: [
            { src: '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // In dev mode, files are served by Vite dev server, so globPatterns may not match
          // This is expected and harmless - Workbox will still work correctly
          globPatterns: mode === 'development' 
            ? [] // Empty in dev mode to avoid warnings
            : ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2}'],
          globIgnores: ['**/PixelLogo.png', 'sw.js', 'workbox-*.js'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          // Cache static assets for 30 days so repeat visits load from cache
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
                cacheableResponse: { statuses: [0, 200] },
                networkTimeoutSeconds: 10,
              },
            },
            // Cache PixelLogo.png at runtime if needed (not precached due to size)
            {
              urlPattern: /\/PixelLogo\.png$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'large-images-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        buffer: "buffer"
      }
    },
    define: {
      global: {},
    }
  };
});
