import { test, expect } from '@playwright/test';

test.describe('Autenticacao', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('screen-welcome')).toBeVisible();
  });

  test('deve exibir tela de welcome com botoes', async ({ page }) => {
    await expect(page.getByTestId('btn-go-login')).toBeVisible();
    await expect(page.getByTestId('btn-go-signup')).toBeVisible();
  });

  test('deve navegar para tela de login', async ({ page }) => {
    await page.getByTestId('btn-go-login').click();
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('btn-login')).toBeVisible();
  });

  test('deve mostrar erro com credenciais invalidas', async ({ page }) => {
    await page.getByTestId('btn-go-login').click();
    await page.getByTestId('login-email').fill('invalido@email.com');
    await page.getByTestId('login-password').fill('senhaerrada');
    await page.getByTestId('btn-login').click();
    await expect(page.getByTestId('login-error')).toBeVisible();
  });

  test('deve navegar para tela de registro', async ({ page }) => {
    await page.getByTestId('btn-go-signup').click();
    await expect(page.getByTestId('signup-name')).toBeVisible();
    await expect(page.getByTestId('signup-email')).toBeVisible();
    await expect(page.getByTestId('signup-password')).toBeVisible();
  });

  test('deve registrar novo usuario', async ({ page }) => {
    await page.getByTestId('btn-go-signup').click();
    await page.getByTestId('signup-name').fill('Maria Teste');
    await page.getByTestId('signup-email').fill(`teste${Date.now()}@email.com`);
    await page.getByTestId('signup-password').fill('senha12345');
    await page.getByTestId('btn-signup').click();
    // After registration, user navigates to testdrive screen
    await expect(page.getByTestId('screen-testdrive')).toBeVisible({ timeout: 5000 });
  });

});
