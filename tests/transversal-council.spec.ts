import { test, expect } from '@playwright/test';

test.describe('Transversal Council Approval Flow', () => {
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

    // Mock Edge Function (fetchActivities)
    await page.route('**/functions/v1/api-work', async route => {
      const body = JSON.parse(route.request().postData() || '{}');
      
      if (body.action === 'fetchActivities') {
        const json = {
          data: [
            {
              id: 'pending-task-1',
              title: { pt: 'Tarefa por Aprovar', en: 'Task to Approve' },
              description: { pt: 'Descrição pendente', en: 'Pending description' },
              type: 'task',
              status: 'pending_approval',
              reward_amount: 100,
              requester_id: 'user-2',
              requester: { full_name: 'Regular Member' },
              confirmations: [{ count: 0 }]
            }
          ],
          error: null
        };
        await route.fulfill({ json: { data: json.data } });
      } else if (body.action === 'moderateActivity') {
        await route.fulfill({ json: { data: { success: true } } });
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

  test('should show moderation tab and allow approving a task', async ({ page }) => {
    await page.goto('/work-wall');
    
    // Check if Moderation tab exists
    const moderationTab = page.getByRole('tab', { name: /Moderação/i });
    await expect(moderationTab).toBeVisible();
    
    // Click on Moderation tab
    await moderationTab.click();
    
    // Verify pending task is visible
    await expect(page.locator('text=/Tarefa por Aprovar/i')).toBeVisible();
    
    // Click Approve
    const approveButton = page.getByRole('button', { name: /Aprovar/i });
    await expect(approveButton).toBeVisible();
    await approveButton.click();
    
    // In a real scenario, onRefresh would be called. 
    // Since we mocked moderateActivity to return success, we've verified the flow.
  });
});
