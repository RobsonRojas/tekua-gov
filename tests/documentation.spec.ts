import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 720 } });

test.describe('Documentation Viewer', () => {
  test.beforeEach(async ({ page }) => {
    const context = page.context();

    // Mock user profile on context level
    await context.route('**/functions/v1/api-members', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        const postData = request.postDataJSON();
        if (postData?.action === 'getProfile') {
          await route.fulfill({
            status: 200,
            json: {
              data: {
                id: 'fake-user',
                email: 'test@example.com',
                role: 'member',
                roles: ['member'],
                accepted_terms_at: new Date().toISOString(),
                terms_version: '1.0'
              }
            }
          });
          return;
        }
      }
      await route.continue();
    });

    // Mock Audit Logs API on context level
    await context.route('**/functions/v1/api-audit', async route => {
      await route.fulfill({
        status: 200,
        json: { data: true }
      });
    });

    // Mock Wallet API on context level
    await context.route('**/functions/v1/api-wallet', async route => {
      await route.fulfill({
        status: 200,
        json: { data: { balance: 1000 } }
      });
    });

    // Mock Login on context level
    await context.route('**/auth/v1/token?grant_type=password', async route => {
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

    // Mock Documents list via Edge Function on context level
    await context.route('**/functions/v1/api-documents', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        const postData = request.postDataJSON();
        if (postData?.action === 'fetchDocuments') {
          const docs = [
            { 
              id: '1', 
              title: { pt: 'Estatuto Tekua', en: 'Tekua Bylaws' }, 
              description: { pt: 'Regras da associação', en: 'Association rules' },
              category: 'estatuto',
              file_path: 'estatuto/rules.pdf',
              created_at: new Date().toISOString()
            },
            { 
              id: '2', 
              title: { pt: 'Link Externo Teste', en: 'External Link Test' }, 
              description: { pt: 'Link para o Google Drive', en: 'Link to Google Drive' },
              category: 'atas',
              external_url: 'https://external-link.com/form',
              created_at: new Date().toISOString()
            }
          ];
          await route.fulfill({
            status: 200,
            json: { data: docs }
          });
          return;
        }
      }
      await route.continue();
    });

    // Mock Storage Signing on context level
    await context.route('**/storage/v1/object/sign/**', async route => {
      await route.fulfill({ 
        status: 200,
        contentType: 'application/json',
        json: { 
          signedURL: 'https://fake-signed-url.com/doc.pdf',
          signedUrl: 'https://fake-signed-url.com/doc.pdf'
        } 
      });
    });

    // Mock external link target page on context level to avoid sandbox network redirects
    await context.route('**/external-link.com/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>Mock External Page</body></html>'
      });
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should view a file document in the integrated modal viewer', async ({ page }) => {
    const card = page.locator('div.MuiPaper-root').filter({ has: page.getByRole('heading', { name: /Documentação|Documentation/i }) });
    await card.getByRole('button', { name: /Acessar|Access/i }).click();
    
    await expect(page).toHaveURL('/documents');
    await expect(page.locator('text=/Estatuto Tekua|Tekua Bylaws/')).toBeVisible();
    
    // Clicking view for the file document should open the secure modal dialog
    await page.locator('tr').filter({ hasText: 'Estatuto Tekua' }).locator('button[aria-label*="Visualizar"], button[aria-label*="View"]').click();
    
    // The dialog viewer should open containing the document title
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('#document-viewer-dialog-title')).toContainText('Estatuto Tekua');
  });

  test('should open a link document in a new tab', async ({ page }) => {
    const card = page.locator('div.MuiPaper-root').filter({ has: page.getByRole('heading', { name: /Documentação|Documentation/i }) });
    await card.getByRole('button', { name: /Acessar|Access/i }).click();
    
    await expect(page).toHaveURL('/documents');
    await expect(page.locator('text=/Link Externo Teste|External Link Test/')).toBeVisible();
    
    // Clicking view for the link document should open it directly in a new tab
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('tr').filter({ hasText: 'Link Externo Teste' }).locator('button[aria-label*="Visualizar"], button[aria-label*="View"]').click()
    ]);
    
    expect(newPage.url()).toContain('external-link.com/form');
  });
});
