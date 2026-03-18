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

  test('AC1 - map component renders on trip detail page', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.click('text=Map Test Trip');
    
    // Wait for map to load - Leaflet creates a container
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
  });

  test('AC3 - map has zoom controls', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.click('text=Map Test Trip');
    
    // Wait for map
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    
    // Leaflet zoom controls
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    const zoomOut = page.locator('.leaflet-control-zoom-out');
    
    await expect(zoomIn).toBeVisible();
    await expect(zoomOut).toBeVisible();
  });

  test('AC4 - map can pan', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.click('text=Map Test Trip');
    
    // Wait for map
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    
    // Drag to pan
    const map = page.locator('.leaflet-container');
    const box = await map.boundingBox();
    
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2);
      await page.mouse.up();
    }
    
    // Map should still be visible after pan
    await expect(map).toBeVisible();
  });

  test('AC5 - map loads tiles without errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await page.click('text=Map Test Trip');
    
    // Wait for map container
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    
    // Check no console errors related to map
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Give time for tiles to load
    await page.waitForTimeout(2000);
    
    // No critical map errors
    const mapErrors = errors.filter(e => e.includes('leaflet') || e.includes('tile') || e.includes('map'));
    expect(mapErrors.length).toBe(0);
  });
});
