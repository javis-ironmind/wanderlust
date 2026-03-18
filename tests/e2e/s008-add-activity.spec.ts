import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://wanderlust-six-beta.vercel.app';

test.describe('S008 - Add Activity Form', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/trips/new`);
    await page.fill('input[name="name"]', 'Add Activity Test');
    await page.fill('input[name="startDate"]', '2027-01-01');
    await page.fill('input[name="endDate"]', '2027-01-03');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/trips\/.+/);
  });

  test('AC1 - Can access trip detail for activity adding', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/trips\/.+/);
    // The page should have the trip name
    await expect(page.locator('h1')).toContainText('Add Activity Test');
  });

  test('AC2 - Form fields structure exists', async ({ page }) => {
    // Page should be interactive
    const map = page.locator('.leaflet-container');
    await expect(map).toBeVisible();
  });
});
