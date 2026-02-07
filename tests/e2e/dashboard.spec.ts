import { test, expect, Page } from '@playwright/test';

// Helper: navigate to test-drive, set revenue and go to dashboard
async function setupAndGoToDashboard(page: Page, revenue = '4500') {
  await page.goto('/');
  await page.getByTestId('btn-go-signup').click();
  await page.getByTestId('btn-signup-testdrive').click();
  await expect(page.getByTestId('screen-testdrive')).toBeVisible();
  await page.getByTestId('testdrive-revenue').fill(revenue);
  await page.getByTestId('btn-go-dashboard').click();
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();
  await expect(page.getByTestId('summary-card-income')).toBeVisible();
}

test.describe('Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await setupAndGoToDashboard(page);
  });

  test('deve exibir sidebar com menu de navegacao', async ({ page }) => {
    await expect(page.getByTestId('sidebar')).toBeVisible();
    await expect(page.getByTestId('menu-dashboard')).toBeVisible();
    await expect(page.getByTestId('menu-transacoes')).toBeVisible();
    await expect(page.getByTestId('menu-dividas')).toBeVisible();
    await expect(page.getByTestId('menu-contas')).toBeVisible();
    await expect(page.getByTestId('menu-insights')).toBeVisible();
  });

  test('deve exibir 4 cards de resumo financeiro', async ({ page }) => {
    await expect(page.getByTestId('summary-card-income')).toBeVisible();
    await expect(page.getByTestId('summary-card-expenses')).toBeVisible();
    await expect(page.getByTestId('summary-card-balance')).toBeVisible();
    await expect(page.getByTestId('summary-card-fixed')).toBeVisible();
  });

  test('card de receita deve conter label correto', async ({ page }) => {
    const card = page.getByTestId('summary-card-income');
    await expect(card).toContainText('Receita do mes');
  });

  test('card de gastos deve conter label correto', async ({ page }) => {
    const card = page.getByTestId('summary-card-expenses');
    await expect(card).toContainText('Total de gastos');
  });

  test('card de saldo deve conter label correto', async ({ page }) => {
    const card = page.getByTestId('summary-card-balance');
    await expect(card).toContainText('Saldo disponivel');
  });

  test('deve exibir grafico donut de categorias', async ({ page }) => {
    await expect(page.getByTestId('donut-card')).toBeVisible();
  });

  test('deve exibir card de transacoes recentes', async ({ page }) => {
    await expect(page.getByTestId('transactions-card')).toBeVisible();
  });

  test('deve exibir card de dividas', async ({ page }) => {
    await expect(page.getByTestId('debts-card')).toBeVisible();
  });

  test('deve exibir card de contas fixas', async ({ page }) => {
    await expect(page.getByTestId('fixed-card')).toBeVisible();
  });

  test('deve exibir card de IA', async ({ page }) => {
    await expect(page.getByTestId('ai-card')).toBeVisible();
  });

  test('sidebar deve navegar para transacoes', async ({ page }) => {
    await page.getByTestId('menu-transacoes').click();
    await expect(page.getByTestId('view-transacoes')).toHaveClass(/active/);
  });

  test('sidebar deve navegar para dividas', async ({ page }) => {
    await page.getByTestId('menu-dividas').click();
    await expect(page.getByTestId('view-dividas')).toHaveClass(/active/);
  });

  test('sidebar deve navegar para contas fixas', async ({ page }) => {
    await page.getByTestId('menu-contas').click();
    await expect(page.getByTestId('view-contas')).toHaveClass(/active/);
  });

  test('sidebar deve navegar para insights', async ({ page }) => {
    await page.getByTestId('menu-insights').click();
    await expect(page.getByTestId('view-insights')).toHaveClass(/active/);
  });

  test('sidebar deve voltar ao dashboard', async ({ page }) => {
    await page.getByTestId('menu-transacoes').click();
    await page.getByTestId('menu-dashboard').click();
    await expect(page.getByTestId('view-dashboard')).toHaveClass(/active/);
  });

  test('banner de test-drive deve ser visivel para usuario nao logado', async ({ page }) => {
    await expect(page.getByTestId('test-banner')).toBeVisible();
  });

  test('deve exibir greeting no header', async ({ page }) => {
    await expect(page.getByTestId('dash-greeting')).toBeVisible();
  });

});

test.describe('Dashboard — Valores acompanham receita', () => {

  test('receita 3000 deve refletir no card', async ({ page }) => {
    await setupAndGoToDashboard(page, '3000');

    const raw = await page.getByTestId('summary-value-income').getAttribute('data-raw-value');
    expect(parseFloat(raw || '0')).toBe(3000);
  });

  test('receita 10000 deve refletir no card', async ({ page }) => {
    await setupAndGoToDashboard(page, '10000');

    const raw = await page.getByTestId('summary-value-income').getAttribute('data-raw-value');
    expect(parseFloat(raw || '0')).toBe(10000);
  });

  test('receita padrao 4500 com mock data deve calcular saldo corretamente', async ({ page }) => {
    await setupAndGoToDashboard(page, '4500');

    const income = parseFloat(await page.getByTestId('summary-value-income').getAttribute('data-raw-value') || '0');
    const expenses = parseFloat(await page.getByTestId('summary-value-expenses').getAttribute('data-raw-value') || '0');
    const balance = parseFloat(await page.getByTestId('summary-value-balance').getAttribute('data-raw-value') || '0');

    expect(income).toBe(4500);
    expect(expenses).toBeGreaterThan(0);
    // Balance must equal income minus expenses
    expect(balance).toBeCloseTo(income - expenses, 2);
  });

  test('contas fixas devem aparecer no card', async ({ page }) => {
    await setupAndGoToDashboard(page, '4500');

    const fixed = parseFloat(await page.getByTestId('summary-value-fixed').getAttribute('data-raw-value') || '0');
    // MOCK_FIXED sum: 1200 + 119.90 + 89.90 + 180 = 1589.80
    expect(fixed).toBeCloseTo(1589.80, 2);
  });

});
