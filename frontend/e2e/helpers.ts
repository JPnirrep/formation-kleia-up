import { type Page, expect } from '@playwright/test';

const APP_URL = 'http://localhost:5173';

/**
 * Login as a user and wait for dashboard.
 * Sets onboarding flag in localStorage before login to avoid redirect.
 */
export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto(`${APP_URL}/login`);
  await page.evaluate(() => localStorage.setItem('kleia_onboarding_done', '1'));
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/);
}

/**
 * Wait for dashboard to be fully loaded.
 * Phase 1: sidebar visible (Layout mounts instantly)
 * Phase 2: dashboard-content rendered (after API calls)
 */
export async function waitForDashboard(page: Page): Promise<void> {
  // Phase 1: sidebar is guaranteed — Layout mounts synchronously
  await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible({ timeout: 10000 });
  // Phase 2: content arrives after enrollment/course fetches
  await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 15000 });
}

/**
 * Navigate to a sidebar link and wait for URL + content.
 * Falls back to URL-only check if testId doesn't exist.
 */
export async function navigateTo(page: Page, navTestId: string, urlPattern: RegExp, contentTestId?: string): Promise<void> {
  await page.click(`[data-testid="${navTestId}"]`);
  await page.waitForURL(urlPattern);
  if (contentTestId) {
    await page.waitForSelector(`[data-testid="${contentTestId}"]`, { timeout: 10000 }).catch(() => {
      // Silently ignore — some pages don't have the testId
    });
  }
}
