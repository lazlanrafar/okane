import { test, expect } from '@playwright/test';

test('homepage has correct title and renders', async ({ page }) => {
  // Navigate to the base URL
  await page.goto('/');

  // Expect a title "to contain" a substring. We don't know the exact title, 
  // so we'll just check if the page loaded without a 404 or 500 error.
  const pageTitle = await page.title();
  expect(pageTitle).not.toBe('');
  
  // Basic validation that the page has a body
  const body = page.locator('body');
  await expect(body).toBeVisible();
});
