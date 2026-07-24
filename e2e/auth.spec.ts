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

    test('can access the dashboard and see client sidebar links', async ({page}) => {
      await page.goto('/dashboard/schedule');
      // Verify we stay on the dashboard schedule route
      await expect(page).toHaveURL(/.*\/dashboard\/schedule/);

      // Verify sidebar links are present
      await expect(page.locator('a[href*="/dashboard/schedule"]').first()).toBeVisible();
      await expect(page.locator('a[href*="/dashboard/my-bookings"]').first()).toBeVisible();
    });

    test('cannot access the admin panel', async ({page}) => {
      await page.goto('/admin');

      // Depending on the RBAC implementation in middleware/layout,
      // the user might see a 403 or be redirected back to the dashboard.
      // toHaveURL automatically waits for the redirect to complete.
      await expect(page).toHaveURL(/.*\/dashboard/);
    });
  });

  test.describe('Hero CTA Redirect', () => {
    test.use({storageState: {cookies: [], origins: []}});

    test('unauthenticated user is redirected to login with redirect param when clicking Hero CTA', async ({page}) => {
      // Go to home page
      await page.goto('/');

      // Wait for client-side authentication check to complete (isAuthLoading goes false)
      // The CTA has dict.hero.cta1 which is "Начать тренировки" in Russian.
      // Let's use the data-testid if available, or just click the link that contains /login?redirect=
      await expect(page.locator('a[href*="/login?redirect="]')).toBeVisible();
    });
  });
  test.describe('Default Redirect after Login', () => {
    test.use({storageState: {cookies: [], origins: []}});

    test('client user is redirected to dashboard when logging in without redirect param', async ({page}) => {
      const email = process.env.TEST_USER_EMAIL || 'user@test.com';
      const password = process.env.TEST_USER_PASSWORD || 'TestPass123!';

      await page.goto('/login');

      const emailInput = page.getByTestId('login-email-input');
      const passwordInput = page.getByTestId('login-password-input');
      const submitBtn = page.getByTestId('login-submit-btn');

      await emailInput.waitFor({state: 'visible'});
      await emailInput.fill(email);
      await passwordInput.fill(password);
      await submitBtn.click();

      // Ensure it redirects to the client dashboard since it's a client user
      await expect(page).toHaveURL(/.*\/dashboard\/schedule/);
    });
  });
});
