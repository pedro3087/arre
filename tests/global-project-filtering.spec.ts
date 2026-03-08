import { test, expect } from './auth';

test.describe('Global Project Filtering', () => {
  test('should filter tasks globally when a project is selected in the sidebar', async ({ loggedInPage: page }) => {
    test.slow(); // Allow more time for emulator operations

    const projectName = 'Global Filter Proj ' + Date.now();
    const taskProject = 'P-Task ' + Date.now();
    const taskLoose = 'L-Task ' + Date.now();

    // 1. Create a Project
    await page.goto('/inbox');
    await page.getByTestId('btn-new-project').click();
    await page.getByTestId('project-title-input').fill(projectName);
    await page.getByTestId('color-emerald').click();
    await page.getByTestId('project-title-input').press('Enter');

    // Wait for project in sidebar
    const projectItem = page.getByText(projectName);
    await expect(projectItem).toBeVisible({ timeout: 10000 });

    // 2. Create Task 1 assigned to the Project
    await page.getByTestId('btn-new-task-sidebar').click();
    await page.getByTestId('tab-manual').click();
    await page.getByTestId('input-title').fill(taskProject);
    
    // Set energy to high so it shows in Inbox by default
    await page.getByRole('button', { name: 'high', exact: true }).click();
    
    // Playwright select by exact label
    await page.getByTestId('select-project').selectOption({ label: projectName });
    await page.getByTestId('btn-create-task').click();

    // 3. Create Task 2 NOT assigned
    await page.getByTestId('btn-new-task-sidebar').click();
    await page.getByTestId('tab-manual').click();
    await page.getByTestId('input-title').fill(taskLoose);
    
    // Set energy to high
    await page.getByRole('button', { name: 'high', exact: true }).click();
    
    // Explicitly select "None" or leave empty if "None" is default
    await page.getByTestId('select-project').selectOption({ value: '' }); 
    await page.getByTestId('btn-create-task').click();

    // 4. Navigate to Anytime and verify both exist initially
    await page.goto('/anytime');
    await expect(page.getByText(taskProject)).toBeVisible();
    await expect(page.getByText(taskLoose)).toBeVisible();

    // 5. Click the project in the sidebar to activate the filter
    const projectSidebarItem = page.getByRole('listitem').filter({ hasText: projectName });
    await projectSidebarItem.click();

    // 6. Verify only Task 1 is visible in "Anytime"
    // Check for the new indicator I just added to Anytime.tsx
    await expect(page.getByTestId('active-filter-indicator')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(taskProject)).toBeVisible();
    await expect(page.getByText(taskLoose)).not.toBeVisible();

    // 7. Verify the active state styling on the sidebar project item
    await expect(projectSidebarItem).toHaveClass(/activeProject/);

    // 8. Click Inbox in sidebar using the new testid
    await page.getByTestId('nav-item-inbox').click();

    // 9. Verify the filter cleared
    await expect(page.getByTestId('active-filter-indicator')).not.toBeVisible();
    await expect(page.getByText(taskLoose)).toBeVisible();
    
    // Re-verify Anytime also has both if we go back without project selected
    await page.goto('/anytime');
    await expect(page.getByText(taskProject)).toBeVisible();
    await expect(page.getByText(taskLoose)).toBeVisible();
  });
});
