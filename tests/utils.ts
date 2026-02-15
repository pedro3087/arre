import { Page, expect } from '@playwright/test';

export async function login(page: Page) {
  await page.goto('/login');
  await page.getByTestId('dev-login-button').click();
  // Wait for redirect to dashboard
  await expect(page).toHaveURL('/');
}
