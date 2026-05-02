const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await context.newPage();

  // Test DashboardLayout
  console.log('Testing Dashboard Layout...');
  try {
    await page.goto('http://localhost:3050/', { waitUntil: 'networkidle' });
  } catch (e) {
    console.log('Port 3050 failed, trying 3051...');
    await page.goto('http://localhost:3051/', { waitUntil: 'networkidle' });
  }
  
  await page.waitForTimeout(2000);
  
  // Click the toggle button
  const toggleBtn = await page.locator('button[aria-label="فتح القائمة"]').first();
  if (await toggleBtn.isVisible()) {
    await toggleBtn.click();
    await page.waitForTimeout(1000); // Wait for animation
    await page.screenshot({ path: 'C:/wafar-project/mobile-sidebar-dashboard.png' });
    console.log('Saved dashboard screenshot');
  } else {
    console.log('Toggle button not visible on dashboard');
    await page.screenshot({ path: 'C:/wafar-project/mobile-sidebar-dashboard-error.png' });
  }

  // Test AdminLayout
  console.log('Testing Admin Layout...');
  try {
    await page.goto('http://localhost:3050/admin', { waitUntil: 'networkidle' });
  } catch (e) {
    await page.goto('http://localhost:3051/admin', { waitUntil: 'networkidle' });
  }
  
  await page.waitForTimeout(2000);
  
  const adminToggleBtn = await page.locator('button[aria-label="فتح قائمة الإدارة"]').first();
  if (await adminToggleBtn.isVisible()) {
    await adminToggleBtn.click();
    await page.waitForTimeout(1000); // Wait for animation
    await page.screenshot({ path: 'C:/wafar-project/mobile-sidebar-admin.png' });
    console.log('Saved admin screenshot');
  } else {
    console.log('Admin toggle button not visible');
    await page.screenshot({ path: 'C:/wafar-project/mobile-sidebar-admin-error.png' });
  }

  await browser.close();
})();
