import { test, expect } from '@playwright/test';

/**
 * TIER 2 — business invariant: a customer requires phone OR email.
 * Authenticated. Verifies the form rejects a customer with neither.
 */
test.describe('Customer validation', () => {
  test('creating a customer with neither phone nor email is rejected', async ({ page }) => {
    await page.goto('/customers/new');
    await page.getByRole('textbox', { name: 'Name' }).fill('No Contact Person');
    await page.getByRole('button', { name: 'Create customer' }).click();
    // Should NOT navigate away on success; an error/validation message appears.
    await expect(page.getByText(/phone or email/i)).toBeVisible();
  });
});