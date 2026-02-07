import { test, expect } from '@playwright/test';

test.describe('Tela de Transacoes', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/test-drive');
    await page.getByTestId('btn-demo-data').click();
    await expect(page).toHaveURL(/#\/transacoes/);
  });

  test('deve mostrar campo de receita', async ({ page }) => {
    await expect(page.getByTestId('income-input')).toBeVisible();
  });

  test('deve salvar receita e mostrar resumo', async ({ page }) => {
    await page.getByTestId('income-input').fill('5000');
    await page.getByTestId('btn-save-income').click();

    await expect(page.getByTestId('summary-income')).toBeVisible();
    await expect(page.getByTestId('summary-expenses')).toBeVisible();
    await expect(page.getByTestId('summary-balance')).toBeVisible();
  });

  test('deve navegar para dashboard', async ({ page }) => {
    await page.getByTestId('btn-view-dashboard').first().click();
    await expect(page).toHaveURL(/#\/dashboard/);
  });

  test('deve mostrar todas as transacoes na tabela', async ({ page }) => {
    const rows = page.getByTestId('transactions-table').locator('[data-row]');
    await expect(rows).toHaveCount(15);
  });

});
