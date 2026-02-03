import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from "path";


// https://vite.dev/config/
export default defineConfig({
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
        icons: [
          { src: '/invigen.jpg', sizes: '192x192', type: 'image/jpeg', purpose: 'any maskable' },
          { src: '/invigen.jpg', sizes: '512x512', type: 'image/jpeg', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB (invigen.jpg is ~2.76 MB)
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
});
