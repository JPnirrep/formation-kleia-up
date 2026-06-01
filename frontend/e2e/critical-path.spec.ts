import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:5173';

// Helper: login and bypass onboarding via localStorage
async function loginAs(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto(`${APP_URL}/login`);
  // Marquer l'onboarding comme déjà fait (évite redirect vers /onboarding)
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

    await loginAs(page, 'clara.f@example.com', 'password123');

    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
    await page.click('[data-testid="nav-formations"]');
    await expect(page).toHaveURL(/\/formations/);
  });

  test('Dashboard → Formation → Leçon', async ({ page }) => {
    await loginAs(page, 'clara.f@example.com', 'password123');

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

    await page.goto(`${APP_URL}/admin`);
    await expect(page.locator('[data-testid="admin-title"]')).toBeVisible();

    await page.goto(`${APP_URL}/admin/users`);
    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test('Admin → Formations → Créer', async ({ page }) => {
    await loginAs(page, 'sandrina@kleia-up.com', 'admin123');

    await page.goto(`${APP_URL}/admin/courses`);
    await expect(page.locator('[data-testid="admin-courses-list"]')).toBeVisible();

    await page.click('[data-testid="admin-courses-new"]');
    await expect(page).toHaveURL(/\/admin\/courses\/new/);
  });
});
