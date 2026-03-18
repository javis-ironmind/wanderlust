import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://wanderlust-six-beta.vercel.app';

test.describe('Wanderlust E2E Tests', () => {
  
  test('homepage loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await expect(page.locator('h1')).toContainText('My Trips');
  });

  test('can navigate to create trip', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.click('text=Create Your First Trip');
    await expect(page).toHaveURL(/.*\/trips\/new/);
    await expect(page.locator('h1')).toContainText('Create New Trip');
  });

  test('create trip form has required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips/new`);
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="startDate"]')).toBeVisible();
    await expect(page.locator('input[name="endDate"]')).toBeVisible();
  });

  test('can create a trip', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips/new`);
    
    await page.fill('input[name="name"]', 'Japan Trip 2026');
    await page.fill('input[name="startDate"]', '2026-04-01');
    await page.fill('input[name="endDate"]', '2026-04-15');
    await page.click('button[type="submit"]');
    
    // Should navigate to trip detail
    await expect(page).toHaveURL(/.*\/trips\/.+/);
  });

  test('trip detail shows created trip', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await expect(page.locator('text=Japan Trip 2026')).toBeVisible();
  });
});
