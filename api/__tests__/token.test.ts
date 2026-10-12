/**
 * token.test.ts – Unit tests for POST /api/token
 *
 * All tests are MOCKED — livekit-server-sdk's AccessToken is replaced with a
 * spy that never calls a real LiveKit server. No network connections are made.
 * Labelled: VERIFIED-BY-AUTOMATION (logic only), IMPLEMENTED-UNVERIFIED (real HTTP)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ---------------------------------------------------------------------------
// Mock livekit-server-sdk — vi.mock is hoisted to top of file by Vitest,
// so this runs before any imports of api/token.ts. Using a class (function
// with prototype) ensures `new AccessToken(...)` works correctly.
// ---------------------------------------------------------------------------
vi.mock('livekit-server-sdk', () => {
  class AccessToken {
    addGrant = vi.fn();
    toJwt = vi.fn().mockResolvedValue('mock-jwt-token');
    roomConfig: unknown = undefined;
    constructor(_key: string, _secret: string, _opts: unknown) {
      AccessToken.lastInstance = this;
    }
    static lastInstance: AccessToken | null = null;
  }
  class RoomConfiguration {
    name?: string;
    agents?: unknown[];
    constructor(opts: { name?: string; agents?: unknown[] } = {}) {
      this.name = opts.name;
      this.agents = opts.agents;
    }
  }
  class RoomAgentDispatch {
    agentName?: string;
    constructor(opts: { agentName?: string } = {}) {
      this.agentName = opts.agentName;
    }
  }
  return { AccessToken, RoomConfiguration, RoomAgentDispatch };
});

// ---------------------------------------------------------------------------
// Minimal req/res mocks
// ---------------------------------------------------------------------------
function makeReq(
  method: string,
  body: unknown = {},
  origin: string = 'https://keerthisingh12.github.io',
): Partial<VercelRequest> {
  return { method, body, headers: { origin } };
}

type JsonCapture = Record<string, unknown>;

function makeRes(): {
  res: Partial<VercelResponse>;
  statusCode: () => number;
  body: () => JsonCapture;
} {
  let _status = 200;
  let _body: JsonCapture = {};
  let _ended = false;

  const res: Partial<VercelResponse> = {
    setHeader: vi.fn().mockReturnThis(),
    status(code: number) { _status = code; return this as VercelResponse; },
    json(data: JsonCapture) { _body = data; return this as VercelResponse; },
    end() { _ended = true; return this as VercelResponse; },
  };

  return {
    res,
    statusCode: () => _status,
    body: () => (_ended ? { ended: true } : _body),
  };
}

// ---------------------------------------------------------------------------
// Env setup — set BEFORE each test; handler reads env at call-time
// ---------------------------------------------------------------------------
beforeEach(() => {
  process.env.ALLOWED_ORIGIN = 'https://keerthisingh12.github.io';
  process.env.VERCEL_ENV = 'production';
  process.env.LIVEKIT_URL = 'wss://test.livekit.cloud';
  process.env.LIVEKIT_API_KEY = 'test-api-key';
  process.env.LIVEKIT_API_SECRET = 'test-api-secret';
});

afterEach(() => {
  delete process.env.LIVEKIT_URL;
  delete process.env.LIVEKIT_API_KEY;
  delete process.env.LIVEKIT_API_SECRET;
  delete process.env.ALLOWED_ORIGIN;
  delete process.env.VERCEL_ENV;
});

// Import handler once (mock is already in place via vi.mock hoisting)
// Use a lazy import inside each test to get a fresh handler with current env
async function getHandler() {
  const mod = await import('../token');
  return mod.default;
}

// ---------------------------------------------------------------------------
// Tests: request validation
// ---------------------------------------------------------------------------
describe('POST /api/token – validation', () => {
  it('returns 400 when mode is missing', async () => {
    const handler = await getHandler();
    const req = makeReq('POST', { displayName: 'Alice' });
    const { res, statusCode, body } = makeRes();
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusCode()).toBe(400);
    expect(body().error).toBe('Invalid request body');
  });

  it('returns 400 when displayName is missing', async () => {
    const handler = await getHandler();
    const req = makeReq('POST', { mode: 'human' });
    const { res, statusCode, body } = makeRes();
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusCode()).toBe(400);
    expect(body().error).toBe('Invalid request body');
  });

  it('returns 400 when mode is invalid', async () => {
    const handler = await getHandler();
    const req = makeReq('POST', { mode: 'admin', displayName: 'Alice' });
    const { res, statusCode, body } = makeRes();
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusCode()).toBe(400);
    expect(body().error).toBe('Invalid request body');
  });

  it('returns 400 when displayName exceeds 50 chars', async () => {
    const handler = await getHandler();
    const req = makeReq('POST', { mode: 'human', displayName: 'A'.repeat(51) });
    const { res, statusCode } = makeRes();
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusCode()).toBe(400);
  });

  it('returns 405 for non-POST methods', async () => {
    const handler = await getHandler();
    const req = makeReq('GET', {});
    const { res, statusCode } = makeRes();
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusCode()).toBe(405);
  });

  it('returns 403 for requests from a disallowed origin', async () => {
    const handler = await getHandler();
    const req = makeReq('POST', { mode: 'human', displayName: 'Alice' }, 'https://evil.example.com');
    const { res, statusCode, body } = makeRes();
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusCode()).toBe(403);
    expect(typeof body().error).toBe('string');
  });

  it('returns 503 when LiveKit env vars are missing', async () => {
    delete process.env.LIVEKIT_API_KEY;
    const handler = await getHandler();
    const req = makeReq('POST', { mode: 'human', displayName: 'Alice' });
    const { res, statusCode, body } = makeRes();
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusCode()).toBe(503);
    expect((body().error as string)).toContain('not configured');
  });

  it('OPTIONS preflight returns 204 without reaching token logic', async () => {
    const handler = await getHandler();
    const req = makeReq('OPTIONS', {});
    const { res, statusCode, body } = makeRes();
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusCode()).toBe(204);
    expect(body().ended).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: successful token generation (mocked SDK)
// ---------------------------------------------------------------------------
describe('POST /api/token – successful token generation (mocked)', () => {
  it('returns 200 with token, url, room, identity for mode=human with supplied room', async () => {
    const handler = await getHandler();
    const req = makeReq('POST', { mode: 'human', displayName: 'Alice', room: 'test-room' });
    const { res, statusCode, body } = makeRes();
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusCode()).toBe(200);
    expect(body().token).toBe('mock-jwt-token');
    expect(body().url).toBe('wss://test.livekit.cloud');
    expect(body().room).toBe('test-room'); // human mode: uses supplied room
    expect(typeof body().identity).toBe('string');
  });

  it('generates a fresh room name prefixed "ai-" and configures onground-assistant dispatch for mode=ai', async () => {
    const handler = await getHandler();
    const req = makeReq('POST', { mode: 'ai', displayName: 'Agent', room: 'some-room' });
    const { res, statusCode, body } = makeRes();
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusCode()).toBe(200);
    expect((body().room as string).startsWith('ai-')).toBe(true);

    const sdk = await import('livekit-server-sdk');
    const lastInstance = (sdk.AccessToken as unknown as { lastInstance: { roomConfig: any } }).lastInstance;
    expect(lastInstance.roomConfig).toBeDefined();
    expect(lastInstance.roomConfig.agents[0].agentName).toBe('onground-assistant');
  });

  it('generates a fresh room name prefixed "phone-" for mode=phone', async () => {
    const handler = await getHandler();
    const req = makeReq('POST', { mode: 'phone', displayName: 'User' });
    const { res, statusCode, body } = makeRes();
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusCode()).toBe(200);
    expect((body().room as string).startsWith('phone-')).toBe(true);
  });

  it('identity includes a sanitised version of the displayName', async () => {
    const handler = await getHandler();
    const req = makeReq('POST', { mode: 'human', displayName: 'Alice Smith', room: 'r1' });
    const { res, statusCode, body } = makeRes();
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusCode()).toBe(200);
    expect((body().identity as string).startsWith('alice')).toBe(true);
  });

  it('generates unique identities for two requests with the same displayName', async () => {
    const handler = await getHandler();
    const makeCall = async () => {
      const req = makeReq('POST', { mode: 'human', displayName: 'Alice', room: 'room1' });
      const { res, body } = makeRes();
      await handler(req as VercelRequest, res as VercelResponse);
      return body().identity as string;
    };
    const [id1, id2] = await Promise.all([makeCall(), makeCall()]);
    expect(id1).not.toBe(id2);
  });
});

// ---------------------------------------------------------------------------
// Tests: security properties (mocked SDK)
// ---------------------------------------------------------------------------
describe('POST /api/token – security properties (mocked)', () => {
  it('response body does not contain the API key or secret', async () => {
    const handler = await getHandler();
    const req = makeReq('POST', { mode: 'human', displayName: 'Alice', room: 'r1' });
    const { res, statusCode, body } = makeRes();
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusCode()).toBe(200);
    const bodyStr = JSON.stringify(body());
    expect(bodyStr).not.toContain('test-api-key');
    expect(bodyStr).not.toContain('test-api-secret');
  });

  it('generates a fresh room when mode=human but no room is provided', async () => {
    const handler = await getHandler();
    const req = makeReq('POST', { mode: 'human', displayName: 'Alice' });
    const { res, statusCode, body } = makeRes();
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusCode()).toBe(200);
    expect((body().room as string).startsWith('human-')).toBe(true);
  });
});
