import { test, expect } from '@playwright/test';
import { setupDashboard } from './helpers';

test.describe('Contas Fixas — View e CRUD', () => {

  test.beforeEach(async ({ page }) => {
    await setupDashboard(page);
    await page.getByTestId('menu-contas').click();
    await expect(page.getByTestId('view-contas')).toHaveClass(/active/);
  });

  test('view contas fixas exibe total bar e grid', async ({ page }) => {
    await expect(page.getByTestId('fixed-total-bar')).toBeVisible();
    await expect(page.getByTestId('fixed-grid')).toBeVisible();
  });

  test('total bar mostra label correto', async ({ page }) => {
    await expect(page.getByTestId('fixed-total-bar')).toContainText('Total mensal em contas fixas');
  });

  test('botao nova conta fixa abre modal', async ({ page }) => {
    await page.getByTestId('btn-new-fixed').click();
    await expect(page.getByTestId('fixed-modal')).toBeVisible();
    await expect(page.getByTestId('fixed-modal-title')).toContainText('Nova conta fixa');
  });

  test('criar conta fixa aparece no grid', async ({ page }) => {
    await page.getByTestId('btn-new-fixed').click();
    await page.getByTestId('fixed-modal-desc').fill('Academia Smart Fit');
    await page.getByTestId('fixed-modal-value').fill('99.90');
    await page.getByTestId('fixed-modal-category').selectOption('Saude');
    await page.getByTestId('fixed-modal-save').click();

    await expect(page.getByTestId('fixed-modal')).not.toBeVisible();
    await expect(page.getByTestId('fixed-grid')).toContainText('Academia Smart Fit');
  });

  test('validacao: nao salva sem descricao', async ({ page }) => {
    await page.getByTestId('btn-new-fixed').click();
    await page.getByTestId('fixed-modal-value').fill('100');
    await page.getByTestId('fixed-modal-save').click();
    await expect(page.getByTestId('fixed-modal')).toBeVisible();
  });

  test('validacao: nao salva com valor zero', async ({ page }) => {
    await page.getByTestId('btn-new-fixed').click();
    await page.getByTestId('fixed-modal-desc').fill('Teste');
    await page.getByTestId('fixed-modal-value').fill('0');
    await page.getByTestId('fixed-modal-save').click();
    await expect(page.getByTestId('fixed-modal')).toBeVisible();
  });

  test('fechar modal com cancelar', async ({ page }) => {
    await page.getByTestId('btn-new-fixed').click();
    await expect(page.getByTestId('fixed-modal')).toBeVisible();
    await page.getByTestId('fixed-modal-cancel').click();
    await expect(page.getByTestId('fixed-modal')).not.toBeVisible();
  });

  test('fechar modal com X', async ({ page }) => {
    await page.getByTestId('btn-new-fixed').click();
    await expect(page.getByTestId('fixed-modal')).toBeVisible();
    await page.getByTestId('fixed-modal-close').click();
    await expect(page.getByTestId('fixed-modal')).not.toBeVisible();
  });

  test('editar conta fixa abre modal com dados preenchidos', async ({ page }) => {
    // Criar conta para editar
    await page.getByTestId('btn-new-fixed').click();
    await page.getByTestId('fixed-modal-desc').fill('Internet Vivo');
    await page.getByTestId('fixed-modal-value').fill('120');
    await page.getByTestId('fixed-modal-category').selectOption('Moradia');
    await page.getByTestId('fixed-modal-save').click();
    await expect(page.getByTestId('fixed-modal')).not.toBeVisible();

    // Editar
    const editBtn = page.locator('[data-action="edit-fixed"]').last();
    await editBtn.click();
    await expect(page.getByTestId('fixed-modal')).toBeVisible();
    await expect(page.getByTestId('fixed-modal-title')).toContainText('Editar conta fixa');

    const desc = await page.getByTestId('fixed-modal-desc').inputValue();
    expect(desc).toBe('Internet Vivo');
  });

  test('excluir conta fixa remove do grid', async ({ page }) => {
    // Criar conta para deletar
    await page.getByTestId('btn-new-fixed').click();
    await page.getByTestId('fixed-modal-desc').fill('ContaDeletar');
    await page.getByTestId('fixed-modal-value').fill('50');
    await page.getByTestId('fixed-modal-save').click();
    await expect(page.getByTestId('fixed-grid')).toContainText('ContaDeletar');

    const countBefore = await page.locator('.fixed-card-item').count();
    const deleteBtn = page.locator('[data-action="delete-fixed"]').last();
    await deleteBtn.click();
    const countAfter = await page.locator('.fixed-card-item').count();
    expect(countAfter).toBe(countBefore - 1);
  });

  test('total atualiza ao adicionar nova conta', async ({ page }) => {
    // Pegar total antes
    const totalBefore = await page.getByTestId('fixed-total-bar').textContent();

    // Criar conta
    await page.getByTestId('btn-new-fixed').click();
    await page.getByTestId('fixed-modal-desc').fill('Streaming');
    await page.getByTestId('fixed-modal-value').fill('29.90');
    await page.getByTestId('fixed-modal-save').click();

    // Total deve ter mudado
    const totalAfter = await page.getByTestId('fixed-total-bar').textContent();
    expect(totalAfter).not.toBe(totalBefore);
  });
});
