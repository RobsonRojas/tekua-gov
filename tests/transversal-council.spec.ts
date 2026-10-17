import { test, expect } from '@playwright/test';

test.describe('Transversal Council - Moderation Removed', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user profile as Council Member
    await page.route('**/rest/v1/profiles*', async route => {
      const json = [{ id: 'council-user', role: 'transversal_council', full_name: 'Council Member' }];
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
          user: { id: 'council-user', email: 'council@example.com' }
        }
      });
    });

    // Mock Edge Function (api-members)
    await page.route('**/functions/v1/api-members', async route => {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body.action === 'getProfile') {
        await route.fulfill({ json: { data: { id: 'council-user', role: 'transversal_council', full_name: 'Council Member' } } });
      } else {
        await route.fulfill({ json: { data: [] } });
      }
    });

    // Mock Edge Function (api-work): new tasks are already open, no moderateActivity action exists.
    await page.route('**/functions/v1/api-work', async route => {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body.action === 'fetchActivities') {
        await route.fulfill({
          json: {
            data: [
              {
                id: 'open-task-1',
                title: { pt: 'Tarefa Aberta', en: 'Open Task' },
                description: { pt: 'Descrição da tarefa', en: 'Task description' },
                type: 'task',
                status: 'open',
                reward_amount: 100,
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
    await page.fill('input[type="email"]', 'council@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should not show a Moderation column and should list open tasks', async ({ page }) => {
    await page.goto('/work-wall');

    // The moderation stage no longer exists, even for council members.
    await expect(page.locator('text=/Moderação/i')).toHaveCount(0);

    // Newly created tasks are visible in the Open column without any approval step.
    await expect(page.locator('text=/Tarefa por Aprovar/i')).toHaveCount(0);
    await expect(page.locator('text=/Tarefa Aberta/i').first()).toBeVisible();
  });
});
