import { test, expect } from './auth';

async function openNewTaskModal(page: import('@playwright/test').Page) {
  const sidebarBtn = page.getByTestId('btn-new-task-sidebar');
  const fabBtn = page.getByTestId('btn-new-task-fab');
  const inboxBtn = page.getByTestId('btn-new-task-main');
  
  await page.waitForTimeout(1000);
  
  if (await sidebarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await sidebarBtn.click();
  } else if (await fabBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await fabBtn.click({ force: true });
  } else if (await inboxBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await inboxBtn.click();
  } else {
    throw new Error('No New Task button found');
  }
}

test.describe('Task Reordering (Drag and Drop)', () => {
  test.beforeEach(async ({ loggedInPage: page }) => {
    // Go to Anytime view since tasks there don't have set dates,
    // which makes testing the list ordering much easier.
    await page.goto('/anytime');
  });

  test('should reorder tasks via drag and drop and persist across reload', async ({ loggedInPage: page }) => {
    // 1. Create two new tasks
    const task1Title = 'Drag Task 1 ' + Date.now();
    const task2Title = 'Drag Task 2 ' + Date.now();
    
    // Helper to create tasks
    const createTask = async (title: string) => {
      await openNewTaskModal(page);
      await page.getByTestId('tab-manual').click();
      await page.getByTestId('input-title').fill(title);
      await page.getByTestId('btn-create-task').click();
      await expect(page.getByText(title)).toBeVisible({ timeout: 10000 });
    };

    await createTask(task1Title);
    await createTask(task2Title);

    // 2. Perform the drag
    // Since task 2 was created latest, it appears at the top initially (`createdAt` desc)
    const task1 = page.getByTestId('task-item').filter({ hasText: task1Title });
    const task2 = page.getByTestId('task-item').filter({ hasText: task2Title });

    // Drag task 1 (bottom) to task 2 (top) position
    // We use explicit mouse moves since Framer Motion's Reorder relies on realistic pointer events
    const box1 = await task1.boundingBox();
    const box2 = await task2.boundingBox();
    
    if (box1 && box2) {
      await task1.hover();
      await page.mouse.down();
      // Break drag threshold
      await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2 - 20, { steps: 5 });
      await page.waitForTimeout(100);
      
      // Move past the center line of task 2 to ensure swapping
      await page.mouse.move(box2.x + box2.width / 2, box2.y + 5, { steps: 20 });
      // Give it a tiny bit of time to register the overlap internally before releasing
      await page.waitForTimeout(500); 
      await page.mouse.up();
    } else {
      await task1.dragTo(task2);
    }

    // Give some time for the Framer Motion animation to settle and the Firestore batch to commit
    await page.waitForTimeout(2000);

    // 3. Reload the page to test true database persistence (Scenario 1 Requirement)
    await page.reload();
    
    await expect(page.getByText(task1Title)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(task2Title)).toBeVisible({ timeout: 10000 });

    // Verify task1 is now situated visually above task2 after reloading 
    const items = page.getByTestId('task-item');
    const allText = await items.allTextContents();
    
    const index1 = allText.findIndex(text => text.includes(task1Title));
    const index2 = allText.findIndex(text => text.includes(task2Title));
    
    expect(index1).not.toBe(-1);
    expect(index2).not.toBe(-1);
    expect(index1).toBeLessThan(index2);
  });
});
