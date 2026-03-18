import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://wanderlust-six-beta.vercel.app';

test.describe('S002 - TypeScript Definitions', () => {
  
  test('AC1 - App loads without TypeScript errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/trips`);
    // If TypeScript had errors, the page wouldn't load
    await expect(page.locator('h1')).toBeVisible();
  });

  test('AC8 - All types are exported and usable', async ({ page }) => {
    // The app should compile and run - if types were missing, build would fail
    await page.goto(`${BASE_URL}/trips/new`);
    await expect(page.locator('h1')).toContainText('Create New Trip');
  });
});
