/**
 * livekit.ts – Shared LiveKit utilities for Vercel serverless functions.
 *
 * Reads LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET from process.env.
 * Throws a clear error if any are missing (surfaced as 503 in handlers).
 * No secrets are logged or returned to clients.
 */

export interface LiveKitConfig {
  url: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Read and validate LiveKit env vars.
 * Throws if any required var is missing.
 * The thrown message is safe to log server-side; it is NOT forwarded to clients.
 */
export function getLiveKitConfig(): LiveKitConfig {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!url || !apiKey || !apiSecret) {
    throw new Error(
      'Missing LiveKit server env vars. ' +
        'Set LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET in the deployment dashboard.',
    );
  }

  return { url, apiKey, apiSecret };
}

/**
 * Generate a short random room name with a mode prefix.
 * E.g. "human-a3f7k2p1", "ai-q9w1e2r3", "phone-z4x5c6v7"
 */
export function generateRoomName(prefix: string): string {
  const id = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${id}`;
}

/**
 * Generate a unique participant identity from a display name.
 * Sanitises the name and appends a random suffix to avoid collisions.
 * E.g. displayName "Alice" → "alice-a1b2c3"
 */
export function generateIdentity(displayName: string): string {
  const safe = displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20);
  const id = Math.random().toString(36).slice(2, 8);
  return `${safe || 'user'}-${id}`;
}
