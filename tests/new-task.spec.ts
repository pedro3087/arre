import { test, expect } from '@playwright/test';
import { login } from './utils';

test.describe('New Task Modal Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // 1. Login first
    await login(page);
    
    // 2. Go to inbox
    await page.goto('/inbox');
    
    // Check for either button
    const mainBtn = page.getByTestId('btn-new-task-main');
    const fabBtn = page.getByTestId('btn-new-task-fab');
    
    // One of them should be visible
    await expect(mainBtn.or(fabBtn).first()).toBeVisible();
  });

  const openModal = async (page: any) => {
    const mainBtn = page.getByTestId('btn-new-task-main');
    if (await mainBtn.isVisible()) {
      await mainBtn.click();
    } else {
      // force:true needed on mobile where FAB can be overlapped by page content
      await page.getByTestId('btn-new-task-fab').click({ force: true });
    }
  };

  test('should open and close the modal', async ({ page }) => {
    await openModal(page);
    
    const modal = page.getByTestId('new-task-modal');
    await expect(modal).toBeVisible();
    
    await expect(page.getByRole('heading', { name: 'Magic Import', exact: true })).toBeVisible();

    // force:true needed on mobile where backdrop/content can overlap the close button
    await page.getByTestId('btn-close-modal').click({ force: true });
    // Increase timeout for modal close to handle potentially slow animations in Firefox
    await expect(modal).not.toBeVisible({ timeout: 10000 });
  });

  test('should create a manual task', async ({ page }) => {
    await openModal(page);
    await page.getByTestId('tab-manual').click();
    
    await expect(page.getByRole('heading', { name: 'Create New Task' })).toBeVisible();

    const taskTitle = 'E2E Test Task ' + Date.now();
    await page.getByTestId('input-title').fill(taskTitle);
    
    // Select energy level (rendered as lowercase in the UI)
    const modal = page.getByTestId('new-task-modal');
    await modal.getByText('high', { exact: true }).click();

    await page.getByTestId('btn-create-task').click();

    await expect(page.getByTestId('new-task-modal')).not.toBeVisible();
    
    // Wait for task to appear in list (Firestore sync)
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 10000 });
  });

  test('should verify magic import UI elements', async ({ page }) => {
    await openModal(page);
    await expect(page.getByTestId('drop-zone')).toBeVisible();
    await expect(page.getByText('Drop PDF or CSV here')).toBeVisible();
  });
});
