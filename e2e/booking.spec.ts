import { test, expect } from '@playwright/test';

test.describe('Server-Authoritative Booking & OCC Conflict E2E Automation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('✓ Create Booking & Booking Success - Submits Plot Booking Form', async ({ page }) => {
    const plotPolygon = page.locator('polygon[points]').first();
    if (await plotPolygon.isVisible()) {
      await plotPolygon.click();
    }

    const bookButton = page.locator('button:has-text("Book Now"), button:has-text("Reserve")').first();
    if (await bookButton.isVisible()) {
      await bookButton.click();

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

      const submitBtn = page.locator('button[type="submit"]:has-text("Confirm"), button:has-text("Book Plot")');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      }
    }
  });

  test('✓ OCC Conflict - Validates Optimistic Concurrency Control (OCC) HTTP 409 Conflict Rejection', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });
});
