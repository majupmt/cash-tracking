import { test, expect } from '@playwright/test';

test.describe('Fluxo Test-Drive', () => {

  test('deve navegar Login -> Escolha -> Test-Drive', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('btn-comecar').click();
    await expect(page).toHaveURL(/#\/escolha/);

    await page.getByTestId('option-test-drive').click();
    await expect(page).toHaveURL(/#\/test-drive/);

    await expect(page.getByTestId('upload-dropzone')).toBeVisible();
  });

  test('deve carregar demo data e mostrar transacoes', async ({ page }) => {
    await page.goto('/#/test-drive');
    await page.getByTestId('btn-demo-data').click();
    await expect(page).toHaveURL(/#\/transacoes/);
    await expect(page.getByTestId('transactions-count')).toBeVisible();
    await expect(page.getByTestId('transactions-table')).toBeVisible();
  });

  test('deve adicionar transacao manual', async ({ page }) => {
    await page.goto('/#/test-drive');
    await page.getByTestId('manual-date').fill('2026-02-07');
    await page.getByTestId('manual-description').fill('Teste Mercado');
    await page.getByTestId('manual-value').fill('150.00');
    await page.getByTestId('manual-type').selectOption('despesa');
    await page.getByTestId('btn-add-manual').click();

    await expect(page.getByTestId('manual-entries-list')).toContainText('Teste Mercado');
  });

});
