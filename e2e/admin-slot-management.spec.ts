import {test, expect} from '@playwright/test';

// Use the admin authentication state for the entire test file
test.use({storageState: 'playwright/.auth/admin.json'});

test.describe.serial('Admin Slot Management', () => {
  // Scenario 1: Cancel Slot
  test('Admin can cancel a slot with existing bookings', async ({page, browser}) => {
    // The slot we added for this test in seed.sql:
    const slotId = 'aaaa0000-0000-0000-0000-000000000004';

    // Admin cancels the slot
    await page.goto(`/admin/slots/${slotId}`);

    // Ensure we are on the slot details page
    await expect(page.getByTestId('edit-slot-btn')).toBeVisible();

    const cancelBtn = page.getByTestId('cancel-slot-btn');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    const confirmBtn = page.getByTestId('cancel-dialog-confirm-btn');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // The cancel & edit buttons should disappear after the slot is cancelled
    await expect(cancelBtn).not.toBeVisible();
    await expect(page.getByTestId('edit-slot-btn')).not.toBeVisible();

    // Now verify the client sees the booking as cancelled
    const userContext = await browser.newContext({storageState: 'playwright/.auth/user.json'});
    const userPage = await userContext.newPage();

    await userPage.goto('/dashboard/my-bookings');

    // Navigate to history tab where cancelled bookings appear
    await userPage.getByTestId('tab-history').click();

    // The booking cascaded from slot cancellation should appear as cancelled.
    // Check for the localized "Cancelled" status text (ru: "Отменено", uk: "Скасовано", en: "Cancelled").
    await expect(userPage.locator('text=Отменено').first().or(userPage.locator('text=Cancelled').first())).toBeVisible({
      timeout: 10000
    });

    await userContext.close();
  });

  // Scenario 2: Edit Slot Time
  test('Admin receives warning when editing time of a booked slot', async ({page}) => {
    // The slot we added for this test in seed.sql:
    const slotId = 'aaaa0000-0000-0000-0000-000000000005';

    await page.goto(`/admin/slots/${slotId}`);

    const editBtn = page.getByTestId('edit-slot-btn');
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // The edit dialog should open and display the warnings
    await expect(page.getByTestId('edit-dialog-title')).toBeVisible();
    await expect(page.getByTestId('edit-dialog-time-warning')).toBeVisible();
    await expect(page.getByTestId('edit-dialog-price-warning')).toBeVisible();

    // Submit without changes - should succeed
    const submitBtn = page.getByTestId('slot-form-submit-btn');
    await submitBtn.click();

    // Dialog should close
    await expect(page.getByTestId('edit-dialog-title')).not.toBeVisible();
  });

  // Scenario 3: Edit Capacity Constraint
  test('Admin cannot reduce capacity below confirmed bookings', async ({page}) => {
    // The slot we added for this test in seed.sql:
    const slotId = 'aaaa0000-0000-0000-0000-000000000006';

    await page.goto(`/admin/slots/${slotId}`);

    const editBtn = page.getByTestId('edit-slot-btn');
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    await expect(page.getByTestId('edit-dialog-title')).toBeVisible();

    const capacityInput = page.getByTestId('slot-form-capacity');
    await capacityInput.fill('1'); // Currently has 2 bookings

    const submitBtn = page.getByTestId('slot-form-submit-btn');
    await submitBtn.click();

    // Toast error should appear
    await expect(page.getByText(/Cannot decrease capacity below current confirmed bookings/i)).toBeVisible({
      timeout: 10000
    });
  });

  // Scenario 4: Cancelled slot does not show edit/cancel buttons
  test('Cancelled slot hides edit and cancel buttons', async ({page}) => {
    // This slot was cancelled by Scenario 1 above
    const cancelledSlotId = 'aaaa0000-0000-0000-0000-000000000004';

    await page.goto(`/admin/slots/${cancelledSlotId}`);

    // The edit and cancel buttons should not be visible for a cancelled slot
    await expect(page.getByTestId('edit-slot-btn')).not.toBeVisible();
    await expect(page.getByTestId('cancel-slot-btn')).not.toBeVisible();
  });
});
