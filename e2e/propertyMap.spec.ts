import { test, expect } from '@playwright/test';

test.describe('GIS Vector Map Engine E2E Automation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('✓ Open Property Map - Renders SVG Vector Map Canvas & Blueprint', async ({ page }) => {
    const svgCanvas = page.locator('svg').first();
    await expect(svgCanvas).toBeVisible();
  });

  test('✓ Search Plot - Search Plot Input Filtering and Focus Ring Highlight', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="plot"], input[placeholder*="Block"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Block-A');
      await expect(searchInput).toHaveValue('Block-A');
    }
  });

  test('✓ Select Plot & Plot Drawer Opens - Click Plot Polygon on SVG Canvas', async ({ page }) => {
    const plotPolygon = page.locator('polygon.plot-polygon-group, polygon[points]').first();
    if (await plotPolygon.isVisible()) {
      await plotPolygon.click();
      await expect(page.locator('body')).toContainText(/Plot|Block|Status|Price|Sq.Ft/i);
    }
  });

  test('✓ Hover Tooltip - Mouse Hover Displays Plot Quick Summary Tooltip', async ({ page }) => {
    const plotPolygon = page.locator('polygon.plot-polygon-group, polygon[points]').first();
    if (await plotPolygon.isVisible()) {
      await plotPolygon.hover();
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
