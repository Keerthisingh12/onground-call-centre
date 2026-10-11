import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    // basicSsl() is ONLY active during `vite dev` (command === 'serve').
    // It generates a self-signed cert so the dev server runs over HTTPS,
    // which is required for navigator.mediaDevices (microphone) when
    // accessing from a second device via LAN IP.
    //
    // During `vite build` (CI / GitHub Pages) this plugin is NOT loaded —
    // the production bundle is served by GitHub Pages' own trusted TLS cert.
    ...(command === 'serve' ? [basicSsl()] : []),
  ],
  server: {
    // Bind to all network interfaces so a second laptop on the same Wi-Fi
    // can reach the dev server at https://<host-ip>:5173.
    // basicSsl() injects the TLS cert automatically via its configResolved hook.
    host: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
}));
