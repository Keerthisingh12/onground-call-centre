/**
 * token.ts – POST /api/token
 *
 * Issues a short-lived, room-scoped LiveKit participant token.
 *
 * Request body (JSON):
 *   { mode: "human" | "ai" | "phone", displayName: string, room?: string }
 *
 * Response (JSON):
 *   { token: string, url: string, room: string, identity: string }
 *
 * Security properties:
 *  - Validates body with zod before touching any LiveKit API.
 *  - Token TTL: 600 seconds (10 min) — short-lived.
 *  - Grants: roomJoin + room-scoped only. No roomAdmin, roomCreate,
 *    roomList, ingressAdmin, or sipAdmin grants.
 *  - LIVEKIT_API_KEY / LIVEKIT_API_SECRET never appear in any response,
 *    log line, or error message sent to the client.
 *  - CORS restricted by applyCors() (see _lib/cors.ts).
 *
 * NOTE: Rate limiting is not implemented in Phase 1 (stateless serverless
 * functions cannot share in-memory counters). For the phone/dial endpoint
 * (Phase 3) a Vercel KV-backed rate limiter will be added. This endpoint
 * issues only tokens; no telephony or money is spent.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { AccessToken, RoomConfiguration, RoomAgentDispatch } from 'livekit-server-sdk';
import { applyCors } from './_lib/cors';
import { getLiveKitConfig, generateRoomName, generateIdentity } from './_lib/livekit';

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------
const BodySchema = z.object({
  mode: z.enum(['human', 'ai', 'phone']),
  displayName: z
    .string()
    .min(1, 'displayName is required')
    .max(50, 'displayName must be ≤50 chars')
    .trim(),
  room: z
    .string()
    .min(1)
    .max(100)
    .trim()
    .optional(),
});

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  // 1. CORS (also handles OPTIONS preflight)
  if (!applyCors(req, res)) return;

  // 2. Method guard
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // 3. Body validation
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid request body',
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { mode, displayName, room: roomInput } = parsed.data;

  // 4. Read server env vars — throws if any are missing
  let config;
  try {
    config = getLiveKitConfig();
  } catch {
    // Do NOT include the thrown message in the response — it mentions env var names
    // which are fine to log server-side but should not leak to clients.
    console.error('[token] LiveKit server config is incomplete');
    res.status(503).json({
      error: 'Service unavailable: backend not configured',
    });
    return;
  }

  // 5. Determine room name
  //    For "human" mode: caller may supply a room so two participants can meet.
  //    For "ai"/"phone": always generate a fresh room to avoid cross-session leakage.
  const room =
    mode === 'human' && roomInput ? roomInput : generateRoomName(mode);

  // 6. Generate unique identity
  const identity = generateIdentity(displayName);

  // 7. Build a short-lived, room-scoped token
  const at = new AccessToken(config.apiKey, config.apiSecret, {
    identity,
    name: displayName,
    ttl: 600, // 10 minutes — short-lived
  });

  at.addGrant({
    roomJoin: true,
    room,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    // Explicitly NOT granted:
    //   roomAdmin, roomCreate, roomList,
    //   ingressAdmin, sipAdmin, hidden
  });

  // For AI mode: configure automatic agent dispatch to 'onground-assistant'
  // when the participant connects to create the room.
  if (mode === 'ai') {
    at.roomConfig = new RoomConfiguration({
      name: room,
      agents: [
        new RoomAgentDispatch({
          agentName: 'onground-assistant',
        }),
      ],
    });
  }

  let token: string;
  try {
    token = await at.toJwt();
  } catch (err) {
    console.error('[token] Failed to sign JWT:', err);
    res.status(500).json({ error: 'Failed to generate token' });
    return;
  }

  // 8. Respond — never include apiKey, apiSecret, or any secret
  res.status(200).json({
    token,
    url: config.url,
    room,
    identity,
  });
}
