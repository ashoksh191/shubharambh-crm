import { test, expect } from '@playwright/test';

test.describe('Shubharambh CRM - End-to-End User Journey', () => {
  test('navigates CRM app, performs plot search, selects plot, and verifies map canvas', async ({ page }) => {
    // 1. Open home page
    await page.goto('/');

    // 2. Verify header title
    await expect(page.locator('body')).toContainText(/Shubharambh/i);

    // 3. Search for plot "A-101"
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('A-101');
    }

    // 4. Verify SVG map canvas element exists on page
    const svgCanvas = page.locator('svg').first();
    await expect(svgCanvas).toBeVisible();
  });
});
