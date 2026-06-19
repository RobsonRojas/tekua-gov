import { test, expect } from '@playwright/test';

test.describe('Beneficiary Confirmation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/profiles*', async route => {
      const json = [{ id: 'beneficiary-user', role: 'member', roles: ['member', 'beneficiary'], full_name: 'Village Beneficiary', village_id: 'village-1' }];
      await route.fulfill({ json });
    });

    await page.route('**/auth/v1/token?grant_type=password', async route => {
      await route.fulfill({
        status: 200,
        json: {
          access_token: 'fake-token',
          refresh_token: 'fake-refresh',
          expires_in: 3600,
          user: { id: 'beneficiary-user', email: 'beneficiary@example.com' }
        }
      });
    });

    await page.route('**/functions/v1/api-members', async route => {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body.action === 'getProfile') {
        await route.fulfill({ json: { data: { id: 'beneficiary-user', role: 'member', roles: ['member', 'beneficiary'], full_name: 'Village Beneficiary', village_id: 'village-1' } } });
      } else {
        await route.fulfill({ json: { data: [] } });
      }
    });

    await page.route('**/functions/v1/api-work', async route => {
      const body = JSON.parse(route.request().postData() || '{}');
      
      if (body.action === 'fetchActivities') {
        const json = {
          data: [
            {
              id: 'village-task-1',
              title: { pt: 'Tarefa da Vila', en: 'Village Task' },
              description: { pt: 'Descrição da tarefa', en: 'Task description' },
              type: 'task',
              status: 'pending_approval',
              reward_amount: 50,
              beneficiary_type: 'village',
              beneficiary_id: 'village-1',
              requester_id: 'user-2',
              requester: { full_name: 'Regular Member' },
              confirmations: [{ count: 0 }]
            }
          ],
          error: null
        };
        await route.fulfill({ json: { data: json.data } });
      } else if (body.action === 'moderateActivity') {
        const params = body.params || {};
        expect(params.activityId).toBeDefined();
        expect(params.action).toBe('confirm');
        await route.fulfill({ json: { data: { success: true } } });
      } else {
        await route.fulfill({ json: { data: [] } });
      }
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'beneficiary@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should allow beneficiary to confirm a village task', async ({ page }) => {
    await page.goto('/work-wall');
    
    const moderationTab = page.getByRole('tab', { name: /Moderação/i });
    await expect(moderationTab).toBeVisible();
    await moderationTab.click();
    
    await expect(page.locator('text=/Tarefa da Vila/i')).toBeVisible();
    
    const confirmButton = page.getByRole('button', { name: /Confirmar/i });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
  });
});
