// Vitest workspace config — separates browser-env (jsdom) tests from
// server-env (node) tests. This prevents the jsdom setup.ts (which
// references `window`) from running in Node-environment API tests.
//
// API tests live in api/__tests__/ (adjacent to api/ handlers) so that
// relative imports like `../health` resolve correctly without Vite's
// src-rooted module resolver.
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // ── Frontend / component tests (jsdom) ───────────────────────────────────
  {
    extends: './vite.config.ts',
    test: {
      name: 'frontend',
      include: ['src/test/**/*.test.{ts,tsx}'],
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
      env: {
        VITE_LIVEKIT_TOKEN_SERVER_ID: 'test-token-server-id',
      },
    },
  },

  // ── Backend / API handler tests (node) ───────────────────────────────────
  // Root is set to the repo root and tests live in api/__tests__/ so that
  // `../health` resolves to `api/health.ts` correctly.
  {
    test: {
      name: 'api',
      root: '.',
      include: ['api/__tests__/**/*.test.ts'],
      environment: 'node',
      globals: true,
      // No setupFiles — no `window` references needed in node environment
    },
  },
]);
