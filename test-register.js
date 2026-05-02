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
    if (response.url().includes('/api/')) {
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
    await page.waitForTimeout(2000);
    
    console.log('Filling registration form...');
    // The registration form might have specific fields like name, phone, password. Let's find them.
    const nameInput = page.locator('input[name="name"], input[placeholder*="الاسم"], input[type="text"]').first();
    const phoneInput = page.locator('input[name="phone"], input[placeholder*="هاتف"], input[type="tel"]').first();
    const emailInput = page.locator('input[name="email"], input[placeholder*="بريد"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    const confirmPasswordInput = page.locator('input[name="password_confirmation"], input[name="confirm_password"], input[type="password"]').nth(1);

    if (await nameInput.isVisible()) {
        await nameInput.fill('Tester Playwright');
    }
    
    // We will try filling phone and email depending on what is visible
    if (await phoneInput.isVisible()) {
        await phoneInput.fill('0912345678');
    }
    
    if (await emailInput.isVisible()) {
        await emailInput.fill(`tester${Date.now()}@example.com`);
    }

    if (await passwordInput.isVisible()) {
        await passwordInput.fill('Password123!');
    }

    if (await confirmPasswordInput.isVisible()) {
        await confirmPasswordInput.fill('Password123!');
    }

    console.log('Submitting form...');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    
    console.log('Waiting for response...');
    await page.waitForTimeout(5000);

  } catch (err) {
    console.error('Error during testing:', err.message);
  }

  console.log('\n--- Registration Test Results ---');
  console.log(`Failed Network Requests: ${failedRequests.length}`);
  failedRequests.forEach(r => console.log('  - ' + r));
  
  console.log(`\nAPI Responses:`);
  apiResponses.forEach(r => console.log(`  - ${r.status} ${r.url}: ${r.text.substring(0, 150)}`));

  await browser.close();
})();