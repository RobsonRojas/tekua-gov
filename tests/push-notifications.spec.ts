import { test, expect } from '@playwright/test';

test.describe('Push Notifications Flow', () => {
  // Setup mock for push notification permissions
  test.use({
    permissions: ['notifications'],
  });

  test('Shows banner when permissions are not default', async ({ page, context }) => {
    // Clear permissions to 'default' state
    await context.clearPermissions();

    // Mock Login
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
    await page.click('button:has-text("Entrar")');
    
    // Once logged in, should be on Dashboard
    await expect(page).toHaveURL(/.*\//);

    // Banner should be visible
    const bannerTitle = page.getByText(/Fique Atualizado|Stay Updated/i);
    await expect(bannerTitle).toBeVisible();

    const enableBtn = page.getByRole('button', { name: /Ativar Notificações|Enable Notifications/i });
    await expect(enableBtn).toBeVisible();
  });

  test('Subscribing flow is handled', async ({ page, context }) => {
    // Explicitly grant permissions
    await context.grantPermissions(['notifications']);

    // Mock the PushManager API because Playwright doesn't fully support pushing in headless without mocks
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve({
            pushManager: {
              subscribe: async () => {
                return {
                  toJSON: () => ({
                    endpoint: 'https://fake.push.server.com/endpoint',
                    keys: {
                      auth: 'mock-auth',
                      p256dh: 'mock-p256dh'
                    }
                  })
                };
              }
            }
          })
        },
        configurable: true
      });
    });

    // Mock Supabase push_subscriptions upsert
    let upsertCalled = false;
    await page.route('**/rest/v1/push_subscriptions*', async route => {
      upsertCalled = true;
      await route.fulfill({ status: 201 });
    });

    // Mock Login
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
    await page.click('button:has-text("Entrar")');
    
    await expect(page).toHaveURL(/.*\//);
    
    // In this test, permission is already granted via Playwright context
    // The banner should NOT be visible
    const bannerTitle = page.getByText(/Fique Atualizado|Stay Updated/i);
    await expect(bannerTitle).toBeHidden();
  });
});
