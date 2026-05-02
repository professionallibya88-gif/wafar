const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
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

  console.log('Navigating to https://wafar-frontend.vercel.app/ ...');
  
  try {
    await page.goto('https://wafar-frontend.vercel.app/', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded successfully. Title:', await page.title());
    
    const links = await page.locator('a[href^="http"], a[href^="/"]').all();
    console.log(`Found ${links.length} links on the page.`);
    
    console.log('Testing "تسجيل الدخول" (Login) button if exists...');
    const loginButton = page.locator('text=تسجيل الدخول').first();
    if (await loginButton.isVisible()) {
      console.log('Login button is visible.');
      await loginButton.click();
      await page.waitForTimeout(2000);
      console.log('URL after clicking login:', page.url());
      
      // Let's test typing into the login form
      if (page.url().includes('login')) {
        console.log('Filling login form with dummy data...');
        const emailInput = page.locator('input[type="email"], input[name="email"], input[name="phone"]');
        const passwordInput = page.locator('input[type="password"], input[name="password"]');
        
        if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
           await emailInput.first().fill('test@example.com');
           await passwordInput.first().fill('password123');
           console.log('Dummy data filled.');
           // Not submitting to avoid spamming actual DB
        }
      }
      
      await page.goBack({ waitUntil: 'networkidle' });
    }

  } catch (err) {
    console.error('Error during navigation or testing:', err.message);
  }

  console.log('\n--- Test Results ---');
  console.log(`Page Errors: ${errors.length}`);
  errors.forEach(e => console.log('  - ' + e));
  
  console.log(`Console Errors/Warnings: ${consoleMessages.length}`);
  consoleMessages.forEach(m => console.log('  - ' + m));
  
  console.log(`Failed Network Requests: ${failedRequests.length}`);
  failedRequests.forEach(r => console.log('  - ' + r));

  await browser.close();
})();