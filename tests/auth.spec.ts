import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should show login page with all elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h3:has-text("Tekua")')).toBeVisible();
    await expect(page.locator('button:has-text("Entrar")')).toBeVisible();
  });

  test('should show error message on failed login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrong-pass');
    await page.click('button:has-text("Entrar")');
    
    // error message is expected as we are using a real (or unconfigured) supabase
    await expect(page.locator('role=alert')).toBeVisible();
  });
});

test.describe('Admin Control', () => {
  test('unauthorized user should be redirected to login', async ({ page }) => {
    // Navigate to admin directly
    await page.goto('/admin-panel');
    
    // Should be redirected to login as not authenticated
    await expect(page).toHaveURL(/.*login/);
  });
});
