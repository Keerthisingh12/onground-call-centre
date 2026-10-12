/**
 * health.ts – GET /api/health
 *
 * Returns 200 with service status.
 * Reports whether the required LiveKit env vars are present (NOT their values).
 * Safe to expose publicly — no secrets, no internal details.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_lib/cors';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (!applyCors(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const livekitConfigured =
    !!process.env.LIVEKIT_URL &&
    !!process.env.LIVEKIT_API_KEY &&
    !!process.env.LIVEKIT_API_SECRET;

  res.status(200).json({
    ok: true,
    service: 'onground-call-centre-api',
    timestamp: new Date().toISOString(),
    livekit: livekitConfigured ? 'configured' : 'missing-env',
  });
}
