import { test, expect } from '@playwright/test';
import { goToTestDrive, addManualEntry } from './helpers';

test.describe('Fluxo Test-Drive', () => {

  test.beforeEach(async ({ page }) => {
    await goToTestDrive(page);
  });

  test('tela test-drive exibe dropzone, revenue input e botao dashboard desabilitado', async ({ page }) => {
    await expect(page.getByTestId('testdrive-dropzone')).toBeVisible();
    await expect(page.getByTestId('testdrive-revenue')).toBeVisible();
    await expect(page.getByTestId('btn-go-dashboard')).toBeDisabled();
  });

  test('somente receita nao habilita botao dashboard (precisa de dados tambem)', async ({ page }) => {
    await page.getByTestId('testdrive-revenue').fill('5000');
    await expect(page.getByTestId('btn-go-dashboard')).toBeDisabled();
  });

  test('receita zero nao habilita botao dashboard', async ({ page }) => {
    await page.getByTestId('testdrive-revenue').fill('0');
    await expect(page.getByTestId('btn-go-dashboard')).toBeDisabled();
  });

  test('somente dados sem receita nao habilita botao dashboard', async ({ page }) => {
    await addManualEntry(page, 'Supermercado', '150', 'gasto');
    await expect(page.getByTestId('btn-go-dashboard')).toBeDisabled();
  });

  test('receita + dados juntos habilitam botao dashboard', async ({ page }) => {
    await page.getByTestId('testdrive-revenue').fill('5000');
    await addManualEntry(page, 'Supermercado', '150', 'gasto');
    await expect(page.getByTestId('btn-go-dashboard')).toBeEnabled();
  });

  test('aba manual: adicionar transacao aparece na lista', async ({ page }) => {
    await addManualEntry(page, 'Supermercado', '150', 'gasto');
    await expect(page.getByTestId('manual-entries-list')).toContainText('Supermercado');
  });

  test('aba manual: adicionar receita aparece na lista', async ({ page }) => {
    await addManualEntry(page, 'Freelance', '2000', 'receita');
    await expect(page.getByTestId('manual-entries-list')).toContainText('Freelance');
  });

  test('aba manual: remover transacao da lista', async ({ page }) => {
    await addManualEntry(page, 'ItemRemover', '100', 'gasto');
    await expect(page.getByTestId('manual-entries-list')).toContainText('ItemRemover');

    const removeBtn = page.locator('[data-testid="manual-entries-list"] button').first();
    await removeBtn.click();
    await expect(page.getByTestId('manual-entries-list')).not.toContainText('ItemRemover');
  });

  test('ir pro dashboard com receita e dados mostra corretamente', async ({ page }) => {
    await page.getByTestId('testdrive-revenue').fill('4500');
    await addManualEntry(page, 'Mercado', '200', 'gasto');
    await page.getByTestId('btn-go-dashboard').click();

    await expect(page.getByTestId('screen-dashboard')).toBeVisible();
    await expect(page.getByTestId('summary-card-income')).toBeVisible();
    await expect(page.getByTestId('test-banner')).toBeVisible();
  });

  test('banner test-drive tem botao de criar conta', async ({ page }) => {
    await page.getByTestId('testdrive-revenue').fill('1000');
    await addManualEntry(page, 'Teste', '50', 'gasto');
    await page.getByTestId('btn-go-dashboard').click();
    await expect(page.getByTestId('test-banner')).toBeVisible();
    await expect(page.getByTestId('banner-register')).toBeVisible();
  });
});
