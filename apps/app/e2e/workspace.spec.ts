import { test, expect } from '@playwright/test';

test.describe('Workspace Management', () => {
  test('should navigate to overview by default', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*overview/);
  });

  test('should switch between workspaces', async ({ page }) => {
    await page.goto('/en/overview');
    
    // Open workspace switcher
    await page.getByRole('button', { name: /.+ Free/ }).first().click(); // Open the switcher button
    
    // Get all workspace items in the dropdown
    const workspaceItems = page.getByRole('menuitem').filter({ hasText: /⌘/ });
    const count = await workspaceItems.count();
    
    if (count > 1) {
      const targetWorkspace = workspaceItems.nth(1);
      const name = await targetWorkspace.innerText();
      await targetWorkspace.click();
      
      // Verify switch success (toast or reload)
      await expect(page.getByText(/Switched to/)).toBeVisible();
    }
  });

  test('should open create workspace dialog from sidebar', async ({ page }) => {
    await page.goto('/en/overview');
    
    // Open workspace switcher
    await page.getByRole('button', { name: /.+ Free/ }).first().click();
    
    // Click "Add Workspace"
    await page.getByText('Add Workspace').click();
    
    // Verify dialog is open
    await expect(page.getByText('Create new workspace')).toBeVisible();
    await expect(page.locator('#workspace-name')).toBeVisible();
  });
});
