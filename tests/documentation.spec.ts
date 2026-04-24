import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 720 } });

test.describe('Documentation Viewer', () => {
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

    // Mock Documents list
    await page.route('**/rest/v1/documents*', async route => {
      const docs = [
        { 
          id: '1', 
          title: { pt: 'Estatuto Tekua', en: 'Tekua Bylaws' }, 
          description: { pt: 'Regras da associação', en: 'Association rules' },
          category: 'estatuto',
          file_path: 'estatuto/rules.pdf',
          created_at: new Date().toISOString()
        }
      ];
      await route.fulfill({ json: docs });
    });

    // Mock Storage Signing - return BOTH possible casings to be safe
    await page.route('**/storage/v1/object/sign/**', async route => {
      await route.fulfill({ 
        status: 200,
        contentType: 'application/json',
        json: { 
          signedURL: 'https://fake-signed-url.com/doc.pdf',
          signedUrl: 'https://fake-signed-url.com/doc.pdf'
        } 
      });
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to documentation and view a document', async ({ page }) => {
    const card = page.locator('div.MuiPaper-root').filter({ has: page.getByRole('heading', { name: /Documentação|Documentation/i }) });
    await card.getByRole('button', { name: /Acessar|Access/i }).click();
    
    await expect(page).toHaveURL('/documents');
    await expect(page.locator('text=/Estatuto Tekua|Tekua Bylaws/')).toBeVisible();
    
    // Clicking view should open in new tab
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.click('button[aria-label*="Visualizar"], button[aria-label*="View"]')
    ]);
    
    expect(newPage.url()).toContain('fake-signed-url.com');
  });
});
