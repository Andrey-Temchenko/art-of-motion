import {test as setup} from '@playwright/test';
import path from 'path';

const authFileUser = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate as regular user', async ({page}) => {
  // Ensure the directory exists
  const email = process.env.TEST_USER_EMAIL || 'user@test.com';
  const password = process.env.TEST_USER_PASSWORD || 'TestPass123!';

  await page.goto('/login');

  // Fill the login form
  const emailInput = page.getByTestId('login-email-input');
  const passwordInput = page.getByTestId('login-password-input');
  const submitBtn = page.getByTestId('login-submit-btn');

  await emailInput.waitFor({state: 'visible'});
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await submitBtn.click();

  try {
    // Wait for successful redirect away from login page
    await page.waitForURL(url => !url.pathname.includes('/login'), {timeout: 10000});
  } catch (e) {
    console.error('FAILED TO REDIRECT. PAGE TEXT:');
    console.error(await page.innerText('body'));
    throw e;
  }

  // Save the authenticated state
  await page.context().storageState({path: authFileUser});
});
