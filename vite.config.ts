import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

/**
 * devApiPlugin: In development, serves Vercel serverless API handlers (api/*.ts)
 * directly from Vite's dev server middleware. This ensures local development
 * uses the full backend token generation with LiveKit agent dispatch.
 */
function devApiPlugin(): Plugin {
  return {
    name: 'dev-api-endpoints',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url ? req.url.split('?')[0] : '';
        const handlers: Record<string, string> = {
          '/api/token': '/api/token.ts',
          '/api/health': '/api/health.ts',
        };
        const modulePath = handlers[pathname];
        if (!modulePath) {
          return next();
        }

        // Ensure origin is set for local dev CORS checks (supports HTTP/1.1 host and HTTP/2 :authority)
        const host =
          req.headers.host ||
          (req.headers as Record<string, string | undefined>)[':authority'] ||
          'localhost:5173';
        if (!req.headers.origin) {
          req.headers.origin = `https://${host}`;
        }

        // Polyfill VercelResponse methods on Node ServerResponse
        const augmentedRes = res as unknown as {
          statusCode: number;
          setHeader: (name: string, value: string) => void;
          end: (data?: string) => void;
          status: (code: number) => typeof augmentedRes;
          json: (data: unknown) => typeof augmentedRes;
        };
        augmentedRes.status = function (code: number) {
          this.statusCode = code;
          return this;
        };
        augmentedRes.json = function (data: unknown) {
          this.setHeader('Content-Type', 'application/json');
          this.end(JSON.stringify(data));
          return this;
        };

        const execute = async () => {
          try {
            const mod = await server.ssrLoadModule(modulePath);
            await mod.default(req, res);
          } catch (err) {
            console.error(`[dev-api] Error handling ${pathname}:`, err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Internal server error in dev API' }));
            }
          }
        };

        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            try {
              (req as unknown as { body: unknown }).body = bodyStr ? JSON.parse(bodyStr) : {};
            } catch {
              (req as unknown as { body: unknown }).body = {};
            }
            await execute();
          });
        } else {
          (req as unknown as { body: unknown }).body = {};
          await execute();
        }
      });
    },
  };
}

export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    // Populate process.env from .env.local for local API serverless handlers
    const env = loadEnv(mode ?? 'development', process.cwd(), '');
    Object.assign(process.env, env);
  }

  return {
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [
      react(),
      // basicSsl() and devApiPlugin() are ONLY active during `vite dev` (command === 'serve').
      // basicSsl() generates a self-signed cert so the dev server runs over HTTPS,
      // which is required for navigator.mediaDevices (microphone) when
      // accessing from a second device via LAN IP.
      //
      // During `vite build` (CI / GitHub Pages) these plugins are NOT loaded —
      // the production bundle is served by GitHub Pages' own trusted TLS cert.
      ...(command === 'serve' ? [basicSsl(), devApiPlugin()] : []),
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
      // Provide a dummy token server ID so module-level TOKEN_SERVER_ID is
      // defined in tests. The actual LiveKit fetch is mocked in each test file.
      env: {
        VITE_LIVEKIT_TOKEN_SERVER_ID: 'test-token-server-id',
      },
    },
  };
});
