const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone 6/7/8 size
  });

  // Mock API responses so we don't need the backend
  await context.route('**/api/v1/auth/me', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { user: { id: 1, name: 'Test User', role: 'user', type: 'user' } }
      })
    });
  });

  await context.route('**/api/v1/admin/me', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { admin: { id: 1, name: 'Test Admin', role: 'admin', type: 'admin' } }
      })
    });
  });
  
  await context.route('**/api/v1/settings/public', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { site_name: 'Test Site' }
      })
    });
  });

  const page = await context.newPage();

  // Test User Dashboard Layout
  console.log('Testing Dashboard Layout...');
  try {
    await page.goto('http://localhost:3050/login', { waitUntil: 'networkidle' });
  } catch(e) {
    await page.goto('http://localhost:3051/login', { waitUntil: 'networkidle' });
  }

  // Inject auth state
  await page.evaluate(() => {
    localStorage.setItem('remember_me', 'true');
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User', role: 'user', type: 'user' }));
  });

  // Now go to dashboard
  const baseUrl = page.url().replace('/login', '');
  await page.goto(baseUrl + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const toggleBtn = await page.locator('button[aria-label="فتح القائمة"]').first();
  if (await toggleBtn.isVisible()) {
    await toggleBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/wafar-project/visual-test-dashboard-sidebar.png' });
    console.log('Dashboard sidebar visual test saved to visual-test-dashboard-sidebar.png');
  } else {
    console.log('Toggle button not found on dashboard');
    await page.screenshot({ path: 'C:/wafar-project/visual-test-dashboard-error.png' });
  }

  // Test Admin Layout
  console.log('Testing Admin Layout...');
  await page.evaluate(() => {
    localStorage.setItem('remember_me', 'true');
    localStorage.setItem('token', 'fake-admin-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test Admin', role: 'admin', type: 'admin', is_super_admin: true }));
  });

  await page.goto(baseUrl + '/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const adminToggleBtn = await page.locator('button[aria-label="فتح قائمة الإدارة"]').first();
  if (await adminToggleBtn.isVisible()) {
    await adminToggleBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/wafar-project/visual-test-admin-sidebar.png' });
    console.log('Admin sidebar visual test saved to visual-test-admin-sidebar.png');
  } else {
    console.log('Admin toggle button not found');
    await page.screenshot({ path: 'C:/wafar-project/visual-test-admin-error.png' });
  }

  await browser.close();
})();
