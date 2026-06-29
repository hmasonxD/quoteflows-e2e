import { test, expect } from '@playwright/test';

/**
 * TIER 2 — the customer search filters the list. Authenticated.
 */
test.describe('Customer search', () => {
  test('searching narrows the customer list to matches', async ({ page }) => {
    await page.goto('/customers');
    const search = page.getByPlaceholder(/search by name/i);
    await search.fill('dsadsa');
    await expect(page.getByText('dsadsa').first()).toBeVisible();

    // A term that matches nothing yields no customer rows.
    await search.fill('zzz-no-such-customer-zzz');
    await expect(page.getByText('dsadsa')).toHaveCount(0);
  });
});