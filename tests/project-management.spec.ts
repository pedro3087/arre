import { test, expect } from './auth';

test.describe('Project management', () => {
  
  test.beforeEach(async ({ loggedInPage: page }) => {
  });
  test.skip('should create a project, assign tasks to it, and verify grouping', async ({ loggedInPage: page }) => {
    test.slow(); // Allow 3x timeout for emulator operations
    
    console.log('START: Project Management Test');
    
    // Listen to browser console logs
    page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));

    const projectName = 'Test Project ' + Date.now();
    const taskTitle = 'Task in Project ' + Date.now();

    // 1. Create a Project
    process.stderr.write('STEP 1: Navigate to Inbox\n');
    await page.goto('/inbox');
    
    process.stderr.write('STEP 2: Open Project Modal\n');
    await page.getByTestId('btn-new-project').click();
    
    process.stderr.write('STEP 3: Fill Project Data\n');
    // Expect modal
    await expect(page.getByTestId('project-modal')).toBeVisible();
    
    // Fill title
    await page.getByTestId('project-title-input').fill(projectName);
    
    // Select color (e.g., Emerald)
    await page.getByTestId('color-emerald').click();
    
    // Save - Use Enter key to avoid potential click interception
    process.stderr.write('STEP 4: Trigger Save (Enter)\n');
    await page.getByTestId('project-title-input').press('Enter');
    process.stderr.write('STEP 4: Save Triggered\n');
    
    // Verify modal closed and project appears in sidebar
    await expect(page.getByTestId('project-modal')).not.toBeVisible();
    // Wait for Firestore sync to update sidebar
    await page.waitForTimeout(500); 
    await expect(page.locator('nav').getByText(projectName)).toBeVisible();

    process.stderr.write('STEP 5: Create Task\n');
    // 2. Create a Task assigned to this Project
    // Open new task modal
    await page.getByTestId('btn-new-task-sidebar').click();
    
    // Switch to manual mode
    await page.getByTestId('tab-manual').click();
    
    // Fill details
    await page.getByTestId('input-title').fill(taskTitle);
    
    process.stderr.write('STEP 6: Assign Project\n');
    // Select project - Wait for options to populate if needed
    // Playwright auto-waits, but let's be safe with timeout
    try {
      await page.getByTestId('select-project').selectOption({ label: projectName });
    } catch (e) {
      console.log('Select option failed, dumping HTML:', await page.getByTestId('select-project').innerHTML());
      throw e;
    }
    
    // Create
    await page.getByTestId('btn-create-task').click();
    
    process.stderr.write('STEP 7: Verify Grouping\n');
    // 3. Verify Task displays Project Badge
    
    // Let's navigate to "Anytime" view where grouped projects appear.
    await page.goto('/anytime');
    await page.waitForTimeout(1000); // Allow view to hydrate

    
    // 4. Verify Project Grouping in Anytime view
    // Look for a header or section with project name
    await expect(page.getByText(projectName)).toBeVisible(); // Header
    
    // Verify task is visible under it?
    // We can check if the task text is visible on page.
    await expect(page.getByText(taskTitle)).toBeVisible();
    
    // Verify badge on task item?
    // TaskItem usually renders project dot/name.
    // Let's scope to the task row
    const taskRow = page.getByTestId('task-item').filter({ hasText: taskTitle });
    
    // Check if project name is visible inside the task row (the badge)
    await expect(taskRow.getByText(projectName)).toBeVisible();

    // 5. Delete Project
    // Hover sidebar item to show edit button (assuming desktop)
    
    // Find the sidebar list item containing the project name
    const sidebarRow = page.getByRole('listitem').filter({ hasText: projectName }).first();
    await sidebarRow.hover();
    
    // Click edit button
    await sidebarRow.getByTitle('Edit Project').click();
    
    // Modal opens
    await expect(page.getByTestId('project-modal')).toBeVisible();
    await expect(page.getByTestId('project-title-input')).toHaveValue(projectName);
    
    // Delete
    // Handle dialog if any? ProjectModal usually asks confirmation or just deletes?
    // Let's assume it might have a confirmation if it's destructive, but handoff doesn't mention it.
    // Handoff says: "ProjectModal component ... Create/edit/delete projects".
    // Let's assume standard delete button click.
    
    // If there is a confirmation dialog, we need to handle it.
    // Safe to add page.once('dialog', ...) just in case.
    page.once('dialog', dialog => dialog.accept());
    
    await page.getByTestId('btn-delete-project').click();
    
    // Verify deleted
    await expect(page.getByTestId('project-modal')).not.toBeVisible();
    await expect(page.locator('nav').getByText(projectName)).not.toBeVisible();
  });
});
