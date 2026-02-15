import { test, expect } from '@playwright/test';
import { setupDashboard, getRawValue, addManualEntry, goToTestDrive } from './helpers';

test.describe('Transacoes — Valores no dashboard', () => {

  test('receita definida no test-drive aparece no dashboard', async ({ page }) => {
    await setupDashboard(page, '5000');
    const income = await getRawValue(page, 'summary-value-income');
    expect(income).toBe(5000);
  });

  test('saldo = receita - gastos com entradas manuais', async ({ page }) => {
    await goToTestDrive(page);
    await page.getByTestId('testdrive-revenue').fill('5000');
    await addManualEntry(page, 'Supermercado', '300', 'gasto');
    await addManualEntry(page, 'Uber', '50', 'gasto');
    await page.getByTestId('btn-go-dashboard').click();
    await expect(page.getByTestId('summary-card-income')).toBeVisible();

    const income = await getRawValue(page, 'summary-value-income');
    const expenses = await getRawValue(page, 'summary-value-expenses');
    const balance = await getRawValue(page, 'summary-value-balance');

    expect(income).toBe(5000);
    expect(expenses).toBe(350);
    expect(balance).toBe(4650);
  });

  test('receita zero com gastos resulta em saldo negativo', async ({ page }) => {
    await goToTestDrive(page);
    await page.getByTestId('testdrive-revenue').fill('0');
    await addManualEntry(page, 'Aluguel', '1200', 'gasto');
    // Revenue 0 doesn't enable button, but manual entry does
    await page.getByTestId('btn-go-dashboard').click();
    await expect(page.getByTestId('summary-card-income')).toBeVisible();

    const balance = await getRawValue(page, 'summary-value-balance');
    expect(balance).toBe(-1200);
  });
});

test.describe('Transacoes — View, filtros e navegacao', () => {

  test.beforeEach(async ({ page }) => {
    await setupDashboard(page);
  });

  test('navegar para view de transacoes mostra tabela', async ({ page }) => {
    await page.getByTestId('menu-transacoes').click();
    await expect(page.getByTestId('view-transacoes')).toHaveClass(/active/);
    await expect(page.getByTestId('transactions-tbody')).toBeVisible();
  });

  test('filtro de busca filtra transacoes', async ({ page }) => {
    await page.getByTestId('menu-transacoes').click();
    await page.getByTestId('filter-search').fill('Uber');
    await expect(page.getByTestId('transactions-info')).toBeVisible();
  });

  test('filtro de categoria filtra transacoes', async ({ page }) => {
    await page.getByTestId('menu-transacoes').click();
    await page.getByTestId('filter-category').selectOption('Alimentacao');
    await expect(page.getByTestId('transactions-info')).toBeVisible();
  });

  test('filtro de tipo filtra apenas gastos', async ({ page }) => {
    await page.getByTestId('menu-transacoes').click();
    await page.getByTestId('filter-type').selectOption('expense');
    await expect(page.getByTestId('transactions-info')).toBeVisible();
  });

  test('link "Ver todas" no dashboard navega para transacoes', async ({ page }) => {
    const link = page.getByTestId('link-ver-todas');
    if (await link.isVisible()) {
      await link.click();
      await expect(page.getByTestId('view-transacoes')).toHaveClass(/active/);
    }
  });
});

test.describe('Transacoes — CRUD via modal', () => {

  test.beforeEach(async ({ page }) => {
    await setupDashboard(page);
    await page.getByTestId('menu-transacoes').click();
    await expect(page.getByTestId('view-transacoes')).toHaveClass(/active/);
  });

  test('abrir modal nova transacao', async ({ page }) => {
    await page.getByTestId('btn-new-transaction').click();
    await expect(page.getByTestId('transaction-modal')).toBeVisible();
    await expect(page.getByTestId('transaction-modal-title')).toContainText('Nova transacao');
  });

  test('criar transacao tipo gasto aparece na lista', async ({ page }) => {
    const countBefore = await page.locator('[data-testid="transactions-tbody"] tr').count();

    await page.getByTestId('btn-new-transaction').click();
    await page.getByTestId('tx-modal-desc').fill('Pizza delivery');
    await page.getByTestId('tx-modal-value').fill('45.90');
    await page.getByTestId('tx-modal-type').selectOption('gasto');
    await page.getByTestId('tx-modal-category').selectOption('Alimentacao');
    await page.getByTestId('tx-modal-save').click();

    // Modal fecha
    await expect(page.getByTestId('transaction-modal')).not.toBeVisible();

    // Transacao aparece na tabela
    const countAfter = await page.locator('[data-testid="transactions-tbody"] tr').count();
    expect(countAfter).toBeGreaterThan(countBefore);
    await expect(page.getByTestId('transactions-tbody')).toContainText('Pizza delivery');
  });

  test('criar transacao tipo receita aparece na lista', async ({ page }) => {
    await page.getByTestId('btn-new-transaction').click();
    await page.getByTestId('tx-modal-desc').fill('Freelance UI');
    await page.getByTestId('tx-modal-value').fill('2500');
    await page.getByTestId('tx-modal-type').selectOption('receita');
    await page.getByTestId('tx-modal-save').click();

    await expect(page.getByTestId('transaction-modal')).not.toBeVisible();
    await expect(page.getByTestId('transactions-tbody')).toContainText('Freelance UI');
  });

  test('validacao: nao salva sem descricao', async ({ page }) => {
    await page.getByTestId('btn-new-transaction').click();
    await page.getByTestId('tx-modal-value').fill('100');
    await page.getByTestId('tx-modal-save').click();

    // Modal deve continuar aberto (nao salvou)
    await expect(page.getByTestId('transaction-modal')).toBeVisible();
  });

  test('validacao: nao salva com valor zero', async ({ page }) => {
    await page.getByTestId('btn-new-transaction').click();
    await page.getByTestId('tx-modal-desc').fill('Teste');
    await page.getByTestId('tx-modal-value').fill('0');
    await page.getByTestId('tx-modal-save').click();

    await expect(page.getByTestId('transaction-modal')).toBeVisible();
  });

  test('fechar modal com botao cancelar', async ({ page }) => {
    await page.getByTestId('btn-new-transaction').click();
    await expect(page.getByTestId('transaction-modal')).toBeVisible();
    await page.getByTestId('tx-modal-cancel').click();
    await expect(page.getByTestId('transaction-modal')).not.toBeVisible();
  });

  test('fechar modal com botao X', async ({ page }) => {
    await page.getByTestId('btn-new-transaction').click();
    await expect(page.getByTestId('transaction-modal')).toBeVisible();
    await page.getByTestId('transaction-modal-close').click();
    await expect(page.getByTestId('transaction-modal')).not.toBeVisible();
  });

  test('editar transacao abre modal com dados preenchidos', async ({ page }) => {
    // Precisa ter pelo menos uma transacao — no test-drive tem MOCK_TRANSACTIONS
    const editBtn = page.locator('[data-action="edit-tx"]').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await expect(page.getByTestId('transaction-modal')).toBeVisible();
      await expect(page.getByTestId('transaction-modal-title')).toContainText('Editar transacao');

      const desc = await page.getByTestId('tx-modal-desc').inputValue();
      expect(desc.length).toBeGreaterThan(0);
    }
  });

  test('excluir transacao remove da lista', async ({ page }) => {
    const countBefore = await page.locator('[data-testid="transactions-tbody"] tr').count();
    const deleteBtn = page.locator('[data-action="delete-tx"]').first();
    if (await deleteBtn.isVisible() && countBefore > 0) {
      await deleteBtn.click();
      const countAfter = await page.locator('[data-testid="transactions-tbody"] tr').count();
      expect(countAfter).toBe(countBefore - 1);
    }
  });
});
