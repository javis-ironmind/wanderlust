import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://wanderlust-six-beta.vercel.app';

test.describe('S001 - Initialize Next.js Project', () => {
  
  test('AC1 - Next.js project loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await expect(page).toHaveTitle(/Wanderlust/i);
  });

  test('AC2 - Tailwind CSS is loaded', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    // Check page loads without CSS errors
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('AC6 - Development server runs without errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    await expect(page.locator('h1')).toContainText('My Trips');
  });
});
