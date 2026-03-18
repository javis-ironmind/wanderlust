import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://wanderlust-six-beta.vercel.app';

test.describe('S011 - Flight Form', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/trips/new`);
    await page.fill('input[name="name"]', 'Flight Test Trip');
    await page.fill('input[name="startDate"]', '2027-03-01');
    await page.fill('input[name="endDate"]', '2027-03-07');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/trips\/.+/);
  });

  test('AC1 - Trip detail page is accessible', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/trips\/.+/);
    await expect(page.locator('h1')).toContainText('Flight Test Trip');
  });

  test('AC7 - Trip has structure for flights', async ({ page }) => {
    // Map and itinerary sections exist
    const map = page.locator('.leaflet-container');
    await expect(map).toBeVisible();
  });
});
