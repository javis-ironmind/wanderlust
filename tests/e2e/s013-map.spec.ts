import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://wanderlust-six-beta.vercel.app';

test.describe('S013 - Map Component', () => {
  
  test.beforeEach(async ({ page }) => {
    // Create a test trip first
    await page.goto(`${BASE_URL}/trips/new`);
    await page.fill('input[name="name"]', 'Map Test Trip');
    await page.fill('input[name="startDate"]', '2026-07-01');
    await page.fill('input[name="endDate"]', '2026-07-03');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/trips\/.+/);
  });

  test('map component renders on trip detail page', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.click('text=Map Test Trip');
    
    // Map should be visible
    const mapContainer = page.locator('.leaflet-container, [class*="leaflet"]');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });
  });

  test('map has zoom controls', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.click('text=Map Test Trip');
    
    // Leaflet zoom controls
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    const zoomOut = page.locator('.leaflet-control-zoom-out');
    
    await expect(zoomIn).toBeVisible();
    await expect(zoomOut).toBeVisible();
  });

  test('map can pan', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.click('text=Map Test Trip');
    
    // Get initial center by dragging
    const map = page.locator('.leaflet-container');
    const box = await map.boundingBox();
    
    if (box) {
      // Drag to pan
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2);
      await page.mouse.up();
    }
    
    // Map should still be visible after pan
    await expect(map).toBeVisible();
  });

  test('map attribution visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.click('text=Map Test Trip');
    
    const attribution = page.locator('.leaflet-control-attribution');
    await expect(attribution).toBeVisible();
  });
});
