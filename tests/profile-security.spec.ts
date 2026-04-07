import { test, expect } from '@playwright/test';

test.describe('Profile Security', () => {
  test.beforeEach(async ({ page }) => {
    // Login flow
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@tekua.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should allow user to change password from profile page', async ({ page }) => {
    // Navigate to profile
    await page.click('a[href="/profile"]');
    await expect(page).toHaveURL('/profile');

    // Should see personal info by default
    await expect(page.locator('text=Personal Information')).toBeVisible();

    // Click Security tab
    await page.click('button:has-text("Security")');
    
    // Should see Change Password form
    await expect(page.locator('text=Change Password')).toBeVisible();

    // Fill form
    await page.fill('#new-password', 'newSecurePassword123');
    await page.fill('#confirm-password', 'newSecurePassword123');
    
    // Intercept update call
    await page.route('**/auth/v1/user', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'user-id', email: 'test@tekua.com' }),
      });
    });

    // Submit
    await page.click('button:has-text("Update Password")');

    // Success message
    await expect(page.locator('text=Password updated successfully')).toBeVisible();
  });

  test('should show error if passwords do not match', async ({ page }) => {
    await page.click('a[href="/profile"]');
    await page.click('button:has-text("Security")');

    await page.fill('#new-password', 'password123');
    await page.fill('#confirm-password', 'differentPassword');
    
    await page.click('button:has-text("Update Password")');

    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });
});
