import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Upload de Extrato', () => {

  test('deve fazer upload de CSV e processar', async ({ page }) => {
    await page.goto('/#/test-drive');

    const fileInput = page.getByTestId('upload-file-input');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/extrato-teste.csv'));

    // Aguarda processamento
    await expect(page.getByTestId('upload-progress')).toBeVisible();

    // Aguarda redirecionamento para transacoes
    await expect(page).toHaveURL(/#\/transacoes/, { timeout: 10000 });
    await expect(page.getByTestId('transactions-count')).toBeVisible();
  });

  test('drop zone deve estar visivel', async ({ page }) => {
    await page.goto('/#/test-drive');
    const dropzone = page.getByTestId('upload-dropzone');
    await expect(dropzone).toBeVisible();
  });

});
