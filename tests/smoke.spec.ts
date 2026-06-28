import { test, expect } from '@playwright/test';

test('staging app loads through the Vercel protection bypass', async ({ page }) => {
  const response = await page.goto('/');
  // Not bounced to the Vercel SSO wall:
  await expect(page).not.toHaveURL(/vercel\.com\/sso/);
  // Got a real 2xx from the app:
  expect(response?.status()).toBeLessThan(400);
});