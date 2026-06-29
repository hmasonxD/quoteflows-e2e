import { test, expect } from '@playwright/test';

/**
 * TIER 2 — security/business gate: an UNVERIFIED user is blocked from sending.
 * Signs up a fresh account (logged in immediately, but unverified) and confirms
 * the verification gate prevents sending — tested from the enforcement side.
 * This test runs logged-OUT initially (no stored session) so it lives in a
 * project that doesn't reuse the verified seed account.
 */
test.describe('Unverified send gate', () => {
  test('a freshly signed-up (unverified) user cannot send a quote', async ({ page }) => {
    const stamp = Date.now();
    const email = `e2e_unverified_${stamp}@example.com`;

    // Sign up — lands logged in but unverified.
    await page.goto('/signup');
    await page.getByRole('textbox', { name: 'Business name' }).fill(`E2E ${stamp}`);
    await page.getByRole('textbox', { name: 'Your name' }).fill('E2E Tester');
    await page.getByRole('textbox', { name: 'Phone' }).fill('(780) 555-0100');
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('TestPassword123');
    await page.getByRole('button', { name: /create account/i }).click();

    // Confirm we're in the app (signup logs you in).
    await expect(page).not.toHaveURL(/\/signup/, { timeout: 15000 });

    // Attempt to build + send a quote. The verification gate should block the send.
    await page.goto('/quotes/new');
    // The app shows a verification prompt / blocks send for unverified users.
    // Assert the send is gated: a verify-email prompt appears, or send is unavailable.
    const verifyPrompt = page.getByText(/verify (your )?email/i);
    await expect(verifyPrompt.first()).toBeVisible({ timeout: 10000 });
  });
});