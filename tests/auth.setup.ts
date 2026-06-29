import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate as the verified seed account', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.SEED_EMAIL!);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.SEED_PASSWORD!);
  await page.getByRole('button', { name: /log ?in/i }).click();

  // Login succeeds when we're redirected away from /login into the app.
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

  // Persist cookies + localStorage so authenticated tests reuse this session.
  await page.context().storageState({ path: authFile });
});