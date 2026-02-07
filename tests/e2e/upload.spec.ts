import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Upload de Extrato', () => {

  // Helper: navigate to test-drive screen
  async function goToTestDrive(page) {
    await page.goto('/');
    await page.getByTestId('btn-go-signup').click();
    await page.getByTestId('btn-signup-testdrive').click();
    await expect(page.getByTestId('screen-testdrive')).toBeVisible();
  }

  test('dropzone deve estar visivel na tela de test-drive', async ({ page }) => {
    await goToTestDrive(page);
    await expect(page.getByTestId('testdrive-dropzone')).toBeVisible();
  });

  test('deve fazer upload de CSV e mostrar sucesso', async ({ page }) => {
    await goToTestDrive(page);

    const fileInput = page.getByTestId('testdrive-file-input');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/extrato-teste.csv'));

    // Wait for progress to appear
    await expect(page.getByTestId('testdrive-progress')).toHaveClass(/visible/, { timeout: 5000 });

    // Wait for success area to appear
    await expect(page.getByTestId('upload-success-area')).not.toBeEmpty({ timeout: 10000 });
  });

  test('apos upload, botao dashboard deve estar habilitado', async ({ page }) => {
    await goToTestDrive(page);

    await page.getByTestId('testdrive-revenue').fill('5000');

    const fileInput = page.getByTestId('testdrive-file-input');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/extrato-teste.csv'));

    // Wait for upload processing
    await expect(page.getByTestId('upload-success-area')).not.toBeEmpty({ timeout: 10000 });

    await expect(page.getByTestId('btn-go-dashboard')).toBeEnabled();
  });

});
