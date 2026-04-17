import { test, expect } from '@playwright/test';

test.describe('Finance: Accounts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/overview');
    // Navigate to Accounts page via Sidebar or direct URL
    await page.goto('/en/accounts');
    await expect(page).toHaveURL(/.*accounts/);
  });

  test('should create a new account', async ({ page }) => {
    // Click Add Account
    await page.getByRole('button', { name: 'Add Account' }).click();

    // Fill form
    await page.getByPlaceholder('e.g., Personal Savings, Business...').fill('Test Bank Account');
    
    // Select a group (e.g., Cash or Bank)
    await page.getByLabel('Group').click();
    await page.getByRole('option').first().click(); // Select first available group

    // Set initial balance
    const balanceInput = page.locator('input[type="text"]').last(); // CurrencyInput
    await balanceInput.fill('1000');

    // Submit
    await page.getByRole('button', { name: 'Create Account', exact: true }).click();

    // Verify success
    await expect(page.getByText('Account created successfully')).toBeVisible();
    await expect(page.getByText('Test Bank Account')).toBeVisible();
  });

  test('should search for an account', async ({ page }) => {
    await page.getByPlaceholder('Search accounts...').fill('Test Bank Account');
    // The table should filter
    await expect(page.locator('table')).toContainText('Test Bank Account');
  });
});
