import { test, expect } from '@playwright/test';
import { login } from './utils';

test.describe('Task Actions (Edit/Delete)', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/inbox');
  });

  // TODO: persistent timeout in emulator. Skip until fixed.
  test.skip('should edit and delete a task', async ({ page }) => {
    // Listen for logs
    page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));

    // Clear filters
    await page.getByText('Clear').click();

    // Force actions visible for testing reliability
    await page.addStyleTag({ content: '[class*="actions"] { opacity: 1 !important; }' });

    // 1. Create task
    const taskTitle = 'Task to Edit ' + Date.now();
    await page.getByTestId('btn-new-task-main').click();
    await page.getByTestId('tab-manual').click();
    await page.getByTestId('input-title').fill(taskTitle);
    await page.getByTestId('btn-create-task').click();
    
    // Check created
    await expect(page.getByText(taskTitle)).toBeVisible();

    // 2. Edit task
    const taskRow = page.getByTestId('task-item').filter({ hasText: taskTitle });
    
    // Hover if desktop (try-catch for mobile)
    try { await taskRow.hover({ timeout: 1000 }); } catch {}
    
    await taskRow.getByTitle('Edit').click();
    
    // Wait for modal
    await expect(page.getByTestId('new-task-modal')).toBeVisible();
    await expect(page.getByTestId('input-title')).toHaveValue(taskTitle);
    
    // Change title
    const newTitle = taskTitle + ' (Edited)';
    await page.getByTestId('input-title').fill(newTitle);
    
    // Save
    await page.getByTestId('btn-create-task').click({ force: true });
    
    // Wait for modal close
    await expect(page.getByTestId('new-task-modal')).not.toBeVisible();

    // Verify update
    console.log(`Waiting for new title: "${newTitle}"`);
    await expect(page.getByText(newTitle)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(taskTitle)).not.toBeVisible();
    
    // 3. Delete task
    page.once('dialog', dialog => dialog.accept());
    
    const updatedRow = page.getByTestId('task-item').filter({ hasText: newTitle });
    try { await updatedRow.hover({ timeout: 1000 }); } catch {}
    
    await updatedRow.getByTitle('Delete').click();
    
    // Verify deletion
    await expect(page.getByText(newTitle)).not.toBeVisible();
  });
});
