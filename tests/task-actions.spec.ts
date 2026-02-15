import { test, expect } from '@playwright/test';
import { login } from './utils';

test.describe('Task Actions (Edit/Delete)', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/inbox');
  });

  test('should edit and delete a task', async ({ page }) => {
    // Listen to browser console logs
    page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));

    // Clear filters to see all tasks
    await page.getByText('Clear').click();

    // 1. Create a task first
    const taskTitle = 'Task to Edit ' + Date.now();
    await page.getByTestId('btn-new-task-main').click();
    await page.getByTestId('tab-manual').click();
    await page.getByTestId('input-title').fill(taskTitle);
    await page.getByTestId('btn-create-task').click();
    
    // Wait for it to appear
    await expect(page.getByText(taskTitle)).toBeVisible();

    // 2. Edit the task
    // Scope to the specific task item
    const taskRow = page.getByTestId('task-item').filter({ hasText: taskTitle });
    
    // Hover to show actions
    await taskRow.hover();
    
    // Click edit button inside that row
    await taskRow.getByTitle('Edit').click(); // Using direct getByTitle is cleaner if scoped
    
    // Valid modal opened with data
    await expect(page.getByTestId('new-task-modal')).toBeVisible();
    await expect(page.getByTestId('input-title')).toHaveValue(taskTitle);
    
    // Change title
    const newTitle = taskTitle + ' (Edited)';
    await page.getByTestId('input-title').fill(newTitle);
    console.log('Filled new title:', newTitle);
    
    // Save (button text should be 'Save Changes' but ID is same)
    // Debug: Log the button HTML to verify HMR updates
    const btnHtml = await page.getByTestId('btn-create-task').evaluate(el => el.outerHTML);
    console.log('DEBUG BUTTON HTML:', btnHtml);

    // Verify update
    // Wait for task to appear, use a slightly longer timeout for the filter
    await page.screenshot({ path: 'test-results/edit-modal-open.png' });
    
    // Save by clicking the button
    await page.getByTestId('btn-create-task').click({ force: true });
    
    // Give it a tiny bit of time to start the animation if any
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/after-save-click.png' });

    // Ensure modal is gone - this implicitly waits for the save operation to finish
    await expect(page.getByTestId('new-task-modal')).not.toBeVisible({ timeout: 10000 });
    console.log('Modal closed, synced.');

    // Explicitly reload to fetch latest data and wait for network to settle
    await page.reload({ waitUntil: 'networkidle' });

    // Verify update
    // Wait for task to appear, use a slightly longer timeout for the filter
    await expect(page.getByText(newTitle)).toBeVisible({ timeout: 10000 });
    // Verify old title is gone (might take a moment for sync, but UI should be optimistic or fast)
    await expect(page.getByText(taskTitle)).not.toBeVisible();
    
    // 3. Delete the task
    // Handle dialog BEFORE clicking
    page.once('dialog', dialog => dialog.accept());
    
    // Re-scope to new title
    const updatedRow = page.getByTestId('task-item').filter({ hasText: newTitle });
    await updatedRow.hover();
    await updatedRow.getByTitle('Delete').click();
    
    // Verify deletion
    await expect(page.getByText(newTitle)).not.toBeVisible();
  });
});
