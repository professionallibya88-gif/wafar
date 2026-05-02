const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  const errors = [];
  const consoleMessages = [];
  const failedRequests = [];

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  page.on('requestfailed', request => {
    failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.request().method()} ${response.url()} - Status: ${response.status()}`);
    }
  });

  console.log('Navigating to https://wafar-frontend.vercel.app/ with CORS disabled...');
  
  try {
    await page.goto('https://wafar-frontend.vercel.app/', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded successfully. Title:', await page.title());
    
    // Let's test the search feature or category loading
    console.log('Waiting for categories to load...');
    await page.waitForTimeout(3000); // Wait for API calls
    
    console.log('Testing "تسجيل الدخول" (Login) flow...');
    const loginButton = page.locator('text=تسجيل الدخول').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForURL('**/login', { timeout: 10000 });
      console.log('Successfully navigated to Login page.');
      
      const emailInput = page.locator('input[type="email"], input[name="email"], input[name="phone"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      
      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
         await emailInput.first().fill('test@example.com');
         await passwordInput.first().fill('password123');
         
         const submitBtn = page.locator('button[type="submit"]');
         await submitBtn.click();
         console.log('Clicked login submit.');
         await page.waitForTimeout(3000); // Wait to see what happens
      }
    }

  } catch (err) {
    console.error('Error during navigation or testing:', err.message);
  }

  console.log('\n--- Advanced Test Results ---');
  console.log(`Page Errors: ${errors.length}`);
  errors.forEach(e => console.log('  - ' + e));
  
  console.log(`Console Errors/Warnings: ${consoleMessages.length}`);
  consoleMessages.forEach(m => console.log('  - ' + m));
  
  console.log(`Failed Network Requests: ${failedRequests.length}`);
  failedRequests.forEach(r => console.log('  - ' + r));

  await browser.close();
})();