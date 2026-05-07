import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const testAdminEmail = 'browser-test-admin@tekua.com';
const testMemberEmail = 'browser-test-member@tekua.com';
const testPassword = 'TestPassword123!';

test.describe('Admin Council Task Owner Attribution Flow', () => {
  test.slow();
  
  test.beforeAll(async () => {
    const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);
    const { data: listData } = await supabase.auth.admin.listUsers();
    
    // Setup Admin User
    let adminUser = listData?.users.find(u => u.email === testAdminEmail);
    if (adminUser) {
      await supabase.auth.admin.updateUserById(adminUser.id, { password: testPassword });
      await supabase.from('profiles').upsert({ id: adminUser.id, full_name: 'Test Admin', role: 'admin' });
    } else {
      const { data: userData, error } = await supabase.auth.admin.createUser({
        email: testAdminEmail, password: testPassword, email_confirm: true,
        user_metadata: { full_name: 'Test Admin' }
      });
      if (error) console.error('Error creating admin:', error);
      if (userData?.user) {
        await supabase.from('profiles').upsert({ id: userData.user.id, full_name: 'Test Admin', role: 'admin' });
      }
    }

    // Setup Member User
    let memberUser = listData?.users.find(u => u.email === testMemberEmail);
    if (memberUser) {
      await supabase.auth.admin.updateUserById(memberUser.id, { password: testPassword });
      await supabase.from('profiles').upsert({ id: memberUser.id, full_name: 'Test Member', role: 'member' });
    } else {
      const { data: userData, error } = await supabase.auth.admin.createUser({
        email: testMemberEmail, password: testPassword, email_confirm: true,
        user_metadata: { full_name: 'Test Member' }
      });
      if (error) console.error('Error creating member:', error);
      if (userData?.user) {
        await supabase.from('profiles').upsert({ id: userData.user.id, full_name: 'Test Member', role: 'member' });
      }
    }
  });

  test('Admin should see executor field and create demand', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', testAdminEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL('/', { timeout: 15000 });
    
    await page.goto('/create-demand');
    
    // Check if the attribution field is visible
    const executorField = page.locator('label', { hasText: /Executor/i });
    await expect(executorField).toBeVisible({ timeout: 10000 });

    const title = 'Admin Assigned Demand ' + Date.now();
    await page.fill('input[label*="Título"], input[placeholder*="Ex:"]', title);
    await page.fill('textarea', 'Test assigning to member');
    await page.fill('input[type="number"]', '50');
    
    // Wait for members to load and select one
    await page.click('div[aria-labelledby*="mui-component-select"]'); // Opens the select dropdown
    // It should list members
    const memberOption = page.locator(`text=Test Member`);
    await expect(memberOption).toBeVisible({ timeout: 10000 });
    await memberOption.click();

    await page.getByRole('button', { name: /Publicar|Publish/i }).click();
    await expect(page).toHaveURL('/work-wall', { timeout: 15000 });
    
    // Log out
    await page.goto('/profile');
    await page.click('button:has-text("Sair")');
  });

  test('Regular member should NOT see executor field', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', testMemberEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL('/', { timeout: 15000 });
    
    await page.goto('/create-demand');
    
    // The attribution field should NOT be visible
    const executorField = page.locator('text=Atribuir a um Membro');
    await expect(executorField).not.toBeVisible();
  });
});
