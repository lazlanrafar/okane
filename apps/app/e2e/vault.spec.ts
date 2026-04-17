import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Advanced: Vault', () => {
  const testFilePath = path.join(__dirname, 'test-file.txt');

  test.beforeAll(async () => {
    // Create a dummy file for testing
    fs.writeFileSync(testFilePath, 'This is a test file for Oewang Vault.');
  });

  test.afterAll(async () => {
    // Cleanup
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/en/vault');
    await expect(page).toHaveURL(/.*vault/);
  });

  test('should upload a file to the vault', async ({ page }) => {
    // Handle the file upload via the hidden input
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Upload' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testFilePath);

    // Verify upload success toast
    await expect(page.getByText('All files uploaded successfully')).toBeVisible();
    
    // Verify file appears in list or has detail panel open
    await expect(page.getByText('test-file.txt')).toBeVisible();
  });

  test('should search for a file', async ({ page }) => {
    await page.getByPlaceholder('Search files...').fill('test-file');
    await expect(page.locator('body')).toContainText('test-file.txt');
  });

  test('should open file details', async ({ page }) => {
    await page.getByText('test-file.txt').first().click();
    await expect(page.getByText('File Details')).toBeVisible();
    await expect(page.getByText('test-file.txt')).toBeVisible({ timeout: 10000 });
  });
});
