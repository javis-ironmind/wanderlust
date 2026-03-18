import { test, expect } from '@playwright/test';
import Axe from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('homepage has no critical accessibility violations', async ({ page }) => {
    const accessibilityScanner = new Axe({ 
      builderSource: { 
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
        }
      }
    });
    
    await page.goto('http://localhost:3001');
    
    const results = await accessibilityScanner.analyze();
    
    // Log all violations
    if (results.violations.length > 0) {
      console.log('Accessibility violations found:');
      results.violations.forEach(v => {
        console.log(`- ${v.id}: ${v.description} (${v.impact})`);
      });
    }
    
    // Critical and serious violations should fail
    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalViolations.length).toBe(0);
  });

  test('trip creation page has no critical accessibility violations', async ({ page }) => {
    const accessibilityScanner = new Axe({ 
      builderSource: { 
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa']
        }
      }
    });
    
    await page.goto('http://localhost:3001');
    
    // Click to create a new trip (if button exists)
    const createButton = page.getByRole('button', { name: /create new trip|new trip/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);
    }
    
    const results = await accessibilityScanner.analyze();
    
    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalViolations.length).toBe(0);
  });
});
