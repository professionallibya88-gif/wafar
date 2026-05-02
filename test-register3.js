const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  page.on('response', async response => {
    if (response.url().includes('/api/auth/register')) {
      console.log(`\nAPI Response [${response.status()}]:`, await response.text().catch(e=>'error'));
    }
  });

  try {
    await page.goto('https://wafar-frontend.vercel.app/register', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Fill the form correctly according to the Vue code
    await page.locator('input[type="text"]').fill('Ahmed Tester'); // fullName
    
    const testPhone = `091${Math.floor(1000000 + Math.random() * 9000000)}`;
    await page.locator('input[type="tel"]').fill(testPhone); // phone
    
    await page.locator('input[type="password"]').first().fill('TestPass123!'); // password
    await page.locator('input[type="password"]').nth(1).fill('TestPass123!'); // confirmPassword
    
    // The submit button is disabled if `!acceptTerms` is true. We must check the checkbox.
    const termsCheckbox = page.locator('input[type="checkbox"]#terms');
    await termsCheckbox.check({ force: true }); // force click if it's styled custom
    
    console.log('Filled form and checked terms. Submitting...');
    
    const submitBtn = page.locator('button[type="submit"]');
    const isDisabled = await submitBtn.isDisabled();
    
    if (!isDisabled) {
        await submitBtn.click();
        await page.waitForTimeout(5000); // wait for api response
        console.log('Current URL after submit:', page.url());
    } else {
        console.log('Submit button is still disabled.');
    }

  } catch (err) {
    console.error('Error during testing:', err.message);
  }

  await browser.close();
})();