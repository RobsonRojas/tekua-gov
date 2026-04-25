import { test, expect } from '@playwright/test';

test.describe('AI Agent Tool Calling', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user profile
    await page.route('**/rest/v1/profiles*', async route => {
      // If it has .single() or eq, return object
      const json = { id: 'fake-user', role: 'admin', full_name: 'Admin Test' };
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
          user: { id: 'fake-user', email: 'admin@tekua.com' }
        }
      });
    });

    // Mock Session/User for initSession
    await page.route('**/auth/v1/user', async route => {
      await route.fulfill({
        status: 200,
        json: { id: 'fake-user', email: 'admin@tekua.com' }
      });
    });

    await page.route('**/auth/v1/session', async route => {
      await route.fulfill({
        status: 200,
        json: {
          access_token: 'fake-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'fake-refresh',
          user: { id: 'fake-user', email: 'admin@tekua.com' }
        }
      });
    });

    // Mock AI Handler Response
    await page.route('**/functions/v1/ai-handler', async route => {
      const requestBody = route.request().postDataJSON();
      let text = 'Default response';
      let tools: string[] = [];

      if (requestBody.messages[requestBody.messages.length - 1].content.includes('saldo')) {
        text = 'Seu saldo atual é de 1000.00 Surreais.';
        tools = ['get_user_balance'];
      } else if (requestBody.messages[requestBody.messages.length - 1].content.includes('atividades')) {
        text = 'Aqui estão suas últimas atividades...';
        tools = ['get_activity_history'];
      }

      await route.fulfill({
        status: 200,
        json: { text, tools }
      });
    });

    // Mock Documents query (Task 1.1 dependency)
    await page.route('**/rest/v1/documents*', async route => {
      await route.fulfill({
        status: 200,
        json: [
          { title: { pt: 'Doc Teste' }, description: { pt: 'Desc Teste' }, category: 'outros' }
        ]
      });
    });

    // Mock Wallets query for get_user_balance
    await page.route('**/rest/v1/wallets*', async route => {
      await route.fulfill({
        status: 200,
        json: { balance: 1000.00 }
      });
    });

    // Mock Activities query for get_activity_history
    await page.route('**/rest/v1/activities*', async route => {
      await route.fulfill({
        status: 200,
        json: [
          { id: '1', title: { pt: 'Atividade 1' }, status: 'completed', created_at: new Date().toISOString() }
        ]
      });
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@tekua.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should invoke get_user_balance tool when asked about balance', async ({ page }) => {
    // 2. Go to AI Agent
    await page.goto('/ai-agent');
    await expect(page).toHaveURL('/ai-agent');

    // 3. Ask about balance
    await page.getByTestId('ai-chat-input').fill('Qual o meu saldo atual?');
    await page.click('button:has(svg)');

    // 4. Wait for response and check for tool usage indicator
    // The UI should show "🔧 get_user_balance"
    await expect(page.locator('text=get_user_balance')).toBeVisible({ timeout: 30000 });
    
    // Check if response contains a number (the balance)
    const response = await page.locator('div.MuiPaper-root:has-text("get_user_balance")').innerText();
    expect(response).toMatch(/\d+/);
  });

  test('should invoke get_activity_history tool when asked about history', async ({ page }) => {
    // 2. Go to AI Agent
    await page.goto('/ai-agent');
    await expect(page).toHaveURL('/ai-agent');

    // 3. Ask about history
    await page.getByTestId('ai-chat-input').fill('Quais foram minhas últimas atividades?');
    await page.click('button:has(svg)');

    // 4. Wait for response and check for tool usage indicator
    await expect(page.locator('text=get_activity_history')).toBeVisible({ timeout: 30000 });
  });
});
