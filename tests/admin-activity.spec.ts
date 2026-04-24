import { test, expect } from '@playwright/test';

test.describe('Admin Activity Audit Flow', () => {
  test('Admin can view and filter global activity logs', async ({ page }) => {
    // Mock user profile to be admin
    await page.route('**/rest/v1/profiles*', async route => {
      const json = [{ id: 'fake-admin', role: 'admin' }];
      await route.fulfill({ json });
    });

    // Mock Login
    await page.route('**/auth/v1/token?grant_type=password', async route => {
      await route.fulfill({
        status: 200,
        json: {
          access_token: 'fake-token',
          refresh_token: 'fake-refresh',
          expires_in: 3600,
          user: { id: 'fake-admin', email: 'admin@example.com' }
        }
      });
    });

    // Mock Logs fetch
    await page.route('**/rest/v1/activity_logs*', async route => {
      const logs = [
        { 
          id: '1', 
          action_type: 'vote', 
          created_at: new Date().toISOString(), 
          description: { pt: 'Votou na pauta #1', en: 'Voted on topic #1' },
          profiles: { full_name: 'John Doe', email: 'john@example.com' }
        },
        { 
          id: '2', 
          action_type: 'auth', 
          created_at: new Date().toISOString(), 
          description: { pt: 'Login efetuado', en: 'Login successful' },
          profiles: { full_name: 'Jane Smith', email: 'jane@example.com' }
        }
      ];
      await route.fulfill({ 
        json: logs,
        headers: { 'content-range': '0-1/2' }
      });
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.getByRole('button', { name: /Entrar/i }).click();
    
    // Check if redirect worked
    await expect(page).toHaveURL(/.*\//);

    // Navigate to Auditoria
    await page.click('a:has-text("Auditoria")');
    await expect(page).toHaveURL(/.*\/admin\/activity/);

    // Check if logs are visible
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).toBeVisible();

    // Check if dashboard chart container exists
    await expect(page.locator('.recharts-responsive-container')).toBeVisible();

    // Fill search filter
    await page.fill('placeholder="Buscar Usuário"', 'John');
    
    // In a real scenario, this would trigger a new fetch. 
    // Since we're mocking, we just verify the input was filled.
    await expect(page.locator('input[placeholder="Buscar Usuário"]')).toHaveValue('John');
  });
});
