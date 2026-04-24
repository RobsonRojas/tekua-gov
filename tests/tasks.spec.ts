import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 720 } });

test.describe('Tasks and Gift Economy', () => {
  test.beforeEach(async ({ page }) => {
    
    // Mock user profile
    await page.route('**/rest/v1/profiles*', async route => {
      const json = [{ id: 'fake-user', role: 'member', full_name: 'Test Member' }];
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

    // Mock Activities
    await page.route('**/rest/v1/activities*', async route => {
      if (route.request().method() === 'GET') {
        const json = [
          {
            id: 'task-1',
            title: { pt: 'Limpar Horta', en: 'Clean Garden' },
            description: { pt: 'Limpar as ervas daninhas', en: 'Remove weeds' },
            type: 'task',
            status: 'open',
            reward_amount: 50,
            requester_id: 'requester-1',
            requester: { full_name: 'Admin' },
            confirmations: [{ count: 0 }]
          }
        ];
        await route.fulfill({ json });
      } else {
        await route.fulfill({ status: 201, json: [] });
      }
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to tasks board and accept a task', async ({ page }) => {
    // Navigate to Governance first
    const card = page.locator('div.MuiPaper-root').filter({ has: page.getByRole('heading', { name: /Serviços de Governança|Governance Services/i }) });
    await card.getByRole('button', { name: /Acessar|Access/i }).click();
    await expect(page).toHaveURL('/governance');

    // Navigate to Tasks Board
    const taskCard = page.locator('div.MuiPaper-root').filter({ has: page.getByRole('heading', { name: /Registro de Trabalho|Work Registration/i }) });
    await taskCard.getByRole('button', { name: /Acessar|Access/i }).click();
    await expect(page).toHaveURL('/tasks-board');

    // Accept task
    await expect(page.locator('text=/Limpar Horta|Clean Garden/i')).toBeVisible();
    await page.click('button:has-text("Assumir Tarefa"), button:has-text("Accept Task")');
  });

  test('should allow creating a new task', async ({ page }) => {
     await page.goto('/tasks/new');
     await page.getByLabel(/Título|Title/i).fill('Nova Tarefa E2E');
     await page.getByLabel(/Descreva o que você fez|Describe what you did/i).fill('Descrição da tarefa criada via teste automatizado');
     await page.fill('input[type="number"]', '150');
     
     await page.click('button[type="submit"]');
     await expect(page).toHaveURL('/tasks-board');
  });
});
