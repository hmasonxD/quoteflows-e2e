import { test, expect } from '@playwright/test';
import { QuoteBuilderPage } from '../../pages/QuoteBuilderPage';

/**
 * TIER 3 — e2e happy path: a verified user builds and sends a quote.
 * Runs authenticated as the verified seed account (session reused via setup).
 */
test.describe('Quote send (verified user)', () => {
  test('a complete quote can be built and sent', async ({ page }) => {
    const builder = new QuoteBuilderPage(page);
    await builder.goto();

    await builder.selectCustomer('dsadsa');
    await builder.fillBasics('123 Test Ave, Edmonton', 'E2E test scope of work');
    await builder.addLineItemFromTemplate(/Labour - standard rate/i);

    await builder.saveAndSend();

    // Success signal: lands on the quotes list and the quote shows Sent status.
    await expect(page.getByText(/sent/i).first()).toBeVisible({ timeout: 15000 });
  });
});