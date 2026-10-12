/**
 * health.test.ts – Unit tests for GET /api/health
 *
 * These tests are MOCKED — they exercise the handler logic in isolation.
 * They do not make real HTTP requests or connect to LiveKit Cloud.
 * Labelled: VERIFIED-BY-AUTOMATION (logic only), IMPLEMENTED-UNVERIFIED (real HTTP)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ---------------------------------------------------------------------------
// Minimal mock for VercelRequest / VercelResponse
// ---------------------------------------------------------------------------
function makeReq(
  method: string,
  origin: string = 'https://keerthisingh12.github.io',
): Partial<VercelRequest> {
  return {
    method,
    headers: { origin },
    body: {},
  };
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
    status(code: number) {
      _status = code;
      return this as VercelResponse;
    },
    json(data: JsonCapture) {
      _body = data;
      return this as VercelResponse;
    },
    end() {
      _ended = true;
      return this as VercelResponse;
    },
  };

  return {
    res,
    statusCode: () => _status,
    body: () => (_ended ? { ended: true } : _body),
  };
}

// ---------------------------------------------------------------------------
// Set env vars before importing handler (env is read at call-time, not import)
// ---------------------------------------------------------------------------
beforeEach(() => {
  process.env.ALLOWED_ORIGIN = 'https://keerthisingh12.github.io';
  process.env.VERCEL_ENV = 'production';
  process.env.LIVEKIT_URL = 'wss://test.livekit.cloud';
  process.env.LIVEKIT_API_KEY = 'test-key';
  process.env.LIVEKIT_API_SECRET = 'test-secret';
  vi.resetModules();
});

afterEach(() => {
  delete process.env.LIVEKIT_URL;
  delete process.env.LIVEKIT_API_KEY;
  delete process.env.LIVEKIT_API_SECRET;
  delete process.env.ALLOWED_ORIGIN;
  delete process.env.VERCEL_ENV;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('GET /api/health', () => {
  it('returns 200 with ok: true when LiveKit env vars are set', async () => {
    const { default: handler } = await import('../health');
    const req = makeReq('GET');
    const { res, statusCode, body } = makeRes();

    handler(req as VercelRequest, res as VercelResponse);

    expect(statusCode()).toBe(200);
    expect(body().ok).toBe(true);
    expect(body().service).toBe('onground-call-centre-api');
    expect(body().livekit).toBe('configured');
    expect(typeof body().timestamp).toBe('string');
  });

  it('reports livekit: missing-env when env vars are absent', async () => {
    delete process.env.LIVEKIT_URL;
    delete process.env.LIVEKIT_API_KEY;
    delete process.env.LIVEKIT_API_SECRET;

    const { default: handler } = await import('../health');
    const req = makeReq('GET');
    const { res, statusCode, body } = makeRes();

    handler(req as VercelRequest, res as VercelResponse);

    expect(statusCode()).toBe(200); // health is still 200 — service is up, just not configured
    expect(body().livekit).toBe('missing-env');
  });

  it('returns 405 for non-GET methods', async () => {
    const { default: handler } = await import('../health');
    const req = makeReq('POST');
    const { res, statusCode, body } = makeRes();

    handler(req as VercelRequest, res as VercelResponse);

    expect(statusCode()).toBe(405);
    expect(typeof body().error).toBe('string');
  });

  it('returns 403 for requests from a disallowed origin', async () => {
    const { default: handler } = await import('../health');
    const req = makeReq('GET', 'https://evil.example.com');
    const { res, statusCode, body } = makeRes();

    handler(req as VercelRequest, res as VercelResponse);

    expect(statusCode()).toBe(403);
    expect(typeof body().error).toBe('string');
  });

  it('handles OPTIONS preflight and returns 204', async () => {
    const { default: handler } = await import('../health');
    const req = makeReq('OPTIONS');
    const { res, statusCode, body } = makeRes();

    handler(req as VercelRequest, res as VercelResponse);

    expect(statusCode()).toBe(204);
    expect(body().ended).toBe(true);
  });
});
