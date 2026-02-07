import { test, expect } from '@playwright/test';

test.describe('Analise da IA', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/test-drive');
    await page.getByTestId('btn-demo-data').click();
    await page.getByTestId('btn-view-dashboard').first().click();
    await expect(page).toHaveURL(/#\/dashboard/);
  });

  test('deve exibir card de analise IA', async ({ page }) => {
    await expect(page.getByTestId('ai-insight-card')).toBeVisible();
    await expect(page.getByTestId('btn-ai-analyze')).toBeVisible();
  });

  test('deve mostrar analise com efeito typing ao clicar', async ({ page }) => {
    await page.getByTestId('btn-ai-analyze').click();

    // Aguarda o texto comecar a aparecer
    await expect(page.getByTestId('ai-insight-text')).toBeVisible({ timeout: 3000 });

    // Verifica que contem conteudo relevante
    await expect(page.getByTestId('ai-insight-text')).not.toBeEmpty();
  });

  test('deve mostrar limite gratuito apos analise', async ({ page }) => {
    await page.getByTestId('btn-ai-analyze').click();

    // Aguarda analise completar (typing ~3 segundos)
    await expect(page.getByTestId('ai-free-limit')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('ai-free-limit')).toContainText('1 de 1');
  });

  test('botao deve desaparecer apos usar analise', async ({ page }) => {
    await page.getByTestId('btn-ai-analyze').click();
    await expect(page.getByTestId('btn-ai-analyze')).not.toBeVisible({ timeout: 5000 });
  });

});
