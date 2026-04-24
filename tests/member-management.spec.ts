import { test, expect } from '@playwright/test';

test.describe('Admin Member Management Flow', () => {
  test('Admin can view, search and edit member roles', async ({ page }) => {
    // Mock user profile to be admin
    await page.route('**/rest/v1/profiles?id=eq.*', async route => {
      const json = { id: 'fake-admin', role: 'admin', full_name: 'Admin User' };
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

    // Mock members list
    await page.route('**/rest/v1/profiles?select=*&order=full_name.asc', async route => {
      const members = [
        { id: '1', full_name: 'John Doe', email: 'john@example.com', role: 'member' },
        { id: '2', full_name: 'Jane Smith', email: 'jane@example.com', role: 'admin' }
      ];
      await route.fulfill({ json: members });
    });

    // Mock update role
    await page.route('**/rest/v1/profiles?id=eq.1', async route => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({ status: 204 });
      } else {
        await route.continue();
      }
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Check if redirect to Home worked
    await page.waitForURL(/.*\//);
    await page.waitForLoadState('networkidle');

    // Click on Members card access button
    const accessButton = page.getByRole('button', { name: /Acessar/i }).first();
    await accessButton.waitFor({ state: 'visible' });
    await accessButton.click();

    await expect(page).toHaveURL(/.*\/admin\/members/);

    // Verify list is loaded
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).toBeVisible();

    // Test search
    await page.fill('placeholder="Buscar por nome ou email..."', 'Jane');
    await expect(page.getByText('John Doe')).not.toBeVisible();
    await expect(page.getByText('Jane Smith')).toBeVisible();

    // Reset search
    await page.fill('placeholder="Buscar por nome ou email..."', '');

    // Open edit modal
    const johnRow = page.locator('tr', { hasText: 'John Doe' });
    await johnRow.locator('button').click();

    await expect(page.getByText('Editar Perfil')).toBeVisible();

    // Change role to admin
    await page.click('label:has-text("Cargo / Função")');
    await page.click('li:has-text("Administrador")');

    // Save
    await page.getByRole('button', { name: /Salvar/i }).click();

    // Modal should close
    await expect(page.getByText('Editar Perfil')).not.toBeVisible();
  });
});
