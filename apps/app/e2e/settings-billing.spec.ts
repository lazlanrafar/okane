import { test, expect } from '@playwright/test';

test.describe('System: Settings & Billing', () => {
  test('should update profile display name', async ({ page }) => {
    await page.goto('/en/settings/profile');
    await expect(page).toHaveURL(/.*profile/);

    const nameInput = page.getByLabel('Display Name');
    await nameInput.clear();
    await nameInput.fill('Updated Test User');

    await page.getByRole('button', { name: 'Update profile' }).click();

    await expect(page.getByText('Profile successfully updated')).toBeVisible();
  });

  test('should switch theme in appearance settings', async ({ page }) => {
    await page.goto('/en/settings/appearance');
    await expect(page).toHaveURL(/.*appearance/);

    // Click Dark theme toggle
    await page.getByLabel('Toggle dark').click();
    
    // Verify html has dark class or data-theme
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Click Light theme toggle
    await page.getByLabel('Toggle light').click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should view billing page', async ({ page }) => {
    await page.goto('/en/settings/billing');
    await expect(page).toHaveURL(/.*billing/);

    await expect(page.getByText('Billing', { exact: true })).toBeVisible();
    await expect(page.getByText('Current Plan')).toBeVisible();
  });
});
