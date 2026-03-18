import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://wanderlust-six-beta.vercel.app';

test.describe('S005 - Create Trip Modal', () => {
  
  test('AC1 - Can navigate to create trip page', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.click('text=Create Your First Trip');
    await expect(page).toHaveURL(/.*\/trips\/new/);
  });

  test('AC2 - Form fields: name, start date, end date', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips/new`);
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="startDate"]')).toBeVisible();
    await expect(page.locator('input[name="endDate"]')).toBeVisible();
  });

  test('AC6 - Create button exists', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips/new`);
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('AC8 - New trip appears in list immediately', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips/new`);
    await page.fill('input[name="name"]', 'Immediate Test Trip');
    await page.fill('input[name="startDate"]', '2026-10-01');
    await page.fill('input[name="endDate"]', '2026-10-07');
    await page.click('button[type="submit"]');
    
    // Should see the new trip
    await expect(page.locator('text=Immediate Test Trip')).toBeVisible();
  });
});
