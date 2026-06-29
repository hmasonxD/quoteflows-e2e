import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const baseURL = process.env.STAGING_BASE_URL;
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

if (!baseURL || !bypass) {
  throw new Error(
    'Missing STAGING_BASE_URL or VERCEL_AUTOMATION_BYPASS_SECRET. ' +
    'Copy .env.example to .env and fill them in.'
  );
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL,
    // Sends the Vercel bypass on every request (page navigations + API calls),
    // so the whole suite gets past deployment protection. Token comes from .env,
    // never hardcoded. set-bypass-cookie carries it across navigations.
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': bypass,
      'x-vercel-set-bypass-cookie': 'true',
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Logs in once, saves session for the authenticated project.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    // Logged-OUT tests (auth gating, public pages, negative paths).
{
      name: 'public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: [/tests[\\/]tier1[\\/]/, /tests[\\/]tier4[\\/]/, /unverified-send-block/],
    },
    {
      name: 'authenticated',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
      dependencies: ['setup'],
      testMatch: /tests[\\/](tier2|tier3)[\\/]/,
      testIgnore: /unverified-send-block/,
    },
  ],
});