import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:5173';

test.describe('Parcours critique — Apprenant', () => {
  test('Landing → Login → Dashboard → Catalogue', async ({ page }) => {
    await page.goto(APP_URL);
    await expect(page.locator('h1')).toContainText('Kleia-up');

    await page.click('text=Se connecter');
    await expect(page).toHaveURL(/\/login/);

    await page.fill('input[type="email"]', 'clara.fontaine@kleia-up.fr');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.click('text=Catalogue');
    await page.click('text=Formations');
    await expect(page).toHaveURL(/\/formations/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Dashboard → Formation → Leçon', async ({ page }) => {
    await page.goto(`${APP_URL}/login`);
    await page.fill('input[type="email"]', 'clara.fontaine@kleia-up.fr');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    await page.click('text=Catalogue');
    await page.click('text=Formations');

    // Click first course card
    const firstCard = page.locator('[data-testid="course-card"]').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    await expect(page).toHaveURL(/\/formation\//);
  });
});

test.describe('Parcours Admin', () => {
  test('Login admin → Dashboard admin → Utilisateurs', async ({ page }) => {
    await page.goto(`${APP_URL}/login`);
    await page.fill('input[type="email"]', 'sandrina.perrin@kleia-up.fr');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    await page.goto(`${APP_URL}/admin`);
    await expect(page.locator('h1')).toContainText('Administration');

    await page.click('text=Utilisateurs');
    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test('Admin → Formations → Créer', async ({ page }) => {
    await page.goto(`${APP_URL}/login`);
    await page.fill('input[type="email"]', 'sandrina.perrin@kleia-up.fr');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    await page.goto(`${APP_URL}/admin/courses`);
    await expect(page.locator('h1')).toContainText('Formations');

    await page.click('text=Nouvelle formation');
    await expect(page).toHaveURL(/\/admin\/courses\/new/);
  });
});
