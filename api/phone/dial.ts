/**
 * dial.ts – POST /api/phone/dial
 *
 * Validates the request, enforces the access-code gate, checks the allow-list,
 * and creates a SIP participant via LiveKit's CreateSIPParticipant API.
 *
 * STATUS: NOT DONE — Placeholder stub.
 * Will be implemented in Phase 3 after Twilio Elastic SIP Trunk is configured
 * and verified with the `lk sip participant create` CLI test.
 *
 * Security properties (planned):
 *  - ACCESS_CODE checked in constant time
 *  - ALLOWED_DESTINATIONS allow-list (E.164 numbers you own/verified)
 *  - Phone number validated with libphonenumber-js (E.164 only)
 *  - Per-IP and global rate limits via Vercel KV
 *  - Duplicate-call protection via deterministic room name + SIP participant check
 *  - Hard cap on active calls (1 at a time on trial plan)
 *  - All errors map to typed codes: invalid_number|not_allowed|rate_limited|
 *    busy|declined|no_answer|provider_error|timeout
 *  - Phone numbers masked in logs (last 4 digits only)
 *
 * Request body: { accessCode, to, idempotencyKey, withAgent? }
 * Response:     { room, sipIdentity } | { code: ErrorCode, message: string }
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
    note: 'Telephony will be added in Phase 3 after SIP trunk setup.',
  });
}
