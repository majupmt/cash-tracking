import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { goToTestDrive, setupDashboard } from './helpers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Upload de Extrato — Test Drive', () => {

  test('dropzone visivel na tela de test-drive', async ({ page }) => {
    await goToTestDrive(page);
    await expect(page.getByTestId('testdrive-dropzone')).toBeVisible();
  });

  test('upload de CSV mostra sucesso e contagem', async ({ page }) => {
    await goToTestDrive(page);

    const fileInput = page.getByTestId('testdrive-file-input');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/extrato-teste.csv'));

    // Progress should appear
    await expect(page.getByTestId('testdrive-progress')).toHaveClass(/visible/, { timeout: 5000 });

    // Success area should show something
    await expect(page.getByTestId('upload-success-area')).not.toBeEmpty({ timeout: 10000 });
  });

  test('apos upload + receita, botao dashboard habilitado', async ({ page }) => {
    await goToTestDrive(page);
    await page.getByTestId('testdrive-revenue').fill('5000');

    const fileInput = page.getByTestId('testdrive-file-input');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/extrato-teste.csv'));
    await expect(page.getByTestId('upload-success-area')).not.toBeEmpty({ timeout: 10000 });

    await expect(page.getByTestId('btn-go-dashboard')).toBeEnabled();
  });

  test('transacoes do CSV aparecem no dashboard apos upload', async ({ page }) => {
    await goToTestDrive(page);
    await page.getByTestId('testdrive-revenue').fill('5000');

    const fileInput = page.getByTestId('testdrive-file-input');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/extrato-teste.csv'));
    await expect(page.getByTestId('upload-success-area')).not.toBeEmpty({ timeout: 10000 });

    await page.getByTestId('btn-go-dashboard').click();
    await expect(page.getByTestId('screen-dashboard')).toBeVisible();

    // Expenses should be > 0 (CSV has gastos)
    const expenses = parseFloat(
      await page.getByTestId('summary-value-expenses').getAttribute('data-raw-value') || '0'
    );
    expect(expenses).toBeGreaterThan(0);
  });
});

test.describe('Upload de Extrato — Modal no Dashboard', () => {

  test('botao upload abre modal', async ({ page }) => {
    await setupDashboard(page);
    await page.getByTestId('btn-upload-modal').click();
    await expect(page.getByTestId('upload-modal')).toBeVisible();
  });

  test('fechar modal com botao X', async ({ page }) => {
    await setupDashboard(page);
    await page.getByTestId('btn-upload-modal').click();
    await expect(page.getByTestId('upload-modal')).toBeVisible();
    await page.getByTestId('modal-close').click();
    await expect(page.getByTestId('upload-modal')).not.toBeVisible();
  });

  test('modal tem dropzone e botao processar desabilitado', async ({ page }) => {
    await setupDashboard(page);
    await page.getByTestId('btn-upload-modal').click();
    await expect(page.getByTestId('modal-dropzone')).toBeVisible();
    await expect(page.getByTestId('btn-modal-process')).toBeDisabled();
  });
});
