import { test, expect } from '@playwright/test';

test.describe('Theme switching', () => {
  test('should toggle theme and persist in localStorage', async ({ page }) => {
    await page.goto('/');

    // Initially should be dark theme (default if no localStorage)
    let theme = await page.evaluate(() => localStorage.getItem('preferred_theme'));
    // Depending on the implementation, it might not be set initially if it just falls back to default
    // We can just click and expect it to be light
    
    const themeButton = page.locator('button[aria-label="theme.switchToLight"], button[aria-label="theme.switchToDark"]');
    await expect(themeButton).toBeVisible();

    // Click to toggle
    await themeButton.click();

    // Now it should be set to light or dark depending on initial state
    // Let's assume default is dark, so clicking makes it light
    theme = await page.evaluate(() => localStorage.getItem('preferred_theme'));
    expect(theme).toMatch(/light|dark/);
    
    // Store the toggled theme
    const firstToggledTheme = theme;

    // Click again
    await themeButton.click();
    theme = await page.evaluate(() => localStorage.getItem('preferred_theme'));
    expect(theme).not.toBe(firstToggledTheme);
    
    const secondToggledTheme = theme;

    // Reload the page and verify it persists
    await page.reload();
    theme = await page.evaluate(() => localStorage.getItem('preferred_theme'));
    expect(theme).toBe(secondToggledTheme);
  });
});
