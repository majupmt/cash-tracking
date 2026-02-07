import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/test-drive');
    await page.getByTestId('btn-demo-data').click();
    await page.getByTestId('btn-view-dashboard').first().click();
    await expect(page).toHaveURL(/#\/dashboard/);
  });

  test('deve exibir sidebar com menu', async ({ page }) => {
    await expect(page.getByTestId('sidebar')).toBeVisible();
    await expect(page.getByTestId('sidebar-menu-dashboard')).toBeVisible();
    await expect(page.getByTestId('sidebar-menu-transacoes')).toBeVisible();
  });

  test('deve exibir cards de resumo financeiro', async ({ page }) => {
    await expect(page.getByTestId('dashboard-summary-income')).toBeVisible();
    await expect(page.getByTestId('dashboard-summary-expenses')).toBeVisible();
    await expect(page.getByTestId('dashboard-summary-balance')).toBeVisible();
  });

  test('deve exibir grafico donut de categorias', async ({ page }) => {
    await expect(page.getByTestId('category-donut')).toBeVisible();
  });

  test('deve exibir breakdown de categorias', async ({ page }) => {
    await expect(page.getByTestId('category-breakdown')).toBeVisible();
  });

  test('sidebar deve navegar entre telas', async ({ page }) => {
    await page.getByTestId('sidebar-menu-transacoes').click();
    await expect(page).toHaveURL(/#\/transacoes/);
  });

  test('itens Plus devem mostrar badge', async ({ page }) => {
    const insights = page.getByTestId('sidebar-menu-insights');
    await expect(insights).toContainText('PLUS');
  });

  test('deve exibir CTA de upgrade no sidebar', async ({ page }) => {
    await expect(page.getByTestId('sidebar-upgrade-cta')).toBeVisible();
    await expect(page.getByTestId('sidebar-upgrade-cta')).toContainText('R$ 15/mes');
  });

});
