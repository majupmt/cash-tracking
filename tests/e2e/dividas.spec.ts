import { test, expect } from '@playwright/test';
import { setupDashboard } from './helpers';

test.describe('Dividas — View e CRUD', () => {

  test.beforeEach(async ({ page }) => {
    await setupDashboard(page);
    await page.getByTestId('menu-dividas').click();
    await expect(page.getByTestId('view-dividas')).toHaveClass(/active/);
  });

  test('view dividas exibe summary e grid', async ({ page }) => {
    await expect(page.getByTestId('debts-summary')).toBeVisible();
    await expect(page.getByTestId('debts-grid')).toBeVisible();
  });

  test('summary mostra total, pago e restante', async ({ page }) => {
    const summary = page.getByTestId('debts-summary');
    await expect(summary).toContainText('Total em dividas');
    await expect(summary).toContainText('Ja pago');
    await expect(summary).toContainText('Restante');
  });

  test('botao nova divida abre modal', async ({ page }) => {
    await page.getByTestId('btn-new-debt').click();
    await expect(page.getByTestId('debt-modal')).toBeVisible();
    await expect(page.getByTestId('debt-modal-title')).toContainText('Nova divida');
  });

  test('criar divida aparece no grid', async ({ page }) => {
    await page.getByTestId('btn-new-debt').click();
    await page.getByTestId('debt-modal-desc').fill('Cartao Nubank');
    await page.getByTestId('debt-modal-total').fill('5000');
    await page.getByTestId('debt-modal-paid').fill('1000');
    await page.getByTestId('debt-modal-due').fill('2026-06-15');
    await page.getByTestId('debt-modal-save').click();

    await expect(page.getByTestId('debt-modal')).not.toBeVisible();
    await expect(page.getByTestId('debts-grid')).toContainText('Cartao Nubank');
  });

  test('validacao: nao salva sem descricao', async ({ page }) => {
    await page.getByTestId('btn-new-debt').click();
    await page.getByTestId('debt-modal-total').fill('1000');
    await page.getByTestId('debt-modal-due').fill('2026-06-15');
    await page.getByTestId('debt-modal-save').click();
    await expect(page.getByTestId('debt-modal')).toBeVisible();
  });

  test('validacao: nao salva sem vencimento', async ({ page }) => {
    await page.getByTestId('btn-new-debt').click();
    await page.getByTestId('debt-modal-desc').fill('Teste');
    await page.getByTestId('debt-modal-total').fill('1000');
    await page.getByTestId('debt-modal-save').click();
    await expect(page.getByTestId('debt-modal')).toBeVisible();
  });

  test('fechar modal divida com cancelar', async ({ page }) => {
    await page.getByTestId('btn-new-debt').click();
    await expect(page.getByTestId('debt-modal')).toBeVisible();
    await page.getByTestId('debt-modal-cancel').click();
    await expect(page.getByTestId('debt-modal')).not.toBeVisible();
  });

  test('fechar modal divida com X', async ({ page }) => {
    await page.getByTestId('btn-new-debt').click();
    await expect(page.getByTestId('debt-modal')).toBeVisible();
    await page.getByTestId('debt-modal-close').click();
    await expect(page.getByTestId('debt-modal')).not.toBeVisible();
  });

  test('editar divida existente abre modal com dados', async ({ page }) => {
    // Primeiro criar uma divida
    await page.getByTestId('btn-new-debt').click();
    await page.getByTestId('debt-modal-desc').fill('Emprestimo Banco');
    await page.getByTestId('debt-modal-total').fill('10000');
    await page.getByTestId('debt-modal-paid').fill('2000');
    await page.getByTestId('debt-modal-due').fill('2026-12-01');
    await page.getByTestId('debt-modal-save').click();
    await expect(page.getByTestId('debt-modal')).not.toBeVisible();

    // Agora editar
    const editBtn = page.locator('[data-action="edit-debt"]').first();
    await editBtn.click();
    await expect(page.getByTestId('debt-modal')).toBeVisible();
    await expect(page.getByTestId('debt-modal-title')).toContainText('Editar divida');

    const desc = await page.getByTestId('debt-modal-desc').inputValue();
    expect(desc.length).toBeGreaterThan(0);
  });

  test('excluir divida remove do grid', async ({ page }) => {
    // Criar uma divida para deletar
    await page.getByTestId('btn-new-debt').click();
    await page.getByTestId('debt-modal-desc').fill('DividaParaDeletar');
    await page.getByTestId('debt-modal-total').fill('500');
    await page.getByTestId('debt-modal-due').fill('2026-06-01');
    await page.getByTestId('debt-modal-save').click();
    await expect(page.getByTestId('debts-grid')).toContainText('DividaParaDeletar');

    const countBefore = await page.locator('.debt-card').count();
    const deleteBtn = page.locator('[data-action="delete-debt"]').last();
    await deleteBtn.click();
    const countAfter = await page.locator('.debt-card').count();
    expect(countAfter).toBe(countBefore - 1);
  });

  test('progress bar mostra percentual correto', async ({ page }) => {
    await page.getByTestId('btn-new-debt').click();
    await page.getByTestId('debt-modal-desc').fill('Divida Teste Bar');
    await page.getByTestId('debt-modal-total').fill('1000');
    await page.getByTestId('debt-modal-paid').fill('500');
    await page.getByTestId('debt-modal-due').fill('2026-06-01');
    await page.getByTestId('debt-modal-save').click();

    // Should show 50%
    await expect(page.getByTestId('debts-grid')).toContainText('50%');
  });
});
