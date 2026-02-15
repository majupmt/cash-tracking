import { Page, expect } from '@playwright/test';

/**
 * Shared helpers for all E2E tests.
 * Every helper waits for real DOM elements — no mocks, no fakes.
 */

// Navigate to test-drive screen via UI
export async function goToTestDrive(page: Page) {
  await page.goto('/');
  await page.getByTestId('btn-go-signup').click();
  await page.getByTestId('btn-signup-testdrive').click();
  await expect(page.getByTestId('screen-testdrive')).toBeVisible();
}

// Set revenue, add sample data, and go to dashboard (test-drive mode)
export async function setupDashboard(page: Page, revenue = '4500') {
  await goToTestDrive(page);
  await page.getByTestId('testdrive-revenue').fill(revenue);
  await addManualEntry(page, 'Supermercado', '200', 'gasto', 'Alimentacao');
  await page.getByTestId('btn-go-dashboard').click();
  await expect(page.getByTestId('screen-dashboard')).toBeVisible();
  await expect(page.getByTestId('summary-card-income')).toBeVisible();
}

// Add a manual entry in test-drive
export async function addManualEntry(
  page: Page,
  desc: string,
  value: string,
  type: 'gasto' | 'receita' = 'gasto',
  category = 'Outros'
) {
  await page.getByTestId('tab-manual').click();
  await expect(page.getByTestId('tab-content-manual')).toBeVisible();
  await page.getByTestId('manual-desc').fill(desc);
  await page.getByTestId('manual-value').fill(value);
  await page.getByTestId('manual-type').selectOption(type);
  await page.getByTestId('manual-category').selectOption(category);
  await page.getByTestId('btn-add-manual').click();
}

// Get raw numeric value from a summary card
export async function getRawValue(page: Page, testId: string): Promise<number> {
  const el = page.getByTestId(testId);
  const raw = await el.getAttribute('data-raw-value');
  return parseFloat(raw || '0');
}

// Switch to a dashboard view
export async function switchView(page: Page, menu: string) {
  await page.getByTestId(`menu-${menu}`).click();
  await expect(page.getByTestId(`view-${menu === 'receitas' ? 'transacoes' : menu}`)).toHaveClass(/active/);
}
