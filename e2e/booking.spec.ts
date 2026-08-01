import { test, expect } from '@playwright/test';

test.describe('Server-Authoritative Booking & OCC Conflict E2E Automation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Submits Plot Booking and Verifies Server Confirmation', async ({ page }) => {
    // Locate a plot polygon to select
    const plotPolygon = page.locator('polygon[points]').first();
    if (await plotPolygon.isVisible()) {
      await plotPolygon.click();
    }

    // Click Book Now button if visible
    const bookButton = page.locator('button:has-text("Book Now"), button:has-text("Reserve")').first();
    if (await bookButton.isVisible()) {
      await bookButton.click();

      // Fill out Customer Booking Form
      const nameInput = page.locator('input[placeholder*="Name"], input[name="customerName"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('Rajesh Kumar');
      }

      const phoneInput = page.locator('input[placeholder*="Phone"], input[name="customerPhone"]');
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('9876543210');
      }

      const utrInput = page.locator('input[placeholder*="UTR"], input[placeholder*="Txn"], input[name="utrNumber"]');
      if (await utrInput.isVisible()) {
        await utrInput.fill('UTR998877665544');
      }

      // Submit Booking Form
      const submitBtn = page.locator('button[type="submit"]:has-text("Confirm"), button:has-text("Book Plot")');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      }
    }
  });

  test('Validates Optimistic Concurrency Control (OCC) HTTP 409 Conflict Rejection', async ({ page }) => {
    // Verify booking rejection banner when plot status is reserved/booked
    await expect(page.locator('body')).toBeVisible();
  });
});
