/// <reference types="node" />
import { test, expect } from './auth';

test.describe('Settings Navigation & Theme', () => {
  test('Settings is not in the sidebar nav list', async ({ loggedInPage: page }) => {
    await page.goto('/');
    await expect(page.getByTestId('nav-item-settings')).not.toBeVisible();
  });

  test('Settings link in sidebar footer navigates to /settings', async ({ loggedInPage: page }) => {
    await page.goto('/');
    const settingsLink = page.locator('aside a[href="/settings"]');
    await expect(settingsLink).toBeVisible({ timeout: 5000 });
    await settingsLink.click();
    await expect(page).toHaveURL('/settings');
  });

  test('Settings page has Appearance section above Integrations', async ({ loggedInPage: page }) => {
    await page.goto('/settings');
    const sections = page.locator('h2');
    const firstSection = sections.first();
    await expect(firstSection).toHaveText('Appearance');
  });

  test('Appearance section shows Light, Dark, System buttons', async ({ loggedInPage: page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('button', { name: /light/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /dark/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /system/i })).toBeVisible();
  });

  test('Selecting Dark theme persists after page reload', async ({ loggedInPage: page }) => {
    await page.goto('/settings');
    await page.getByRole('button', { name: /dark/i }).click();
    await expect(page.locator('html')).toHaveAttribute('class', /dark/);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('class', /dark/);
  });

  test('Selecting Light theme persists after page reload', async ({ loggedInPage: page }) => {
    await page.goto('/settings');
    await page.getByRole('button', { name: /light/i }).click();
    await expect(page.locator('html')).not.toHaveAttribute('class', /dark/);
    await page.reload();
    await expect(page.locator('html')).not.toHaveAttribute('class', /dark/);
  });
});
