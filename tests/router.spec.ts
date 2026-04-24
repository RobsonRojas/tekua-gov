import { test, expect } from '@playwright/test';

test.describe('Routing and Protected Routes', () => {
  test('unauthenticated user navigating to home should be redirected to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login/);
  });

  test('unauthenticated user navigating to profile should be redirected to login', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/.*login/);
  });

  test('unauthenticated user navigating to unknown route should be redirected to login', async ({ page }) => {
    // The router has a catch-all '*' that redirects to '/'
    // And '/' will redirect to '/login' since user is unauthenticated
    await page.goto('/random-unknown-route-12345');
    await expect(page).toHaveURL(/.*login/);
  });

  test('login route should not redirect to login again', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('button:has-text("Entrar")')).toBeVisible();
  });
});
