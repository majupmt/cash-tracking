import { test, expect } from '@playwright/test';

test.describe('Fluxo Test-Drive', () => {

  // Helper: navigate to test-drive screen via UI
  async function goToTestDrive(page) {
    await page.goto('/');
    await page.getByTestId('btn-go-signup').click();
    await page.getByTestId('btn-signup-testdrive').click();
    await expect(page.getByTestId('screen-testdrive')).toBeVisible();
  }

  test('deve navegar Welcome -> Signup -> Test-Drive', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('btn-go-signup').click();
    await expect(page.getByTestId('screen-signup')).toBeVisible();

    await page.getByTestId('btn-signup-testdrive').click();
    await expect(page.getByTestId('screen-testdrive')).toBeVisible();

    await expect(page.getByTestId('testdrive-dropzone')).toBeVisible();
    await expect(page.getByTestId('testdrive-revenue')).toBeVisible();
  });

  test('deve mostrar upload dropzone e revenue input', async ({ page }) => {
    await goToTestDrive(page);
    await expect(page.getByTestId('testdrive-dropzone')).toBeVisible();
    await expect(page.getByTestId('testdrive-revenue')).toBeVisible();
    await expect(page.getByTestId('btn-go-dashboard')).toBeDisabled();
  });

  test('deve habilitar botao dashboard ao inserir receita', async ({ page }) => {
    await goToTestDrive(page);
    await page.getByTestId('testdrive-revenue').fill('5000');
    await expect(page.getByTestId('btn-go-dashboard')).toBeEnabled();
  });

  test('deve adicionar transacao manual', async ({ page }) => {
    await goToTestDrive(page);

    // Switch to manual tab
    await page.getByTestId('tab-manual').click();
    await expect(page.getByTestId('tab-content-manual')).toBeVisible();

    await page.getByTestId('manual-desc').fill('Teste Mercado');
    await page.getByTestId('manual-value').fill('150.00');
    await page.getByTestId('manual-type').selectOption('gasto');
    await page.getByTestId('btn-add-manual').click();

    await expect(page.getByTestId('manual-entries-list')).toContainText('Teste Mercado');
  });

  test('deve navegar para dashboard com receita e dados', async ({ page }) => {
    await goToTestDrive(page);
    await page.getByTestId('testdrive-revenue').fill('4500');

    // Add manual entry to have data
    await page.getByTestId('tab-manual').click();
    await page.getByTestId('manual-desc').fill('Supermercado');
    await page.getByTestId('manual-value').fill('200');
    await page.getByTestId('manual-type').selectOption('gasto');
    await page.getByTestId('btn-add-manual').click();

    await page.getByTestId('btn-go-dashboard').click();
    await expect(page.getByTestId('screen-dashboard')).toBeVisible();
  });

});
