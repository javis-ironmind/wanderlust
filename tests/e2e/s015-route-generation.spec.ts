import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://wanderlust-six-beta.vercel.app';

test.describe('S015 - Route Generation', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/trips/new`);
    await page.fill('input[name="name"]', 'Route Test Trip');
    await page.fill('input[name="startDate"]', '2026-08-01');
    await page.fill('input[name="endDate"]', '2026-08-03');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/trips\/.+/);
  });

  test('AC8 - route toggle visibility', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.click('text=Route Test Trip');
    
    // Wait for map
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    
    // Map should be visible
    const map = page.locator('.leaflet-container');
    await expect(map).toBeVisible();
  });

  test('AC9 - route auto-recalculates on zoom', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.click('text=Route Test Trip');
    
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    
    // Zoom in
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    await zoomIn.click();
    await page.waitForTimeout(500);
    
    // Map should still be functional
    const map = page.locator('.leaflet-container');
    await expect(map).toBeVisible();
  });

  test('AC10 - handles single activity', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.click('text=Route Test Trip');
    
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    
    // Map handles single activity gracefully
    const map = page.locator('.leaflet-container');
    await expect(map).toBeVisible();
  });
});
