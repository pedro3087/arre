import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Extend base test by adding a "loggedInPage" fixture.
export const test = base.extend<{ loggedInPage: Page }>({
  loggedInPage: async ({ page }, use) => {
    // Navigate to the login page
    await page.goto('/login');

    // Click the local "Dev Login" button to authenticate anonymously
    await page.getByTestId('dev-login-button').click();

    // Wait for the application to redirect to the main page after login
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/'); 

    // Use the logged-in page in the test
    await use(page);
  },
});

export { expect } from '@playwright/test';
