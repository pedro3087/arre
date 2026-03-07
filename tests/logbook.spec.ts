import { test, expect } from './auth';

test.describe('Logbook View', () => {
  test.beforeEach(async ({ loggedInPage: page }) => {
    await page.goto('/inbox');
    await page.getByText('Clear').click();
  });

  test('should display completed tasks in the logbook', async ({ loggedInPage: page }) => {
    // 1. Create a task to complete
    const taskTitle = 'Logbook Test Task ' + Date.now();
    await page.getByTestId('btn-new-task-main').click();
    await page.getByTestId('tab-manual').click();
    await page.getByTestId('input-title').fill(taskTitle);
    await page.getByTestId('btn-create-task').click();
    
    // Check created
    await expect(page.getByText(taskTitle)).toBeVisible();

    // 2. Mark the task as complete
    const taskRow = page.getByTestId('task-item').filter({ hasText: taskTitle });
    await taskRow.locator('button[aria-label="Mark as complete"]').click();

    // Verify it disappears from inbox
    await expect(page.getByText(taskTitle)).not.toBeVisible();

    // 3. Navigate to Logbook
    await page.getByRole('link', { name: 'Logbook' }).click();
    await expect(page).toHaveURL('/logbook');

    // 4. Verify the task appears in the logbook
    await expect(page.getByRole('heading', { name: 'Logbook', exact: true })).toBeVisible();
    await expect(page.getByText(taskTitle)).toBeVisible();
    
    // 5. Uncheck the task to verify it can be restored (optional, but good for coverage)
    const logbookRow = page.getByTestId('task-item').filter({ hasText: taskTitle });
    await logbookRow.locator('button[aria-label="Mark as incomplete"]').click();
    
    // Verify it disappears from logbook
    await expect(page.getByText(taskTitle)).not.toBeVisible();
  });
});
