import { test, expect } from '@playwright/test';

/**
 * TIER 2 — business invariant: the quote builder enforces required fields
 * before a quote can be sent. Runs authenticated (reuses the seed session).
 */
test.describe('Quote builder validation', () => {
  test('an incomplete quote shows what must be fixed before sending', async ({ page }) => {
    await page.goto('/quotes/new');
    // The builder surfaces a checklist of what's missing on an empty quote.
    await expect(page.getByText(/fix before sending/i)).toBeVisible();
  });

  test('the authenticated user reaches the app, not the login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).not.toHaveURL(/\/login/);
  });
});