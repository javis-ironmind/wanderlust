import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://wanderlust-six-beta.vercel.app';

test.describe('S007 - Activity Card', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/trips/new`);
    await page.fill('input[name="name"]', 'Activity Card Test');
    await page.fill('input[name="startDate"]', '2026-12-01');
    await page.fill('input[name="endDate"]', '2026-12-03');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/trips\/.+/);
  });

  test('AC9 - Trip detail loads with map', async ({ page }) => {
    // Trip detail should load the map
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    const map = page.locator('.leaflet-container');
    await expect(map).toBeVisible();
  });
});
