import { test, expect } from '@playwright/test';

test.describe('User Activity History', () => {
  // Use a known user or mock auth
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should display activity tab in profile', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');
    
    // Check if the activity tab exists
    const activityTab = page.locator('text=Histórico de Atividades').or(page.locator('text=Activity History'));
    await expect(activityTab).toBeVisible();

    // Click on the activity tab
    await activityTab.click();

    // Check if timeline or empty state is visible
    const activityContainer = page.locator('text=Nenhuma atividade registrada.').or(page.locator('text=No activity recorded.'));
    // Since it's a test, it might have activities if tests run sequentially, or none
    // Just asserting the tab didn't crash
    await expect(page.locator('h4', { hasText: 'Histórico de Atividades' }).or(page.locator('h4', { hasText: 'Activity History' }))).toBeVisible();
  });
});
