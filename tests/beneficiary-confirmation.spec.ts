import { test, expect } from '@playwright/test';

test.describe('Beneficiary - Village Task Visibility (Moderation Removed)', () => {
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

    // Village tasks are created directly as 'open'; there is no moderation step to confirm.
    await page.route('**/functions/v1/api-work', async route => {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body.action === 'fetchActivities') {
        await route.fulfill({
          json: {
            data: [
              {
                id: 'village-task-1',
                title: { pt: 'Tarefa da Vila', en: 'Village Task' },
                description: { pt: 'Descrição da tarefa', en: 'Task description' },
                type: 'task',
                status: 'open',
                reward_amount: 50,
                beneficiary_type: 'village',
                beneficiary_id: 'village-1',
                requester_id: 'user-2',
                requester: { full_name: 'Regular Member' },
                confirmations: [{ count: 0 }]
              }
            ]
          }
        });
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

  test('should show the village task without a moderation tab', async ({ page }) => {
    await page.goto('/work-wall');

    await expect(page.locator('text=/Moderação/i')).toHaveCount(0);
    await expect(page.locator('text=/Tarefa da Vila/i').first()).toBeVisible();
  });
});
