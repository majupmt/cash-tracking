import { test, expect } from '@playwright/test';

test.describe('Autenticacao', () => {

  test('deve exibir tela de login', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('btn-login')).toBeVisible();
    await expect(page.getByTestId('btn-comecar')).toBeVisible();
  });

  test('deve mostrar erro com credenciais invalidas', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('login-email').fill('invalido@email.com');
    await page.getByTestId('login-password').fill('senhaerrada');
    await page.getByTestId('btn-login').click();
    await expect(page.getByTestId('login-error')).toBeVisible();
  });

  test('deve navegar para tela de registro', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('link-criar-conta').click();
    await expect(page).toHaveURL(/#\/registro/);
    await expect(page.getByTestId('register-name')).toBeVisible();
  });

  test('deve registrar novo usuario', async ({ page }) => {
    await page.goto('/#/registro');
    await page.getByTestId('register-name').fill('Maria Teste');
    await page.getByTestId('register-email').fill(`teste${Date.now()}@email.com`);
    await page.getByTestId('register-password').fill('senha12345');
    await page.getByTestId('btn-register').click();
    await expect(page).toHaveURL(/#\/dashboard/, { timeout: 5000 });
  });

});
