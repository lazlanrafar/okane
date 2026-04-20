import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/en/login');
  
  if (process.env.PLAYWRIGHT_MANUAL_AUTH) {
    // Manual mode for Social Login (Google/GitHub)
    console.log('--- MANUAL AUTHENTICATION MODE ---');
    console.log('Please log in manually in the browser window.');
    console.log('Playwright will capture the session once you reach the dashboard.');

    // Wait for the URL to contain 'overview' with no timeout
    await page.waitForURL(/.*overview/, { timeout: 0 });
  } else {
    // Automated mode for Email/Password (fallback)
    const email = process.env.PLAYWRIGHT_USER;
    const password = process.env.PLAYWRIGHT_PASS;

    if (!email || !password) {
      console.warn('Skipping automated login: PLAYWRIGHT_USER or PLAYWRIGHT_PASS not set.');
      console.warn('Run "bun run test:e2e:login" to authenticate manually.');
      return;
    }

    await page.getByText('Show other options').click();
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page).toHaveURL(/.*overview/);
  }

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
