import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const testEmail = 'browser-test@tekua.com';
const testPassword = 'TestPassword123!';

test.describe('Work Registration Integration Flow', () => {
  test.slow(); // Increase timeout for this slow integration test
  
  test.beforeAll(async () => {
    // Ensure the test user exists and has the correct password
    const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: listData } = await supabase.auth.admin.listUsers();
    const user = listData?.users.find(u => u.email === testEmail);

    if (user) {
      // Update password to be sure
      await supabase.auth.admin.updateUserById(user.id, { password: testPassword });
    } else {
      // Create user
      const { data: userData, error } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: { full_name: 'Browser Test User' }
      });
      if (error) throw error;
      
      // Ensure profile
      await supabase.from('profiles').upsert({
        id: userData.user.id,
        full_name: 'Browser Test User',
        role: 'admin'
      });
    }
  });

  test('should register a new work entry successfully', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    // Support both PT and EN button text
    const loginButton = page.getByRole('button', { name: /Entrar|Login|Sign In/i });
    await loginButton.click();
    
    // Wait for redirect to home
    await expect(page).toHaveURL('/', { timeout: 15000 });
    
    // 2. Navigate to Register Work
    await page.goto('/register-work');
    await expect(page).toHaveURL('/register-work');
    
    // Wait for the loading indicator to disappear (MUI CircularProgress)
    await expect(page.locator('role=progressbar')).not.toBeVisible({ timeout: 20000 });
    
    // 3. Fill the form
    // Using placeholders or labels that work in both languages
    await page.fill('textarea', 'Trabalho de integração automatizado - ' + Date.now());
    await page.fill('input[name*="evidence"], input[placeholder*="http"]', 'https://github.com/RobsonRojas/tekua-gov');
    
    // Amount field (Suggested Value / Requested Amount)
    const amountField = page.locator('input[type="number"]');
    await amountField.fill('25');
    
    // 4. Submit
    const submitButton = page.getByRole('button', { name: /Enviar|Submit|Registration/i });
    await submitButton.click();
    
    // 5. Verify success
    await expect(page.locator('role=alert')).toBeVisible({ timeout: 10000 });
    
    // 6. Verify on Work Wall
    await expect(page).toHaveURL('/work-wall', { timeout: 15000 });
    await expect(page.locator('text=Trabalho de integração automatizado')).toBeVisible();
  });
});
