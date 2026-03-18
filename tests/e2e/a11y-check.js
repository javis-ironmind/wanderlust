const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Testing homepage: http://localhost:3001');
  await page.goto('http://localhost:3001');
  
  // Check for basic accessibility issues using evaluate
  const issues = await page.evaluate(async () => {
    const issues = [];
    
    // Check for images without alt text
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt) {
        issues.push({ type: 'img-missing-alt', selector: img.tagName, impact: 'serious' });
      }
    });
    
    // Check for buttons without accessible names
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) {
        issues.push({ type: 'button-no-name', selector: 'button', impact: 'critical' });
      }
    });
    
    // Check for inputs without labels
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      if (!input.getAttribute('aria-label') && !input.getAttribute('id')) {
        issues.push({ type: 'input-no-label', selector: 'input', impact: 'serious' });
      }
    });
    
    // Check for form elements without labels
    const labels = document.querySelectorAll('label');
    const labeledInputs = document.querySelectorAll('input[id]');
    
    return issues;
  });
  
  console.log('\n=== ACCESSIBILITY CHECK RESULTS ===');
  console.log(`Total issues found: ${issues.length}`);
  
  const critical = issues.filter(i => i.impact === 'critical');
  const serious = issues.filter(i => i.impact === 'serious');
  
  console.log(`Critical: ${critical.length}`);
  console.log(`Serious: ${serious.length}`);
  
  if (issues.length > 0) {
    console.log('\nIssues:');
    issues.forEach(i => console.log(`  - [${i.impact}] ${i.type} (${i.selector})`));
  } else {
    console.log('\n✓ No basic accessibility issues found');
  }
  
  await browser.close();
})();
