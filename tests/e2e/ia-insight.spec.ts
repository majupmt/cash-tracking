import { test, expect, Page } from '@playwright/test';

// Helper: navigate to dashboard via test-drive
async function goToDashboard(page: Page) {
  await page.goto('/');
  await page.getByTestId('btn-go-signup').click();
  await page.getByTestId('btn-signup-testdrive').click();
  await expect(page.getByTestId('screen-testdrive')).toBeVisible();
  await page.getByTestId('testdrive-revenue').fill('4500');
  await page.getByTestId('btn-go-dashboard').click();
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();
}

test.describe('Analise da IA', () => {

  test.beforeEach(async ({ page }) => {
    await goToDashboard(page);
  });

  test('deve exibir card de IA no dashboard', async ({ page }) => {
    await expect(page.getByTestId('ai-card')).toBeVisible();
  });

  test('deve exibir botao de insight no header', async ({ page }) => {
    await expect(page.getByTestId('btn-ai-insight')).toBeVisible();
  });

  test('deve navegar para view de insights via sidebar', async ({ page }) => {
    await page.getByTestId('menu-insights').click();
    await expect(page.getByTestId('view-insights')).toHaveClass(/active/);
    await expect(page.getByTestId('btn-generate-insight')).toBeVisible();
  });

});
