import { test, expect } from '@playwright/test';
import { setupDashboard, getRawValue } from './helpers';

test.describe('Dashboard — Layout e Navegacao', () => {

  test.beforeEach(async ({ page }) => {
    await setupDashboard(page);
  });

  test('sidebar mostra todos os menus', async ({ page }) => {
    await expect(page.getByTestId('sidebar')).toBeVisible();
    await expect(page.getByTestId('menu-dashboard')).toBeVisible();
    await expect(page.getByTestId('menu-transacoes')).toBeVisible();
    await expect(page.getByTestId('menu-receitas')).toBeVisible();
    await expect(page.getByTestId('menu-dividas')).toBeVisible();
    await expect(page.getByTestId('menu-contas')).toBeVisible();
    await expect(page.getByTestId('menu-insights')).toBeVisible();
  });

  test('clicar sidebar-toggle colapsa sidebar', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar');
    await page.getByTestId('sidebar-toggle').click();
    await expect(sidebar).toHaveClass(/collapsed/);
  });

  test('exibe 4 cards de resumo financeiro', async ({ page }) => {
    await expect(page.getByTestId('summary-card-income')).toBeVisible();
    await expect(page.getByTestId('summary-card-expenses')).toBeVisible();
    await expect(page.getByTestId('summary-card-balance')).toBeVisible();
    await expect(page.getByTestId('summary-card-fixed')).toBeVisible();
  });

  test('card receita tem label correto', async ({ page }) => {
    await expect(page.getByTestId('summary-card-income')).toContainText('Receita do mes');
  });

  test('card gastos tem label correto', async ({ page }) => {
    await expect(page.getByTestId('summary-card-expenses')).toContainText('Total de gastos');
  });

  test('card saldo tem label correto', async ({ page }) => {
    await expect(page.getByTestId('summary-card-balance')).toContainText('Saldo disponivel');
  });

  test('exibe todos os widgets do dashboard', async ({ page }) => {
    await expect(page.getByTestId('transactions-card')).toBeVisible();
    await expect(page.getByTestId('debts-card')).toBeVisible();
    await expect(page.getByTestId('donut-card')).toBeVisible();
    await expect(page.getByTestId('budget-card')).toBeVisible();
    await expect(page.getByTestId('ai-card')).toBeVisible();
    await expect(page.getByTestId('fixed-card')).toBeVisible();
  });

  test('header exibe greeting e data', async ({ page }) => {
    await expect(page.getByTestId('dash-greeting')).toBeVisible();
    await expect(page.getByTestId('dash-date')).toBeVisible();
  });

  test('header tem botoes de upload e insight', async ({ page }) => {
    await expect(page.getByTestId('btn-upload-modal')).toBeVisible();
    await expect(page.getByTestId('btn-ai-insight')).toBeVisible();
  });

  test('sidebar navega entre todas views corretamente', async ({ page }) => {
    await page.getByTestId('menu-transacoes').click();
    await expect(page.getByTestId('view-transacoes')).toHaveClass(/active/);

    await page.getByTestId('menu-dividas').click();
    await expect(page.getByTestId('view-dividas')).toHaveClass(/active/);

    await page.getByTestId('menu-contas').click();
    await expect(page.getByTestId('view-contas')).toHaveClass(/active/);

    await page.getByTestId('menu-insights').click();
    await expect(page.getByTestId('view-insights')).toHaveClass(/active/);

    await page.getByTestId('menu-dashboard').click();
    await expect(page.getByTestId('view-dashboard')).toHaveClass(/active/);
  });

  test('banner test-drive visivel no modo nao logado', async ({ page }) => {
    await expect(page.getByTestId('test-banner')).toBeVisible();
  });
});

test.describe('Dashboard — Valores refletem receita', () => {

  test('receita 3000 aparece corretamente no card', async ({ page }) => {
    await setupDashboard(page, '3000');
    const income = await getRawValue(page, 'summary-value-income');
    expect(income).toBe(3000);
  });

  test('receita 10000 aparece corretamente no card', async ({ page }) => {
    await setupDashboard(page, '10000');
    const income = await getRawValue(page, 'summary-value-income');
    expect(income).toBe(10000);
  });

  test('saldo = receita - gastos (formula correta)', async ({ page }) => {
    await setupDashboard(page, '4500');
    const income = await getRawValue(page, 'summary-value-income');
    const expenses = await getRawValue(page, 'summary-value-expenses');
    const balance = await getRawValue(page, 'summary-value-balance');

    expect(income).toBe(4500);
    expect(balance).toBeCloseTo(income - expenses, 2);
  });

  test('contas fixas (mock) somam 1589.80', async ({ page }) => {
    await setupDashboard(page, '4500');
    const fixed = await getRawValue(page, 'summary-value-fixed');
    expect(fixed).toBeCloseTo(1589.80, 2);
  });
});
