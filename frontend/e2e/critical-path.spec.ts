import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:5173';

async function loginAs(page: any, email: string, password: string) {
  await page.goto(`${APP_URL}/login`);
  await page.evaluate(() => localStorage.setItem('kleia_onboarding_done', '1'));
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/);
}

test.describe('Parcours critique — Apprenant', () => {
  test('Landing → Login → Dashboard → Catalogue', async ({ page }) => {
    await page.goto(`${APP_URL}/landing`);
    await expect(page.locator('h1').first()).toContainText('unique');

    await page.click('text=Se connecter');
    await expect(page).toHaveURL(/\/login/);

    // Set onboarding flag BEFORE submitting the form
    await page.evaluate(() => localStorage.setItem('kleia_onboarding_done', '1'));
    await page.fill('input[type="email"]', 'clara.f@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // Sidebar visible = dashboard ready
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible({ timeout: 10000 });

    await page.click('[data-testid="nav-formations"]');
    await page.waitForURL(/\/formations/);
  });

  test('Dashboard → Formation → Leçon', async ({ page }) => {
    await loginAs(page, 'clara.f@example.com', 'password123');
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible({ timeout: 10000 });

    await page.click('[data-testid="nav-formations"]');
    await page.waitForURL(/\/formations/);

    const coursesContainer = page.locator('[data-testid="dashboard-courses"]');
    if (await coursesContainer.isVisible()) {
      await coursesContainer.locator('[role="button"]').first().click();
      await expect(page).toHaveURL(/\/formation\//);
    }
  });
});

test.describe('Parcours Admin', () => {
  test('Login admin → Dashboard admin → Utilisateurs', async ({ page }) => {
    await loginAs(page, 'sandrina@kleia-up.com', 'admin123');
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible({ timeout: 10000 });

    await page.goto(`${APP_URL}/admin`);
    await expect(page.locator('[data-testid="admin-title"]')).toBeVisible({ timeout: 10000 });

    await page.goto(`${APP_URL}/admin/users`);
    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test('Admin → Formations → Créer', async ({ page }) => {
    await loginAs(page, 'sandrina@kleia-up.com', 'admin123');
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible({ timeout: 10000 });

    await page.goto(`${APP_URL}/admin/courses`);
    await expect(page.locator('[data-testid="admin-courses-list"]')).toBeVisible({ timeout: 10000 });

    await page.click('[data-testid="admin-courses-new"]');
    await expect(page).toHaveURL(/\/admin\/courses\/new/);
  });
});
