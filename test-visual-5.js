const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });

  context.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  const page = await context.newPage();

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*'
  };

  await page.route('**/*', async route => {
    const url = route.request().url();
    const type = route.request().resourceType();
    
    if (type !== 'fetch' && type !== 'xhr') {
      return route.continue();
    }
    
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: corsHeaders });
    }
    
    if (url.includes('/admin/auth/me')) {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { id: 1, name: 'Test Admin', role: 'admin', type: 'admin', is_super_admin: true }
        })
      });
    } else if (url.includes('/auth/me') || url.includes('/users/profile')) {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { user: { id: 1, name: 'Test User', role: 'user', type: 'user' } }
        })
      });
    } else if (url.includes('/settings/public')) {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { site_name: 'Test Site', site_logo: null }
        })
      });
    } else if (url.includes('/api/')) {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] })
      });
    } else {
      await route.continue();
    }
  });

  console.log('Going to /login to set localStorage...');
  await page.goto('http://localhost:3051/login', { waitUntil: 'networkidle' });
  
  await page.evaluate(() => {
    localStorage.setItem('remember_me', 'true');
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User', role: 'user', type: 'user' }));
  });

  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:3051/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const url = page.url();
  console.log('Current URL is:', url);

  const toggleBtn = await page.locator('button[aria-label="فتح القائمة"]').first();
  if (await toggleBtn.isVisible()) {
    console.log('Toggle button visible! Clicking...');
    await toggleBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/wafar-project/visual-test-dashboard-sidebar.png' });
    console.log('Dashboard sidebar visual test saved to C:/wafar-project/visual-test-dashboard-sidebar.png');
  } else {
    console.log('Toggle button NOT visible. Taking error screenshot.');
    await page.screenshot({ path: 'C:/wafar-project/visual-test-dashboard-error.png' });
  }

  // Admin test
  console.log('Navigating to admin...');
  await page.evaluate(() => {
    localStorage.setItem('remember_me', 'true');
    localStorage.setItem('token', 'fake-admin-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test Admin', role: 'admin', type: 'admin', is_super_admin: true }));
  });

  await page.goto('http://localhost:3051/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('Admin URL is:', page.url());

  const adminToggleBtn = await page.locator('button[aria-label="فتح قائمة الإدارة"]').first();
  if (await adminToggleBtn.isVisible()) {
    console.log('Admin Toggle button visible! Clicking...');
    await adminToggleBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/wafar-project/visual-test-admin-sidebar.png' });
    console.log('Admin sidebar visual test saved to C:/wafar-project/visual-test-admin-sidebar.png');
  } else {
    console.log('Admin toggle button not visible');
    await page.screenshot({ path: 'C:/wafar-project/visual-test-admin-error.png' });
  }

  await browser.close();
})();
