/**
 * hangup.ts – POST /api/phone/hangup
 *
 * Removes the SIP participant from a room, triggering a clean disconnect
 * on the phone side. Also removes the room if empty.
 *
 * STATUS: NOT DONE — Placeholder stub.
 * Will be implemented in Phase 3.
 *
 * Request body: { room: string }
 * Response:     { hung_up: boolean }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from '../_lib/cors';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (!applyCors(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Phase 3 implementation goes here.
  res.status(501).json({
    error: 'Not implemented',
    note: 'Phone hangup will be added in Phase 3.',
  });
}
