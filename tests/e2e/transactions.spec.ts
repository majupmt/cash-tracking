import { test, expect, Page } from '@playwright/test';

// Helper: navigate to test-drive, set revenue and go to dashboard
async function setupTestDrive(page: Page, revenue: string) {
  await page.goto('/');
  await page.getByTestId('btn-go-signup').click();
  await page.getByTestId('btn-signup-testdrive').click();
  await expect(page.getByTestId('screen-testdrive')).toBeVisible();
  await page.getByTestId('testdrive-revenue').fill(revenue);
}

// Helper: add a manual entry in test-drive
async function addManualEntry(page: Page, desc: string, value: string, type: 'gasto' | 'receita' = 'gasto') {
  await page.getByTestId('tab-manual').click();
  await page.getByTestId('manual-desc').fill(desc);
  await page.getByTestId('manual-value').fill(value);
  await page.getByTestId('manual-type').selectOption(type);
  await page.getByTestId('btn-add-manual').click();
}

// Helper: go to dashboard from test-drive
async function goToDashboard(page: Page) {
  await page.getByTestId('btn-go-dashboard').click();
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();
  // Wait for summary cards to render
  await expect(page.getByTestId('summary-card-income')).toBeVisible();
}

// Helper: get the raw value from a summary card
async function getSummaryRawValue(page: Page, testId: string): Promise<number> {
  const el = page.getByTestId(testId);
  const raw = await el.getAttribute('data-raw-value');
  return parseFloat(raw || '0');
}

test.describe('Receita e Dashboard — Dados acompanham', () => {

  test('receita definida no test-drive deve aparecer no dashboard', async ({ page }) => {
    await setupTestDrive(page, '5000');
    await goToDashboard(page);

    const income = await getSummaryRawValue(page, 'summary-value-income');
    expect(income).toBe(5000);
  });

  test('receita diferente deve refletir corretamente no dashboard', async ({ page }) => {
    await setupTestDrive(page, '7500');
    await goToDashboard(page);

    const income = await getSummaryRawValue(page, 'summary-value-income');
    expect(income).toBe(7500);
  });

  test('saldo deve ser receita menos gastos', async ({ page }) => {
    await setupTestDrive(page, '5000');

    // Add manual expenses
    await addManualEntry(page, 'Supermercado', '300', 'gasto');
    await addManualEntry(page, 'Uber', '50', 'gasto');

    await goToDashboard(page);

    const income = await getSummaryRawValue(page, 'summary-value-income');
    const expenses = await getSummaryRawValue(page, 'summary-value-expenses');
    const balance = await getSummaryRawValue(page, 'summary-value-balance');

    expect(income).toBe(5000);
    expect(expenses).toBe(350); // 300 + 50
    expect(balance).toBe(4650); // 5000 - 350
  });

  test('receita zero deve resultar em saldo negativo', async ({ page }) => {
    await setupTestDrive(page, '0');

    await addManualEntry(page, 'Aluguel', '1200', 'gasto');

    await goToDashboard(page);

    const income = await getSummaryRawValue(page, 'summary-value-income');
    const balance = await getSummaryRawValue(page, 'summary-value-balance');

    expect(income).toBe(0);
    expect(balance).toBe(-1200);
  });

  test('receita alta com poucos gastos deve mostrar saldo positivo alto', async ({ page }) => {
    await setupTestDrive(page, '15000');

    await addManualEntry(page, 'Lanche', '25', 'gasto');

    await goToDashboard(page);

    const income = await getSummaryRawValue(page, 'summary-value-income');
    const expenses = await getSummaryRawValue(page, 'summary-value-expenses');
    const balance = await getSummaryRawValue(page, 'summary-value-balance');

    expect(income).toBe(15000);
    expect(expenses).toBe(25);
    expect(balance).toBe(14975);
  });

});

test.describe('Transacoes — Exibicao e navegacao', () => {

  test.beforeEach(async ({ page }) => {
    // Setup test-drive and go to dashboard (loads MOCK_TRANSACTIONS)
    await setupTestDrive(page, '4500');
    await goToDashboard(page);
  });

  test('deve exibir cards de resumo no dashboard', async ({ page }) => {
    await expect(page.getByTestId('summary-card-income')).toBeVisible();
    await expect(page.getByTestId('summary-card-expenses')).toBeVisible();
    await expect(page.getByTestId('summary-card-balance')).toBeVisible();
    await expect(page.getByTestId('summary-card-fixed')).toBeVisible();
  });

  test('deve exibir transacoes recentes no dashboard', async ({ page }) => {
    await expect(page.getByTestId('transactions-card')).toBeVisible();
  });

  test('deve navegar para view de transacoes via sidebar', async ({ page }) => {
    await page.getByTestId('menu-transacoes').click();
    await expect(page.getByTestId('view-transacoes')).toHaveClass(/active/);
    await expect(page.getByTestId('transactions-tbody')).toBeVisible();
  });

  test('deve filtrar transacoes por busca', async ({ page }) => {
    await page.getByTestId('menu-transacoes').click();
    await expect(page.getByTestId('view-transacoes')).toHaveClass(/active/);

    await page.getByTestId('filter-search').fill('Uber');
    // Should filter the table
    await expect(page.getByTestId('transactions-info')).toBeVisible();
  });

  test('deve filtrar transacoes por categoria', async ({ page }) => {
    await page.getByTestId('menu-transacoes').click();
    await page.getByTestId('filter-category').selectOption('Alimentacao');
    await expect(page.getByTestId('transactions-info')).toBeVisible();
  });

  test('deve voltar ao dashboard via sidebar', async ({ page }) => {
    await page.getByTestId('menu-transacoes').click();
    await expect(page.getByTestId('view-transacoes')).toHaveClass(/active/);

    await page.getByTestId('menu-dashboard').click();
    await expect(page.getByTestId('view-dashboard')).toHaveClass(/active/);
  });

});
