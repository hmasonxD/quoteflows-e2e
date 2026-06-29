import { test, expect, request as playwrightRequest } from '@playwright/test';

const API_URL = process.env.STAGING_API_URL!;

/**
 * TIER 4 — negative paths: the public quote endpoint must not leak or error
 * on a bad token. An unknown token returns not-found, never a 500 or a leak.
 * Public endpoints are anonymous, so we hit the backend directly.
 */
test.describe('Public quote token handling', () => {
  test('an unknown public quote token returns 404, not an error', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: API_URL });
    const res = await ctx.get('/api/public/quotes/this-token-does-not-exist');
    expect(res.status()).toBe(404);
    await ctx.dispose();
  });

  test('a malformed public quote token is rejected cleanly (not 500)', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: API_URL });
    const res = await ctx.get('/api/public/quotes/!!!not-a-valid-token!!!');
    // Must be a clean client error, never a server crash.
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
    await ctx.dispose();
  });
});