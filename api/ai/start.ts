/**
 * start.ts – POST /api/ai/start
 *
 * Dispatches the LiveKit AI voice agent into a named room.
 * Idempotent: if the agent is already in the room, returns 200 without re-dispatching.
 *
 * STATUS: NOT DONE — Placeholder stub.
 * Will be implemented in Phase 2 once the Python agent is deployed and
 * the agent_name is confirmed.
 *
 * Request body: { room: string }
 * Response:     { dispatched: boolean, agentIdentity: string }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from '../_lib/cors';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (!applyCors(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Phase 2 implementation goes here.
  res.status(501).json({
    error: 'Not implemented',
    note: 'AI agent dispatch will be added in Phase 2.',
  });
}
