import {test, expect} from '@playwright/test';

test.describe('Authentication and Route Protection', () => {
  test.describe('Unauthenticated user', () => {
    // Clear storage state so the user is completely unauthenticated
    test.use({storageState: {cookies: [], origins: []}});

    test('is redirected to /login when attempting to access /dashboard', async ({page}) => {
      await page.goto('/dashboard');
      // The middleware should redirect unauthenticated users to the login page
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('is redirected to /login when attempting to access /admin', async ({page}) => {
      await page.goto('/admin');
      await expect(page).toHaveURL(/.*\/login/);
    });
  });

  test.describe('Authenticated user', () => {
    // Use the saved authentication state from auth.setup.ts
    test.use({storageState: 'playwright/.auth/user.json'});

    test('can access the dashboard', async ({page}) => {
      await page.goto('/dashboard');
      // Verify we stay on the dashboard route
      await expect(page).toHaveURL(/.*\/dashboard/);

      // Optional: Verify that a logout button or dashboard title exists
      // await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('cannot access the admin panel', async ({page}) => {
      await page.goto('/admin');

      // Depending on the RBAC implementation in middleware/layout,
      // the user might see a 403 or be redirected back to the dashboard.
      // toHaveURL automatically waits for the redirect to complete.
      await expect(page).toHaveURL(/.*\/dashboard/);
    });
  });
});
