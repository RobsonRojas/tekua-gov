import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 720 } });

test.describe('Internationalization (i18n)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/profiles*', async route => {
      const json = [{ id: 'fake-user', role: 'member', preferred_language: 'pt', full_name: 'Test User' }];
      await route.fulfill({ json });
    });
    await page.route('**/auth/v1/token?grant_type=password', async route => {
      await route.fulfill({
        status: 200,
        json: {
          access_token: 'fake-token',
          refresh_token: 'fake-refresh',
          expires_in: 3600,
          user: { id: 'fake-user', email: 'test@example.com' }
        }
      });
    });
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should change language and update UI', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'TEKUA' })).toBeVisible();

    const logoutBtn = page.locator('button').filter({ has: page.locator('svg.lucide-log-out') });
    await expect(logoutBtn).toBeVisible();
    
    // Switch to English if not already
    await page.click('button:has(svg.lucide-languages)');
    await page.click('text=English');
    await expect(logoutBtn).toHaveText(/Logout/);
    
    // Switch to Portuguese
    await page.click('button:has(svg.lucide-languages)');
    await page.click('text=Português');
    await expect(logoutBtn).toHaveText(/Sair/);
  });
});
