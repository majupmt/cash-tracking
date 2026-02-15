import { test, expect } from '@playwright/test';
import { goToTestDrive, addManualEntry } from './helpers';

test.describe('Receitas — Menu e filtro', () => {

  test('menu Receitas mostra apenas entradas tipo receita', async ({ page }) => {
    await goToTestDrive(page);
    await page.getByTestId('testdrive-revenue').fill('4000');

    // Add incomes
    await addManualEntry(page, 'Salario Empresa', '2000', 'receita');
    await addManualEntry(page, 'Freelance Projeto', '750', 'receita');

    // Add an expense to ensure filter excludes it
    await addManualEntry(page, 'Almoco', '45', 'gasto');

    await page.getByTestId('btn-go-dashboard').click();
    await expect(page.getByTestId('screen-dashboard')).toBeVisible();
    await expect(page.getByTestId('summary-card-income')).toBeVisible();

    // Click Receitas in sidebar
    await page.getByTestId('menu-receitas').click();

    // The transacoes view should be active
    await expect(page.getByTestId('view-transacoes')).toHaveClass(/active/);

    // Title should read Receitas
    const title = await page.locator('[data-view="transacoes"] .section-header h2').textContent();
    expect(title?.trim()).toBe('Receitas');

    // Ensure all visible rows show income class
    const rows = page.locator('[data-testid="transactions-tbody"] tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i++) {
      const valueCell = rows.nth(i).locator('.td-value');
      await expect(valueCell).toHaveClass(/income/);
    }
  });
});
