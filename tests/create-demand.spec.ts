import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const testEmail = 'browser-test-demand@tekua.com';
const testPassword = 'TestPassword123!';

test.describe('Create Demand Integration Flow', () => {
  test.slow();
  
  test.beforeAll(async () => {
    const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);
    const { data: listData } = await supabase.auth.admin.listUsers();
    const user = listData?.users.find(u => u.email === testEmail);

    if (user) {
      await supabase.auth.admin.updateUserById(user.id, { password: testPassword });
    } else {
      const { data: userData } = await supabase.auth.admin.createUser({
        email: testEmail, password: testPassword, email_confirm: true,
        user_metadata: { full_name: 'Demand Creator' }
      });
      await supabase.from('profiles').upsert({ id: userData.user.id, full_name: 'Demand Creator', role: 'member' });
    }
  });

  test('should create a new demand and see it on Work Wall', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.getByRole('button', { name: /Entrar|Login/i }).click();
    await expect(page).toHaveURL('/', { timeout: 15000 });
    
    await page.goto('/create-demand');
    const title = 'Demand Integration Test ' + Date.now();
    await page.fill('input[label*="Título"], input[placeholder*="Ex:"]', title);
    await page.fill('textarea', 'Integration test description');
    await page.fill('input[type="number"]', '100');
    
    await page.getByRole('button', { name: /Publicar|Publish/i }).click();
    await expect(page).toHaveURL('/work-wall', { timeout: 15000 });
    
    // Verify it appears in "Todos" tab
    await expect(page.locator(`text=${title}`)).toBeVisible({ timeout: 10000 });
  });
});
