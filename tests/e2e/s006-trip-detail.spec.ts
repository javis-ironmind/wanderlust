import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://wanderlust-six-beta.vercel.app';

test.describe('S006 - Trip Detail Layout', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/trips/new`);
    await page.fill('input[name="name"]', 'Detail Test Trip');
    await page.fill('input[name="startDate"]', '2026-11-01');
    await page.fill('input[name="endDate"]', '2026-11-03');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/trips\/.+/);
  });

  test('AC1 - Page displays at /trips/[tripId] route', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/trips\/.+/);
  });

  test('AC2 - Header shows trip name and dates', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Detail Test Trip');
    await expect(page.locator('text=2026-11-01')).toBeVisible();
  });

  test('AC9 - Back button visible', async ({ page }) => {
    const backButton = page.locator('text=← Back');
    await expect(backButton).toBeVisible();
  });
});
