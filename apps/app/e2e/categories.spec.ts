import { test, expect } from '@playwright/test';

test.describe('Finance: Categories', () => {
  test('should create a new income category', async ({ page }) => {
    await page.goto('/en/settings/income-category');
    await expect(page).toHaveURL(/.*income-category/);

    // Click Add Category
    await page.getByRole('button', { name: 'Add Category' }).click();

    // Fill form
    await page.getByPlaceholder('Category name').fill('Test Income Category');

    // Submit
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify success
    await expect(page.getByText('Category created successfully')).toBeVisible();
    await expect(page.locator('table')).toContainText('Test Income Category');
  });

  test('should create a new expense category', async ({ page }) => {
    await page.goto('/en/settings/expense-category');
    await expect(page).toHaveURL(/.*expense-category/);

    // Click Add Category
    await page.getByRole('button', { name: 'Add Category' }).click();

    // Fill form
    await page.getByPlaceholder('Category name').fill('Test Expense Category');

    // Submit
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify success
    await expect(page.getByText('Category created successfully')).toBeVisible();
    await expect(page.locator('table')).toContainText('Test Expense Category');
  });
});
