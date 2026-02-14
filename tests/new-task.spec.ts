import { test, expect } from '@playwright/test';

test.describe('New Task Modal Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inbox');
    await expect(page.getByTestId('btn-new-task-main')).toBeVisible();
  });

  test('should open and close the modal', async ({ page }) => {
    await page.getByTestId('btn-new-task-main').click();
    
    const modal = page.getByTestId('new-task-modal');
    await expect(modal).toBeVisible();
    
    // Check for unique text inside the modal to confirm content rendered
    await expect(page.getByRole('heading', { name: 'Magic Import', exact: true })).toBeVisible();

    await page.getByTestId('btn-close-modal').click();
    await expect(modal).not.toBeVisible();
  });

  test('should create a manual task', async ({ page }) => {
    await page.getByTestId('btn-new-task-main').click();
    await page.getByTestId('tab-manual').click();
    
    await expect(page.getByRole('heading', { name: 'Create New Task' })).toBeVisible();

    const taskTitle = 'E2E Test Task ' + Date.now();
    await page.getByTestId('input-title').fill(taskTitle);
    
    // Use getByText for pill button which contains lower case text 'high'
    await page.getByText('high', { exact: true }).click();

    await page.getByTestId('btn-create-task').click();

    await expect(page.getByTestId('new-task-modal')).not.toBeVisible();
    await expect(page.getByText(taskTitle)).toBeVisible();
  });

  test('should simulate magic import flow', async ({ page }) => {
    await page.getByTestId('btn-new-task-main').click();
    await expect(page.getByTestId('drop-zone')).toBeVisible();

    await page.getByTestId('drop-zone').click();
    
    // Check loading state
    await expect(page.getByText('Analyzing document structure...')).toBeVisible();
    
    // Check result state
    await expect(page.getByText('3 Tasks Generated')).toBeVisible({ timeout: 10000 });
    
    await page.getByTestId('btn-import-all').click();

    await expect(page.getByTestId('new-task-modal')).not.toBeVisible();
    await expect(page.getByText('Imported Batch')).toBeVisible();
  });
});
