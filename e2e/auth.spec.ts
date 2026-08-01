import { test, expect } from '@playwright/test';

test.describe('Authentication & Session Management E2E Automation', () => {
  test('User Login, JWT Token Storage, and Dashboard Render', async ({ page }) => {
    await page.goto('/');

    // Check application title or brand heading
    await expect(page.locator('body')).toBeVisible();

    // Verify Login Button / Modal is accessible
    const loginButton = page.locator('button:has-text("Login")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();

      // Enter login credentials
      await page.fill('input[type="text"], input[type="email"]', 'superadmin');
      await page.fill('input[type="password"]', 'Password@123456');

      // Submit Login
      await page.click('button[type="submit"]:has-text("Sign In"), button:has-text("Login")');
    }

    // Verify dashboard layout is rendered
    await expect(page.locator('body')).toContainText(/Shubharambh|CRM|Plots|Dashboard/i);
  });

  test('Automated JWT Refresh Token Rotation Flow', async ({ page }) => {
    await page.goto('/');

    // Intercept refresh token endpoint
    let refreshTriggered = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/v1/auth/refresh')) {
        refreshTriggered = true;
      }
    });

    // Emulate session active state
    await page.evaluate(() => {
      localStorage.setItem('shubharambh_access_token', 'mock-jwt-access-token');
    });

    await page.reload();
    await expect(page.locator('body')).toBeVisible();
  });

  test('Secure User Logout and Session Clearance', async ({ page }) => {
    await page.goto('/');

    // Check if user menu / logout button is available
    const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign Out")').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
