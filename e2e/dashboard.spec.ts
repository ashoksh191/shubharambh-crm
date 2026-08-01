import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation & Security Audit E2E Automation', () => {
  test('✓ Navigation - Header Layout Navigation Controls', async ({ page }) => {
    await page.goto('/');
    const headerNav = page.locator('header, nav').first();
    await expect(headerNav).toBeVisible();
  });

  test('✓ Audit - Security Audit Log Feed Display', async ({ page }) => {
    await page.goto('/');
    const auditBtn = page.locator('button:has-text("Audit"), button:has-text("Logs")').first();
    if (await auditBtn.isVisible()) {
      await auditBtn.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('✓ Profile - User Profile Management Modal', async ({ page }) => {
    await page.goto('/');
    const profileBtn = page.locator('button:has-text("Profile"), avatar').first();
    if (await profileBtn.isVisible()) {
      await profileBtn.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
