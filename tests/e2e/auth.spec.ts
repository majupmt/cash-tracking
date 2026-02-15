import { test, expect } from '@playwright/test';

test.describe('Autenticacao', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('screen-welcome')).toBeVisible();
  });

  // --- Welcome screen ---

  test('tela welcome exibe botoes de login e signup', async ({ page }) => {
    await expect(page.getByTestId('btn-go-login')).toBeVisible();
    await expect(page.getByTestId('btn-go-signup')).toBeVisible();
    await expect(page.getByTestId('link-test-drive')).toBeVisible();
  });

  // --- Login navigation ---

  test('botao "Entrar" navega para tela de login', async ({ page }) => {
    await page.getByTestId('btn-go-login').click();
    await expect(page.getByTestId('screen-login')).toBeVisible();
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('btn-login')).toBeVisible();
  });

  test('botao voltar na tela de login retorna ao welcome', async ({ page }) => {
    await page.getByTestId('btn-go-login').click();
    await expect(page.getByTestId('screen-login')).toBeVisible();
    await page.getByTestId('login-back').click();
    await expect(page.getByTestId('screen-welcome')).toBeVisible();
  });

  // --- Login validation ---

  test('botao login fica desabilitado ate preencher email e senha', async ({ page }) => {
    await page.getByTestId('btn-go-login').click();
    await expect(page.getByTestId('btn-login')).toBeDisabled();

    await page.getByTestId('login-email').fill('a@b.com');
    await expect(page.getByTestId('btn-login')).toBeDisabled();

    await page.getByTestId('login-password').fill('123456');
    await expect(page.getByTestId('btn-login')).toBeEnabled();
  });

  test('login com credenciais invalidas mostra erro', async ({ page }) => {
    await page.getByTestId('btn-go-login').click();
    await page.getByTestId('login-email').fill('naoexiste@email.com');
    await page.getByTestId('login-password').fill('senhaerrada');
    await page.getByTestId('btn-login').click();
    await expect(page.getByTestId('login-error')).toBeVisible();
    const errorText = await page.getByTestId('login-error').textContent();
    expect(errorText!.length).toBeGreaterThan(0);
  });

  // --- Signup navigation ---

  test('botao "Criar conta" navega para tela de signup', async ({ page }) => {
    await page.getByTestId('btn-go-signup').click();
    await expect(page.getByTestId('screen-signup')).toBeVisible();
    await expect(page.getByTestId('signup-name')).toBeVisible();
    await expect(page.getByTestId('signup-email')).toBeVisible();
    await expect(page.getByTestId('signup-password')).toBeVisible();
  });

  test('botao voltar na tela de signup retorna ao welcome', async ({ page }) => {
    await page.getByTestId('btn-go-signup').click();
    await page.getByTestId('signup-back').click();
    await expect(page.getByTestId('screen-welcome')).toBeVisible();
  });

  // --- Signup validation ---

  test('botao signup fica desabilitado ate preencher todos campos', async ({ page }) => {
    await page.getByTestId('btn-go-signup').click();
    await expect(page.getByTestId('btn-signup')).toBeDisabled();

    await page.getByTestId('signup-name').fill('Jo');
    await expect(page.getByTestId('btn-signup')).toBeDisabled();

    await page.getByTestId('signup-email').fill('jo@test.com');
    await expect(page.getByTestId('btn-signup')).toBeDisabled();

    await page.getByTestId('signup-password').fill('12345678');
    await expect(page.getByTestId('btn-signup')).toBeEnabled();
  });

  // --- Signup success ---

  test('registrar novo usuario redireciona ao test-drive', async ({ page }) => {
    await page.getByTestId('btn-go-signup').click();
    await page.getByTestId('signup-name').fill('Maria Teste');
    await page.getByTestId('signup-email').fill(`teste${Date.now()}@email.com`);
    await page.getByTestId('signup-password').fill('senha12345');
    await page.getByTestId('btn-signup').click();
    await expect(page.getByTestId('screen-testdrive')).toBeVisible({ timeout: 5000 });
  });

  // --- Test drive shortcut ---

  test('botao test-drive no signup navega direto', async ({ page }) => {
    await page.getByTestId('btn-go-signup').click();
    await page.getByTestId('btn-signup-testdrive').click();
    await expect(page.getByTestId('screen-testdrive')).toBeVisible();
  });
});
