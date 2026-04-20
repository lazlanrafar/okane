import { test, expect } from '@playwright/test';

// Reset storage state for public tests
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Public Authentication', () => {
  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/en/login');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    
    // Check for validation messages (Zod/React Hook Form usually renders them in FormMessage)
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(page.getByText('Password must be at least 6 characters.')).toBeVisible();
  });

  test('should show validation errors on registration', async ({ page }) => {
    await page.goto('/en/register');
    await page.getByRole('button', { name: 'Register', exact: true }).click();
    
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(page.locator('text=Password must be at least 6 characters.').first()).toBeVisible();
  });

  test('should navigate to register from login', async ({ page }) => {
    await page.goto('/en/login');
    await page.click('text=Register'); // Assuming there's a link with text Register
    await expect(page).toHaveURL(/.*register/);
  });
});
