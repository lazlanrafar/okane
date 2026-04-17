import { test, expect } from '@playwright/test';

test.describe('Advanced: Contacts & Debts', () => {
  test('should create a new contact', async ({ page }) => {
    await page.goto('/en/contacts');
    await expect(page).toHaveURL(/.*contacts/);

    // Click New Contact
    await page.getByRole('button', { name: 'New Contact' }).click();

    // Fill form
    await page.getByPlaceholder('John Doe').fill('Test Contact');
    await page.getByPlaceholder('john@example.com').fill('test@example.com');
    await page.getByPlaceholder('+1 234 567 890').fill('123456789');

    // Submit
    await page.getByRole('button', { name: 'Create Contact' }).click();

    // Verify success
    await expect(page.getByText('Contact created successfully')).toBeVisible();
    await expect(page.locator('table')).toContainText('Test Contact');
  });

  test('should create a new debt for a contact', async ({ page }) => {
    await page.goto('/en/debts');
    await expect(page).toHaveURL(/.*debts/);

    // Click Add Debt
    await page.getByRole('button', { name: 'Add Debt' }).click();

    // Fill form
    // Select Contact
    await page.getByLabel('Contact').click();
    await page.getByText('Test Contact').click();

    // Amount
    await page.getByLabel('Amount').fill('200');

    // Description
    await page.getByPlaceholder('What is this debt for?').fill('Test Debt Description');

    // Select Account
    await page.getByLabel('Account').click();
    await page.getByRole('option').first().click();

    // Submit
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Verify success
    await expect(page.getByText('Debt created successfully')).toBeVisible();
    await expect(page.locator('table')).toContainText('Test Contact');
    await expect(page.locator('table')).toContainText('200');
  });
});
