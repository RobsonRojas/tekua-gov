import { test, expect } from '@playwright/test';

test.describe('Wallet System', () => {
  test.beforeEach(async ({ page }) => {
    // Login flow
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@tekua.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to wallet and see balance', async ({ page }) => {
    await page.click('a[href="/wallet"]');
    await expect(page).toHaveURL('/wallet');
    await expect(page.locator('text=Available Balance')).toBeVisible();
    await expect(page.locator('text=$S')).toBeVisible();
  });

  test('should show transfer modal and validate inputs', async ({ page }) => {
    await page.goto('/wallet');
    await page.click('button:has-text("Transfer")');
    
    await expect(page.locator('text=Send Surreais')).toBeVisible();
    
    const confirmBtn = page.getByRole('button', { name: 'Confirm Transfer' });
    await expect(confirmBtn).toBeDisabled();

    await page.fill('input[label="Recipient"]', 'user@tekua.com');
    await page.fill('input[label="Amount"]', '10');
    
    await expect(confirmBtn).not.toBeDisabled();
  });

  test('should allow admin to access treasury', async ({ page }) => {
    await page.goto('/admin-treasury');
    await expect(page.locator('text=Treasury')).toBeVisible();
    await expect(page.locator('text=Total Supply')).toBeVisible();
  });
});
