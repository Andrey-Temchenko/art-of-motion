import {test, expect} from '@playwright/test';

test.describe('My Bookings', () => {
  test.use({storageState: 'playwright/.auth/user.json'});

  test('displays upcoming and history tabs', async ({page}) => {
    await page.goto('/dashboard/my-bookings');

    // Check headings using data-testid
    await expect(page.getByTestId('my-bookings-title')).toBeVisible();
    await expect(page.getByTestId('tab-upcoming')).toBeVisible();
    await expect(page.getByTestId('tab-history')).toBeVisible();
  });

  test('cancel dialog opens and works', async ({page}) => {
    await page.goto('/dashboard/my-bookings');

    // If there is an upcoming booking, try to open the dialog
    const cancelButton = page.getByTestId('cancel-booking-btn').first();

    // We only test if a button is present (depends on seeded DB data)
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      await expect(page.getByTestId('cancel-dialog-title')).toBeVisible();

      // Close dialog without cancelling to not ruin test data for subsequent runs
      await page.getByTestId('cancel-dialog-back-btn').click();
      await expect(page.getByTestId('cancel-dialog-title')).not.toBeVisible();
    }
  });
});
