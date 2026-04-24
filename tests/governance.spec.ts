import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 720 } });

test.describe('Governance Hub', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user profile
    await page.route('**/rest/v1/profiles*', async route => {
      const json = [{ id: 'fake-user', role: 'member' }];
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
          user: { id: 'fake-user', email: 'test@example.com' }
        }
      });
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to governance hub and redirects to sub-services', async ({ page }) => {
    // Find the card by its heading and click the access button within it
    const card = page.locator('div.MuiPaper-root').filter({ has: page.getByRole('heading', { name: /Serviços de Governança|Governance Services/i }) });
    await card.getByRole('button', { name: /Acessar|Access/i }).click();
    
    await expect(page).toHaveURL('/governance');
    
    // Check if cards are present
    await expect(page.locator('text=/Votações|Voting/i')).toBeVisible();
    await expect(page.locator('text=/Documentação|Documentation/i')).toBeVisible();
    
    // Navigate to Documents from Hub
    const docCard = page.locator('div.MuiPaper-root').filter({ has: page.getByRole('heading', { name: /Documentação|Documentation/i }) });
    await docCard.getByRole('button', { name: /Acessar|Access/i }).click();
    await expect(page).toHaveURL('/documents');
  });
});
