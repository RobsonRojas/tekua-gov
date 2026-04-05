import { test, expect } from '@playwright/test';
import { supabase } from '../src/lib/supabase';

// Helper to generate unique emails
const generateTestEmail = () => `test-admin-${Date.now()}@tekua.com`;

test.describe('Admin Management Integration Flow', () => {
  const testEmail = generateTestEmail();
  const testPassword = 'TestPassword123!';
  const testFullName = 'Integration Test Admin';

  test('should create a new admin via Edge Function and allow login', async ({ page, request }) => {
    // 1. Call the Edge Function via direct HTTP request
    // Note: In a real CI environment, we would use process.env.VITE_SUPABASE_URL 
    // and ADMIN_MANAGEMENT_KEY. For this test, we assume they are configured.
    
    const baseUrl = process.env.VITE_SUPABASE_URL;
    const adminKey = process.env.ADMIN_MANAGEMENT_KEY;

    if (!baseUrl || !adminKey) {
      test.skip();
      return;
    }

    console.log(`Creating admin user: ${testEmail}`);

    const response = await request.post(`${baseUrl}/functions/v1/manage-admin`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
      },
      data: {
        action: 'create',
        email: testEmail,
        password: testPassword,
        full_name: testFullName
      }
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.message).toContain('successfully created');

    // 2. Verify login works
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Entrar")');

    // 3. Verify redirected to home or admin panel
    await expect(page).not.toHaveURL(/.*login/);
    
    // 4. Verify access to admin panel
    await page.goto('/admin-panel');
    await expect(page.locator('h2:has-text("Gerenciamento de Usuários")')).toBeVisible();
  });

  test('should update an existing admin password', async ({ page, request }) => {
    const baseUrl = process.env.VITE_SUPABASE_URL;
    const adminKey = process.env.ADMIN_MANAGEMENT_KEY;

    if (!baseUrl || !adminKey) {
      test.skip();
      return;
    }

    const newPassword = 'NewTestPassword456!';

    console.log(`Updating admin password for: ${testEmail}`);

    // Call update action
    const response = await request.post(`${baseUrl}/functions/v1/manage-admin`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
      },
      data: {
        action: 'update',
        email: testEmail,
        password: newPassword
      }
    });

    expect(response.status()).toBe(200);
    
    // Verify login with OLD password fails (or new works)
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Entrar")');
    await expect(page.locator('role=alert')).toBeVisible();

    // Verify login with NEW password works
    await page.fill('input[type="password"]', newPassword);
    await page.click('button:has-text("Entrar")');
    await expect(page).not.toHaveURL(/.*login/);
  });
});
