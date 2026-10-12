/**
 * cors.ts – CORS helper for Vercel serverless functions.
 *
 * Allowed origins:
 *  - ALLOWED_ORIGIN env var (production: https://keerthisingh12.github.io)
 *  - http(s)://localhost:* on any non-production environment
 *
 * Returns true when the request should continue to business logic.
 * Returns false when it has already sent a preflight (204) or blocked (403) response.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

function isLocalhost(origin: string): boolean {
  return (
    origin.startsWith('http://localhost') ||
    origin.startsWith('https://localhost') ||
    origin.startsWith('http://127.0.0.1') ||
    origin.startsWith('https://127.0.0.1')
  );
}

export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const allowedOrigin =
    process.env.ALLOWED_ORIGIN ?? 'https://keerthisingh12.github.io';
  const requestOrigin = (req.headers.origin as string) ?? '';

  const isProduction = process.env.VERCEL_ENV === 'production';
  const originAllowed =
    requestOrigin === allowedOrigin ||
    (!isProduction && isLocalhost(requestOrigin));

  // Always set CORS headers (even on 403) so the browser can read the error body.
  res.setHeader(
    'Access-Control-Allow-Origin',
    originAllowed ? requestOrigin : allowedOrigin,
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');

  // Handle preflight – no body, no auth check needed.
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return false;
  }

  if (!originAllowed) {
    res.status(403).json({ error: 'Forbidden: origin not allowed' });
    return false;
  }

  return true;
}
