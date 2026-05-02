const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  const failedRequests = [];
  const apiResponses = [];

  page.on('requestfailed', request => {
    failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });

  page.on('response', async response => {
    if (response.url().includes('/api/auth/register')) {
      apiResponses.push({
        url: response.url(),
        status: response.status(),
        text: await response.text().catch(e => 'Could not read text')
      });
    }
  });

  console.log('Navigating to https://wafar-frontend.vercel.app/register ...');
  
  try {
    await page.goto('https://wafar-frontend.vercel.app/register', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded successfully. Title:', await page.title());
    
    console.log('Waiting for the form...');
    await page.waitForTimeout(3000);
    
    console.log('Filling registration form...');
    const nameInput = page.locator('input[name="name"], input[placeholder*="الاسم"], input[type="text"]').first();
    const phoneInput = page.locator('input[name="phone"], input[placeholder*="هاتف"], input[type="tel"]').first();
    const emailInput = page.locator('input[name="email"], input[placeholder*="بريد"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    const confirmPasswordInput = page.locator('input[name="password_confirmation"], input[name="confirm_password"], input[type="password"]').nth(1);

    if (await nameInput.isVisible()) {
        await nameInput.fill('Ahmed Tester');
    }
    
    const testPhone = `092${Math.floor(1000000 + Math.random() * 9000000)}`;
    if (await phoneInput.isVisible()) {
        await phoneInput.fill(testPhone);
        console.log('Filled phone:', testPhone);
    }
    
    if (await emailInput.isVisible()) {
        await emailInput.fill(`ahmed${Date.now()}@example.com`);
    }

    if (await passwordInput.isVisible()) {
        await passwordInput.fill('TestPass123!');
    }

    if (await confirmPasswordInput.isVisible()) {
        await confirmPasswordInput.fill('TestPass123!');
    }

    console.log('Checking if submit button is enabled...');
    const submitBtn = page.locator('button[type="submit"]');
    const isDisabled = await submitBtn.isDisabled();
    
    if (!isDisabled) {
        console.log('Submitting form...');
        await submitBtn.click();
        console.log('Waiting for API response and redirection...');
        await page.waitForTimeout(5000);
        console.log('Current URL after submit:', page.url());
    } else {
        console.log('Submit button is disabled. Cannot register. Perhaps validation failed or settings are still not loading?');
    }

  } catch (err) {
    console.error('Error during testing:', err.message);
  }

  console.log('\n--- Registration Test Results ---');
  console.log(`Failed Network Requests: ${failedRequests.length}`);
  failedRequests.forEach(r => console.log('  - ' + r));
  
  console.log(`\nRegistration API Responses:`);
  apiResponses.forEach(r => console.log(`  - ${r.status} ${r.url}: ${r.text.substring(0, 200)}`));

  await browser.close();
})();