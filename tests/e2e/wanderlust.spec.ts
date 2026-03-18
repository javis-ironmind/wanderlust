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

  test('can create a trip and see it in list', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips/new`);
    
    // Fill the form
    await page.fill('input[name="name"]', 'Paris Adventure');
    await page.fill('input[name="startDate"]', '2026-05-01');
    await page.fill('input[name="endDate"]', '2026-05-07');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Should navigate back to trips list
    await expect(page).toHaveURL(/.*\/trips/);
    
    // Should see the new trip in the list
    await expect(page.locator('text=Paris Adventure')).toBeVisible();
  });

  test('trip detail page shows trip info', async ({ page }) => {
    // First create a trip directly via URL with query params
    await page.goto(`${BASE_URL}/trips/new`);
    await page.fill('input[name="name"]', 'Rome Trip');
    await page.fill('input[name="startDate"]', '2026-06-01');
    await page.fill('input[name="endDate"]', '2026-06-10');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to trips list
    await page.waitForURL(/.*\/trips/);
    
    // Click on the created trip
    await page.click('text=Rome Trip');
    
    // Should navigate to trip detail
    await expect(page.locator('h1')).toContainText('Rome Trip');
  });
});
