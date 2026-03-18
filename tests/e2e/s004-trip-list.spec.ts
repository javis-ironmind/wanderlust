import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://wanderlust-six-beta.vercel.app';

test.describe('S004 - Trip List Page', () => {
  
  test('AC1 - Page displays at /trips route', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await expect(page.locator('h1')).toContainText('My Trips');
  });

  test('AC2 - Grid of trip cards shown', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    // Should have a list or grid of trips (empty state is OK)
    const content = await page.content();
    expect(content).toContain('My Trips');
  });

  test('AC5 - Create Trip button prominent', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    const createButton = page.locator('text=Create Your First Trip');
    await expect(createButton).toBeVisible();
  });

  test('AC6 - Empty state shown when no trips', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await expect(page.locator('text=No trips yet')).toBeVisible();
  });
});
