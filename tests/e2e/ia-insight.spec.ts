import { test, expect } from '@playwright/test';
import { setupDashboard } from './helpers';

test.describe('Insights IA', () => {

  test.beforeEach(async ({ page }) => {
    await setupDashboard(page);
  });

  test('card de IA visivel no dashboard', async ({ page }) => {
    await expect(page.getByTestId('ai-card')).toBeVisible();
  });

  test('botao insight no header visivel', async ({ page }) => {
    await expect(page.getByTestId('btn-ai-insight')).toBeVisible();
  });

  test('navegar para view insights mostra botao gerar e area de texto', async ({ page }) => {
    await page.getByTestId('menu-insights').click();
    await expect(page.getByTestId('view-insights')).toHaveClass(/active/);
    await expect(page.getByTestId('btn-generate-insight')).toBeVisible();
    await expect(page.getByTestId('insight-current')).toBeVisible();
  });

  test('gerar insight mostra texto com analise financeira', async ({ page }) => {
    await page.getByTestId('menu-insights').click();
    await page.getByTestId('btn-generate-insight').click();

    // Wait for typewriter effect to produce text
    await expect(page.getByTestId('insight-text')).not.toBeEmpty({ timeout: 10000 });

    const text = await page.getByTestId('insight-text').textContent();
    expect(text!.length).toBeGreaterThan(20);
  });

  test('insight gerado aparece no historico', async ({ page }) => {
    await page.getByTestId('menu-insights').click();
    await page.getByTestId('btn-generate-insight').click();
    await expect(page.getByTestId('insight-text')).not.toBeEmpty({ timeout: 10000 });

    // History should have at least one item
    const historyList = page.getByTestId('insight-history-list');
    await expect(historyList).not.toBeEmpty({ timeout: 5000 });
  });

  test('botao insight no header gera analise e mostra no card', async ({ page }) => {
    await page.getByTestId('btn-ai-insight').click();

    // AI card text should populate
    await expect(page.getByTestId('ai-text')).not.toBeEmpty({ timeout: 10000 });
  });
});
