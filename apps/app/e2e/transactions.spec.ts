import { test, expect } from '@playwright/test';

test.describe('Finance: Transactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/overview');
    await page.goto('/en/transactions');
    await expect(page).toHaveURL(/.*transactions/);
  });

  test('should create a new expense transaction', async ({ page }) => {
    // Click Add
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    // Fill form
    await page.getByPlaceholder('Ex: Coffee, Lunch, Rent...').fill('Test Expense Transaction');
    
    // Amount
    const amountInput = page.locator('input[type="text"]').filter({ hasText: /^\d/ }).last(); 
    // Wait, CurrencyInput might be tricky. Let's use getByLabel if possible.
    // In transaction-form-sheet.tsx, Amount has FormLabel "Amount"
    await page.getByLabel('Amount').fill('50');

    // Select Account
    await page.getByLabel('Account', { exact: true }).click();
    await page.getByRole('option').first().click();

    // Select Category
    await page.getByLabel('Category').click();
    await page.getByRole('option').first().click();

    // Submit
    await page.getByRole('button', { name: 'Save Transaction' }).click();

    // Verify success
    await expect(page.getByText('Transaction created successfully')).toBeVisible();
    await expect(page.locator('table')).toContainText('Test Expense Transaction');
  });

  test('should filter transactions by search', async ({ page }) => {
    await page.getByPlaceholder('Search transactions...').fill('Test Expense Transaction');
    // The table should filter
    await expect(page.locator('table')).toContainText('Test Expense Transaction');
  });
});
