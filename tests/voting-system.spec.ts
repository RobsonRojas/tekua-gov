import { test, expect } from '@playwright/test';

test.describe('Voting System Flow', () => {
  // We use standard test flows, mocking backend API or testing real UI state if running a dev server
  // Since we don't know if the backend is seeded with data, we focus on route protection and UI elements presence
  
  test('User cannot access voting page if unauthenticated', async ({ page }) => {
    // Navigate to voting page without logging in
    await page.goto('/voting');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('Shows correct empty state or list of topics when authenticated', async ({ page }) => {
    await page.route('**/rest/v1/discussion_topics*', async route => {
      const json = [
        { id: 'mock-1', title: { pt: 'Pauta de Teste Playwright' }, content: { pt: '<p>Mock Content</p>' }, status: 'open', created_at: new Date().toISOString() }
      ];
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
    await page.click('button:has-text("Entrar")');
    
    // Now go to voting
    await page.goto('/voting');
    
    // Verify that the mocked topic appears
    await expect(page.getByText('Pauta de Teste Playwright')).toBeVisible();
    await expect(page.getByText('Aberta')).toBeVisible();
  });

  test('Admin sees create topic button', async ({ page }) => {
    // Mock topics response
    await page.route('**/rest/v1/discussion_topics*', async route => {
      await route.fulfill({ json: [] });
    });
    
    // Mock user profile to be admin
    await page.route('**/rest/v1/profiles*', async route => {
      const json = [{ id: 'fake-admin', role: 'admin' }];
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
          user: { id: 'fake-admin', email: 'admin@example.com' }
        }
      });
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Entrar")');
    
    await page.goto('/voting');
    
    // Admin should see Create Topic button
    const createBtn = page.getByText(/Criar Nova Pauta|Create New Topic/i);
    await expect(createBtn).toBeVisible();

    await createBtn.click();
    await expect(page.getByText(/Título da Pauta/i)).toBeVisible();
  });

  test('Voting detail page allows voting and commenting', async ({ page }) => {
    // Mock Topic
    await page.route('**/rest/v1/discussion_topics*', async route => {
      await route.fulfill({ json: [{ id: 'mock-1', title: { pt: 'Pauta de Teste' }, content: { pt: '<p>Conteudo</p>' }, status: 'open' }] });
    });
    
    // Mock Comments
    await page.route('**/rest/v1/topic_comments*', async route => {
      // Return 1 comment on GET, and success on POST
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: [{ id: 'c1', content: 'Comentario existente', created_at: new Date().toISOString(), profiles: { full_name: 'User 1' } }] });
      } else {
        await route.fulfill({ status: 201 });
      }
    });

    // Mock Votes
    await page.route('**/rest/v1/topic_votes*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: [{ option: 'yes', user_id: 'other-user' }] });
      } else {
        await route.fulfill({ status: 201 });
      }
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
    await page.click('button:has-text("Entrar")');
    
    await page.goto('/voting/mock-1');

    await expect(page.getByText('Pauta de Teste')).toBeVisible();
    await expect(page.getByText('Comentario existente')).toBeVisible();

    // Vote interaction
    const btnYes = page.getByRole('button', { name: /Sim \(\d+\)|Yes \(\d+\)/i });
    await expect(btnYes).not.toBeDisabled();
    
    await btnYes.click();
    
    // Should show success
    await expect(page.getByText(/Seu voto foi registrado com sucesso|Your vote was successfully recorded/i)).toBeVisible();

    // Comment interaction
    const commentInput = page.getByPlaceholder(/Adicione um comentário|Add a comment/i);
    await commentInput.fill('Test comment E2E');
    
    const sendBtn = page.getByRole('button', { name: /Enviar|Send/i });
    await sendBtn.click();
  });
});
