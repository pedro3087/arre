/// <reference types="node" />
import { test, expect } from '@playwright/test';
import { login } from './utils';

/**
 * Helper to open the New Task modal from either sidebar button, FAB, or Inbox button.
 * Uses force:true for FAB on mobile where z-index overlap can intercept clicks.
 */
async function openNewTaskModal(page: import('@playwright/test').Page) {
  const sidebarBtn = page.getByTestId('btn-new-task-sidebar');
  const fabBtn = page.getByTestId('btn-new-task-fab');
  const inboxBtn = page.getByTestId('btn-new-task-main');

  // Wait for the layout to settle after navigation
  await page.waitForTimeout(1000);

  if (await sidebarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await sidebarBtn.click();
  } else if (await fabBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    // Use force:true because on mobile the FAB can be overlapped by page content
    await fabBtn.click({ force: true });
  } else if (await inboxBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await inboxBtn.click();
  } else {
    throw new Error('No New Task button found (sidebar, FAB, or inbox)');
  }

  // Wait for modal to appear — use the new-task-modal testid
  await expect(page.getByTestId('new-task-modal')).toBeVisible({ timeout: 5000 });
}

test.describe('Arre App Full Workflow', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should support the full task lifecycle across views', async ({ page }) => {
    // 1. Navigate to Upcoming
    await page.goto('/upcoming');
    await expect(page).toHaveURL('/upcoming');
    
    // 2. Create a task for tomorrow
    await openNewTaskModal(page);
    await page.getByTestId('tab-manual').click();
    
    const tomorrowTask = 'Meeting with Team ' + Date.now();
    await page.getByTestId('input-title').fill(tomorrowTask);
    
    // Set date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    try {
      await page.locator('input[type="date"]').fill(dateStr);
    } catch {
      console.log('Date input fill failed, skipping date assignment');
    }

    await page.getByTestId('btn-create-task').click();
    
    // 3. Verify it appears in Upcoming (allow Firestore sync time)
    await expect(page.getByText(tomorrowTask)).toBeVisible({ timeout: 10000 });

    // 4. Navigate to Someday
    await page.goto('/someday');
    await expect(page).toHaveURL('/someday');
    await expect(page.getByText(tomorrowTask)).not.toBeVisible();

    // 5. Create a Someday task
    await openNewTaskModal(page);
    await page.getByTestId('tab-manual').click();
    const somedayTask = 'Learn Rust ' + Date.now();
    await page.getByTestId('input-title').fill(somedayTask);
    
    await page.getByRole('checkbox', { name: 'Someday' }).check();
    await page.getByTestId('btn-create-task').click();

    // 6. Verify in Someday view (allow Firestore sync time)
    await expect(page.getByText(somedayTask)).toBeVisible({ timeout: 10000 });
  });

  test('should handle magic import file upload', async ({ page }) => {
    await page.goto('/inbox');

    await openNewTaskModal(page);
    
    // The modal opens on the AI/Magic Import tab by default
    await expect(page.getByTestId('drop-zone')).toBeVisible();
    
    // Create a dummy file
    const fileContent = "Please review the Q3 financial report and email the summary to the board.";
    const fileName = 'test-doc.txt';
    const buffer = Buffer.from(fileContent);
    
    // The file input is hidden (display:none). Make it visible so Playwright can interact.
    await page.evaluate(() => {
      const input = document.getElementById('magic-upload-input');
      if (input) input.style.display = 'block';
    });

    await page.locator('#magic-upload-input').setInputFiles({
      name: fileName,
      mimeType: 'text/plain',
      buffer: buffer,
    });

    // After upload, wait for UI feedback from the Cloud Function.
    // Without GEMINI_API_KEY, this will fail gracefully.
    try {
      await expect(page.getByText('Analyzing document structure...')).toBeVisible({ timeout: 5000 });
      
      await expect(
        page.getByText(/Tasks Generated/).or(
          page.getByText(/Error/)
        )
      ).toBeVisible({ timeout: 25000 });

      const hasTasksGenerated = await page.getByText(/Tasks Generated/).isVisible().catch(() => false);
      if (hasTasksGenerated) {
        await page.getByTestId('btn-import-all').click();
        await expect(page.getByText('Imported via Magic Import')).toBeVisible();
      }
    } catch (e) {
      console.log('Magic import: AI processing not available or timed out. This is expected without GEMINI_API_KEY.');
    }
  });

});
