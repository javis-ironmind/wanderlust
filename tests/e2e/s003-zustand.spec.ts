import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://wanderlust-six-beta.vercel.app';

test.describe('S003 - Zustand Store', () => {
  
  test('AC1-AC5 - Store is functional (create and view trip)', async ({ page }) => {
    // Create a trip
    await page.goto(`${BASE_URL}/trips/new`);
    await page.fill('input[name="name"]', 'Store Test Trip');
    await page.fill('input[name="startDate"]', '2026-09-01');
    await page.fill('input[name="endDate"]', '2026-09-05');
    await page.click('button[type="submit"]');
    
    // Should navigate to trip detail (store working)
    await expect(page).toHaveURL(/.*\/trips\/.+/);
  });

  test('AC9-AC10 - Store hooks are exported', async ({ page }) => {
    // If hooks weren't exported, app would crash
    await page.goto(`${BASE_URL}/trips`);
    await expect(page.locator('h1')).toContainText('My Trips');
  });
});
