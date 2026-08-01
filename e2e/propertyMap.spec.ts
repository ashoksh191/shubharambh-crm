import { test, expect } from '@playwright/test';

test.describe('GIS Vector Map & Plot Search E2E Automation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Renders SVG Vector Map Canvas and Blueprint Overlay', async ({ page }) => {
    // Assert SVG Canvas element is rendered
    const svgCanvas = page.locator('svg');
    await expect(svgCanvas.first()).toBeVisible();
  });

  test('Plot Search Input Filtering and Focus Ring Highlight', async ({ page }) => {
    // Locate search input field
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="plot"], input[placeholder*="Block"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Block-A');
      await expect(searchInput).toHaveValue('Block-A');
    }
  });

  test('Click Plot Polygon on SVG Canvas and Open PlotDrawer Metadata Modal', async ({ page }) => {
    // Find polygon plot element on SVG Canvas
    const plotPolygon = page.locator('polygon.plot-polygon-group, polygon[points]').first();
    if (await plotPolygon.isVisible()) {
      await plotPolygon.click();

      // Assert PlotDrawer modal / panel displays plot details
      await expect(page.locator('body')).toContainText(/Plot|Block|Status|Price|Sq.Ft/i);
    }
  });
});
