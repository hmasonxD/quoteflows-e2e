import { test, expect, request as playwrightRequest } from '@playwright/test';

const API_URL = process.env.STAGING_API_URL!;

/**
 * TIER 1 — SECURITY: authentication gating (UI).
 * An unauthenticated visitor must not reach protected app areas.
 */
test.describe('Authentication gating (UI)', () => {
  test('a protected app route redirects to login when logged out', async ({ page }) => {
    await page.goto('/quotes');
    await expect(page).toHaveURL(/\/login/);
  });

  test('the login page is reachable when logged out', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: /log ?in|sign ?in/i })).toBeVisible();
  });
});

/**
 * TIER 1 — SECURITY: the protected API rejects unauthenticated calls.
 * Hits the BACKEND directly (not the frontend origin) to verify the server-side
 * auth guard as a black box. The backend's fallback policy requires auth on
 * everything not explicitly [AllowAnonymous].
 */
test.describe('API authentication', () => {
  test('a protected endpoint returns 401 without a token', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: API_URL });
    const res = await ctx.get('/api/quotes');
    expect(res.status()).toBe(401);
    await ctx.dispose();
  });

  test('a protected endpoint returns 401 with a garbage token', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: API_URL });
    const res = await ctx.get('/api/quotes', {
      headers: { Authorization: 'Bearer not-a-real-token' },
    });
    expect(res.status()).toBe(401);
    await ctx.dispose();
  });
});