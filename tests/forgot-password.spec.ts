import { test, expect } from '@playwright/test';

test.describe('Forgot Password and Reset Flow', () => {
  
  test('should navigate to forgot password and show success message', async ({ page }) => {
    // Mock Supabase RPC call for resetPasswordForEmail
    await page.route('**/auth/v1/recover**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await page.goto('/login');
    await page.click('text=Esqueceu a senha?');
    
    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.locator('h4')).toContainText(['Recuperar Senha', 'Recover Password']);

    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    await expect(page.locator('role=alert')).toContainText(['Link enviado', 'Link sent']);
  });

  test('should validate password matching on reset password page', async ({ page }) => {
    // We need to simulate being on the reset-password page with a session
    // Supabase uses localStorage for sessions usually, but for reset password it often comes from the URL hash
    // However, our component checks getSession()
    
    await page.route('**/auth/v1/user**', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'user-id', email: 'test@example.com' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/reset-password');
    
    await page.fill('label:has-text("Nova Senha"), label:has-text("New Password") >> .. >> input', 'password123');
    await page.fill('label:has-text("Confirmar Nova Senha"), label:has-text("Confirm New Password") >> .. >> input', 'different');
    await page.click('button[type="submit"]');

    await expect(page.locator('role=alert')).toContainText(['As senhas não coincidem', 'Passwords do not match']);
  });

  test('should successfully reset password', async ({ page }) => {
    await page.route('**/auth/v1/user**', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'user-id', email: 'test@example.com' }),
        });
      } else if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user: { id: 'user-id' } }),
        });
      }
    });

    await page.goto('/reset-password');
    
    await page.fill('label:has-text("Nova Senha"), label:has-text("New Password") >> .. >> input', 'newpassword123');
    await page.fill('label:has-text("Confirmar Nova Senha"), label:has-text("Confirm New Password") >> .. >> input', 'newpassword123');
    await page.click('button[type="submit"]');

    await expect(page.locator('role=alert')).toContainText(['Senha atualizada com sucesso', 'Password updated successfully']);
    
    // Check if it redirects to login
    await page.waitForURL(/.*login/, { timeout: 5000 });
  });
});
